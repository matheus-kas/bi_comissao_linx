import * as XLSX from "xlsx"
import { v4 as uuidv4 } from "uuid"
import type { ProcessedFile, CommissionData } from "@/types/file-types"

// Função para processar arquivo Excel a partir de um File (para componentes)
export async function processFile(file: File): Promise<ProcessedFile> {
  try {
    // Ler o arquivo como ArrayBuffer
    const buffer = await file.arrayBuffer()

    // Ler o arquivo Excel com configurações específicas para preservar os valores originais
    const workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
      cellNF: false,
      cellText: false,
      raw: true, // Importante: ler valores brutos
    })

    // Obter a primeira planilha
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    // Converter para JSON com opções para preservar valores originais
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: true, // Ler valores brutos
      defval: "",
      header: "A", // Usar letras como cabeçalhos para garantir que lemos os dados brutos
    })

    console.log("Dados brutos (primeiros 3 registros):", jsonData.slice(0, 3))

    // Mapear cabeçalhos para índices de coluna
    const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[]
    const headerMap = new Map<string, string>()

    headerRow.forEach((header, index) => {
      const colLetter = XLSX.utils.encode_col(index)
      headerMap.set(header.toLowerCase().trim(), colLetter)
    })

    console.log("Mapeamento de cabeçalhos:", Object.fromEntries(headerMap))

    // Processar os dados usando o mapeamento de cabeçalhos
    const processedData = processRecordsWithHeaders(jsonData, headerMap, headerRow)

    // Verificar se temos dados
    if (processedData.length === 0) {
      throw new Error("Não foi possível extrair dados do arquivo. Verifique se o formato está correto.")
    }

    // Extrair período
    const period = extractPeriod(processedData)

    // Calcular estatísticas
    const summary = calculateSummary(processedData)

    // Criar objeto de arquivo processado
    const processedFile: ProcessedFile = {
      id: uuidv4(),
      name: file.name,
      originalName: file.name,
      size: file.size,
      uploadDate: new Date().toISOString(),
      period,
      data: processedData,
      summary,
    }

    return processedFile
  } catch (error) {
    console.error("Erro ao processar arquivo Excel:", error)
    throw new Error(`Falha ao processar o arquivo Excel: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function processExcelFile(buffer: Buffer, fileName: string): Promise<ProcessedFile> {
  // Criar um objeto File a partir do Buffer
  const file = new File([buffer], fileName, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  // Usar a função processFile existente
  return processFile(file)
}

// Função para processar registros usando o mapeamento de cabeçalhos
function processRecordsWithHeaders(
  jsonData: any[],
  headerMap: Map<string, string>,
  headerRow: string[],
): CommissionData[] {
  // Função auxiliar para extrair valor de uma célula específica
  const extractValue = (row: any, headerKey: string): any => {
    const colLetter = headerMap.get(headerKey.toLowerCase().trim())
    if (!colLetter) {
      console.warn(`Cabeçalho não encontrado: ${headerKey}`)
      return null
    }
    return row[colLetter]
  }

  // Função para processar valor numérico com segurança
  const processNumericValue = (value: any): number => {
    if (value === undefined || value === null || value === "") return 0

    // Se já for um número, retornar diretamente
    if (typeof value === "number") return value

    // Se for string, converter para número com cuidado
    if (typeof value === "string") {
      // Remover símbolos de moeda e converter vírgula para ponto
      const valueStr = value
        .replace(/[R$\s]/g, "") // Remover R$ e espaços
        .replace(/\./g, "") // Remover pontos de milhar
        .replace(",", ".") // Substituir vírgula decimal por ponto

      return Number.parseFloat(valueStr) || 0
    }

    // Tentar converter outros tipos
    return Number(value) || 0
  }

  return jsonData.slice(1).map((row, index) => {
    // Pular a primeira linha (cabeçalhos)
    try {
      // Extrair valores usando o mapeamento de cabeçalhos
      const nome_clifor = extractValue(row, "nome_clifor") || ""
      const cnpj_cliente = extractValue(row, "cnpj_cliente") || ""
      const codigo_item = extractValue(row, "codigo_item") || ""
      const fatura = extractValue(row, "fatura") || ""

      // Processar valores numéricos com cuidado
      const valor_recebido_total = processNumericValue(extractValue(row, "valor_recebido_total"))
      const percent_comissao_item_contrato = processNumericValue(extractValue(row, "percent_comissao_item_contrato"))
      const valor_comissao_total = processNumericValue(extractValue(row, "valor_comissao_total"))

      // Processar outros valores numéricos
      const taxa_imposto = processNumericValue(extractValue(row, "taxa_imposto"))
      const valor_imposto = processNumericValue(extractValue(row, "valor_imposto"))
      const valor_a_pagar_sem_imposto = processNumericValue(extractValue(row, "valor_a_pagar_sem_imposto"))
      const valor_menos_imposto = processNumericValue(extractValue(row, "valor_menos_imposto"))

      // Processar data de emissão
      let emissao = new Date().toISOString()
      const emissaoValue = extractValue(row, "emissao")
      if (emissaoValue) {
        try {
          // Se já for um objeto Date
          if (emissaoValue instanceof Date) {
            emissao = emissaoValue.toISOString()
          } else {
            // Tentar converter para data
            const dataStr = String(emissaoValue)

            // Verificar formato DD/MM/YYYY
            const parts = dataStr.split(/[/.-]/)
            if (parts.length === 3) {
              // Assumir DD/MM/YYYY se o primeiro número for <= 31
              if (Number.parseInt(parts[0]) <= 31) {
                const date = new Date(
                  Number.parseInt(parts[2]),
                  Number.parseInt(parts[1]) - 1,
                  Number.parseInt(parts[0]),
                )
                if (!isNaN(date.getTime())) {
                  emissao = date.toISOString()
                }
              }
            } else {
              // Tentar formato padrão
              const date = new Date(dataStr)
              if (!isNaN(date.getTime())) {
                emissao = date.toISOString()
              }
            }
          }
        } catch (e) {
          console.warn(`Não foi possível converter a data: ${emissaoValue}`)
        }
      }

      // Criar objeto de registro normalizado
      return {
        id: uuidv4(),
        nome_clifor,
        cnpj_cliente,
        codigo_item,
        valor_comissao_total,
        percent_comissao_item_contrato,
        emissao,
        fatura,
        valor_recebido_total,
        contato: extractValue(row, "contato") || "",
        clifor_cliente: extractValue(row, "clifor_cliente") || "",
        vencimento_real: extractValue(row, "vencimento_real") || "",
        taxa_imposto,
        valor_imposto,
        valor_a_pagar_sem_imposto,
        valor_menos_imposto,
        rawData: row,
      }
    } catch (error) {
      console.error(`Erro ao processar linha ${index + 2}:`, error)
      // Retornar um registro com valores padrão em caso de erro
      return {
        id: uuidv4(),
        nome_clifor: `Erro na linha ${index + 2}`,
        cnpj_cliente: "",
        codigo_item: "Erro de processamento",
        valor_comissao_total: 0,
        percent_comissao_item_contrato: 0,
        emissao: new Date().toISOString(),
        fatura: "",
        valor_recebido_total: 0,
        contato: "",
        clifor_cliente: "",
        vencimento_real: "",
        taxa_imposto: 0,
        valor_imposto: 0,
        valor_a_pagar_sem_imposto: 0,
        valor_menos_imposto: 0,
        rawData: row,
      }
    }
  })
}

// Função para extrair período
function extractPeriod(records: CommissionData[]): string {
  if (records.length === 0) return "Desconhecido"

  try {
    // Ordenar registros por data
    const sortedRecords = [...records].sort((a, b) => {
      const dateA = new Date(a.emissao)
      const dateB = new Date(b.emissao)
      return dateA.getTime() - dateB.getTime()
    })

    // Pegar a primeira e última data
    const firstDate = new Date(sortedRecords[0].emissao)
    const lastDate = new Date(sortedRecords[sortedRecords.length - 1].emissao)

    // Formatar as datas
    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
    }

    return `${formatDate(firstDate)} - ${formatDate(lastDate)}`
  } catch (error) {
    console.error("Erro ao extrair período:", error)
    return "Desconhecido"
  }
}

// Função para calcular estatísticas
function calculateSummary(records: CommissionData[]) {
  // Total de comissões
  const totalCommission = records.reduce((sum, record) => sum + record.valor_comissao_total, 0)

  // Contar clientes únicos
  const clientCount = new Set(records.map((record) => record.nome_clifor)).size

  // Contar produtos únicos
  const productCount = new Set(records.map((record) => record.codigo_item)).size

  // Calcular comissão média
  const avgCommission = records.length > 0 ? totalCommission / records.length : 0

  return {
    totalCommission,
    clientCount,
    productCount,
    avgCommission,
    recordCount: records.length,
  }
}
