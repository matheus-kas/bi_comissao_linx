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
import { TrendingUp, TrendingDown, Minus, Search, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

  // Verificar se os arquivos estão disponíveis
  const [filesAvailable, setFilesAvailable] = useState(false)

  useEffect(() => {
    // Verificar se os arquivos e seus dados estão disponíveis
    const available = !!(file1 && file2 && file1.data && file2.data && file1.data.length > 0 && file2.data.length > 0)
    setFilesAvailable(available)

    if (available) {
      console.log("Arquivos disponíveis para comparação", {
        file1Name: file1.name,
        file2Name: file2.name,
        file1DataLength: file1.data.length,
        file2DataLength: file2.data.length,
      })
    } else {
      console.warn("Arquivos não disponíveis para comparação detalhada", {
        file1: !!file1,
        file2: !!file2,
        file1Data: file1 ? !!file1.data : false,
        file2Data: file2 ? !!file2.data : false,
      })
    }
  }, [file1, file2])

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
      // E verificar se não são apenas diferenças de fatura/emissão
      const filteredData = normalizedData.filter((item) => {
        // Verificar se há variação percentual significativa
        const hasSignificantChange = item[file1Alias] > 0 && item[file2Alias] > 0 && Math.abs(item.percentChange) > 10

        if (!hasSignificantChange) return false

        // Se os arquivos completos estiverem disponíveis, verificar se as diferenças
        // não são apenas em fatura e emissão
        if (filesAvailable && file1 && file2) {
          const itemName = item.name

          // Determinar se estamos comparando clientes ou produtos
          const isClient = file1Alias === "arquivo1" && file2Alias === "arquivo2"

          // Buscar registros correspondentes
          let records1 = []
          let records2 = []

          if (isClient) {
            records1 = file1.data.filter(
              (record) => record.nome_clifor === itemName || record.cnpj_cliente === itemName,
            )
            records2 = file2.data.filter(
              (record) => record.nome_clifor === itemName || record.cnpj_cliente === itemName,
            )
          } else {
            records1 = file1.data.filter((record) => record.codigo_item === itemName)
            records2 = file2.data.filter((record) => record.codigo_item === itemName)
          }

          // Se encontramos registros em ambos os arquivos
          if (records1.length > 0 && records2.length > 0) {
            // Pegar o primeiro registro de cada (simplificação)
            const record1 = records1[0]
            const record2 = records2[0]

            // Verificar se os valores importantes são iguais
            const sameCommission = Math.abs(record1.valor_comissao_total - record2.valor_comissao_total) < 0.01
            const samePercent =
              Math.abs(record1.percent_comissao_item_contrato - record2.percent_comissao_item_contrato) < 0.01
            const sameReceived = Math.abs(record1.valor_recebido_total - record2.valor_recebido_total) < 0.01

            // Se todos os valores importantes são iguais, ignorar diferenças apenas em fatura e emissão
            if (sameCommission && samePercent && sameReceived) {
              return false
            }
          }
        }

        return true
      })

      setTableData(filteredData)
    }
  }

  // Função para mostrar detalhes do item
  const showItemDetails = (itemName: string) => {
    console.log("showItemDetails chamado para:", itemName)

    if (!filesAvailable) {
      console.error("Arquivos não disponíveis para comparação detalhada")
      return
    }

    try {
      // Encontrar o item na tabela de comparação
      const tableItem = tableData.find((item) => item.name === itemName)

      if (!tableItem) {
        console.error("Item não encontrado na tabela:", itemName)
        return
      }

      console.log("Item encontrado na tabela:", tableItem)

      // Determinar se estamos comparando clientes ou produtos
      const isClient = file1Alias === "arquivo1" && file2Alias === "arquivo2"

      let item1Data: CommissionData | null = null
      let item2Data: CommissionData | null = null

      if (isClient) {
        // Buscar registros por cliente
        const clientRecords1 = file1!.data.filter(
          (item) => item.nome_clifor === itemName || item.cnpj_cliente === itemName,
        )

        const clientRecords2 = file2!.data.filter(
          (item) => item.nome_clifor === itemName || item.cnpj_cliente === itemName,
        )

        // Se encontramos registros, use o que tem o valor mais próximo do valor na tabela
        if (clientRecords1.length > 0) {
          // Primeiro, tentar encontrar registros com valores exatamente iguais
          const exactMatches = clientRecords1.filter(
            (record) => Math.abs(record.valor_comissao_total - tableItem[file1Alias]) < 0.01,
          )

          if (exactMatches.length > 0) {
            // Se encontramos correspondências exatas, usar a primeira
            item1Data = exactMatches[0]
          } else {
            // Caso contrário, ordenar por proximidade do valor na tabela
            clientRecords1.sort(
              (a, b) =>
                Math.abs(a.valor_comissao_total - tableItem[file1Alias]) -
                Math.abs(b.valor_comissao_total - tableItem[file1Alias]),
            )
            item1Data = clientRecords1[0]
          }
        }

        if (clientRecords2.length > 0) {
          // Primeiro, tentar encontrar registros com valores exatamente iguais
          const exactMatches = clientRecords2.filter(
            (record) => Math.abs(record.valor_comissao_total - tableItem[file2Alias]) < 0.01,
          )

          if (exactMatches.length > 0) {
            // Se encontramos correspondências exatas, usar a primeira
            item2Data = exactMatches[0]
          } else {
            // Caso contrário, ordenar por proximidade do valor na tabela
            clientRecords2.sort(
              (a, b) =>
                Math.abs(a.valor_comissao_total - tableItem[file2Alias]) -
                Math.abs(b.valor_comissao_total - tableItem[file2Alias]),
            )
            item2Data = clientRecords2[0]
          }
        }
      } else {
        // Buscar registros por produto
        const productRecords1 = file1!.data.filter((item) => item.codigo_item === itemName)

        const productRecords2 = file2!.data.filter((item) => item.codigo_item === itemName)

        // Se encontramos registros, use o que tem o valor mais próximo do valor na tabela
        if (productRecords1.length > 0) {
          // Primeiro, tentar encontrar registros com valores exatamente iguais
          const exactMatches = productRecords1.filter(
            (record) => Math.abs(record.valor_comissao_total - tableItem[file1Alias]) < 0.01,
          )

          if (exactMatches.length > 0) {
            // Se encontramos correspondências exatas, usar a primeira
            item1Data = exactMatches[0]
          } else {
            // Caso contrário, ordenar por proximidade do valor na tabela
            productRecords1.sort(
              (a, b) =>
                Math.abs(a.valor_comissao_total - tableItem[file1Alias]) -
                Math.abs(b.valor_comissao_total - tableItem[file1Alias]),
            )
            item1Data = productRecords1[0]
          }
        }

        if (productRecords2.length > 0) {
          // Primeiro, tentar encontrar registros com valores exatamente iguais
          const exactMatches = productRecords2.filter(
            (record) => Math.abs(record.valor_comissao_total - tableItem[file2Alias]) < 0.01,
          )

          if (exactMatches.length > 0) {
            // Se encontramos correspondências exatas, usar a primeira
            item2Data = exactMatches[0]
          } else {
            // Caso contrário, ordenar por proximidade do valor na tabela
            productRecords2.sort(
              (a, b) =>
                Math.abs(a.valor_comissao_total - tableItem[file2Alias]) -
                Math.abs(b.valor_comissao_total - tableItem[file2Alias]),
            )
            item2Data = productRecords2[0]
          }
        }
      }

      console.log("Dados para o modal:", { item1Data, item2Data })

      // Definir os estados e abrir o modal
      setDetailItem1(item1Data)
      setDetailItem2(item2Data)
      setSelectedItem(itemName)
      setIsDetailModalOpen(true)

      console.log("Modal deveria estar aberto agora:", { isDetailModalOpen: true })
    } catch (error) {
      console.error("Erro ao processar detalhes:", error)
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
            if (filesAvailable) {
              console.log("Clicou no nome:", row.getValue("name"))
              showItemDetails(row.getValue("name"))
            }
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
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              if (filesAvailable) {
                console.log("Botão de detalhes clicado para:", row.getValue("name"))
                showItemDetails(row.getValue("name"))
              }
            }}
            disabled={!filesAvailable}
          >
            Ver Detalhes
          </Button>
        )
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
      {!filesAvailable && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Não foi possível carregar os dados completos para comparação detalhada. Por favor, tente recarregar a página
            ou selecione outros arquivos.
          </AlertDescription>
        </Alert>
      )}

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
          disabled={!filesAvailable}
        >
          Novos Itens
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applySpecificFilter("removed-items")}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          disabled={!filesAvailable}
        >
          Itens Removidos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applySpecificFilter("significant-changes")}
          className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
          disabled={!filesAvailable}
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
                      if (filesAvailable) {
                        console.log("Clicou na linha:", row.getValue("name"))
                        showItemDetails(row.getValue("name"))
                      }
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

      {/* Modal de detalhes do item - sempre renderizado, mas visível apenas quando isDetailModalOpen=true */}
      <DetailedComparisonModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          console.log("Fechando modal")
          setIsDetailModalOpen(false)
        }}
        item1={detailItem1}
        item2={detailItem2}
        file1Name={file1Name}
        file2Name={file2Name}
      />
    </div>
  )
}
