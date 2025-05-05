"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface QuickFiltersProps {
  onFilterChange: (filter: string) => void
  onDateRangeChange?: (range: { from: Date; to: Date }) => void
}

export function QuickFilters({ onFilterChange, onDateRangeChange }: QuickFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [date, setDate] = useState<{ from: Date; to: Date }>()

  const handleFilterClick = (filter: string) => {
    const newFilter = activeFilter === filter ? null : filter
    setActiveFilter(newFilter)
    onFilterChange(newFilter || "")
  }

  const handleDateRangeSelect = (range: { from: Date; to: Date }) => {
    setDate(range)
    if (range.from && range.to && onDateRangeChange) {
      onDateRangeChange(range)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center mr-2">
        <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        className={cn(activeFilter === "top-clients" && "bg-primary text-primary-foreground")}
        onClick={() => handleFilterClick("top-clients")}
      >
        Top 10 Clientes
      </Button>

      <Button
        variant="outline"
        size="sm"
        className={cn(activeFilter === "top-products" && "bg-primary text-primary-foreground")}
        onClick={() => handleFilterClick("top-products")}
      >
        Top 10 Produtos
      </Button>

      <Button
        variant="outline"
        size="sm"
        className={cn(activeFilter === "highest-commission" && "bg-primary text-primary-foreground")}
        onClick={() => handleFilterClick("highest-commission")}
      >
        Maiores Comissões
      </Button>

      <Button
        variant="outline"
        size="sm"
        className={cn(activeFilter === "lowest-commission" && "bg-primary text-primary-foreground")}
        onClick={() => handleFilterClick("lowest-commission")}
      >
        Menores Comissões
      </Button>

      {onDateRangeChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                  </>
                ) : (
                  format(date.from, "dd/MM/yyyy", { locale: ptBR })
                )
              ) : (
                <span>Período personalizado</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  handleDateRangeSelect(range as { from: Date; to: Date })
                }
              }}
              locale={ptBR}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
