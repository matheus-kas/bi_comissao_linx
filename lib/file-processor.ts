import * as XLSX from "xlsx"
import { v4 as uuidv4 } from "uuid"
import type { ProcessedFile, CommissionData } from "@/types/file-types"

export async function processFile(file: File): Promise<ProcessedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        // Primeira tentativa - método padrão
        let workbook
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          workbook = XLSX.read(data, { type: "array" })
        } catch (error) {
          console.log("Erro no método padrão, tentando método alternativo...", error)

          // Segunda tentativa - com opções diferentes
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            workbook = XLSX.read(data, {
              type: "array",
              cellFormula: false, // Desabilitar fórmulas
              cellStyles: false, // Desabilitar estilos
              cellNF: false, // Desabilitar formatos numéricos
              cellDates: true, // Manter datas
              WTF: true, // Modo "What The Formula" - ignora erros
            })
          } catch (secondError) {
            console.log("Erro no método alternativo, tentando método de texto...", secondError)

            // Terceira tentativa - converter para base64
            try {
              const data = e.target?.result
              const base64 = btoa(
                new Uint8Array(data as ArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
              )
              workbook = XLSX.read(base64, { type: "base64", WTF: true })
            } catch (thirdError) {
              throw new Error(`Não foi possível processar o arquivo. Erro: ${thirdError.message}`)
            }
          }
        }

        // Processamento do workbook
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Verificar se o arquivo tem a estrutura esperada
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: "yyyy-mm-dd",
        })

        // Verificar se há pelo menos um registro
        if (jsonData.length === 0) {
          throw new Error(
            "O arquivo não contém dados. Verifique se a planilha está vazia ou se os dados estão na primeira aba.",
          )
        }

        // Processar os dados
        const records = processRecords(jsonData as CommissionData[])

        // Extrair informações do período
        const period = extractPeriod(records)

        // Calcular estatísticas
        const summary = calculateSummary(records)

        // Criar objeto de arquivo processado
        const processedFile: ProcessedFile = {
          id: uuidv4(),
          name: file.name,
          originalName: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          period,
          data: records,
          summary,
        }

        // Armazenar arquivo original (opcional)
        // Em um cenário real, você poderia salvar o arquivo original em um servidor ou serviço de armazenamento

        resolve(processedFile)
      } catch (error) {
        console.error("Erro ao processar arquivo:", error)
        reject(
          new Error(`Falha ao processar o arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}. 
          
          Sugestões:
          1. Verifique se o arquivo está corrompido
          2. Tente salvar o arquivo em um formato mais recente (.xlsx)
          3. Remova elementos complexos como macros, fórmulas avançadas ou objetos incorporados
          4. Se possível, exporte os dados para CSV e tente novamente`),
        )
      }
    }

    reader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo"))
    }

    reader.readAsArrayBuffer(file)
  })
}

