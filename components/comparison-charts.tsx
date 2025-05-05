"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts"
import type { ProcessedFile } from "@/types/file-types"

interface ComparisonChartsProps {
  file1: ProcessedFile
  file2: ProcessedFile
}

export function ComparisonCharts({ file1, file2 }: ComparisonChartsProps) {
  // Dados para o gráfico de barras - Top 5 clientes por comissão
  const topClientsComparison = useMemo(() => {
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

    // Combinar os top clientes de ambos os arquivos
    const allClients = new Set([...clientMap1.keys(), ...clientMap2.keys()])

    const comparisonData = Array.from(allClients).map((client) => ({
      name: client,
      [file1.name]: clientMap1.get(client) || 0,
      [file2.name]: clientMap2.get(client) || 0,
    }))

    // Ordenar por valor total (soma dos dois arquivos)
    return comparisonData.sort((a, b) => b[file1.name] + b[file2.name] - (a[file1.name] + a[file2.name])).slice(0, 5)
  }, [file1, file2])

  // Dados para o gráfico de linha - Distribuição por produto
  const productComparison = useMemo(() => {
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

    // Combinar os top produtos de ambos os arquivos
    const allProducts = new Set([...productMap1.keys(), ...productMap2.keys()])

    const comparisonData = Array.from(allProducts).map((product) => ({
      name: product,
      [file1.name]: productMap1.get(product) || 0,
      [file2.name]: productMap2.get(product) || 0,
    }))

    // Ordenar por valor total (soma dos dois arquivos)
    return comparisonData.sort((a, b) => b[file1.name] + b[file2.name] - (a[file1.name] + a[file2.name])).slice(0, 5)
  }, [file1, file2])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Clientes</CardTitle>
          <CardDescription>Top 5 clientes por valor de comissão</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topClientsComparison} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), "Comissão"]}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend />
              <Bar dataKey={file1.name} fill="#8884d8" />
              <Bar dataKey={file2.name} fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparação de Produtos</CardTitle>
          <CardDescription>Top 5 produtos por valor de comissão</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productComparison} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), "Comissão"]}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={file1.name}
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey={file2.name}
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
