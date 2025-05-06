"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileList } from "@/components/file-list"
import { SummaryCharts } from "@/components/summary-charts"
import { DataTable } from "@/components/data-table"
import type { ProcessedFile } from "@/types/file-types"

interface DataViewerProps {
  files: ProcessedFile[]
  onDeleteFile: (fileId: string) => void
}

export function DataViewer({ files, onDeleteFile }: DataViewerProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(files.length > 0 ? files[0].id : null)

  const selectedFile = useMemo(() => {
    return files.find((file) => file.id === selectedFileId) || null
  }, [files, selectedFileId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Arquivos Processados</CardTitle>
          <CardDescription>Selecione um arquivo para visualizar</CardDescription>
        </CardHeader>
        <CardContent>
          <FileList
            files={files}
            selectedFileId={selectedFileId}
            onSelectFile={setSelectedFileId}
            onDeleteFile={onDeleteFile}
          />
        </CardContent>
      </Card>

      <div className="md:col-span-3 space-y-4">
        {selectedFile ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Resumo: {selectedFile.name}</CardTitle>
                <CardDescription>Período: {selectedFile.period}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Total de Comissões</h3>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(selectedFile.summary.totalCommission)}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Total de Clientes</h3>
                    <p className="text-2xl font-bold">{selectedFile.summary.clientCount}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Total de Produtos</h3>
                    <p className="text-2xl font-bold">{selectedFile.summary.productCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="charts">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
                <TabsTrigger value="data">Dados</TabsTrigger>
              </TabsList>
              <TabsContent value="charts" className="space-y-4">
                <SummaryCharts data={selectedFile.data} />
              </TabsContent>
              <TabsContent value="data">
                <Card>
                  <CardContent className="p-0">
                    <DataTable data={selectedFile.data} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Selecione um arquivo para visualizar os dados</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
