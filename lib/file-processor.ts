import * as XLSX from "xlsx"
import { v4 as uuidv4 } from "uuid"
import type { ProcessedFile, CommissionData } from "@/types/file-types"

// Modifique a função processExcelFile para lidar com o erro específico
// Adicione opções adicionais ao XLSX.read para ignorar recursos não suportados

export async function processExcelFile(file: File, onProgress?: (progress: number) => void): Promise<ProcessedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error("Falha ao ler o arquivo")
        }

        // Atualizar progresso
        onProgress?.(30)

        // Processar o arquivo Excel com opções adicionais para lidar com registros desconhecidos
        const data = new Uint8Array(e.target.result as ArrayBuffer)

        let workbook
        try {
          // Primeira tentativa com opções padrão aprimoradas
          workbook = XLSX.read(data, {
            type: "array",
            cellFormula: false, // Desabilitar fórmulas
            cellStyles: false, // Desabilitar estilos
            cellDates: true, // Converter datas automaticamente
            cellNF: false, // Desabilitar formatos de número
            cellText: false, // Desabilitar texto formatado
            WTF: false, // Suprimir erros de análise
          })
        } catch (primaryError) {
          console.warn("Primeira tentativa de leitura falhou, tentando com opções mais restritivas", primaryError)

          // Se falhar, tente novamente com opções mais restritivas
          try {
            workbook = XLSX.read(data, {
              type: "array",
              cellFormula: false,
              cellStyles: false,
              cellDates: false, // Desabilitar conversão automática de datas
              cellNF: false,
              cellText: false,
              WTF: true, // Habilitar modo de tolerância a erros
              sheetStubs: true, // Incluir células vazias
              bookDeps: false, // Ignorar dependências
              bookFiles: false, // Ignorar arquivos incorporados
              bookProps: false, // Ignorar propriedades
              bookSheets: false, // Ignorar informações de planilha
              bookVBA: false, // Ignorar macros VBA
              password: "", // Sem senha
              ignoreEC: true, // Ignorar erros de cálculo
            })
          } catch (fallbackError) {
            // Se ambas as tentativas falharem, forneça uma mensagem de erro mais útil
            console.error("Erro ao processar arquivo Excel:", fallbackError)

            if (primaryError.message && primaryError.message.includes("Missing Info for XLS Record")) {
              throw new Error(
                "O arquivo Excel contém recursos avançados não suportados. Por favor, tente uma das seguintes soluções:\n\n" +
                  "1. Salve o arquivo em formato Excel 97-2003 (.xls)\n" +
                  "2. Salve como CSV e depois converta para Excel novamente\n" +
                  "3. Remova formatações complexas, macros, e fórmulas avançadas\n" +
                  "4. Abra o arquivo no Excel e salve como uma nova cópia",
              )
            }

            throw fallbackError
          }
        }

        // Atualizar progresso
        onProgress?.(50)

        // Verificar se há pelo menos uma planilha
        if (workbook.SheetNames.length === 0) {
          throw new Error("O arquivo não contém planilhas")
        }

        // Obter a primeira planilha
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]

        // Converter para JSON com opções para lidar com valores problemáticos
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, {
          defval: "", // Valor padrão para células vazias
          raw: false, // Converter valores para tipos apropriados
          blankrows: false, // Ignorar linhas em branco
        })

        // Atualizar progresso
        onProgress?.(70)

        // Verificar se há dados
        if (jsonData.length === 0) {
          throw new Error("A planilha não contém dados")
        }

        // Verificar colunas obrigatórias
        const requiredColumns = [
          "contato",
          "clifor_cliente",
          "nome_clifor",
          "cnpj_cliente",
          "fatura",
          "codigo_item",
          "emissao",
          "vencimento_real",
          "valor_recebido_total",
          "percent_comissao_item_contrato",
          "valor_comissao_total",
          "taxa_imposto",
          "valor_imposto",
          "valor_a_pagar_sem_imposto",
          "valor_menos_imposto",
        ]

        const firstRow = jsonData[0]
        const missingColumns = requiredColumns.filter((col) => !(col in firstRow))

        if (missingColumns.length > 0) {
          throw new Error(`Colunas obrigatórias ausentes: ${missingColumns.join(", ")}`)
        }

        // Processar e normalizar os dados
        const processedData: CommissionData[] = jsonData.map((row) => {
          // Converter valores numéricos
          const valor_recebido_total =
            typeof row.valor_recebido_total === "string"
              ? Number.parseFloat(row.valor_recebido_total.replace(",", "."))
              : row.valor_recebido_total

          const percent_comissao_item_contrato =
            typeof row.percent_comissao_item_contrato === "string"
              ? Number.parseFloat(row.percent_comissao_item_contrato.replace(",", "."))
              : row.percent_comissao_item_contrato

          const valor_comissao_total =
            typeof row.valor_comissao_total === "string"
              ? Number.parseFloat(row.valor_comissao_total.replace(",", "."))
              : row.valor_comissao_total

          const taxa_imposto =
            typeof row.taxa_imposto === "string"
              ? Number.parseFloat(row.taxa_imposto.replace(",", "."))
              : row.taxa_imposto

          const valor_imposto =
            typeof row.valor_imposto === "string"
              ? Number.parseFloat(row.valor_imposto.replace(",", "."))
              : row.valor_imposto

          const valor_a_pagar_sem_imposto =
            typeof row.valor_a_pagar_sem_imposto === "string"
              ? Number.parseFloat(row.valor_a_pagar_sem_imposto.replace(",", "."))
              : row.valor_a_pagar_sem_imposto

          const valor_menos_imposto =
            typeof row.valor_menos_imposto === "string"
              ? Number.parseFloat(row.valor_menos_imposto.replace(",", "."))
              : row.valor_menos_imposto

          // Normalizar datas
          let emissao = row.emissao
          if (typeof emissao === "string") {
            // Tentar converter para data
            const dateParts = emissao.split("/")
            if (dateParts.length === 3) {
              // Formato DD/MM/YYYY
              emissao = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
            }
          } else if (typeof emissao === "number") {
            // Provavelmente um número serial do Excel
            try {
              emissao = XLSX.SSF.format("yyyy-mm-dd", emissao)
            } catch (e) {
              // Fallback se a formatação falhar
              const date = new Date(1899, 11, 30 + emissao)
              emissao = date.toISOString().split("T")[0]
            }
          }

          let vencimento_real = row.vencimento_real
          if (typeof vencimento_real === "string") {
            // Tentar converter para data
            const dateParts = vencimento_real.split("/")
            if (dateParts.length === 3) {
              // Formato DD/MM/YYYY
              vencimento_real = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
            }
          } else if (typeof vencimento_real === "number") {
            // Provavelmente um número serial do Excel
            try {
              vencimento_real = XLSX.SSF.format("yyyy-mm-dd", vencimento_real)
            } catch (e) {
              // Fallback se a formatação falhar
              const date = new Date(1899, 11, 30 + vencimento_real)
              vencimento_real = date.toISOString().split("T")[0]
            }
          }

          return {
            contato: row.contato || "",
            clifor_cliente: row.clifor_cliente || "",
            nome_clifor: row.nome_clifor || "",
            cnpj_cliente: row.cnpj_cliente || "",
            fatura: row.fatura || "",
            codigo_item: row.codigo_item || "",
            emissao: emissao || "",
            vencimento_real: vencimento_real || "",
            valor_recebido_total: isNaN(valor_recebido_total) ? 0 : valor_recebido_total,
            percent_comissao_item_contrato: isNaN(percent_comissao_item_contrato) ? 0 : percent_comissao_item_contrato,
            valor_comissao_total: isNaN(valor_comissao_total) ? 0 : valor_comissao_total,
            taxa_imposto: isNaN(taxa_imposto) ? 0 : taxa_imposto,
            valor_imposto: isNaN(valor_imposto) ? 0 : valor_imposto,
            valor_a_pagar_sem_imposto: isNaN(valor_a_pagar_sem_imposto) ? 0 : valor_a_pagar_sem_imposto,
            valor_menos_imposto: isNaN(valor_menos_imposto) ? 0 : valor_menos_imposto,
          }
        })

        // Atualizar progresso
        onProgress?.(90)

        // Calcular estatísticas
        const clientSet = new Set(processedData.map((item) => item.cnpj_cliente))
        const productSet = new Set(processedData.map((item) => item.codigo_item))
        const totalCommission = processedData.reduce((sum, item) => sum + item.valor_comissao_total, 0)

        // Determinar o período do arquivo
        const dates = processedData.map((item) => new Date(item.emissao)).filter((d) => !isNaN(d.getTime())) // Filtrar datas inválidas

        // Verificar se há datas válidas
        let period = "Período desconhecido"
        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
          const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

          const formatDate = (date: Date) => {
            return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
          }

          period =
            minDate.getMonth() === maxDate.getMonth() && minDate.getFullYear() === maxDate.getFullYear()
              ? formatDate(minDate)
              : `${formatDate(minDate)} - ${formatDate(maxDate)}`
        }

        // Criar objeto de arquivo processado
        const processedFile: ProcessedFile = {
          id: uuidv4(),
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extensão
          originalName: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          period,
          data: processedData,
          summary: {
            clientCount: clientSet.size,
            productCount: productSet.size,
            totalCommission,
          },
        }

        // Atualizar progresso
        onProgress?.(100)

        resolve(processedFile)
      } catch (error) {
        console.error("Erro ao processar arquivo Excel:", error)
        reject(error instanceof Error ? error : new Error("Erro desconhecido ao processar o arquivo"))
      }
    }

    reader.onerror = (error) => {
      console.error("Erro ao ler o arquivo:", error)
      reject(new Error("Erro ao ler o arquivo"))
    }

    reader.readAsArrayBuffer(file)
  })
}
