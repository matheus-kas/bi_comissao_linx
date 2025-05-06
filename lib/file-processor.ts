import * as XLSX from "xlsx"
import { v4 as uuidv4 } from "uuid"
import type { ComissaoRecord, ProcessedFile } from "@/types/file-types"

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

        // Adicionar após a leitura do workbook e antes do processamento
        // Verificar se o arquivo tem a estrutura esperada
        const requiredColumns = ["nome_clifor", "cnpj_cliente", "codigo_item", "valor_comissao_total"]
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

        // Verificar se as colunas obrigatórias existem
        const firstRow = jsonData[0]
        const missingColumns = requiredColumns.filter((col) => {
          // Tentar encontrar a coluna com diferentes variações de nome
          const possibleNames = [col, col.toUpperCase(), col.toLowerCase()]
          return !possibleNames.some((name) => Object.keys(firstRow).some((key) => key.includes(name)))
        })

        if (missingColumns.length > 0) {
          throw new Error(
            `O arquivo não contém todas as colunas obrigatórias. Colunas faltando: ${missingColumns.join(", ")}`,
          )
        }

        // Processar os dados
        const records = processRecords(jsonData)

        // Extrair informações do período
        const periodo = extractPeriod(records)

        resolve({
          id: uuidv4(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date().toISOString(),
          periodo,
          records,
          summary: calculateSummary(records),
        })
      } catch (error) {
        console.error("Erro ao processar arquivo:", error)
        reject(
          new Error(`Falha ao processar o arquivo: ${error.message}. 
          
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

function processRecords(jsonData: any[]): ComissaoRecord[] {
  return jsonData.map((row, index) => {
    try {
      // Normalizar nomes de colunas (caso haja variações)
      const clienteKey = findKey(row, ["CLIENTE", "Cliente", "cliente", "RAZÃO SOCIAL", "Razão Social"])
      const produtoKey = findKey(row, ["PRODUTO", "Produto", "produto", "DESCRIÇÃO", "Descrição"])
      const valorKey = findKey(row, ["VALOR", "Valor", "valor", "COMISSÃO", "Comissão", "COMISSAO"])
      const dataKey = findKey(row, ["DATA", "Data", "data", "DATA EMISSÃO", "Data Emissão", "EMISSÃO"])

      // Extrair valores
      const cliente = row[clienteKey] || "Desconhecido"
      const produto = row[produtoKey] || "Desconhecido"

      // Converter valor para número
      let valor = 0
      if (row[valorKey]) {
        // Remover símbolos de moeda e converter vírgula para ponto
        const valorStr = String(row[valorKey])
          .replace(/[^\d,-]/g, "")
          .replace(",", ".")
        valor = Number.parseFloat(valorStr) || 0
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

      return {
        id: uuidv4(),
        cliente,
        produto,
        valor,
        data: data ? data.toISOString() : new Date().toISOString(),
        rawData: row, // Manter dados brutos para referência
      }
    } catch (error) {
      console.error(`Erro ao processar linha ${index}:`, error)
      // Retornar um registro com valores padrão em caso de erro
      return {
        id: uuidv4(),
        cliente: `Erro na linha ${index + 2}`,
        produto: "Erro de processamento",
        valor: 0,
        data: new Date().toISOString(),
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

function extractPeriod(records: ComissaoRecord[]): string {
  if (records.length === 0) return "Desconhecido"

  try {
    // Ordenar registros por data
    const sortedRecords = [...records].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

    // Pegar a primeira e última data
    const firstDate = new Date(sortedRecords[0].data)
    const lastDate = new Date(sortedRecords[sortedRecords.length - 1].data)

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

function calculateSummary(records: ComissaoRecord[]) {
  const totalComissoes = records.reduce((sum, record) => sum + record.valor, 0)

  // Contar clientes únicos
  const clientesUnicos = new Set(records.map((record) => record.cliente)).size

  // Contar produtos únicos
  const produtosUnicos = new Set(records.map((record) => record.produto)).size

  // Calcular comissão média
  const comissaoMedia = records.length > 0 ? totalComissoes / records.length : 0

  return {
    totalComissoes,
    clientesUnicos,
    produtosUnicos,
    comissaoMedia,
    totalRegistros: records.length,
  }
}
