"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatCard } from "@/components/ui/stat-card"
import { EnhancedChart } from "@/components/ui/enhanced-chart"
import { ComparisonTable } from "@/components/comparison-table"
import { MultiPeriodComparison } from "@/components/multi-period-comparison"
import { ArrowUpDown, FileSearch, Users, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ProcessedFile } from "@/types/file-types"

export default function ComparisonPage() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [file1Id, setFile1Id] = useState<string>("")
  const [file2Id, setFile2Id] = useState<string>("")
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [comparisonMode, setComparisonMode] = useState<"dual" | "multi">("dual")

  // Simulação de carregamento de dados
  useEffect(() => {
    // Em um cenário real, esses dados viriam do contexto ou de uma API
    const mockFiles = localStorage.getItem("processedFiles")
    if (mockFiles) {
      try {
        const parsedFiles = JSON.parse(mockFiles) as ProcessedFile[]
        setFiles(parsedFiles)
        if (parsedFiles.length > 1) {
          if (!file1Id) setFile1Id(parsedFiles[0].id)
          if (!file2Id) setFile2Id(parsedFiles[1].id)
        }
      } catch (e) {
        console.error("Erro ao carregar arquivos:", e)
      }
    }
  }, [file1Id, file2Id])

  // Gerar dados de comparação quando os arquivos selecionados mudarem
  useEffect(() => {
    if (!file1Id || !file2Id || file1Id === file2Id || files.length < 2) return

    const file1 = files.find((f) => f.id === file1Id)
    const file2 = files.find((f) => f.id === file2Id)

    if (!file1 || !file2) return

    // Simulação de comparação (em um cenário real, isso seria feito pelo processador de arquivos)
    const clientComparisonData = []
    const productComparisonData = []

    // Mapear clientes do arquivo 1
    const clientMap1 = new Map<string, number>()
    file1.data.forEach((item) => {
      const client = item.nome_clifor
      clientMap1.set(client, (clientMap1.get(client) || 0) + item.valor_comissao_total)
    })

    // Mapear clientes do arquivo 2
    const clientMap2 = new Map<string, number>()
    file2.data.forEach((item) => {
      const client = item.nome_clifor
      clientMap2.set(client, (clientMap2.get(client) || 0) + item.valor_comissao_total)
    })

    // Combinar dados de clientes
    const allClients = new Set([...clientMap1.keys(), ...clientMap2.keys()])
    allClients.forEach((client) => {
      const value1 = clientMap1.get(client) || 0
      const value2 = clientMap2.get(client) || 0
      const difference = value2 - value1
      const percentChange = value1 === 0 ? (value2 > 0 ? 100 : 0) : (difference / value1) * 100

      clientComparisonData.push({
        name: client,
        [file1.name]: value1,
        [file2.name]: value2,
        difference,
        percentChange,
      })
    })

    // Mapear produtos do arquivo 1
    const productMap1 = new Map<string, number>()
    file1.data.forEach((item) => {
      const product = item.codigo_item
      productMap1.set(product, (productMap1.get(product) || 0) + item.valor_comissao_total)
    })

    // Mapear produtos do arquivo 2
    const productMap2 = new Map<string, number>()
    file2.data.forEach((item) => {
      const product = item.codigo_item
      productMap2.set(product, (productMap2.get(product) || 0) + item.valor_comissao_total)
    })

    // Combinar dados de produtos
    const allProducts = new Set([...productMap1.keys(), ...productMap2.keys()])
    allProducts.forEach((product) => {
      const value1 = productMap1.get(product) || 0
      const value2 = productMap2.get(product) || 0
      const difference = value2 - value1
      const percentChange = value1 === 0 ? (value2 > 0 ? 100 : 0) : (difference / value1) * 100

      productComparisonData.push({
        name: product,
        [file1.name]: value1,
        [file2.name]: value2,
        difference,
        percentChange,
      })
    })

    // Calcular estatísticas gerais
    const totalCommission1 = file1.summary.totalCommission
    const totalCommission2 = file2.summary.totalCommission
    const totalDifference = totalCommission2 - totalCommission1
    const totalPercentChange = (totalDifference / totalCommission1) * 100

    const uniqueClientsFile1 = [...clientMap1.keys()].filter((client) => !clientMap2.has(client)).length
    const uniqueClientsFile2 = [...clientMap2.keys()].filter((client) => !clientMap1.has(client)).length

    const uniqueProductsFile1 = [...productMap1.keys()].filter((product) => !productMap2.has(product)).length
    const uniqueProductsFile2 = [...productMap2.keys()].filter((product) => !productMap1.has(product)).length

    setComparisonData({
      clientData: clientComparisonData.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)),
      productData: productComparisonData.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)),
      summary: {
        totalCommission1,
        totalCommission2,
        totalDifference,
        totalPercentChange,
        uniqueClientsFile1,
        uniqueClientsFile2,
        uniqueProductsFile1,
        uniqueProductsFile2,
      },
    })
  }, [file1Id, file2Id, files])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comparação de Períodos</h1>
            <p className="text-muted-foreground">Compare dados de comissão entre diferentes períodos</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={comparisonMode === "dual" ? "default" : "outline"}
              onClick={() => setComparisonMode("dual")}
            >
              Comparação Dual
            </Button>
            <Button
              variant={comparisonMode === "multi" ? "default" : "outline"}
              onClick={() => setComparisonMode("multi")}
            >
              Evolução Multi-Período
            </Button>
          </div>
        </div>

        {files.length < 2 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FileSearch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Arquivos insuficientes para comparação</h3>
              <p className="text-muted-foreground text-center max-w-md">
                É necessário ter pelo menos dois arquivos processados para realizar uma comparação.
              </p>
              <Button variant="default" className="mt-4" asChild>
                <Link href="/upload">Fazer Upload</Link>
              </Button>
            </CardContent>
          </Card>
        ) : comparisonMode === "dual" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Selecione os Arquivos para Comparação</CardTitle>
                <CardDescription>Escolha dois arquivos diferentes para analisar as diferenças</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Arquivo 1 (Base)</label>
                    <Select value={file1Id} onValueChange={setFile1Id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o arquivo base" />
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Arquivo 2 (Comparação)</label>
                    <Select value={file2Id} onValueChange={setFile2Id} disabled={!file1Id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o arquivo para comparação" />
                      </SelectTrigger>
                      <SelectContent>
                        {files
                          .filter((file) => file.id !== file1Id)
                          .map((file) => (
                            <SelectItem key={file.id} value={file.id}>
                              {file.name} ({file.period})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {comparisonData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Diferença Total"
                    value={formatCurrency(comparisonData.summary.totalDifference)}
                    icon={<ArrowUpDown className="h-5 w-5 text-primary" />}
                    trend={comparisonData.summary.totalPercentChange}
                    trendLabel="variação"
                  />

                  <StatCard
                    title="Clientes Exclusivos (Base)"
                    value={comparisonData.summary.uniqueClientsFile1}
                    icon={<Users className="h-5 w-5 text-primary" />}
                  />

                  <StatCard
                    title="Clientes Exclusivos (Comparação)"
                    value={comparisonData.summary.uniqueClientsFile2}
                    icon={<Users className="h-5 w-5 text-primary" />}
                  />

                  <StatCard
                    title="Produtos Exclusivos"
                    value={comparisonData.summary.uniqueProductsFile1 + comparisonData.summary.uniqueProductsFile2}
                    icon={<ShoppingBag className="h-5 w-5 text-primary" />}
                  />
                </div>

                <Tabs defaultValue="charts">
                  <TabsList>
                    <TabsTrigger value="charts">Gráficos</TabsTrigger>
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="charts" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <EnhancedChart
                        title="Comparação por Cliente"
                        description="Top 10 clientes com maiores diferenças"
                        data={comparisonData.clientData.slice(0, 10).map((item) => ({
                          name: item.name,
                          value: item.difference,
                        }))}
                        valueFormatter={formatCurrency}
                        height={350}
                        colors={["#4ade80", "#f87171"]}
                      />

                      <EnhancedChart
                        title="Comparação por Produto"
                        description="Top 10 produtos com maiores diferenças"
                        data={comparisonData.productData.slice(0, 10).map((item) => ({
                          name: item.name,
                          value: item.difference,
                        }))}
                        valueFormatter={formatCurrency}
                        height={350}
                        colors={["#4ade80", "#f87171"]}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <Card>
                      <CardHeader>
                        <CardTitle>Detalhes da Comparação</CardTitle>
                        <CardDescription>Análise detalhada das diferenças entre os arquivos</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ComparisonTable
                          data={comparisonData.clientData}
                          file1Name={files.find((f) => f.id === file1Id)?.name || "Arquivo 1"}
                          file2Name={files.find((f) => f.id === file2Id)?.name || "Arquivo 2"}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </>
        ) : (
          <MultiPeriodComparison files={files} />
        )}
      </div>
    </MainLayout>
  )
}
