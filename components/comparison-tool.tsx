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

    // Mapear clientes do arquivo 1
    const clientMap1 = new Map<string, number>()
    file1.data.forEach((item) => {
      const clientName = item.nome_clifor
      const currentTotal = clientMap1.get(clientName) || 0
      clientMap1.set(clientName, currentTotal + item.valor_comissao_total)
    })

    // Mapear clientes do arquivo 2
    const clientMap2 = new Map<string, number>()
    file2.data.forEach((item) => {
      const clientName = item.nome_clifor
      const currentTotal = clientMap2.get(clientName) || 0
      clientMap2.set(clientName, currentTotal + item.valor_comissao_total)
    })

    const mergedData: any[] = []

    // Combinar dados de clientes
    const allClients = new Set([...clientMap1.keys(), ...clientMap2.keys()])
    allClients.forEach((client) => {
      const value1 = clientMap1.get(client) || 0
      const value2 = clientMap2.get(client) || 0
      const difference = value2 - value1

      // Calcular a mudança percentual com verificação para evitar divisão por zero
      let percentChange = 0
      if (value1 !== 0) {
        percentChange = (difference / value1) * 100
      } else if (value2 > 0) {
        percentChange = 100 // Se o valor anterior era 0 e agora é positivo, aumento de 100%
      }

      mergedData.push({
        name: client,
        [file1.name]: value1,
        [file2.name]: value2,
        arquivo1: value1, // Adicionar aliases para uso seguro
        arquivo2: value2, // Adicionar aliases para uso seguro
        difference,
        percentChange,
      })
    })

    return mergedData
  }, [file1, file2])

  const productComparisonData = useMemo(() => {
    if (!file1 || !file2) return []

    // Mapear produtos do arquivo 1
    const productMap1 = new Map<string, number>()
    file1.data.forEach((item) => {
      const productName = item.codigo_item
      const currentTotal = productMap1.get(productName) || 0
      productMap1.set(productName, currentTotal + item.valor_comissao_total)
    })

    // Mapear produtos do arquivo 2
    const productMap2 = new Map<string, number>()
    file2.data.forEach((item) => {
      const productName = item.codigo_item
      const currentTotal = productMap2.get(productName) || 0
      productMap2.set(productName, currentTotal + item.valor_comissao_total)
    })

    const mergedData: any[] = []

    // Combinar dados de produtos
    const allProducts = new Set([...productMap1.keys(), ...productMap2.keys()])
    allProducts.forEach((product) => {
      const value1 = productMap1.get(product) || 0
      const value2 = productMap2.get(product) || 0
      const difference = value2 - value1

      // Calcular a mudança percentual com verificação para evitar divisão por zero
      let percentChange = 0
      if (value1 !== 0) {
        percentChange = (difference / value1) * 100
      } else if (value2 > 0) {
        percentChange = 100 // Se o valor anterior era 0 e agora é positivo, aumento de 100%
      }

      mergedData.push({
        name: product,
        [file1.name]: value1,
        [file2.name]: value2,
        difference,
        percentChange,
      })
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
            <ComparisonSummary file1={file1} file2={file2} />
          </TabsContent>
          <TabsContent value="charts">
            <ComparisonCharts file1={file1} file2={file2} />
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
            <ComparisonTable
              data={clientComparisonData}
              file1Name={file1?.name || "Arquivo 1"}
              file2Name={file2?.name || "Arquivo 2"}
              file1Alias="arquivo1"
              file2Alias="arquivo2"
            />
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
