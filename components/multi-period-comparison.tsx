"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon, AlertTriangle } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ProcessedFile } from "@/types/file-types"

interface MultiPeriodComparisonProps {
  files: ProcessedFile[]
}

// Definir interfaces para os dados
interface EvolutionDataPoint {
  name: string
  period: string
  fileName: string
  fileId: string
  totalCommission: number
  clientCount: number
  productCount: number
}

interface ClientProductEntry {
  name: string
  total: number
  [key: string]: string | number
}

interface ComparisonTableRow {
  id: string
  name: string
  period: string
  baseCommission: number
  currentCommission: number
  diffCommission: number
  percentChange: number
  baseClients: number
  currentClients: number
  diffClients: number
  baseProducts: number
  currentProducts: number
  diffProducts: number
  uniqueClientsBase: number
  uniqueClientsCurrent: number
  uniqueProductsBase: number
  uniqueProductsCurrent: number
}

export function MultiPeriodComparison({ files }: MultiPeriodComparisonProps) {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [metricType, setMetricType] = useState<"totalCommission" | "clientCount" | "productCount">("totalCommission")
  const [baseFileId, setBaseFileId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedClientFilter, setSelectedClientFilter] = useState<string | null>(null)
  const [selectedProductFilter, setSelectedProductFilter] = useState<string | null>(null)

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const newSelection = prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]

      // Se o arquivo base foi removido, redefina o arquivo base
      if (baseFileId === fileId && !newSelection.includes(fileId)) {
        setBaseFileId(newSelection.length > 0 ? newSelection[0] : null)
      }

      // Se não há arquivo base definido e há arquivos selecionados, defina o primeiro como base
      if (baseFileId === null && newSelection.length > 0) {
        setBaseFileId(newSelection[0])
      }

      return newSelection
    })
  }

  const selectAllFiles = () => {
    const allIds = files.map((file) => file.id)
    setSelectedFileIds(allIds)
    if (allIds.length > 0 && baseFileId === null) {
      setBaseFileId(allIds[0])
    }
  }

  const clearSelection = () => {
    setSelectedFileIds([])
    setBaseFileId(null)
  }

  // Ordenar arquivos por data
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      // Extrair a primeira data do período (formato: "DD/MM/YYYY - DD/MM/YYYY")
      const getFirstDate = (period: string) => {
        const firstDateStr = period.split(" - ")[0]
        return parse(firstDateStr, "dd/MM/yyyy", new Date())
      }

      const dateA = getFirstDate(a.period)
      const dateB = getFirstDate(b.period)

      return dateA.getTime() - dateB.getTime()
    })
  }, [files])

  // Obter arquivos selecionados
  const selectedFiles = useMemo(() => {
    return sortedFiles.filter((file) => selectedFileIds.includes(file.id))
  }, [sortedFiles, selectedFileIds])

  // Obter arquivo base
  const baseFile = useMemo(() => {
    if (!baseFileId) return null
    return selectedFiles.find((file) => file.id === baseFileId) || null
  }, [selectedFiles, baseFileId])

  // Preparar dados para o gráfico de evolução
  const evolutionData = useMemo<EvolutionDataPoint[]>(() => {
    if (selectedFiles.length === 0) return []

    return selectedFiles.map((file) => {
      // Extrair a primeira data do período para usar como label no eixo X
      const firstDateStr = file.period.split(" - ")[0]
      const date = parse(firstDateStr, "dd/MM/yyyy", new Date())
      const formattedDate = format(date, "MMM/yyyy", { locale: ptBR })

      // Dados para cada métrica
      return {
        name: formattedDate,
        period: file.period,
        fileName: file.name,
        fileId: file.id,
        totalCommission: file.summary.totalCommission,
        clientCount: file.summary.clientCount,
        productCount: file.summary.productCount,
      }
    })
  }, [selectedFiles])

  // Preparar dados para o gráfico de clientes
  const clientEvolutionData = useMemo<ClientProductEntry[]>(() => {
    if (selectedFileIds.length === 0) return []

    // Mapear todos os clientes únicos em todos os arquivos selecionados
    const allClients = new Set<string>()
    selectedFiles.forEach((file) => {
      file.data.forEach((item) => {
        // Garantir que não haja nomes vazios
        if (item.nome_clifor && item.nome_clifor.trim() !== "") {
          allClients.add(item.nome_clifor)
        }
      })
    })

    // Para cada cliente, calcular o valor total em cada período
    const clientData: ClientProductEntry[] = []

    allClients.forEach((client) => {
      if (selectedClientFilter && client !== selectedClientFilter) return

      const clientInfo: Record<string, any> = { name: client }

      selectedFiles.forEach((file) => {
        // Calcular o total de comissões para este cliente neste arquivo
        const clientTotal = file.data
          .filter((item) => item.nome_clifor === client)
          .reduce((sum, item) => sum + item.valor_comissao_total, 0)

        // Usar a primeira data do período como identificador
        const firstDateStr = file.period.split(" - ")[0]
        const date = parse(firstDateStr, "dd/MM/yyyy", new Date())
        const periodKey = format(date, "MMM/yyyy", { locale: ptBR })

        clientInfo[periodKey] = clientTotal
        clientInfo[`${periodKey}_fileId`] = file.id
      })

      // Calcular o total para todos os períodos
      const total = Object.entries(clientInfo)
        .filter(([key]) => key !== "name" && !key.endsWith("_fileId"))
        .reduce((sum, [, value]) => sum + (typeof value === "number" ? value : 0), 0)

      // Certifique-se de que o objeto tem a propriedade 'name'
      clientData.push({ ...clientInfo, total, name: client.toString() })
    })

    // Ordenar por valor total (soma de todos os períodos)
    return clientData.sort((a, b) => b.total - a.total).slice(0, 10) // Top 10 clientes
  }, [selectedFiles, selectedFileIds, selectedClientFilter])

  // Preparar dados para o gráfico de produtos
  const productEvolutionData = useMemo<ClientProductEntry[]>(() => {
    if (selectedFileIds.length === 0) return []

    // Mapear todos os produtos únicos em todos os arquivos selecionados
    const allProducts = new Set<string>()
    selectedFiles.forEach((file) => {
      file.data.forEach((item) => {
        // Garantir que não haja códigos vazios
        if (item.codigo_item && item.codigo_item.trim() !== "") {
          allProducts.add(item.codigo_item)
        }
      })
    })

    // Para cada produto, calcular o valor total em cada período
    const productData: ClientProductEntry[] = []

    allProducts.forEach((product) => {
      if (selectedProductFilter && product !== selectedProductFilter) return

      const productInfo: Record<string, any> = { name: product }

      selectedFiles.forEach((file) => {
        // Calcular o total de comissões para este produto neste arquivo
        const productTotal = file.data
          .filter((item) => item.codigo_item === product)
          .reduce((sum, item) => sum + item.valor_comissao_total, 0)

        // Usar a primeira data do período como identificador
        const firstDateStr = file.period.split(" - ")[0]
        const date = parse(firstDateStr, "dd/MM/yyyy", new Date())
        const periodKey = format(date, "MMM/yyyy", { locale: ptBR })

        productInfo[periodKey] = productTotal
        productInfo[`${periodKey}_fileId`] = file.id
      })

      // Calcular o total para todos os períodos
      const total = Object.entries(productInfo)
        .filter(([key]) => key !== "name" && !key.endsWith("_fileId"))
        .reduce((sum, [, value]) => sum + (typeof value === "number" ? value : 0), 0)

      // Certifique-se de que o objeto tem a propriedade 'name'
      productData.push({ ...productInfo, total, name: product.toString() })
    })

    // Ordenar por valor total (soma de todos os períodos)
    return productData.sort((a, b) => b.total - a.total).slice(0, 10) // Top 10 produtos
  }, [selectedFiles, selectedFileIds, selectedProductFilter])

  // Preparar dados para a tabela de comparação
  const comparisonTableData = useMemo<ComparisonTableRow[]>(() => {
    if (!baseFile || selectedFiles.length <= 1) return []

    // Comparar cada arquivo com o arquivo base
    return selectedFiles
      .filter((file) => file.id !== baseFileId)
      .map((file) => {
        const baseCommission = baseFile.summary.totalCommission
        const currentCommission = file.summary.totalCommission
        const diffCommission = currentCommission - baseCommission
        const percentChange =
          baseCommission !== 0 ? (diffCommission / baseCommission) * 100 : currentCommission > 0 ? 100 : 0

        const baseClients = baseFile.summary.clientCount
        const currentClients = file.summary.clientCount
        const diffClients = currentClients - baseClients

        const baseProducts = baseFile.summary.productCount
        const currentProducts = file.summary.productCount
        const diffProducts = currentProducts - baseProducts

        // Encontrar clientes exclusivos
        const baseFileClients = new Set(baseFile.data.map((item) => item.cnpj_cliente))
        const currentFileClients = new Set(file.data.map((item) => item.cnpj_cliente))
        const uniqueClientsBase = [...baseFileClients].filter((client) => !currentFileClients.has(client)).length
        const uniqueClientsCurrent = [...currentFileClients].filter((client) => !baseFileClients.has(client)).length

        // Encontrar produtos exclusivos
        const baseFileProducts = new Set(baseFile.data.map((item) => item.codigo_item))
        const currentFileProducts = new Set(file.data.map((item) => item.codigo_item))
        const uniqueProductsBase = [...baseFileProducts].filter((product) => !currentFileProducts.has(product)).length
        const uniqueProductsCurrent = [...currentFileProducts].filter(
          (product) => !baseFileProducts.has(product),
        ).length

        return {
          id: file.id,
          name: file.name,
          period: file.period,
          baseCommission,
          currentCommission,
          diffCommission,
          percentChange,
          baseClients,
          currentClients,
          diffClients,
          baseProducts,
          currentProducts,
          diffProducts,
          uniqueClientsBase,
          uniqueClientsCurrent,
          uniqueProductsBase,
          uniqueProductsCurrent,
        }
      })
  }, [baseFile, baseFileId, selectedFiles])

  // Lista de todos os clientes únicos para o filtro
  const uniqueClients = useMemo(() => {
    const clients = new Set<string>()
    selectedFiles.forEach((file) => {
      file.data.forEach((item) => {
        // Garantir que não haja nomes vazios
        if (item.nome_clifor && item.nome_clifor.trim() !== "") {
          clients.add(item.nome_clifor)
        }
      })
    })
    return Array.from(clients).sort()
  }, [selectedFiles])

  // Lista de todos os produtos únicos para o filtro
  const uniqueProducts = useMemo(() => {
    const products = new Set<string>()
    selectedFiles.forEach((file) => {
      file.data.forEach((item) => {
        // Garantir que não haja códigos vazios
        if (item.codigo_item && item.codigo_item.trim() !== "") {
          products.add(item.codigo_item)
        }
      })
    })
    return Array.from(products).sort()
  }, [selectedFiles])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getMetricLabel = () => {
    switch (metricType) {
      case "totalCommission":
        return "Total de Comissões"
      case "clientCount":
        return "Número de Clientes"
      case "productCount":
        return "Número de Produtos"
      default:
        return "Valor"
    }
  }

  const formatValue = (value: number) => {
    if (metricType === "totalCommission") {
      return formatCurrency(value)
    }
    return value.toString()
  }

  // Gerar cores únicas para cada linha/barra
  const generateColors = (count: number) => {
    const baseColors = [
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#8884D8",
      "#4CAF50",
      "#F44336",
      "#2196F3",
      "#FF9800",
      "#9C27B0",
      "#3F51B5",
      "#E91E63",
      "#009688",
      "#673AB7",
      "#FFC107",
    ]

    return Array(count)
      .fill(0)
      .map((_, i) => baseColors[i % baseColors.length])
  }

  const renderChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpIcon className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDownIcon className="h-4 w-4 text-red-500" />
    return <MinusIcon className="h-4 w-4 text-gray-500" />
  }

  // Constante para o valor "todos"
  const ALL_VALUE = "todos_os_itens"

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Evolução Multi-Período</CardTitle>
          <CardDescription>
            Selecione múltiplos arquivos para visualizar a evolução da carteira ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={selectAllFiles}>
                Selecionar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Limpar Seleção
              </Button>

              <div className="ml-auto flex gap-2">
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                >
                  Linha
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                >
                  Barras
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={metricType === "totalCommission" ? "default" : "outline"}
                size="sm"
                onClick={() => setMetricType("totalCommission")}
              >
                Comissões
              </Button>
              <Button
                variant={metricType === "clientCount" ? "default" : "outline"}
                size="sm"
                onClick={() => setMetricType("clientCount")}
              >
                Clientes
              </Button>
              <Button
                variant={metricType === "productCount" ? "default" : "outline"}
                size="sm"
                onClick={() => setMetricType("productCount")}
              >
                Produtos
              </Button>
            </div>

            <ScrollArea className="h-[200px] border rounded-md p-4">
              <div className="space-y-2">
                {sortedFiles.map((file) => (
                  <div key={file.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={file.id}
                      checked={selectedFileIds.includes(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                    />
                    <label
                      htmlFor={file.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {file.name} ({file.period})
                    </label>
                    {selectedFileIds.includes(file.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={baseFileId === file.id ? "bg-muted" : ""}
                        onClick={() => setBaseFileId(file.id)}
                        disabled={baseFileId === file.id}
                      >
                        {baseFileId === file.id ? "Arquivo Base" : "Definir como Base"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {selectedFileIds.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="comparison" disabled={selectedFileIds.length < 2 || !baseFileId}>
              Comparação com Base
            </TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de {getMetricLabel()}</CardTitle>
                <CardDescription>Visualize a tendência ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={evolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatValue(value)} />
                      <Tooltip
                        formatter={(value) => [formatValue(value as number), getMetricLabel()]}
                        labelFormatter={(label) => {
                          const item = evolutionData.find((item) => item.name === label)
                          return `${item?.fileName} (${item?.period})`
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={metricType}
                        stroke="#0088FE"
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                        name={getMetricLabel()}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={evolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatValue(value)} />
                      <Tooltip
                        formatter={(value) => [formatValue(value as number), getMetricLabel()]}
                        labelFormatter={(label) => {
                          const item = evolutionData.find((item) => item.name === label)
                          return `${item?.fileName} (${item?.period})`
                        }}
                      />
                      <Legend />
                      <Bar dataKey={metricType} fill="#0088FE" name={getMetricLabel()} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4 mt-4">
            {baseFile && (
              <>
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Comparação com arquivo base</AlertTitle>
                  <AlertDescription>
                    Comparando todos os arquivos selecionados com o arquivo base: <strong>{baseFile.name}</strong> (
                    {baseFile.period})
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Tabela de Comparação</CardTitle>
                    <CardDescription>Diferenças em relação ao arquivo base</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Arquivo</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead>Comissão</TableHead>
                          <TableHead>Diferença</TableHead>
                          <TableHead>Clientes</TableHead>
                          <TableHead>Produtos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonTableData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell>{row.period}</TableCell>
                            <TableCell>{formatCurrency(row.currentCommission)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {renderChangeIcon(row.diffCommission)}
                                <span
                                  className={
                                    row.diffCommission > 0
                                      ? "text-green-500"
                                      : row.diffCommission < 0
                                        ? "text-red-500"
                                        : "text-gray-500"
                                  }
                                >
                                  {row.diffCommission > 0 ? "+" : ""}
                                  {formatCurrency(row.diffCommission)} ({row.percentChange.toFixed(2)}%)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {row.currentClients} ({row.diffClients > 0 ? "+" : ""}
                                {row.diffClients})
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {row.uniqueClientsCurrent} exclusivos
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {row.currentProducts} ({row.diffProducts > 0 ? "+" : ""}
                                {row.diffProducts})
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {row.uniqueProductsCurrent} exclusivos
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comparação de Comissões</CardTitle>
                    <CardDescription>Diferença percentual em relação ao arquivo base</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonTableData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Variação"]}
                          labelFormatter={(label) => {
                            const item = comparisonTableData.find((item) => item.name === label)
                            return `${item?.name} (${item?.period})`
                          }}
                        />
                        <Legend />
                        <Bar dataKey="percentChange" fill="#0088FE" name="Variação %" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Filtrar por Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedClientFilter || ALL_VALUE}
                    onValueChange={(value) => setSelectedClientFilter(value === ALL_VALUE ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos os clientes</SelectItem>
                      {uniqueClients.map((client) => (
                        <SelectItem key={client} value={client}>
                          {client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Filtrar por Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedProductFilter || ALL_VALUE}
                    onValueChange={(value) => setSelectedProductFilter(value === ALL_VALUE ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>Todos os produtos</SelectItem>
                      {uniqueProducts.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {metricType === "totalCommission" && selectedFileIds.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedClientFilter
                      ? `Evolução do Cliente: ${selectedClientFilter}`
                      : "Evolução dos Top 10 Clientes"}
                  </CardTitle>
                  <CardDescription>
                    {selectedClientFilter
                      ? "Acompanhe o desempenho do cliente selecionado ao longo do tempo"
                      : "Acompanhe o desempenho dos principais clientes ao longo do tempo"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                      <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" type="category" allowDuplicatedCategory={false} />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), "Comissão"]} />
                        <Legend />
                        {clientEvolutionData.map((entry, index) => (
                          <Line
                            key={entry.name.toString()}
                            data={evolutionData.map((period) => ({
                              name: period.name,
                              value: (entry[period.name] as number) || 0,
                            }))}
                            type="monotone"
                            dataKey="value"
                            name={entry.name.toString()}
                            stroke={generateColors(clientEvolutionData.length)[index]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    ) : (
                      <BarChart data={evolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), "Comissão"]} />
                        <Legend />
                        {clientEvolutionData.slice(0, 5).map((entry, index) => (
                          <Bar
                            key={entry.name.toString()}
                            dataKey={(datum) => (entry[datum.name] as number) || 0}
                            name={entry.name.toString()}
                            fill={generateColors(5)[index]}
                          />
                        ))}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {metricType === "totalCommission" && selectedFileIds.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedProductFilter
                      ? `Evolução do Produto: ${selectedProductFilter}`
                      : "Evolução dos Top 10 Produtos"}
                  </CardTitle>
                  <CardDescription>
                    {selectedProductFilter
                      ? "Acompanhe o desempenho do produto selecionado ao longo do tempo"
                      : "Acompanhe o desempenho dos principais produtos ao longo do tempo"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                      <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" type="category" allowDuplicatedCategory={false} />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), "Comissão"]} />
                        <Legend />
                        {productEvolutionData.map((entry, index) => (
                          <Line
                            key={entry.name.toString()}
                            data={evolutionData.map((period) => ({
                              name: period.name,
                              value: (entry[period.name] as number) || 0,
                            }))}
                            type="monotone"
                            dataKey="value"
                            name={entry.name.toString()}
                            stroke={generateColors(productEvolutionData.length)[index]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    ) : (
                      <BarChart data={evolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), "Comissão"]} />
                        <Legend />
                        {productEvolutionData.slice(0, 5).map((entry, index) => (
                          <Bar
                            key={entry.name.toString()}
                            dataKey={(datum) => (entry[datum.name] as number) || 0}
                            name={entry.name.toString()}
                            fill={generateColors(5)[index]}
                          />
                        ))}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Tabela Detalhada</CardTitle>
                <CardDescription>Valores por período para análise detalhada</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Comissão Total</TableHead>
                      <TableHead>Clientes</TableHead>
                      <TableHead>Produtos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evolutionData.map((row) => (
                      <TableRow key={row.fileId}>
                        <TableCell>{row.period}</TableCell>
                        <TableCell className="font-medium">{row.fileName}</TableCell>
                        <TableCell>{formatCurrency(row.totalCommission)}</TableCell>
                        <TableCell>{row.clientCount}</TableCell>
                        <TableCell>{row.productCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Alert variant="default" className="bg-muted">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Nenhum arquivo selecionado</AlertTitle>
          <AlertDescription>Selecione pelo menos um arquivo para visualizar os gráficos de evolução.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
