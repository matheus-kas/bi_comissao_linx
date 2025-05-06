"use client"

import { useState } from "react"
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
}

export function ComparisonTable({ data, file1Name, file2Name }: ComparisonTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "difference", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const formatCurrency = (value: number) => {
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
        <div className="max-w-[200px] truncate" title={row.getValue("name")}>
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: file1Name,
      header: () => <div className="text-right">{file1Name}</div>,
      cell: ({ row }) => {
        const amount = row.getValue(file1Name) as number
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: file2Name,
      header: () => <div className="text-right">{file2Name}</div>,
      cell: ({ row }) => {
        const amount = row.getValue(file2Name) as number
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
        const value1 = row.getValue(file1Name) as number
        const value2 = row.getValue(file2Name) as number

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
        const value1 = row.getValue(file1Name) as number
        const value2 = row.getValue(file2Name) as number
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
    data,
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
          onClick={() => setGlobalFilter("Novo item")}
          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        >
          Novos Itens
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGlobalFilter("Item removido")}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          Itens Removidos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGlobalFilter("Alteração significativa")}
          className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
        >
          Alterações Significativas
        </Button>
        <Button variant="outline" size="sm" onClick={() => setGlobalFilter("")}>
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
                const status = row.original.status
                let rowClass = ""

                if (status === "new") {
                  rowClass = "bg-green-50 dark:bg-green-900/20"
                } else if (status === "removed") {
                  rowClass = "bg-red-50 dark:bg-red-900/20"
                } else if (status === "significant_change") {
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
    </div>
  )
}
