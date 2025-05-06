"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Download, FileSearch, Link } from "lucide-react"
import type { ProcessedFile } from "@/types/file-types"
import { useSearchParams } from "next/navigation"

export default function AuditPage() {
  const searchParams = useSearchParams()
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("data")
  const [isInitialized, setIsInitialized] = useState(false)

  // Carregamento inicial de dados - executado apenas uma vez
  useEffect(() => {
    // Em um cenário real, esses dados viriam do contexto ou de uma API
    const mockFiles = localStorage.getItem("processedFiles")
    if (mockFiles) {
      try {
        const parsedFiles = JSON.parse(mockFiles) as ProcessedFile[]
        setFiles(parsedFiles)

        // Verificar se há um arquivo especificado na URL
        const fileId = searchParams.get("file")

        if (fileId) {
          setSelectedFileId(fileId)
        } else if (parsedFiles.length > 0) {
          setSelectedFileId(parsedFiles[0].id)
        }

        // Verificar se há uma aba especificada na URL
        const tab = searchParams.get("tab")
        if (tab) {
          setActiveTab(tab)
        }

        setIsInitialized(true)
      } catch (e) {
        console.error("Erro ao carregar arquivos:", e)
        setIsInitialized(true)
      }
    } else {
      setIsInitialized(true)
    }
  }, []) // Removida a dependência searchParams para evitar loops

  // Atualiza o estado quando os parâmetros da URL mudam, mas apenas após a inicialização
  useEffect(() => {
    if (!isInitialized) return

    const fileId = searchParams.get("file")
    if (fileId && fileId !== selectedFileId) {
      setSelectedFileId(fileId)
    }

    const tab = searchParams.get("tab")
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [searchParams, isInitialized, selectedFileId, activeTab])

  const selectedFile = files.find((f) => f.id === selectedFileId)

  const handleExportCSV = () => {
    if (!selectedFile) return

    // Converter dados para CSV
    const headers = Object.keys(selectedFile.data[0]).join(",")
    const rows = selectedFile.data.map((row) =>
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
    link.setAttribute("download", `${selectedFile.name.replace(/\s+/g, "_")}_export.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoria de Dados</h1>
          <p className="text-muted-foreground">Visualize e exporte os dados brutos dos arquivos processados</p>
        </div>

        {files.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FileSearch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum arquivo processado</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Faça upload de um arquivo Excel com dados de comissão para realizar a auditoria.
              </p>
              <Button variant="default" className="mt-4" asChild>
                <Link href="/upload">Fazer Upload</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Selecione um Arquivo</CardTitle>
                  <CardDescription>Escolha um arquivo para visualizar e auditar os dados</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Selecione um arquivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {files.map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                          {file.name} ({file.period})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleExportCSV} disabled={!selectedFile}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {selectedFile ? (
              <Card>
                <CardHeader>
                  <CardTitle>Dados de {selectedFile.name}</CardTitle>
                  <CardDescription>
                    {selectedFile.data.length} registros • Período: {selectedFile.period}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable data={selectedFile.data} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">Selecione um arquivo para visualizar os dados</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
