"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
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
  AreaChart,
  Area,
} from "recharts"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ProcessedFile } from "@/types/file-types"

interface ItemEvolutionAnalysisProps {
  files: ProcessedFile[]
}

interface PeriodData {
  period: string
  periodLabel: string
  fileName: string
  fileId: string
  value: number
  percentChange: number
  clients?: number
  products?: number
  accumulatedChange?: number
}

interface ItemEvolutionData {
  itemName: string
  itemType: "client" | "product"
  periods: PeriodData[]
  totalValue: number
  averageValue: number
  minValue: number
  maxValue: number
  trend: "up" | "down" | "stable" | "volatile"
  volatility: number
}

export function ItemEvolutionAnalysis({ files = [] }: ItemEvolutionAnalysisProps) {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [itemType, setItemType] = useState<"client" | "product">("client")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line")
  const [showPercentages, setShowPercentages] = useState(false)

  // Garantir que files é um array válido
  const validFiles = useMemo(() => {
    return Array.isArray(files) ? files : []
  }, [files])

  // Ordenar arquivos por data
  const sortedFiles = useMemo(() => {
    if (!validFiles.length) return []

    return [...validFiles].sort((a, b) => {
      try {
        // Extrair a primeira data do período (formato: "DD/MM/YYYY - DD/MM/YYYY")
        const getFirstDate = (period: string) => {
          if (!period || typeof period !== "string") return new Date(0)
          const firstDateStr = period.split(" - ")[0]
          return parse(firstDateStr, "dd/MM/yyyy", new Date())
        }

        const dateA = getFirstDate(a.period)
        const dateB = getFirstDate(b.period)

        return dateA.getTime() - dateB.getTime()
      } catch (error) {
        console.error("Erro ao ordenar arquivos:", error)
        return 0
      }
    })
  }, [validFiles])

  // Obter arquivos selecionados
  const selectedFiles = useMemo(() => {
    return sortedFiles.filter((file) => selectedFileIds.includes(file.id))
  }, [sortedFiles, selectedFileIds])

  // Função para alternar a seleção de um arquivo
  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds((prev) => {
      return prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    })
  }

  // Selecionar todos os arquivos
  const selectAllFiles = () => {
    const allIds = sortedFiles.map((file) => file.id)
    setSelectedFileIds(allIds)
  }

  // Limpar seleção
  const clearSelection = () => {
    setSelectedFileIds([])
    setSelectedItem(null)
  }

  // Obter lista de itens disponíveis (clientes ou produtos)
  const availableItems = useMemo(() => {
    if (selectedFiles.length === 0) return []

    const itemSet = new Set<string>()

    selectedFiles.forEach((file) => {
      if (!file.data || !Array.isArray(file.data)) return

      file.data.forEach((item) => {
        if (itemType === "client" && item.nome_clifor) {
          itemSet.add(item.nome_clifor)
        } else if (itemType === "product" && item.codigo_item) {
          itemSet.add(item.codigo_item)
        }
      })
    })

    return Array.from(itemSet).sort()
  }, [selectedFiles, itemType])

  // Calcular dados de evolução para o item selecionado
  const itemEvolutionData = useMemo<ItemEvolutionData | null>(() => {
    if (!selectedItem || selectedFiles.length === 0) return null

    // Prevent processing if we don't have valid data
    const hasValidFiles = selectedFiles.every((file) => file && file.data && Array.isArray(file.data))
    if (!hasValidFiles) return null

    const periods: PeriodData[] = []
    let totalValue = 0
    let minValue = Number.MAX_VALUE
    let maxValue = Number.MIN_VALUE

    // Para cada arquivo, calcular o valor total do item
    selectedFiles.forEach((file, index) => {
      try {
        // Filtrar registros do item selecionado
        const itemRecords = file.data.filter((record) => {
          return itemType === "client" ? record.nome_clifor === selectedItem : record.codigo_item === selectedItem
        })

        // Calcular valor total
        const value = itemRecords.reduce((sum, record) => sum + (record.valor_comissao_total || 0), 0)

        // Extrair a primeira data do período para usar como label
        const firstDateStr = file.period.split(" - ")[0]
        const date = parse(firstDateStr, "dd/MM/yyyy", new Date())
        const periodLabel = format(date, "MMM/yyyy", { locale: ptBR })

        // Calcular variação percentual em relação ao período anterior
        let percentChange = 0
        if (index > 0 && periods[index - 1] && periods[index - 1].value !== 0) {
          percentChange = ((value - periods[index - 1].value) / Math.abs(periods[index - 1].value)) * 100
        }

        // Adicionar dados do período
        periods.push({
          period: file.period,
          periodLabel,
          fileName: file.name,
          fileId: file.id,
          value,
          percentChange,
          clients: itemType === "client" ? 1 : itemRecords.length,
          products: itemType === "product" ? 1 : new Set(itemRecords.map((r) => r.codigo_item)).size,
        })

        // Atualizar estatísticas
        totalValue += value
        if (value < minValue) minValue = value
        if (value > maxValue) maxValue = value
      } catch (error) {
        console.error("Erro ao processar arquivo:", error, file)
      }
    })

    // Se não houver períodos válidos, retornar null
    if (periods.length === 0) return null

    // Ordenar períodos cronologicamente
    periods.sort((a, b) => {
      try {
        const dateA = parse(a.period.split(" - ")[0], "dd/MM/yyyy", new Date())
        const dateB = parse(b.period.split(" - ")[0], "dd/MM/yyyy", new Date())
        return dateA.getTime() - dateB.getTime()
      } catch (error) {
        console.error("Erro ao ordenar períodos:", error)
        return 0
      }
    })

    // Calcular média
    const averageValue = totalValue / periods.length

    // Calcular volatilidade (desvio padrão das variações percentuais)
    const percentChanges = periods.slice(1).map((p) => p.percentChange)
    const avgPercentChange = percentChanges.reduce((sum, val) => sum + val, 0) / (percentChanges.length || 1)
    const volatility = Math.sqrt(
      percentChanges.reduce((sum, val) => sum + Math.pow(val - avgPercentChange, 2), 0) / (percentChanges.length || 1),
    )

    // Determinar tendência
    let trend: "up" | "down" | "stable" | "volatile" = "stable"

    if (volatility > 20) {
      trend = "volatile"
    } else if (periods.length >= 2) {
      const firstValue = periods[0].value
      const lastValue = periods[periods.length - 1].value
      const overallChange = ((lastValue - firstValue) / Math.abs(firstValue || 1)) * 100

      if (overallChange > 10) {
        trend = "up"
      } else if (overallChange < -10) {
        trend = "down"
      }
    }

    return {
      itemName: selectedItem,
      itemType,
      periods,
      totalValue,
      averageValue,
      minValue: minValue === Number.MAX_VALUE ? 0 : minValue,
      maxValue: maxValue === Number.MIN_VALUE ? 0 : maxValue,
      trend,
      volatility,
    }
  }, [selectedItem, selectedFiles, itemType])

  // Resetar o item selecionado quando o tipo de item muda
  useEffect(() => {
    setSelectedItem(null)
  }, [itemType])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "down":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case "volatile":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default:
        return <MinusIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getTrendDescription = (trend: string, volatility: number) => {
    switch (trend) {
      case "up":
        return "Tendência de crescimento"
      case "down":
        return "Tendência de queda"
      case "volatile":
        return `Alta volatilidade (${volatility.toFixed(1)}%)`
      default:
        return "Estável"
    }
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-500"
    if (value < 0) return "text-red-500"
    return "text-gray-500"
  }

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpIcon className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDownIcon className="h-4 w-4 text-red-500" />
    return <MinusIcon className="h-4 w-4 text-gray-500" />
  }

  // Se não houver arquivos, mostrar mensagem
  if (!validFiles.length) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Nenhum arquivo disponível</AlertTitle>
        <AlertDescription>Faça upload de pelo menos dois arquivos para analisar a evolução de itens.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Análise de Evolução de Item</CardTitle>
          <CardDescription>
            Selecione múltiplos arquivos e um item específico para analisar sua evolução ao longo do tempo
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
                  variant={chartType === "area" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("area")}
                >
                  Área
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
                variant={itemType === "client" ? "default" : "outline"}
                size="sm"
                onClick={() => setItemType("client")}
              >
                Clientes
              </Button>
              <Button
                variant={itemType === "product" ? "default" : "outline"}
                size="sm"
                onClick={() => setItemType("product")}
              >
                Produtos
              </Button>

              <div className="ml-auto flex items-center gap-2">
                <Checkbox
                  id="show-percentages"
                  checked={showPercentages}
                  onCheckedChange={(checked) => setShowPercentages(!!checked)}
                />
                <label htmlFor="show-percentages" className="text-sm cursor-pointer">
                  Mostrar variações percentuais
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Arquivos Disponíveis</label>
                <ScrollArea className="h-[200px] border rounded-md p-4">
                  <div className="space-y-2">
                    {sortedFiles.map((file) => (
                      <div key={file.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`file-${file.id}`}
                          checked={selectedFileIds.includes(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                        />
                        <label
                          htmlFor={`file-${file.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {file.name} ({file.period})
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Selecione um {itemType === "client" ? "Cliente" : "Produto"}
                </label>
                <Select value={selectedItem || ""} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Selecione um ${itemType === "client" ? "cliente" : "produto"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedFileIds.length > 0 && selectedItem ? (
        itemEvolutionData ? (
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="analysis">Análise</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Evolução de {itemType === "client" ? "Cliente" : "Produto"}: {selectedItem}
                  </CardTitle>
                  <CardDescription>Visualize a tendência ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                      <LineChart data={itemEvolutionData.periods} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodLabel" />
                        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                        {showPercentages && (
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(value) => `${value}%`}
                            domain={[-100, 100]}
                          />
                        )}
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "value") return [formatCurrency(value as number), "Valor"]
                            if (name === "percentChange") return [`${value}%`, "Variação %"]
                            return [value, name]
                          }}
                          labelFormatter={(label) => {
                            const item = itemEvolutionData.periods.find((item) => item.periodLabel === label)
                            return `${item?.fileName} (${item?.period})`
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="value"
                          stroke="#0088FE"
                          strokeWidth={2}
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                          name="Valor"
                        />
                        {showPercentages && (
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="percentChange"
                            stroke="#FF8042"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Variação %"
                          />
                        )}
                      </LineChart>
                    ) : chartType === "area" ? (
                      <AreaChart data={itemEvolutionData.periods} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodLabel" />
                        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                        {showPercentages && (
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(value) => `${value}%`}
                            domain={[-100, 100]}
                          />
                        )}
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "value") return [formatCurrency(value as number), "Valor"]
                            if (name === "percentChange") return [`${value}%`, "Variação %"]
                            return [value, name]
                          }}
                          labelFormatter={(label) => {
                            const item = itemEvolutionData.periods.find((item) => item.periodLabel === label)
                            return `${item?.fileName} (${item?.period})`
                          }}
                        />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="value"
                          stroke="#0088FE"
                          fill="#0088FE"
                          fillOpacity={0.3}
                          name="Valor"
                        />
                        {showPercentages && (
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="percentChange"
                            stroke="#FF8042"
                            fill="#FF8042"
                            fillOpacity={0.3}
                            name="Variação %"
                          />
                        )}
                      </AreaChart>
                    ) : (
                      <BarChart data={itemEvolutionData.periods} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodLabel" />
                        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                        {showPercentages && (
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(value) => `${value}%`}
                            domain={[-100, 100]}
                          />
                        )}
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "value") return [formatCurrency(value as number), "Valor"]
                            if (name === "percentChange") return [`${value}%`, "Variação %"]
                            return [value, name]
                          }}
                          labelFormatter={(label) => {
                            const item = itemEvolutionData.periods.find((item) => item.periodLabel === label)
                            return `${item?.fileName} (${item?.period})`
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="value" fill="#0088FE" name="Valor" />
                        {showPercentages && (
                          <Bar yAxisId="right" dataKey="percentChange" fill="#FF8042" name="Variação %" />
                        )}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Valor Total</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(itemEvolutionData.totalValue)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Valor Médio</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(itemEvolutionData.averageValue)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Valor Mínimo</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(itemEvolutionData.minValue)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Valor Máximo</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(itemEvolutionData.maxValue)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Análise de Tendência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(itemEvolutionData.trend)}
                    <span className="text-lg font-medium">
                      {getTrendDescription(itemEvolutionData.trend, itemEvolutionData.volatility)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-muted-foreground">
                      {itemEvolutionData.trend === "up" &&
                        "Este item apresenta uma tendência de crescimento ao longo dos períodos analisados."}
                      {itemEvolutionData.trend === "down" &&
                        "Este item apresenta uma tendência de queda ao longo dos períodos analisados."}
                      {itemEvolutionData.trend === "volatile" &&
                        "Este item apresenta alta volatilidade, com variações significativas entre períodos."}
                      {itemEvolutionData.trend === "stable" &&
                        "Este item apresenta valores relativamente estáveis ao longo dos períodos analisados."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes por Período</CardTitle>
                  <CardDescription>Valores e variações detalhadas para cada período analisado</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Arquivo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Variação</TableHead>
                        {itemType === "client" ? (
                          <TableHead className="text-right">Produtos</TableHead>
                        ) : (
                          <TableHead className="text-right">Clientes</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemEvolutionData.periods.map((period, index) => (
                        <TableRow key={period.fileId}>
                          <TableCell>{period.period}</TableCell>
                          <TableCell className="font-medium">{period.fileName}</TableCell>
                          <TableCell className="text-right">{formatCurrency(period.value)}</TableCell>
                          <TableCell className="text-right">
                            {index === 0 ? (
                              <span className="text-muted-foreground">Período base</span>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <span className={getChangeColor(period.percentChange)}>
                                  {period.percentChange > 0 ? "+" : ""}
                                  {period.percentChange.toFixed(2)}%
                                </span>
                                {getChangeIcon(period.percentChange)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {itemType === "client" ? period.products : period.clients}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variação Acumulada</CardTitle>
                  <CardDescription>Análise da variação acumulada em relação ao primeiro período</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={itemEvolutionData.periods.map((period, index) => {
                        const baseValue = itemEvolutionData.periods[0].value || 1
                        const accumulatedChange = ((period.value - baseValue) / Math.abs(baseValue)) * 100
                        return {
                          ...period,
                          accumulatedChange,
                        }
                      })}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodLabel" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        formatter={(value) => [`${Number(value).toFixed(2)}%`, "Variação Acumulada"]}
                        labelFormatter={(label) => {
                          const item = itemEvolutionData.periods.find((item) => item.periodLabel === label)
                          return `${item?.fileName} (${item?.period})`
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="accumulatedChange"
                        name="Variação Acumulada"
                        fill="#4CAF50"
                        // Corrigindo o erro de TypeScript aqui
                        // Em vez de usar uma função como valor para fill, usamos uma cor fixa
                        // e adicionamos uma condição para renderizar barras vermelhas para valores negativos
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Sazonalidade</CardTitle>
                  <CardDescription>Identificação de padrões sazonais nos valores</CardDescription>
                </CardHeader>
                <CardContent>
                  {itemEvolutionData.periods.length >= 4 ? (
                    <div className="space-y-4">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={itemEvolutionData.periods.map((period, index) => {
                              // Extrair mês do período
                              const date = parse(period.period.split(" - ")[0], "dd/MM/yyyy", new Date())
                              const month = date.getMonth()
                              return {
                                ...period,
                                month,
                                monthName: format(date, "MMM", { locale: ptBR }),
                              }
                            })}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="monthName" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip
                              formatter={(value) => [formatCurrency(value as number), "Valor"]}
                              labelFormatter={(label) => label}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#0088FE"
                              strokeWidth={2}
                              dot={{ r: 5 }}
                              activeDot={{ r: 8 }}
                              name="Valor"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Análise de Sazonalidade</AlertTitle>
                        <AlertDescription>
                          {itemEvolutionData.volatility > 20
                            ? "Os dados apresentam alta volatilidade, o que pode indicar sazonalidade ou fatores externos influenciando os valores."
                            : "Não foram identificados padrões sazonais claros nos dados analisados."}
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Dados Insuficientes</AlertTitle>
                      <AlertDescription>
                        São necessários pelo menos 4 períodos para realizar uma análise de sazonalidade confiável.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Previsão de Tendência</CardTitle>
                  <CardDescription>Projeção de valores futuros com base na tendência atual</CardDescription>
                </CardHeader>
                <CardContent>
                  {itemEvolutionData.periods.length >= 3 ? (
                    <div className="space-y-4">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={itemEvolutionData.periods}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="periodLabel" type="category" allowDuplicatedCategory={false} />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip formatter={(value) => [formatCurrency(value as number), "Valor"]} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#0088FE"
                              strokeWidth={2}
                              dot={{ r: 5 }}
                              activeDot={{ r: 8 }}
                              name="Valor Real"
                            />
                            {itemEvolutionData.periods.length >= 2 && (
                              <Line
                                data={[
                                  ...itemEvolutionData.periods,
                                  // Adicionar previsão para o próximo período
                                  {
                                    periodLabel: "Previsão",
                                    value: calculateForecast(itemEvolutionData.periods),
                                  },
                                ]}
                                type="monotone"
                                dataKey="value"
                                stroke="#FF8042"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ r: 5 }}
                                name="Previsão"
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Previsão para o Próximo Período</AlertTitle>
                        <AlertDescription>
                          Com base na tendência atual, o valor previsto para o próximo período é de aproximadamente{" "}
                          <strong>{formatCurrency(calculateForecast(itemEvolutionData.periods))}</strong>.
                          {itemEvolutionData.volatility > 20 &&
                            " Note que a alta volatilidade dos dados pode reduzir a precisão desta previsão."}
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Dados Insuficientes</AlertTitle>
                      <AlertDescription>
                        São necessários pelo menos 3 períodos para realizar uma previsão de tendência confiável.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Nenhum dado encontrado</AlertTitle>
            <AlertDescription>
              Não foram encontrados dados para o item selecionado nos arquivos escolhidos.
            </AlertDescription>
          </Alert>
        )
      ) : (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Selecione arquivos e um item</AlertTitle>
          <AlertDescription>
            Selecione pelo menos um arquivo e um {itemType === "client" ? "cliente" : "produto"} para visualizar a
            análise de evolução.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Função auxiliar para calcular previsão simples
function calculateForecast(periods: PeriodData[]): number {
  if (!periods || periods.length < 2) return 0

  // Usar regressão linear simples para prever o próximo valor
  const n = periods.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = periods.map((p) => p.value || 0) // Ensure we have valid values

  // Calcular médias
  const meanX = x.reduce((sum, val) => sum + val, 0) / n
  const meanY = y.reduce((sum, val) => sum + val, 0) / n

  // Calcular coeficientes
  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY)
    denominator += Math.pow(x[i] - meanX, 2)
  }

  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = meanY - slope * meanX

  // Prever o próximo valor
  const nextX = n
  const forecast = intercept + slope * nextX

  return forecast > 0 ? forecast : 0
}
