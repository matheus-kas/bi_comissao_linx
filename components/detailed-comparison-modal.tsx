"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react"
import type { CommissionData } from "@/types/file-types"

interface DetailedComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  item1: CommissionData | null
  item2: CommissionData | null
  file1Name: string
  file2Name: string
}

export function DetailedComparisonModal({
  isOpen,
  onClose,
  item1,
  item2,
  file1Name,
  file2Name,
}: DetailedComparisonModalProps) {
  console.log("Modal Props:", { isOpen, item1, item2, file1Name, file2Name })
  const [differences, setDifferences] = useState<Record<string, { value1: any; value2: any; isDifferent: boolean }>>({})

  useEffect(() => {
    if (item1 || item2) {
      const diffs: Record<string, { value1: any; value2: any; isDifferent: boolean }> = {}

      // Lista de todos os campos possíveis
      const allFields = [
        "nome_clifor",
        "cnpj_cliente",
        "fatura",
        "id_parcela",
        "data_liberacao",
        "codigo_item",
        "emissao",
        "vencimento_real",
        "valor_recebido_total",
        "percent_comissao_item_contrato",
        "valor_comissao_total",
        "taxa_imposto",
        "valor_imposto",
        "valor_a_pagar_sem_imposto",
        "rateio_centro_custo",
        "desc_rateio_centro_custo",
        "id_fechamento",
        "valor_menos_imposto",
        "contato",
        "clifor_cliente",
      ]

      // Verificar diferenças em todos os campos
      allFields.forEach((field) => {
        const value1 = item1 ? (item1 as any)[field] : undefined
        const value2 = item2 ? (item2 as any)[field] : undefined

        // Verificar se os valores são diferentes
        let isDifferent = false

        if (typeof value1 === "number" && typeof value2 === "number") {
          // Para valores numéricos, considerar diferente se a diferença for maior que 0.01
          isDifferent = Math.abs(value1 - value2) > 0.01
        } else if (value1 === undefined && value2 !== undefined) {
          // Se um valor existe e o outro não
          isDifferent = true
        } else if (value1 !== undefined && value2 === undefined) {
          // Se um valor existe e o outro não
          isDifferent = true
        } else {
          // Para outros tipos, comparação direta
          isDifferent = value1 !== value2
        }

        diffs[field] = {
          value1,
          value2,
          isDifferent,
        }
      })

      setDifferences(diffs)
    }
  }, [item1, item2])

  const getVisibleFields = () => {
    // Campos prioritários que devem aparecer primeiro
    const priorityFields = [
      "nome_clifor",
      "cnpj_cliente",
      "codigo_item",
      "fatura",
      "valor_comissao_total",
      "percent_comissao_item_contrato",
      "valor_recebido_total",
    ]

    // Obter todos os campos que têm valores
    const fieldsWithValues = Object.keys(differences).filter(
      (field) => differences[field].value1 !== undefined || differences[field].value2 !== undefined,
    )

    // Ordenar os campos: primeiro os prioritários, depois os demais
    return [
      ...priorityFields.filter((field) => fieldsWithValues.includes(field)),
      ...fieldsWithValues.filter((field) => !priorityFields.includes(field)),
    ]
  }

  const formatValue = (value: any, fieldName: string) => {
    if (value === undefined || value === null) return "-"

    // Formatar valores monetários
    if (fieldName.includes("valor_") || fieldName === "taxa_imposto") {
      if (typeof value === "number") {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value)
      }
    }

    // Formatar percentuais
    if (fieldName.includes("percent_")) {
      if (typeof value === "number") {
        return `${value.toFixed(2)}%`
      }
    }

    // Formatar datas
    if (fieldName === "emissao" || fieldName === "vencimento_real" || fieldName === "data_liberacao") {
      if (value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)))) {
        const date = value instanceof Date ? value : new Date(value)
        return date.toLocaleDateString("pt-BR")
      }
    }

    return String(value)
  }

  const getChangeIcon = (field: string) => {
    const diff = differences[field]
    if (!diff || !diff.isDifferent) return null

    // Para campos numéricos, mostrar setas indicando aumento ou diminuição
    if (typeof diff.value1 === "number" && typeof diff.value2 === "number") {
      if (diff.value2 > diff.value1) {
        return <ArrowUpIcon className="h-4 w-4 text-green-500 ml-1" />
      } else if (diff.value2 < diff.value1) {
        return <ArrowDownIcon className="h-4 w-4 text-red-500 ml-1" />
      }
    }

    // Para outros tipos de campos, apenas indicar que há diferença
    return <MinusIcon className="h-4 w-4 text-amber-500 ml-1" />
  }

  // Calcular a diferença percentual para valores numéricos
  const getPercentChange = (field: string) => {
    const diff = differences[field]
    if (!diff || !diff.isDifferent) return null

    if (typeof diff.value1 === "number" && typeof diff.value2 === "number") {
      if (diff.value1 === 0) {
        return diff.value2 > 0 ? "+100%" : "0%"
      }

      const percentChange = ((diff.value2 - diff.value1) / Math.abs(diff.value1)) * 100
      return `${percentChange > 0 ? "+" : ""}${percentChange.toFixed(2)}%`
    }

    return null
  }

  if (!item1 && !item2) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Comparação Detalhada: {item1?.nome_clifor || item2?.nome_clifor}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-md">
              <h3 className="font-medium">{file1Name}</h3>
              <p className="text-sm text-muted-foreground">Fatura: {item1?.fatura || "-"}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-md">
              <h3 className="font-medium">{file2Name}</h3>
              <p className="text-sm text-muted-foreground">Fatura: {item2?.fatura || "-"}</p>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campo</TableHead>
                  <TableHead>{file1Name}</TableHead>
                  <TableHead>{file2Name}</TableHead>
                  <TableHead>Diferença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getVisibleFields().map((field) => {
                  const diff = differences[field]
                  const percentChange = getPercentChange(field)

                  return (
                    <TableRow key={field} className={diff.isDifferent ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                      <TableCell className="font-medium">
                        {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </TableCell>
                      <TableCell>{formatValue(diff.value1, field)}</TableCell>
                      <TableCell>{formatValue(diff.value2, field)}</TableCell>
                      <TableCell>
                        {diff.isDifferent ? (
                          <div className="flex items-center">
                            <span
                              className={
                                typeof diff.value1 === "number" && typeof diff.value2 === "number"
                                  ? diff.value2 > diff.value1
                                    ? "text-green-600"
                                    : "text-red-600"
                                  : "text-amber-600"
                              }
                            >
                              {typeof diff.value1 === "number" && typeof diff.value2 === "number"
                                ? formatValue(diff.value2 - diff.value1, field)
                                : "Alterado"}
                            </span>
                            {getChangeIcon(field)}
                            {percentChange && (
                              <span className="text-xs ml-2 text-muted-foreground">({percentChange})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sem alteração</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
