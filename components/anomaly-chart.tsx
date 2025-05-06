"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Anomaly } from "@/lib/anomaly-detection"

interface AnomalyChartProps {
  anomalies: Anomaly[]
}

export function AnomalyChart({ anomalies }: AnomalyChartProps) {
  // Agrupar anomalias por tipo
  const groupedAnomalies = useMemo(() => {
    if (!anomalies || anomalies.length === 0) {
      return {
        clientAnomalies: [],
        productAnomalies: [],
        percentageAnomalies: [],
      }
    }

    const clientAnomalies = anomalies.filter((a) => a.entityType === "client")
    const productAnomalies = anomalies.filter((a) => a.entityType === "product" && a.metric === "valor_comissao_total")
    const percentageAnomalies = anomalies.filter((a) => a.metric === "percent_comissao_item_contrato")

    return {
      clientAnomalies,
      productAnomalies,
      percentageAnomalies,
    }
  }, [anomalies])

  // Preparar dados para o gráfico de barras
  const barChartData = useMemo(() => {
    if (!anomalies || anomalies.length === 0) return []

    return anomalies.map((anomaly) => ({
      name: anomaly.entityName.length > 20 ? anomaly.entityName.substring(0, 20) + "..." : anomaly.entityName,
      valor: anomaly.value,
      minEsperado: anomaly.expectedRange.min,
      maxEsperado: anomaly.expectedRange.max,
      tipo: anomaly.entityType === "client" ? "Cliente" : anomaly.entityType === "product" ? "Produto" : "Fatura",
      severidade: anomaly.severity,
      desvio: anomaly.deviationPercentage,
      fullName: anomaly.entityName, // Nome completo para o tooltip
    }))
  }, [anomalies])

  // Preparar dados para o gráfico de dispersão
  const scatterData = useMemo(() => {
    return anomalies.map((anomaly) => ({
      x: anomaly.value,
      y: anomaly.deviationPercentage,
      z: anomaly.severity === "high" ? 30 : anomaly.severity === "medium" ? 20 : 10,
      name: anomaly.entityName,
      tipo: anomaly.entityType === "client" ? "Cliente" : anomaly.entityType === "product" ? "Produto" : "Fatura",
      severidade: anomaly.severity,
      valor: anomaly.value,
      desvio: anomaly.deviationPercentage,
    }))
  }, [anomalies])

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Cores para os diferentes tipos de severidade
  const severityColors = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#3b82f6",
  }

  return (
    <Tabs defaultValue="bar">
      <TabsList className="mb-4">
        <TabsTrigger value="bar">Gráfico de Barras</TabsTrigger>
        <TabsTrigger value="scatter">Gráfico de Dispersão</TabsTrigger>
      </TabsList>

      <TabsContent value="bar">
        <Card>
          <CardHeader>
            <CardTitle>Valores vs. Faixa Esperada</CardTitle>
            <CardDescription>Comparação entre valores observados e faixas esperadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                  <YAxis
                    tickFormatter={(value) =>
                      anomalies[0]?.metric === "percent_comissao_item_contrato" ? `${value}%` : formatCurrency(value)
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "valor") {
                        return [
                          anomalies[0]?.metric === "percent_comissao_item_contrato"
                            ? `${Number(value).toFixed(2)}%`
                            : formatCurrency(Number(value)),
                          "Valor",
                        ]
                      }
                      if (name === "minEsperado") {
                        return [
                          anomalies[0]?.metric === "percent_comissao_item_contrato"
                            ? `${Number(value).toFixed(2)}%`
                            : formatCurrency(Number(value)),
                          "Mínimo Esperado",
                        ]
                      }
                      if (name === "maxEsperado") {
                        return [
                          anomalies[0]?.metric === "percent_comissao_item_contrato"
                            ? `${Number(value).toFixed(2)}%`
                            : formatCurrency(Number(value)),
                          "Máximo Esperado",
                        ]
                      }
                      return [value, name]
                    }}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload
                      if (item) {
                        return `${item.fullName} (${item.tipo})`
                      }
                      return label
                    }}
                  />
                  <Legend />
                  <Bar dataKey="valor" fill="#8884d8" name="Valor Observado" isAnimationActive={true} />
                  <ReferenceLine
                    stroke="#82ca9d"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    segment={barChartData.map((entry, index) => ({
                      x: index,
                      y: entry.minEsperado,
                    }))}
                    ifOverflow="extendDomain"
                    name="Mínimo Esperado"
                  />
                  <ReferenceLine
                    stroke="#ff7300"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    segment={barChartData.map((entry, index) => ({
                      x: index,
                      y: entry.maxEsperado,
                    }))}
                    ifOverflow="extendDomain"
                    name="Máximo Esperado"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="scatter">
        <Card>
          <CardHeader>
            <CardTitle>Dispersão de Anomalias</CardTitle>
            <CardDescription>Relação entre valor e desvio percentual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Valor"
                    tickFormatter={(value) =>
                      anomalies[0]?.metric === "percent_comissao_item_contrato" ? `${value}%` : formatCurrency(value)
                    }
                  />
                  <YAxis type="number" dataKey="y" name="Desvio (%)" unit="%" />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} name="Severidade" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value, name) => {
                      if (name === "Valor") {
                        return [
                          anomalies[0]?.metric === "percent_comissao_item_contrato"
                            ? `${Number(value).toFixed(2)}%`
                            : formatCurrency(Number(value)),
                          name,
                        ]
                      }
                      if (name === "Desvio (%)") {
                        return [`${Number(value).toFixed(2)}%`, name]
                      }
                      return [value, name]
                    }}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload
                      if (item) {
                        return `${item.name} (${item.tipo})`
                      }
                      return label
                    }}
                  />
                  <Legend />
                  <Scatter
                    name="Alta Severidade"
                    data={scatterData.filter((d) => d.severidade === "high")}
                    fill={severityColors.high}
                  />
                  <Scatter
                    name="Média Severidade"
                    data={scatterData.filter((d) => d.severidade === "medium")}
                    fill={severityColors.medium}
                  />
                  <Scatter
                    name="Baixa Severidade"
                    data={scatterData.filter((d) => d.severidade === "low")}
                    fill={severityColors.low}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
