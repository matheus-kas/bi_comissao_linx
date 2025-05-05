"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileWarning, CheckCircle2, Loader2, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { processExcelFile } from "@/lib/file-processor"
import type { ProcessedFile } from "@/types/file-types"

interface FileUploaderProps {
  onFileProcessed: (file: ProcessedFile) => void
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

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
    },
    maxFiles: 1,
  })

  const handleProcess = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const processedFile = await processExcelFile(file, (p) => setProgress(p))

      clearInterval(progressInterval)
      setProgress(100)

      setTimeout(() => {
        onFileProcessed(processedFile)
        setFile(null)
        setIsProcessing(false)
        setProgress(0)
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
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload de Arquivo</CardTitle>
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
                  Suporta arquivos Excel (.xls, .xlsx) com a estrutura de comissões da Linx
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
              <span>Processando arquivo...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  )
}
