"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileWarning, CheckCircle2, Loader2, FileText, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { processFile } from "@/lib/file-processor"
import type { ProcessedFile } from "@/types/file-types"

interface FileUploaderProps {
  onFileProcessed: (file: ProcessedFile) => void
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [processingStage, setProcessingStage] = useState<string>("Aguardando arquivo")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError(null)
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

  const handleProcess = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setProcessingStage("Iniciando processamento")

    try {
      // Simular progresso com estágios mais detalhados
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

      const processedFile = await processFile(file)

      clearInterval(progressInterval)
      setProgress(100)
      setProcessingStage("Processamento concluído")

      setTimeout(() => {
        onFileProcessed(processedFile)
        setFile(null)
        setIsProcessing(false)
        setProgress(0)
        setProcessingStage("Aguardando arquivo")
      }, 500)
    } catch (err) {
      console.error("Erro ao processar arquivo:", err)

      // Mensagem de erro mais detalhada
      let errorMessage = err instanceof Error ? err.message : "Erro ao processar o arquivo"

      // Verificar se é o erro específico de registro XLS
      if (errorMessage.includes("Missing Info for XLS Record")) {
        errorMessage =
          "O arquivo Excel contém recursos avançados não suportados. Por favor, tente uma das seguintes soluções:\n\n" +
          "1. Salve o arquivo em formato Excel 97-2003 (.xls)\n" +
          "2. Salve como CSV e depois converta para Excel novamente\n" +
          "3. Remova formatações complexas, macros, e fórmulas avançadas\n" +
          "4. Abra o arquivo no Excel e salve como uma nova cópia"
      }

      setError(errorMessage)
      setIsProcessing(false)
      setProgress(0)
      setProcessingStage("Erro no processamento")
    }
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
                  Suporta arquivos Excel (.xls, .xlsx) e CSV com a estrutura de comissões da Linx
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

        {error && (
          <Alert variant="destructive">
            <FileWarning className="h-4 w-4" />
            <AlertTitle>Erro no processamento</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
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
            <li>Para arquivos grandes, o processamento pode levar alguns minutos</li>
            <li>Se encontrar erros, tente salvar o arquivo em um formato mais simples (Excel 97-2003)</li>
            <li>Remova formatações complexas, macros e fórmulas avançadas antes do upload</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}
