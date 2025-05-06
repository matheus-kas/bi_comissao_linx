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
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ComparisonTableProps {
  data: any[]
  file1Name: string
  file2Name: string
  file1Alias?: string
  file2Alias?: string
}

export function ComparisonTable({
  data,
  file1Name,
  file2Name,
  file1Alias = "arquivo1",
  file2Alias = "arquivo2",
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

  // Estado para controlar o modal de detalhes
  const [showDetails, setShowDetails] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)

  // Função para mostrar detalhes do cliente
  const showClientDetails = (client: string) => {
    const clientData = data.find((item) => item.name === client)
    if (clientData) {
      setSelectedClient(clientData)
      setShowDetails(true)
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
          onClick={() => showClientDetails(row.getValue("name"))}
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
        <Input
          placeholder="Filtrar todos os campos..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
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
                  <TableRow key={row.id} className={rowClass} data-state={row.getIsSelected() && "selected"}>
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

      {/* Modal de detalhes do cliente */}
      {showDetails && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-auto">
            <div className="p-4 border-b sticky top-0 bg-background">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedClient.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Arquivo 1: {file1Name}</h4>
                  <p className="text-2xl font-bold">{formatCurrency(selectedClient[file1Alias])}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Arquivo 2: {file2Name}</h4>
                  <p className="text-2xl font-bold">{formatCurrency(selectedClient[file2Alias])}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Análise da Alteração</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Diferença:</span>
                      <span
                        className={
                          selectedClient.difference > 0
                            ? "text-green-600"
                            : selectedClient.difference < 0
                              ? "text-red-600"
                              : ""
                        }
                      >
                        {formatCurrency(selectedClient.difference)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variação Percentual:</span>
                      <span
                        className={
                          selectedClient.percentChange > 0
                            ? "text-green-600"
                            : selectedClient.percentChange < 0
                              ? "text-red-600"
                              : ""
                        }
                      >
                        {selectedClient.percentChange > 0 ? "+" : ""}
                        {selectedClient.percentChange.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span>
                        {selectedClient[file1Alias] === 0 && selectedClient[file2Alias] > 0
                          ? "Novo item"
                          : selectedClient[file1Alias] > 0 && selectedClient[file2Alias] === 0
                            ? "Item removido"
                            : "Valor alterado"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Detalhes da Alteração</h4>
                  <p>
                    {selectedClient[file1Alias] === 0 && selectedClient[file2Alias] > 0
                      ? `Item adicionado com valor de ${formatCurrency(selectedClient[file2Alias])}`
                      : selectedClient[file1Alias] > 0 && selectedClient[file2Alias] === 0
                        ? `Item removido que tinha valor de ${formatCurrency(selectedClient[file1Alias])}`
                        : `${Math.abs(selectedClient.percentChange) > 10 ? "Alteração significativa" : "Alteração"} na comissão de ${formatCurrency(Math.abs(selectedClient.difference))}`}
                  </p>

                  {selectedClient[file1Alias] > 0 && selectedClient[file2Alias] > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedClient.percentChange > 0
                        ? `Aumento de ${Math.abs(selectedClient.percentChange).toFixed(2)}% em relação ao período anterior.`
                        : `Redução de ${Math.abs(selectedClient.percentChange).toFixed(2)}% em relação ao período anterior.`}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t sticky bottom-0 bg-background">
              <Button onClick={() => setShowDetails(false)} className="w-full">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
