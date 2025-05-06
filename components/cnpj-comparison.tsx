"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PlusCircle, MinusCircle } from "lucide-react"
import type { ProcessedFile } from "@/types/file-types"

interface CNPJComparisonProps {
  file1: ProcessedFile
  file2: ProcessedFile
}

export function CNPJComparison({ file1, file2 }: CNPJComparisonProps) {
  const { addedCNPJs, removedCNPJs } = useMemo(() => {
    // Mapear CNPJs e nomes de clientes do arquivo 1
    const cnpjMap1 = new Map<string, string>()
    file1.data.forEach((item) => {
      if (item.cnpj_cliente) {
        cnpjMap1.set(item.cnpj_cliente, item.nome_clifor)
      }
    })

    // Mapear CNPJs e nomes de clientes do arquivo 2
    const cnpjMap2 = new Map<string, string>()
    file2.data.forEach((item) => {
      if (item.cnpj_cliente) {
        cnpjMap2.set(item.cnpj_cliente, item.nome_clifor)
      }
    })

    // Encontrar CNPJs adicionados (presentes em 2 mas não em 1)
    const addedCNPJs = Array.from(cnpjMap2.entries())
      .filter(([cnpj]) => !cnpjMap1.has(cnpj))
      .map(([cnpj, name]) => ({ cnpj, name }))

    // Encontrar CNPJs removidos (presentes em 1 mas não em 2)
    const removedCNPJs = Array.from(cnpjMap1.entries())
      .filter(([cnpj]) => !cnpjMap2.has(cnpj))
      .map(([cnpj, name]) => ({ cnpj, name }))

    return { addedCNPJs, removedCNPJs }
  }, [file1, file2])

  // Calcular valores totais para CNPJs adicionados e removidos
  const { addedTotal, removedTotal } = useMemo(() => {
    let addedTotal = 0
    let removedTotal = 0

    // Calcular total para CNPJs adicionados
    addedCNPJs.forEach(({ cnpj }) => {
      file2.data.forEach((item) => {
        if (item.cnpj_cliente === cnpj) {
          addedTotal += item.valor_comissao_total
        }
      })
    })

    // Calcular total para CNPJs removidos
    removedCNPJs.forEach(({ cnpj }) => {
      file1.data.forEach((item) => {
        if (item.cnpj_cliente === cnpj) {
          removedTotal += item.valor_comissao_total
        }
      })
    })

    return { addedTotal, removedTotal }
  }, [addedCNPJs, removedCNPJs, file1, file2])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de CNPJs</CardTitle>
        <CardDescription>
          Comparação de CNPJs entre {file1.name} e {file2.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="added">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="added" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-green-600" />
              <span>CNPJs Adicionados ({addedCNPJs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="removed" className="flex items-center gap-2">
              <MinusCircle className="h-4 w-4 text-red-600" />
              <span>CNPJs Removidos ({removedCNPJs.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="added">
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="font-medium">Total de comissões dos novos CNPJs: {formatCurrency(addedTotal)}</p>
            </div>
            {addedCNPJs.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Nome do Cliente</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addedCNPJs.map(({ cnpj, name }) => {
                      // Calcular valor total para este CNPJ
                      const total = file2.data
                        .filter((item) => item.cnpj_cliente === cnpj)
                        .reduce((sum, item) => sum + item.valor_comissao_total, 0)

                      return (
                        <TableRow key={cnpj}>
                          <TableCell className="font-mono">{cnpj}</TableCell>
                          <TableCell>{name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Nenhum CNPJ foi adicionado</p>
            )}
          </TabsContent>

          <TabsContent value="removed">
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="font-medium">Total de comissões dos CNPJs removidos: {formatCurrency(removedTotal)}</p>
            </div>
            {removedCNPJs.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Nome do Cliente</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {removedCNPJs.map(({ cnpj, name }) => {
                      // Calcular valor total para este CNPJ
                      const total = file1.data
                        .filter((item) => item.cnpj_cliente === cnpj)
                        .reduce((sum, item) => sum + item.valor_comissao_total, 0)

                      return (
                        <TableRow key={cnpj}>
                          <TableCell className="font-mono">{cnpj}</TableCell>
                          <TableCell>{name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Nenhum CNPJ foi removido</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
