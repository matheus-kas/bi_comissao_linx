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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CommissionData } from "@/types/file-types"

interface DataTableProps {
  data: CommissionData[]
}

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<CommissionData>[] = [
    {
      accessorKey: "nome_clifor",
      header: "Cliente",
      cell: ({ row }) => {
        const value = row.getValue("nome_clifor") as string
        return (
          <div className="max-w-[200px] truncate" title={value || ""}>
            {value || "—"}
          </div>
        )
      },
    },
    {
      accessorKey: "cnpj_cliente",
      header: "CNPJ",
      cell: ({ row }) => {
        const value = row.getValue("cnpj_cliente") as string
        return <div className="font-mono">{value || "—"}</div>
      },
    },
    {
      accessorKey: "fatura",
      header: "Fatura",
      cell: ({ row }) => {
        const value = row.getValue("fatura") as string
        return value || "—"
      },
    },
    {
      accessorKey: "codigo_item",
      header: "Produto",
      cell: ({ row }) => {
        const value = row.getValue("codigo_item") as string
        return (
          <div className="max-w-[200px] truncate" title={value || ""}>
            {value || "—"}
          </div>
        )
      },
    },
    {
      accessorKey: "emissao",
      header: "Emissão",
      cell: ({ row }) => {
        const date = row.getValue("emissao") as string
        if (!date) return "—"
        try {
          return new Date(date).toLocaleDateString("pt-BR")
        } catch (e) {
          return date
        }
      },
    },
    {
      accessorKey: "valor_recebido_total",
      header: "Valor Recebido",
      cell: ({ row }) => {
        const amount = row.getValue("valor_recebido_total")
        if (amount === null || amount === undefined || isNaN(Number(amount))) {
          return "—"
        }
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(amount))
      },
    },
    {
      accessorKey: "valor_comissao_total",
      header: "Comissão",
      cell: ({ row }) => {
        const amount = row.getValue("valor_comissao_total")
        if (amount === null || amount === undefined || isNaN(Number(amount))) {
          return "—"
        }
        // Garantir que o valor seja exibido com 2 casas decimais
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(amount))
      },
    },
    {
      accessorKey: "percent_comissao_item_contrato",
      header: "% Comissão",
      cell: ({ row }) => {
        const percent = row.getValue("percent_comissao_item_contrato")
        if (percent === null || percent === undefined || isNaN(Number(percent))) {
          return "—"
        }
        return `${Number(percent)}%`
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
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </div>
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
      <div className="rounded-md border">
        <Table aria-label="Tabela de dados de comissão">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      onClick={() => header.column.toggleSorting()}
                      aria-sort={
                        header.column.getIsSorted()
                          ? header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "ascending"
                          : "none"
                      }
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="sr-only">
                          {header.column.getIsSorted() === "desc" ? "Ordenado decrescente" : "Ordenado crescente"}
                        </span>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
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
