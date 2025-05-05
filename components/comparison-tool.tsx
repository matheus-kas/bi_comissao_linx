"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ComparisonSummary } from "@/components/comparison-summary"
import { ComparisonTable } from "@/components/comparison-table"
import { ComparisonCharts } from "@/components/comparison-charts"
import type { ProcessedFile } from "@/types/file-types"

interface ComparisonToolProps {
  files: ProcessedFile[]
}

export function ComparisonTool({ files }: ComparisonToolProps) {
  const [file1Id, setFile1Id] = useState<string>(files[0]?.id || "")
  const [file2Id, setFile2Id] = useState<string>(files.length > 1 ? files[1].id : "")

  const file1 = useMemo(() => files.find((f) => f.id === file1Id), [files, file1Id])
  const file2 = useMemo(() => files.find((f) => f.id === file2Id), [files, file2Id])

  const canCompare = file1 && file2 && file1.id !== file2.id

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Períodos</CardTitle>
          <CardDescription>Selecione dois arquivos para comparar os dados de comissão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Arquivo 1</label>
              <Select value={file1Id} onValueChange={setFile1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um arquivo" />
                </SelectTrigger>
                <SelectContent>
                  {files.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Arquivo 2</label>
              <Select value={file2Id} onValueChange={setFile2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um arquivo" />
                </SelectTrigger>
                <SelectContent>
                  {files.map((file) => (
                    <SelectItem key={file.id} value={file.id} disabled={file.id === file1Id}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {canCompare ? (
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <ComparisonSummary file1={file1} file2={file2} />
          </TabsContent>
          <TabsContent value="charts">
            <ComparisonCharts file1={file1} file2={file2} />
          </TabsContent>
          <TabsContent value="details">
            <ComparisonTable file1={file1} file2={file2} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Selecione dois arquivos diferentes para iniciar a comparação</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
