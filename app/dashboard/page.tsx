"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { StatCard } from "@/components/ui/stat-card"
import { QuickFilters } from "@/components/ui/quick-filters"
import { EnhancedChart } from "@/components/ui/enhanced-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Users, ShoppingBag, Percent, FileSearch } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ProcessedFile } from "@/types/file-types"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string>("")
  const [activeFilter, setActiveFilter] = useState("")
  const [clientData, setClientData] = useState<any[]>([])
  const [productData, setProductData] = useState<any[]>([])

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

  // Preparar dados para gráficos quando o arquivo selecionado mudar
  useEffect(() => {
    if (!selectedFileId || files.length === 0) return

    const selectedFile = files.find((f) => f.id === selectedFileId)
    if (!selectedFile) return

    // Preparar dados para o gráfico de clientes
    const clientMap = new Map<string, number>()
    selectedFile.data.forEach((item) => {
      const client = item.nome_clifor
      clientMap.set(client, (clientMap.get(client) || 0) + item.valor_comissao_total)
    })

    let clientDataArray = Array.from(clientMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Aplicar filtros
    if (activeFilter === "top-clients") {
      clientDataArray = clientDataArray.slice(0, 10)
    } else if (activeFilter === "highest-commission") {
      clientDataArray = clientDataArray.slice(0, 5)
    } else if (activeFilter === "lowest-commission") {
      clientDataArray = [...clientDataArray].sort((a, b) => a.value - b.value).slice(0, 5)
    }

    setClientData(clientDataArray)

    // Preparar dados para o gráfico de produtos
    const productMap = new Map<string, number>()
    selectedFile.data.forEach((item) => {
      const product = item.codigo_item
      productMap.set(product, (productMap.get(product) || 0) + item.valor_comissao_total)
    })

    let productDataArray = Array.from(productMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Aplicar filtros
    if (activeFilter === "top-products") {
      productDataArray = productDataArray.slice(0, 10)
    } else if (activeFilter === "highest-commission") {
      productDataArray = productDataArray.slice(0, 5)
    } else if (activeFilter === "lowest-commission") {
      productDataArray = [...productDataArray].sort((a, b) => a.value - b.value).slice(0, 5)
    }

    setProductData(productDataArray)
  }, [selectedFileId, files, activeFilter])

  const selectedFile = files.find((f) => f.id === selectedFileId)

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
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Visualize e analise seus dados de comissão</p>
          </div>

          {files.length > 0 && (
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
          )}
        </div>

        {files.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FileSearch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum arquivo processado</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Faça upload de um arquivo Excel com dados de comissão para visualizar o dashboard.
              </p>
              <Button variant="default" className="mt-4" asChild>
                <Link href="/upload">Fazer Upload</Link>
              </Button>
            </CardContent>
          </Card>
        ) : selectedFile ? (
          <>
            <QuickFilters
              onFilterChange={setActiveFilter}
              onDateRangeChange={(range) => {
                console.log("Período selecionado:", range)
                // Implementar filtro por data
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total de Comissões"
                value={formatCurrency(selectedFile.summary.totalCommission)}
                icon={<DollarSign className="h-5 w-5 text-primary" />}
                trend={12.5}
                trendLabel="vs. período anterior"
              />

              <StatCard
                title="Total de Clientes"
                value={selectedFile.summary.clientCount}
                icon={<Users className="h-5 w-5 text-primary" />}
                trend={5.2}
                trendLabel="vs. período anterior"
              />

              <StatCard
                title="Total de Produtos"
                value={selectedFile.summary.productCount}
                icon={<ShoppingBag className="h-5 w-5 text-primary" />}
                trend={-2.1}
                trendLabel="vs. período anterior"
              />

              <StatCard
                title="Comissão Média"
                value={formatCurrency(selectedFile.summary.totalCommission / selectedFile.data.length)}
                icon={<Percent className="h-5 w-5 text-primary" />}
                trend={0}
                trendLabel="vs. período anterior"
              />
            </div>

            <Tabs defaultValue="charts" className="mt-6">
              <TabsList>
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
                <TabsTrigger value="data">Dados</TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <EnhancedChart
                    title="Comissões por Cliente"
                    description="Valores de comissão por cliente"
                    data={clientData}
                    valueFormatter={formatCurrency}
                    height={350}
                  />

                  <EnhancedChart
                    title="Comissões por Produto"
                    description="Valores de comissão por produto"
                    data={productData}
                    valueFormatter={formatCurrency}
                    height={350}
                    colors={["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]}
                  />
                </div>
              </TabsContent>

              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Detalhados</CardTitle>
                    <CardDescription>Visualize todos os registros de comissão</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable data={selectedFile.data} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Selecione um arquivo para visualizar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
