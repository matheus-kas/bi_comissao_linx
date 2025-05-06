"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react"
import type { ProcessedFile } from "@/types/file-types"

interface ComparisonSummaryProps {
  file1: ProcessedFile
  file2: ProcessedFile
}

export function ComparisonSummary({ file1, file2 }: ComparisonSummaryProps) {
  const comparison = useMemo(() => {
    // Calcular diferenças
    const totalCommissionDiff = file2.summary.totalCommission - file1.summary.totalCommission
    let totalCommissionPercent = 0
    if (file1.summary.totalCommission !== 0) {
      totalCommissionPercent = (totalCommissionDiff / file1.summary.totalCommission) * 100
    } else if (file2.summary.totalCommission > 0) {
      totalCommissionPercent = 100 // Se o valor anterior era 0 e agora é positivo, aumento de 100%
    }

    const clientCountDiff = file2.summary.clientCount - file1.summary.clientCount
    const productCountDiff = file2.summary.productCount - file1.summary.productCount

    // Encontrar clientes exclusivos
    const file1Clients = new Set(file1.data.map((item) => item.cnpj_cliente))
    const file2Clients = new Set(file2.data.map((item) => item.cnpj_cliente))

    const uniqueClientsFile1 = [...file1Clients].filter((client) => !file2Clients.has(client))
    const uniqueClientsFile2 = [...file2Clients].filter((client) => !file1Clients.has(client))

    // Encontrar produtos exclusivos
    const file1Products = new Set(file1.data.map((item) => item.codigo_item))
    const file2Products = new Set(file2.data.map((item) => item.codigo_item))

    const uniqueProductsFile1 = [...file1Products].filter((product) => !file2Products.has(product))
    const uniqueProductsFile2 = [...file2Products].filter((product) => !file1Products.has(product))

    return {
      totalCommissionDiff,
      totalCommissionPercent,
      clientCountDiff,
      productCountDiff,
      uniqueClientsFile1: uniqueClientsFile1.length,
      uniqueClientsFile2: uniqueClientsFile2.length,
      uniqueProductsFile1: uniqueProductsFile1.length,
      uniqueProductsFile2: uniqueProductsFile2.length,
    }
  }, [file1, file2])

  const formatCurrency = (value: number) => {
    // Verificar se o valor é um número válido
    if (value === undefined || value === null || isNaN(value)) {
      return "R$ 0,00"
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const renderChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpIcon className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDownIcon className="h-4 w-4 text-red-500" />
    return <MinusIcon className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Comparação</CardTitle>
          <CardDescription>
            Comparando {file1.name} com {file2.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Valores Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Total de Comissões</p>
                      <div className="flex items-center gap-1 mt-1">
                        {renderChangeIcon(comparison.totalCommissionDiff)}
                        <span
                          className={`text-sm ${
                            comparison.totalCommissionDiff > 0
                              ? "text-green-500"
                              : comparison.totalCommissionDiff < 0
                                ? "text-red-500"
                                : "text-gray-500"
                          }`}
                        >
                          {comparison.totalCommissionDiff > 0 ? "+" : ""}
                          {formatCurrency(comparison.totalCommissionDiff)}(
                          {comparison.totalCommissionPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{file1.name}</p>
                      <p className="font-bold">{formatCurrency(file1.summary.totalCommission)}</p>
                      <p className="text-sm text-muted-foreground mt-1">{file2.name}</p>
                      <p className="font-bold">{formatCurrency(file2.summary.totalCommission)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Clientes e Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Total de Clientes</p>
                    <div className="flex justify-between mt-1">
                      <div className="flex items-center gap-1">
                        {renderChangeIcon(comparison.clientCountDiff)}
                        <span
                          className={`text-sm ${
                            comparison.clientCountDiff > 0
                              ? "text-green-500"
                              : comparison.clientCountDiff < 0
                                ? "text-red-500"
                                : "text-gray-500"
                          }`}
                        >
                          {comparison.clientCountDiff > 0 ? "+" : ""}
                          {comparison.clientCountDiff}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">{file1.name}: </span>
                        <span className="font-medium">{file1.summary.clientCount}</span>
                        <br />
                        <span className="text-sm text-muted-foreground">{file2.name}: </span>
                        <span className="font-medium">{file2.summary.clientCount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Total de Produtos</p>
                    <div className="flex justify-between mt-1">
                      <div className="flex items-center gap-1">
                        {renderChangeIcon(comparison.productCountDiff)}
                        <span
                          className={`text-sm ${
                            comparison.productCountDiff > 0
                              ? "text-green-500"
                              : comparison.productCountDiff < 0
                                ? "text-red-500"
                                : "text-gray-500"
                          }`}
                        >
                          {comparison.productCountDiff > 0 ? "+" : ""}
                          {comparison.productCountDiff}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">{file1.name}: </span>
                        <span className="font-medium">{file1.summary.productCount}</span>
                        <br />
                        <span className="text-sm text-muted-foreground">{file2.name}: </span>
                        <span className="font-medium">{file2.summary.productCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Clientes Exclusivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Exclusivos em {file1.name}</p>
                <p className="text-2xl font-bold">{comparison.uniqueClientsFile1}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Exclusivos em {file2.name}</p>
                <p className="text-2xl font-bold">{comparison.uniqueClientsFile2}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Exclusivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Exclusivos em {file1.name}</p>
                <p className="text-2xl font-bold">{comparison.uniqueProductsFile1}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Exclusivos em {file2.name}</p>
                <p className="text-2xl font-bold">{comparison.uniqueProductsFile2}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
