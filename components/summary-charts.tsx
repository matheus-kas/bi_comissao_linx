"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import type { CommissionData } from "@/types/file-types"

interface SummaryChartsProps {
  data: CommissionData[]
}

export function SummaryCharts({ data }: SummaryChartsProps) {
  // Dados para o gráfico de barras - Top 5 clientes por comissão
  const topClients = useMemo(() => {
    const clientMap = new Map<string, number>()

    data.forEach((item) => {
      const clientName = item.nome_clifor
      const currentTotal = clientMap.get(clientName) || 0
      clientMap.set(clientName, currentTotal + item.valor_comissao_total)
    })

    return Array.from(clientMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [data])

  // Dados para o gráfico de pizza - Distribuição por produto
  const productDistribution = useMemo(() => {
    const productMap = new Map<string, number>()

    data.forEach((item) => {
      const productName = item.codigo_item
      const currentTotal = productMap.get(productName) || 0
      productMap.set(productName, currentTotal + item.valor_comissao_total)
    })

    return Array.from(productMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [data])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Clientes</CardTitle>
          <CardDescription>Por valor de comissão</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topClients} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), "Comissão"]}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Produto</CardTitle>
          <CardDescription>Top 5 produtos por comissão</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={productDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {productDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value as number), "Comissão"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
