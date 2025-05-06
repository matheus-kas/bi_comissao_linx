"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ComparisonSummary } from "@/components/comparison-summary"
import { ComparisonTable } from "@/components/comparison-table"
import { ComparisonCharts } from "@/components/comparison-charts"
import type { ProcessedFile } from "@/types/file-types"
import { PlusCircle, MinusCircle, AlertCircle } from "lucide-react"

interface ComparisonToolProps {
  files: ProcessedFile[]
}

export function ComparisonTool({ files }: ComparisonToolProps) {
  const [file1Id, setFile1Id] = useState<string>(files[0]?.id || "")
  const [file2Id, setFile2Id] = useState<string>(files.length > 1 ? files[1].id : "")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const file1 = useMemo(() => files.find((f) => f.id === file1Id), [files, file1Id])
  const file2 = useMemo(() => files.find((f) => f.id === file2Id), [files, file2Id])

  const canCompare = file1 && file2 && file1.id !== file2.id

  const clientComparisonData = useMemo(() => {
    if (!file1 || !file2) return []

    const mergedData = file1.data.map((item1) => {
      const item2 = file2.data.find((item) => item.client === item1.client)
      if (item2) {
        const percentChange = ((item2.commission - item1.commission) / item1.commission) * 100
        return {
          client: item1.client,
          [file1.name]: item1.commission,
          [file2.name]: item2.commission,
          percentChange: percentChange,
        }
      } else {
        return {
          client: item1.client,
          [file1.name]: item1.commission,
          [file2.name]: 0,
          percentChange: -100,
        }
      }
    })

    file2.data.forEach((item2) => {
      if (!file1.data.find((item) => item.client === item2.client)) {
        mergedData.push({
          client: item2.client,
          [file1.name]: 0,
          [file2.name]: item2.commission,
          percentChange: 100,
        })
      }
    })

    return mergedData
  }, [file1, file2])

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
            <ComparisonSummary file1={file1} file2={file2} formatCurrency={formatCurrency} />
          </TabsContent>
          <TabsContent value="charts">
            <ComparisonCharts file1={file1} file2={file2} formatCurrency={formatCurrency} />
          </TabsContent>
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Novos Itens</h3>
                    <p className="text-2xl font-bold">
                      {file1 && file2
                        ? clientComparisonData.filter((item) => item[file1.name] === 0 && item[file2.name] > 0).length
                        : 0}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                    <PlusCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Itens Removidos</h3>
                    <p className="text-2xl font-bold">
                      {file1 && file2
                        ? clientComparisonData.filter((item) => item[file1.name] > 0 && item[file2.name] === 0).length
                        : 0}
                    </p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full">
                    <MinusCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Alterações Significativas</h3>
                    <p className="text-2xl font-bold">
                      {file1 && file2
                        ? clientComparisonData.filter(
                            (item) => item[file1.name] > 0 && item[file2.name] > 0 && Math.abs(item.percentChange) > 10,
                          ).length
                        : 0}
                    </p>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <ComparisonTable file1={file1} file2={file2} formatCurrency={formatCurrency} />
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
