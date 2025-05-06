"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DebugTable } from "@/components/debug-table"
import { Button } from "@/components/ui/button"
import { FileSearch, Link } from "lucide-react"
import type { ProcessedFile } from "@/types/file-types"

export default function DebugPage() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string>("")

  // Simulação de carregamento de dados
  useEffect(() => {
    // Em um cenário real, esses dados viriam do contexto ou de uma API
    const mockFiles = localStorage.getItem("processedFiles")
    if (mockFiles) {
      try {
        const parsedFiles = JSON.parse(mockFiles) as ProcessedFile[]
        setFiles(parsedFiles)
        if (parsedFiles.length > 0 && !selectedFileId) {
          setSelectedFileId(parsedFiles[0].id)
        }
      } catch (e) {
        console.error("Erro ao carregar arquivos:", e)
      }
    }
  }, [selectedFileId])

  const selectedFile = files.find((f) => f.id === selectedFileId)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Depuração de Dados</h1>
          <p className="text-muted-foreground">Examine os dados brutos dos arquivos para identificar problemas</p>
        </div>

        {files.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FileSearch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum arquivo processado</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Faça upload de um arquivo Excel com dados de comissão para realizar a depuração.
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
                  <CardDescription>Escolha um arquivo para examinar os dados brutos</CardDescription>
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
                </div>
              </CardHeader>
            </Card>

            {selectedFile ? (
              <DebugTable file={selectedFile} />
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
