"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Search, AlertTriangle } from "lucide-react"
import type { ProcessedFile } from "@/types/file-types"

interface ValueReconciliationProps {
  file1: ProcessedFile
  file2: ProcessedFile
}

export function ValueReconciliation({ file1, file2 }: ValueReconciliationProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)

  // Analisar faturas para reconciliação
  const reconciliationData = useMemo(() => {
    // Mapear faturas do arquivo 1
    const invoiceMap1 = new Map<string, number>()
    file1.data.forEach((item) => {
      if (item.fatura) {
        const key = `${item.fatura}-${item.cnpj_cliente}`
        invoiceMap1.set(key, (invoiceMap1.get(key) || 0) + item.valor_comissao_total)
      }
    })

    // Mapear faturas do arquivo 2
    const invoiceMap2 = new Map<string, number>()
    file2.data.forEach((item) => {
      if (item.fatura) {
        const key = `${item.fatura}-${item.cnpj_cliente}`
        invoiceMap2.set(key, (invoiceMap2.get(key) || 0) + item.valor_comissao_total)
      }
    })

    // Combinar dados para análise
    const allInvoices = new Set([...invoiceMap1.keys(), ...invoiceMap2.keys()])

    const invoiceData = Array.from(allInvoices).map((key) => {
      const [invoice, cnpj] = key.split("-")
      const value1 = invoiceMap1.get(key) || 0
      const value2 = invoiceMap2.get(key) || 0
      const difference = value2 - value1
      const percentDiff = value1 === 0 ? (value2 > 0 ? 100 : 0) : (difference / value1) * 100

      // Encontrar nome do cliente
      let clientName = ""
      const clientItem1 = file1.data.find((item) => item.fatura === invoice && item.cnpj_cliente === cnpj)
      const clientItem2 = file2.data.find((item) => item.fatura === invoice && item.cnpj_cliente === cnpj)

      if (clientItem1) {
        clientName = clientItem1.nome_clifor
      } else if (clientItem2) {
        clientName = clientItem2.nome_clifor
      }

      return {
        invoice,
        cnpj,
        clientName,
        value1,
        value2,
        difference,
        percentDiff,
        match: Math.abs(difference) < 0.01, // Considerar match se a diferença for menor que 0.01
      }
    })

    // Calcular estatísticas
    const totalInvoices = invoiceData.length
    const matchingInvoices = invoiceData.filter((item) => item.match).length
    const mismatchInvoices = totalInvoices - matchingInvoices

    // Calcular totais
    const total1 = invoiceData.reduce((sum, item) => sum + item.value1, 0)
    const total2 = invoiceData.reduce((sum, item) => sum + item.value2, 0)
    const totalDifference = total2 - total1

    return {
      invoices: invoiceData,
      stats: {
        totalInvoices,
        matchingInvoices,
        mismatchInvoices,
        total1,
        total2,
        totalDifference,
        matchPercentage: (matchingInvoices / totalInvoices) * 100,
      },
    }
  }, [file1, file2])

  // Filtrar dados com base na pesquisa
  const filteredData = useMemo(() => {
    return reconciliationData.invoices.filter((item) => {
      const matchesSearch =
        item.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cnpj.toLowerCase().includes(searchTerm.toLowerCase())

      // Se estiver mostrando apenas diferenças, filtrar itens que não correspondem
      if (showOnlyDifferences) {
        return !item.match
      }

      return true
    })
  }, [reconciliationData.invoices, searchTerm, showOnlyDifferences])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reconciliação de Valores</CardTitle>
        <CardDescription>
          Verificação de valores entre {file1.name} e {file2.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturas Correspondentes</p>
                <p className="text-2xl font-bold text-green-600">
                  {reconciliationData.stats.matchingInvoices}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({reconciliationData.stats.matchPercentage.toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturas com Diferenças</p>
                <p className="text-2xl font-bold text-amber-600">
                  {reconciliationData.stats.mismatchInvoices}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({(100 - reconciliationData.stats.matchPercentage).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Diferença Total</p>
                <p
                  className={`text-2xl font-bold ${
                    reconciliationData.stats.totalDifference > 0
                      ? "text-green-600"
                      : reconciliationData.stats.totalDifference < 0
                        ? "text-red-600"
                        : ""
                  }`}
                >
                  {formatCurrency(reconciliationData.stats.totalDifference)}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                <XCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por fatura ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant={showOnlyDifferences ? "default" : "outline"}
            onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
          >
            {showOnlyDifferences ? "Mostrando Diferenças" : "Mostrar Apenas Diferenças"}
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Valor ({file1.name})</TableHead>
                <TableHead className="text-right">Valor ({file2.name})</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData
                  .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
                  .map((item) => (
                    <TableRow key={`${item.invoice}-${item.cnpj}`}>
                      <TableCell className="font-medium">{item.invoice}</TableCell>
                      <TableCell>{item.clientName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.value1)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.value2)}</TableCell>
                      <TableCell
                        className={`text-right ${
                          item.difference > 0 ? "text-green-600" : item.difference < 0 ? "text-red-600" : ""
                        }`}
                      >
                        {formatCurrency(item.difference)}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.match ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhum resultado encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
