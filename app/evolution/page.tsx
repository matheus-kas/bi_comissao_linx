"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ItemEvolutionAnalysis } from "@/components/item-evolution-analysis"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { ProcessedFile } from "@/types/file-types"

export default function EvolutionPage() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFiles = () => {
      try {
        setLoading(true)
        const storedFiles = localStorage.getItem("processedFiles")

        if (storedFiles) {
          const parsedFiles = JSON.parse(storedFiles) as ProcessedFile[]
          setFiles(parsedFiles)
        } else {
          setFiles([])
        }

        setError(null)
      } catch (err) {
        console.error("Erro ao carregar arquivos:", err)
        setError("Não foi possível carregar os arquivos processados.")
        setFiles([])
      } finally {
        setLoading(false)
      }
    }

    loadFiles()
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Análise de Evolução</h1>
          <p className="text-muted-foreground">Compare a evolução de clientes e produtos ao longo do tempo</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <ItemEvolutionAnalysis files={files} />
        )}
      </div>
    </MainLayout>
  )
}
