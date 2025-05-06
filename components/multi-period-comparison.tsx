"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
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

interface EvolutionDataPoint {
  name: string
  period: string
  fileName: string
  totalCommission: number
  clientCount: number
  productCount: number
}

interface ClientEvolutionData {
  name: string
  total: number
  [key: string]: string | number
}

export function MultiPeriodComparison({ files }: MultiPeriodComparisonProps) {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [metricType, setMetricType] = useState<"totalCommission" | "clientCount" | "productCount">("totalCommission")

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const selectAllFiles = () => {
    setSelectedFileIds(files.map((file) => file.id))
  }

  const clearSelection = () => {
    setSelectedFileIds([])
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

  // Preparar dados para o gráfico de evolução
  const evolutionData = useMemo(() => {
    const selectedFiles = sortedFiles.filter((file) => selectedFileIds.includes(file.id))

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
        totalCommission: file.summary.totalCommission,
        clientCount: file.summary.clientCount,
        productCount: file.summary.productCount,
      }
    })
  }, [sortedFiles, selectedFileIds])

  // Preparar dados para o gráfico de clientes
  const clientEvolutionData = useMemo(() => {
    if (selectedFileIds.length === 0) return []

    const selectedFiles = sortedFiles.filter((file) => selectedFileIds.includes(file.id))

    // Mapear todos os clientes únicos em todos os arquivos selecionados
    const allClients = new Set<string>()
    selectedFiles.forEach((file) => {
      file.data.forEach((item) => {
        allClients.add(item.nome_clifor)
      })
    })

    // Para cada cliente, calcular o valor total em cada período
    const clientData: ClientEvolutionData[] = []

    allClients.forEach((client) => {
      const clientInfo: ClientEvolutionData = {
        name: client,
        total: 0,
      }

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
        clientInfo.total += clientTotal
      })

      clientData.push(clientInfo)
    })

    // Ordenar por valor total (soma de todos os períodos)
    return clientData.sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 10) // Top 10 clientes
  }, [sortedFiles, selectedFileIds])

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
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {selectedFileIds.length > 0 && (
        <>
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
                    <YAxis tickFormatter={(value) => formatValue(Number(value))} />
                    <Tooltip
                      formatter={(value) => [formatValue(Number(value)), getMetricLabel()]}
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
                    <YAxis tickFormatter={(value) => formatValue(Number(value))} />
                    <Tooltip
                      formatter={(value) => [formatValue(Number(value)), getMetricLabel()]}
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

          {metricType === "totalCommission" && selectedFileIds.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Top 10 Clientes</CardTitle>
                <CardDescription>Acompanhe o desempenho dos principais clientes ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" type="category" allowDuplicatedCategory={false} />
                      <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Comissão"]} />
                      <Legend />
                      {clientEvolutionData.slice(0, 10).map((entry, index) => (
                        <Line
                          key={`${entry.name || "unknown"}-${index}`}
                          data={evolutionData.map((period) => ({
                            name: period.name,
                            value: Number(entry[period.name] || 0),
                          }))}
                          type="monotone"
                          dataKey="value"
                          name={String(entry.name || "unknown")}
                          stroke={generateColors(10)[index]}
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
                      <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Comissão"]} />
                      <Legend />
                      {clientEvolutionData.slice(0, 5).map((entry, index) => (
                        <Bar
                          key={`${entry.name || "unknown"}-${index}`}
                          dataKey={(datum) => Number(entry[datum.name] || 0)}
                          name={String(entry.name || "unknown")}
                          fill={generateColors(5)[index]}
                          stackId={chartType === "bar" ? "stack" : undefined}
                        />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