function processRecords(jsonData: any[]): CommissionData[] {
  return jsonData.map((row, index) => {
    try {
      // Normalizar nomes de colunas (caso haja variações)
      const clienteKey = findKey(row, [
        "CLIENTE",
        "Cliente",
        "cliente",
        "RAZÃO SOCIAL",
        "Razão Social",
        "nome_clifor",
        "NOME_CLIFOR",
      ])
      const cnpjKey = findKey(row, ["CNPJ", "Cnpj", "cnpj", "CNPJ_CLIENTE", "cnpj_cliente"])
      const produtoKey = findKey(row, [
        "PRODUTO",
        "Produto",
        "produto",
        "DESCRIÇÃO",
        "Descrição",
        "codigo_item",
        "CODIGO_ITEM",
      ])
      const valorKey = findKey(row, [
        "VALOR",
        "Valor",
        "valor",
        "COMISSÃO",
        "Comissão",
        "COMISSAO",
        "valor_comissao_total",
        "VALOR_COMISSAO_TOTAL",
      ])
      const dataKey = findKey(row, [
        "DATA",
        "Data",
        "data",
        "DATA EMISSÃO",
        "Data Emissão",
        "EMISSÃO",
        "emissao",
        "EMISSAO",
      ])
      const percentKey = findKey(row, [
        "PERCENTUAL",
        "Percentual",
        "percentual",
        "PERCENT_COMISSAO",
        "percent_comissao_item_contrato",
      ])

      // Extrair valores com fallbacks
      const cliente = row[clienteKey] || "Desconhecido"
      const cnpj = row[cnpjKey] || ""
      const produto = row[produtoKey] || "Desconhecido"
      const fatura = row["fatura"] || row["FATURA"] || ""

      // Converter valor para número
      let valor = 0
      if (row[valorKey]) {
        // Remover símbolos de moeda e converter vírgula para ponto
        const valorStr = String(row[valorKey])
          .replace(/[^\d,-]/g, "")
          .replace(",", ".")
        valor = Number.parseFloat(valorStr) || 0
      }

      // Converter percentual
      let percentual = 0
      if (row[percentKey]) {
        const percentStr = String(row[percentKey])
          .replace(/[^\d,-]/g, "")
          .replace(",", ".")
        percentual = Number.parseFloat(percentStr) || 0
      }

      // Converter data
      let data = null
      if (row[dataKey]) {
        // Tentar diferentes formatos de data
        try {
          // Se já for um objeto Date
          if (row[dataKey] instanceof Date) {
            data = row[dataKey]
          } else {
            // Tentar converter string para data
            const dataStr = String(row[dataKey])
            data = new Date(dataStr)

            // Se a data for inválida, tentar outros formatos
            if (isNaN(data.getTime())) {
              // Formato DD/MM/YYYY
              const parts = dataStr.split(/[/.-]/)
              if (parts.length === 3) {
                // Assumir DD/MM/YYYY se o primeiro número for <= 31
                if (Number.parseInt(parts[0]) <= 31) {
                  data = new Date(Number.parseInt(parts[2]), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[0]))
                } else {
                  // Assumir YYYY/MM/DD
                  data = new Date(Number.parseInt(parts[0]), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[2]))
                }
              }
            }
          }
        } catch (e) {
          console.warn(`Não foi possível converter a data: ${row[dataKey]}`)
          data = new Date() // Usar data atual como fallback
        }
      } else {
        data = new Date() // Usar data atual como fallback
      }

      // Criar objeto de registro normalizado
      return {
        id: uuidv4(),
        nome_clifor: cliente,
        cnpj_cliente: cnpj,
        codigo_item: produto,
        valor_comissao_total: valor,
        percent_comissao_item_contrato: percentual,
        emissao: data ? data.toISOString() : new Date().toISOString(),
        fatura: fatura,
        valor_recebido_total: row["valor_recebido_total"] || 0,
        contato: row["contato"] || "",
        clifor_cliente: row["clifor_cliente"] || "",
        vencimento_real: row["vencimento_real"] || "",
        taxa_imposto: row["taxa_imposto"] || 0,
        valor_imposto: row["valor_imposto"] || 0,
        valor_a_pagar_sem_imposto: row["valor_a_pagar_sem_imposto"] || 0,
        valor_menos_imposto: row["valor_menos_imposto"] || 0,
        rawData: row, // Manter dados brutos para referência
      }
    } catch (error) {
      console.error(`Erro ao processar linha ${index}:`, error)
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

function findKey(obj: any, possibleKeys: string[]): string {
  for (const key of possibleKeys) {
    if (obj[key] !== undefined) {
      return key
    }
  }
  return possibleKeys[0] // Retornar a primeira chave como fallback
}

function extractPeriod(records: CommissionData[]): string {
  if (records.length === 0) return "Desconhecido"

  try {
    // Ordenar registros por data
    const sortedRecords = [...records].sort((a, b) => new Date(a.emissao).getTime() - new Date(b.emissao).getTime())

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
