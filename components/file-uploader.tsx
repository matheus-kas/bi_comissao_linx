"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileWarning, CheckCircle2, Loader2, FileText, Info, AlertTriangle, Bug, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/custom-alert"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { processFile } from "@/lib/file-processor"
import type { ProcessedFile } from "@/types/file-types"
import * as XLSX from "xlsx"

interface FileUploaderProps {
  onFileProcessed: (file: ProcessedFile) => void
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [processingStage, setProcessingStage] = useState<string>("Aguardando arquivo")
  const [showXLSWarning, setShowXLSWarning] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [rawData, setRawData] = useState<any[] | null>(null)
  const [showRawData, setShowRawData] = useState(false)
  const [showColumnMapping, setShowColumnMapping] = useState(false)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})

  // Referência para os logs de console
  const consoleLogsRef = useRef<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setError(null)
      setDebugInfo(null)
      setRawData(null)
      setShowRawData(false)
      consoleLogsRef.current = []

      // Verificar se é um arquivo .xls (potencialmente problemático)
      if (selectedFile.name.toLowerCase().endsWith(".xls")) {
        setShowXLSWarning(true)
      } else {
        setShowXLSWarning(false)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  // Função para capturar logs do console
  const captureConsoleLogs = () => {
    const originalConsoleLog = console.log
    const originalConsoleWarn = console.warn
    const originalConsoleError = console.error

    console.log = (...args) => {
      const logMessage = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")
      consoleLogsRef.current.push(`[LOG] ${logMessage}`)
      originalConsoleLog(...args)
    }

    console.warn = (...args) => {
      const logMessage = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")
      consoleLogsRef.current.push(`[WARN] ${logMessage}`)
      originalConsoleWarn(...args)
    }

    console.error = (...args) => {
      const logMessage = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")
      consoleLogsRef.current.push(`[ERROR] ${logMessage}`)
      originalConsoleError(...args)
    }

    return () => {
      console.log = originalConsoleLog
      console.warn = originalConsoleWarn
      console.error = originalConsoleError
    }
  }

  // Função para ler dados brutos do arquivo
  const readRawData = async () => {
    if (!file) return null

    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const data = new Uint8Array(arrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: "" })
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Erro ao ler o arquivo"))
      reader.readAsArrayBuffer(file)
    })
  }

  // Função para analisar o mapeamento de colunas
  const analyzeColumnMapping = async () => {
    if (!file) return

    try {
      const reader = new FileReader()

      return new Promise<void>((resolve, reject) => {
        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer
            const data = new Uint8Array(arrayBuffer)
            const workbook = XLSX.read(data, { type: "array" })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]

            // Obter cabeçalhos
            const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[]
            const mapping: Record<string, string> = {}

            headerRow.forEach((header, index) => {
              const colLetter = XLSX.utils.encode_col(index)
              mapping[header] = colLetter
            })

            setColumnMapping(mapping)
            setShowColumnMapping(true)
            resolve()
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = () => reject(new Error("Erro ao ler o arquivo"))
        reader.readAsArrayBuffer(file)
      })
    } catch (error) {
      console.error("Erro ao analisar mapeamento de colunas:", error)
    }
  }

  const handleProcess = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setDebugInfo(null)
    setRawData(null)
    setShowRawData(false)
    consoleLogsRef.current = []
    setProcessingStage("Iniciando processamento")

    // Capturar logs se estiver em modo de depuração
    let restoreConsole = () => {}
    if (debugMode) {
      restoreConsole = captureConsoleLogs()
    }

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }

          // Atualizar estágio baseado no progresso
          if (prev < 20) {
            setProcessingStage("Lendo arquivo")
          } else if (prev < 40) {
            setProcessingStage("Extraindo dados")
          } else if (prev < 60) {
            setProcessingStage("Normalizando informações")
          } else if (prev < 80) {
            setProcessingStage("Calculando métricas")
          } else {
            setProcessingStage("Finalizando")
          }

          return prev + 5
        })
      }, 200)

      // Processar o arquivo
      const processedFile = await processFile(file)

      // Se estiver em modo de depuração, ler dados brutos
      if (debugMode) {
        try {
          const rawDataResult = await readRawData()
          setRawData(rawDataResult)
        } catch (e) {
          console.error("Erro ao ler dados brutos:", e)
        }
      }

      clearInterval(progressInterval)
      setProgress(100)
      setProcessingStage("Processamento concluído")

      // Mostrar informações de depuração se estiver no modo debug
      if (debugMode) {
        const debugSummary = `
Arquivo: ${file.name}
Tamanho: ${(file.size / 1024).toFixed(2)} KB
Registros: ${processedFile.data.length}
Clientes: ${processedFile.summary.clientCount}
Produtos: ${processedFile.summary.productCount}
Total de Comissões: R$ ${processedFile.summary.totalCommission.toFixed(2)}
        `
        setDebugInfo(debugSummary)
      }

      setTimeout(() => {
        onFileProcessed(processedFile)
        setFile(null)
        setIsProcessing(false)
        setProgress(0)
        setProcessingStage("Aguardando arquivo")
        setShowXLSWarning(false)

        // Restaurar console
        if (debugMode) {
          restoreConsole()
        }
      }, 500)
    } catch (err) {
      console.error("Erro ao processar arquivo:", err)

      // Mensagem de erro mais detalhada
      const errorMessage = err instanceof Error ? err.message : "Erro ao processar o arquivo"

      setError(errorMessage)
      setIsProcessing(false)
      setProgress(0)
      setProcessingStage("Erro no processamento")

      // Adicionar informações de depuração se estiver no modo debug
      if (debugMode) {
        setDebugInfo(
          `Erro: ${errorMessage}\nTipo de arquivo: ${file.type}\nTamanho: ${(file.size / 1024).toFixed(2)} KB`,
        )
      }

      // Restaurar console
      restoreConsole()
    }
  }

  // Função para exportar dados brutos como CSV
  const exportRawDataAsCSV = () => {
    if (!rawData) return

    // Converter para CSV
    const headers = Object.keys(rawData[0]).join(",")
    const rows = rawData.map((row) =>
      Object.values(row)
        .map((value) => (typeof value === "string" && value.includes(",") ? `"${value}"` : value))
        .join(","),
    )
    const csv = [headers, ...rows].join("\n")

    // Criar blob e link para download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${file?.name.replace(/\.\w+$/, "")}_raw_data.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Upload de Arquivo
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Informações</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Faça upload de arquivos Excel (.xls ou .xlsx) com dados de comissão da Linx. O arquivo deve conter
                  colunas como nome_clifor, cnpj_cliente, codigo_item, valor_comissao_total, etc.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Faça upload de arquivos Excel (.xls ou .xlsx) com dados de comissão da Linx</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            {isDragActive ? (
              <p>Solte o arquivo aqui...</p>
            ) : (
              <>
                <p className="text-lg font-medium">Arraste e solte um arquivo aqui, ou clique para selecionar</p>
                <p className="text-sm text-muted-foreground">
                  Suporta arquivos Excel (.xlsx) e CSV com a estrutura de comissões da Linx
                </p>
              </>
            )}
          </div>
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!isProcessing && (
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                Remover
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="debug-mode" checked={debugMode} onCheckedChange={setDebugMode} />
          <Label htmlFor="debug-mode" className="flex items-center gap-1">
            <Bug className="h-4 w-4" />
            Modo de depuração
          </Label>
        </div>

        {showXLSWarning && (
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Arquivo XLS detectado</AlertTitle>
            <AlertDescription className="text-amber-700">
              Arquivos no formato XLS mais antigo podem causar problemas de compatibilidade. Recomendamos:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Abrir o arquivo no Excel e salvar como XLSX (formato mais recente)</li>
                <li>Ou exportar para CSV antes de fazer o upload</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <FileWarning className="h-4 w-4" />
            <AlertTitle>Erro no processamento</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
          </Alert>
        )}

        {debugInfo && (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Bug className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Informações de depuração</AlertTitle>
            <AlertDescription className="whitespace-pre-line font-mono text-xs text-blue-700">
              {debugInfo}
            </AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{processingStage}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progress < 100 ? "Por favor, aguarde enquanto processamos seu arquivo..." : "Processamento concluído!"}
            </p>
          </div>
        )}

        {debugMode && rawData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setShowRawData(!showRawData)}>
                {showRawData ? "Ocultar dados brutos" : "Mostrar dados brutos"}
              </Button>

              <Button variant="outline" size="sm" onClick={exportRawDataAsCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar dados brutos
              </Button>

              <Button variant="outline" size="sm" onClick={analyzeColumnMapping}>
                Analisar Mapeamento de Colunas
              </Button>
            </div>

            {showRawData && (
              <div className="border rounded-md p-2 mt-2">
                <p className="text-sm font-medium mb-2">Primeiros 5 registros (dados brutos):</p>
                <Textarea
                  readOnly
                  className="font-mono text-xs h-40"
                  value={JSON.stringify(rawData.slice(0, 5), null, 2)}
                />
              </div>
            )}

            {showColumnMapping && (
              <div className="border rounded-md p-2 mt-2">
                <p className="text-sm font-medium mb-2">Mapeamento de Colunas:</p>
                <Textarea readOnly className="font-mono text-xs h-40" value={JSON.stringify(columnMapping, null, 2)} />
              </div>
            )}

            <div className="border rounded-md p-2 mt-2">
              <p className="text-sm font-medium mb-2">Logs de console:</p>
              <Textarea readOnly className="font-mono text-xs h-40" value={consoleLogsRef.current.join("\n")} />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button onClick={handleProcess} disabled={!file || isProcessing} className="w-full">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Processar Arquivo
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-2 w-full">
          <p className="font-medium">Dicas para o upload:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Certifique-se de que o arquivo contém as colunas obrigatórias: nome_clifor, cnpj_cliente, codigo_item,
              valor_comissao_total
            </li>
            <li>Recomendamos usar o formato XLSX (Excel mais recente) em vez de XLS</li>
            <li>Se encontrar erros, tente salvar o arquivo como CSV e fazer o upload novamente</li>
            <li>Remova formatações complexas, macros e fórmulas avançadas antes do upload</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}
