"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react"
import { EnhancedChart } from "@/components/ui/enhanced-chart"
import type { ProcessedFile } from "@/types/file-types"

interface PercentageAnalysisProps {
  file1: ProcessedFile
  file2: ProcessedFile
}

export function PercentageAnalysis({ file1, file2 }: PercentageAnalysisProps) {
  const percentageData = useMemo(() => {
    // Mapear produtos e seus percentuais no arquivo 1
    const productPercentMap1 = new Map<string, { percent: number; total: number; count: number }>()

    file1.data.forEach((item) => {
      const product = item.codigo_item
      const percent = item.percent_comissao_item_contrato
      const value = item.valor_comissao_total

      if (!productPercentMap1.has(product)) {
        productPercentMap1.set(product, { percent, total: value, count: 1 })
      } else {
        const current = productPercentMap1.get(product)!
        // Calcular média ponderada pelo valor
        const newTotal = current.total + value
        const newPercent = (current.percent * current.total + percent * value) / newTotal
        productPercentMap1.set(product, {
          percent: newPercent,
          total: newTotal,
          count: current.count + 1,
        })
      }
    })

    // Mapear produtos e seus percentuais no arquivo 2
    const productPercentMap2 = new Map<string, { percent: number; total: number; count: number }>()

    file2.data.forEach((item) => {
      const product = item.codigo_item
      const percent = item.percent_comissao_item_contrato
      const value = item.valor_comissao_total

      if (!productPercentMap2.has(product)) {
        productPercentMap2.set(product, { percent, total: value, count: 1 })
      } else {
        const current = productPercentMap2.get(product)!
        // Calcular média ponderada pelo valor
        const newTotal = current.total + value
        const newPercent = (current.percent * current.total + percent * value) / newTotal
        productPercentMap2.set(product, {
          percent: newPercent,
          total: newTotal,
          count: current.count + 1,
        })
      }
    })

    // Combinar os dados para análise
    const allProducts = new Set([...productPercentMap1.keys(), ...productPercentMap2.keys()])

    const result = Array.from(allProducts)
      .map((product) => {
        const data1 = productPercentMap1.get(product)
        const data2 = productPercentMap2.get(product)

        const percent1 = data1?.percent || 0
        const percent2 = data2?.percent || 0
        const difference = percent2 - percent1

        return {
          product,
          percent1,
          percent2,
          difference,
          total1: data1?.total || 0,
          total2: data2?.total || 0,
          count1: data1?.count || 0,
          count2: data2?.count || 0,
        }
      })
      .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))

    // Calcular estatísticas gerais
    const totalProducts = result.length
    const decreasedCount = result.filter((item) => item.difference < 0).length
    const increasedCount = result.filter((item) => item.difference > 0).length
    const unchangedCount = result.filter((item) => item.difference === 0).length

    // Calcular média geral ponderada por valor
    const totalValue1 = result.reduce((sum, item) => sum + item.total1, 0)
    const totalValue2 = result.reduce((sum, item) => sum + item.total2, 0)

    const weightedAvg1 = result.reduce((sum, item) => sum + item.percent1 * item.total1, 0) / totalValue1
    const weightedAvg2 = result.reduce((sum, item) => sum + item.percent2 * item.total2, 0) / totalValue2

    return {
      products: result,
      stats: {
        totalProducts,
        decreasedCount,
        increasedCount,
        unchangedCount,
        weightedAvg1,
        weightedAvg2,
        avgDifference: weightedAvg2 - weightedAvg1,
      },
    }
  }, [file1, file2])

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    return percentageData.products
      .filter((item) => item.total1 > 0 && item.total2 > 0) // Filtrar apenas produtos presentes em ambos os períodos
      .sort((a, b) => b.total2 - a.total2) // Ordenar por valor no período mais recente
      .slice(0, 10) // Pegar os 10 principais produtos
      .map((item) => ({
        name: item.product,
        value: item.difference,
      }))
  }, [percentageData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Percentuais de Comissão</CardTitle>
        <CardDescription>
          Comparação de percentuais entre {file1.name} e {file2.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Percentual Médio ({file1.name})</p>
              <p className="text-2xl font-bold">{percentageData.stats.weightedAvg1.toFixed(2)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Percentual Médio ({file2.name})</p>
              <p className="text-2xl font-bold">{percentageData.stats.weightedAvg2.toFixed(2)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Variação Média</p>
              <div className="flex items-center">
                {percentageData.stats.avgDifference > 0 ? (
                  <ArrowUpIcon className="h-5 w-5 text-green-500 mr-1" />
                ) : percentageData.stats.avgDifference < 0 ? (
                  <ArrowDownIcon className="h-5 w-5 text-red-500 mr-1" />
                ) : (
                  <MinusIcon className="h-5 w-5 text-gray-500 mr-1" />
                )}
                <p
                  className={`text-2xl font-bold ${
                    percentageData.stats.avgDifference > 0
                      ? "text-green-600"
                      : percentageData.stats.avgDifference < 0
                        ? "text-red-600"
                        : ""
                  }`}
                >
                  {percentageData.stats.avgDifference > 0 ? "+" : ""}
                  {percentageData.stats.avgDifference.toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Produtos com Redução</p>
              <p className="text-2xl font-bold text-red-600">
                {percentageData.stats.decreasedCount}
                <span className="text-sm text-muted-foreground ml-1">
                  ({((percentageData.stats.decreasedCount / percentageData.stats.totalProducts) * 100).toFixed(1)}%)
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <EnhancedChart
          title="Variação de Percentuais nos Principais Produtos"
          description="Diferença em pontos percentuais para os 10 principais produtos"
          data={chartData}
          valueFormatter={(value) => `${value > 0 ? "+" : ""}${value.toFixed(2)}%`}
          height={350}
          colors={["#8884d8", "#82ca9d"]}
        />

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">% ({file1.name})</TableHead>
                <TableHead className="text-right">% ({file2.name})</TableHead>
                <TableHead className="text-right">Variação</TableHead>
                <TableHead className="text-right">Valor ({file2.name})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {percentageData.products
                .filter((item) => item.total1 > 0 && item.total2 > 0) // Mostrar apenas produtos presentes em ambos os períodos
                .sort((a, b) => b.total2 - a.total2) // Ordenar por valor no período mais recente
                .slice(0, 20) // Limitar a 20 produtos
                .map((item) => (
                  <TableRow key={item.product}>
                    <TableCell>{item.product}</TableCell>
                    <TableCell className="text-right">{item.percent1.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{item.percent2.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {item.difference > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : item.difference < 0 ? (
                          <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <MinusIcon className="h-4 w-4 text-gray-500 mr-1" />
                        )}
                        <span
                          className={item.difference > 0 ? "text-green-600" : item.difference < 0 ? "text-red-600" : ""}
                        >
                          {item.difference > 0 ? "+" : ""}
                          {item.difference.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item.total2)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
