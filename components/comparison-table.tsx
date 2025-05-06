"use client"

import { useState, useEffect, useMemo } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  getFilteredRowModel,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingUp, TrendingDown, Minus, Search } from "lucide-react"
import { DetailedComparisonModal } from "@/components/detailed-comparison-modal"
import type { ProcessedFile, CommissionData } from "@/types/file-types"

interface ComparisonTableProps {
  data: any[]
  file1Name: string
  file2Name: string
  file1Alias?: string
  file2Alias?: string
  file1?: ProcessedFile
  file2?: ProcessedFile
}

export function ComparisonTable({
  data,
  file1Name,
  file2Name,
  file1Alias = "arquivo1",
  file2Alias = "arquivo2",
  file1,
  file2,
}: ComparisonTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "difference", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const normalizedData = useMemo(() => {
    return data.map((item) => ({
      name: item.name,
      [file1Alias]: item[file1Name] || 0,
      [file2Alias]: item[file2Name] || 0,
      difference: item.difference,
      percentChange: item.percentChange,
    }))
  }, [data, file1Name, file2Name, file1Alias, file2Alias])

  const [tableData, setTableData] = useState(normalizedData)

  // Estado para controlar o modal de detalhes
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [detailItem1, setDetailItem1] = useState<CommissionData | null>(null)
  const [detailItem2, setDetailItem2] = useState<CommissionData | null>(null)

  // Atualizar dados da tabela quando os dados de entrada mudarem
  useEffect(() => {
    setTableData(normalizedData)
  }, [normalizedData])

  // Função para aplicar filtros específicos
  const applySpecificFilter = (filterType: string) => {
    if (filterType === "") {
      setGlobalFilter("")
      setTableData(normalizedData)
      return
    }

    // Definir filtros baseados no tipo
    if (filterType === "new-items") {
      // Filtrar apenas itens novos (valor zero no arquivo 1 e maior que zero no arquivo 2)
      const filteredData = normalizedData.filter(
        (item) => (item[file1Alias] === 0 || item[file1Alias] === undefined) && item[file2Alias] > 0,
      )
      setTableData(filteredData)
    } else if (filterType === "removed-items") {
      // Filtrar apenas itens removidos (valor maior que zero no arquivo 1 e zero no arquivo 2)
      const filteredData = normalizedData.filter(
        (item) => item[file1Alias] > 0 && (item[file2Alias] === 0 || item[file2Alias] === undefined),
      )
      setTableData(filteredData)
    } else if (filterType === "significant-changes") {
      // Filtrar alterações significativas (ambos valores > 0 e variação percentual > 10%)
      const filteredData = normalizedData.filter(
        (item) => item[file1Alias] > 0 && item[file2Alias] > 0 && Math.abs(item.percentChange) > 10,
      )
      setTableData(filteredData)
    }
  }

  // Função para mostrar detalhes do item
  const showItemDetails = (itemName: string) => {
    if (!file1 || !file2) return

    // Encontrar os registros correspondentes nos arquivos originais
    // Vamos buscar todos os registros que correspondem ao nome para ter uma visão completa
    const matchingItems1 = file1.data.filter((item) => item.nome_clifor === itemName)
    const matchingItems2 = file2.data.filter((item) => item.nome_clifor === itemName)

    // Se não encontrarmos pelo nome_clifor, podemos tentar outras abordagens
    if (matchingItems1.length === 0 && matchingItems2.length === 0) {
      // Tentar buscar por código ou outro identificador
      console.log("Não foi possível encontrar registros pelo nome, tentando outras abordagens")

      // Verificar se o nome pode ser um código de produto
      const byCode1 = file1.data.filter((item) => item.codigo_item === itemName)
      const byCode2 = file2.data.filter((item) => item.codigo_item === itemName)

      if (byCode1.length > 0 || byCode2.length > 0) {
        setDetailItem1(byCode1.length > 0 ? byCode1[0] : null)
        setDetailItem2(byCode2.length > 0 ? byCode2[0] : null)
        setSelectedItem(itemName)
        setIsDetailModalOpen(true)
        return
      }

      // Se ainda não encontrou, pode ser que o nome seja exatamente o que está na tabela
      // Neste caso, vamos criar registros parciais com os dados que temos
      const tableItem = tableData.find((item) => item.name === itemName)
      if (tableItem) {
        const partialItem1 = {
          id: "partial-1",
          nome_clifor: itemName,
          valor_comissao_total: tableItem[file1Alias] || 0,
        } as unknown as CommissionData

        const partialItem2 = {
          id: "partial-2",
          nome_clifor: itemName,
          valor_comissao_total: tableItem[file2Alias] || 0,
        } as unknown as CommissionData

        setDetailItem1(partialItem1)
        setDetailItem2(partialItem2)
        setSelectedItem(itemName)
        setIsDetailModalOpen(true)
        return
      }
    } else {
      // Usar o primeiro registro encontrado para cada arquivo
      setDetailItem1(matchingItems1.length > 0 ? matchingItems1[0] : null)
      setDetailItem2(matchingItems2.length > 0 ? matchingItems2[0] : null)
      setSelectedItem(itemName)
      setIsDetailModalOpen(true)
    }
  }

  // Função para limpar filtros e restaurar dados originais
  const clearFilters = () => {
    setGlobalFilter("")
    setTableData(normalizedData)
  }

  const formatCurrency = (value: number) => {
    // Verificar se o valor é um número válido antes de formatar
    if (value === undefined || value === null || isNaN(value)) {
      return "R$ 0,00" // Ou qualquer outro valor padrão que faça sentido
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate cursor-pointer text-primary hover:underline"
          title={row.getValue("name")}
          onClick={(e) => {
            e.stopPropagation() // Evitar propagação para não disparar o evento da linha também
            console.log("Clicou no nome:", row.getValue("name"))
            showItemDetails(row.getValue("name"))
          }}
        >
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: file1Alias,
      header: () => <div className="text-right">{file1Name}</div>,
      cell: ({ row }) => {
        const amount = row.getValue(file1Alias) as number
        // Verificar se o valor é válido
        if (amount === undefined || amount === null || isNaN(amount)) {
          return <div className="text-right font-medium">R$ 0,00</div>
        }
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: file2Alias,
      header: () => <div className="text-right">{file2Name}</div>,
      cell: ({ row }) => {
        const amount = row.getValue(file2Alias) as number
        // Verificar se o valor é válido
        if (amount === undefined || amount === null || isNaN(amount)) {
          return <div className="text-right font-medium">R$ 0,00</div>
        }
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: "difference",
      header: () => <div className="text-right">Diferença</div>,
      cell: ({ row }) => {
        const amount = row.getValue("difference") as number
        return (
          <div className="text-right font-medium flex items-center justify-end">
            <span className={amount > 0 ? "text-green-600" : amount < 0 ? "text-red-600" : ""}>
              {formatCurrency(amount)}
            </span>
            <span className="ml-2">
              {amount > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : amount < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "percentChange",
      header: () => <div className="text-right">Variação %</div>,
      cell: ({ row }) => {
        const percent = row.getValue("percentChange") as number
        // Determinar se a alteração é significativa (mais de 10%)
        const isSignificant = Math.abs(percent) > 10

        return (
          <div
            className={`text-right font-medium ${
              percent > 0
                ? isSignificant
                  ? "text-green-700"
                  : "text-green-600"
                : percent < 0
                  ? isSignificant
                    ? "text-red-700"
                    : "text-red-600"
                  : ""
            }`}
          >
            {percent > 0 ? "+" : ""}
            {percent.toFixed(2)}%{isSignificant && <span className="ml-1 text-xs">(!)</span>}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const value1 = row.getValue(file1Alias) as number
        const value2 = row.getValue(file2Alias) as number

        if (value1 === 0 && value2 > 0) {
          return <div className="text-green-600 font-medium">Novo item</div>
        } else if (value1 > 0 && value2 === 0) {
          return <div className="text-red-600 font-medium">Item removido</div>
        } else if (value1 !== value2) {
          return <div className="text-amber-600 font-medium">Valor alterado</div>
        } else {
          return <div className="text-gray-500">Sem alteração</div>
        }
      },
    },
    {
      accessorKey: "details",
      header: "Detalhes da Alteração",
      cell: ({ row }) => {
        const value1 = row.getValue(file1Alias) as number
        const value2 = row.getValue(file2Alias) as number
        const percent = row.getValue("percentChange") as number

        if (value1 === 0 && value2 > 0) {
          return <div>Item adicionado com valor de {formatCurrency(value2)}</div>
        } else if (value1 > 0 && value2 === 0) {
          return <div>Item removido que tinha valor de {formatCurrency(value1)}</div>
        } else if (value1 !== value2) {
          const commissionChange =
            Math.abs(percent) > 10 ? (
              <span className="font-medium">Alteração significativa na comissão</span>
            ) : (
              "Alteração na comissão"
            )

          return (
            <div>
              {commissionChange}
              <br />
              <span className="text-xs text-muted-foreground">
                {percent > 0 ? "Aumento" : "Redução"} de {Math.abs(percent).toFixed(2)}% (
                {formatCurrency(Math.abs(value2 - value1))})
              </span>
            </div>
          )
        } else {
          return <div className="text-muted-foreground">Sem alterações</div>
        }
      },
    },
  ]

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar todos os campos..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Próximo
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => applySpecificFilter("new-items")}
          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        >
          Novos Itens
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applySpecificFilter("removed-items")}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          Itens Removidos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applySpecificFilter("significant-changes")}
          className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
        >
          Alterações Significativas
        </Button>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => header.column.toggleSorting()}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                // Determinar a classe de fundo com base no status
                const value1 = row.getValue(file1Alias) as number
                const value2 = row.getValue(file2Alias) as number
                let rowClass = ""

                if (value1 === 0 && value2 > 0) {
                  rowClass = "bg-green-50 dark:bg-green-900/20"
                } else if (value1 > 0 && value2 === 0) {
                  rowClass = "bg-red-50 dark:bg-red-900/20"
                } else if (value1 !== value2 && Math.abs(row.getValue("percentChange") as number) > 10) {
                  rowClass = "bg-amber-50 dark:bg-amber-900/20"
                }

                return (
                  <TableRow
                    key={row.id}
                    className={`${rowClass} hover:bg-muted/50 cursor-pointer`}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      console.log("Clicou na linha:", row.getValue("name"))
                      showItemDetails(row.getValue("name"))
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de detalhes do item */}
      <DetailedComparisonModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item1={detailItem1}
        item2={detailItem2}
        file1Name={file1Name}
        file2Name={file2Name}
      />
    </div>
  )
}
