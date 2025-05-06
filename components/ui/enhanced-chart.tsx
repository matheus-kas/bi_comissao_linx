"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

interface EnhancedChartProps {
  title: string
  description?: string
  data: ChartData[]
  height?: number
  valueFormatter?: (value: number) => string
  colors?: string[]
}

export function EnhancedChart({
  title,
  description,
  data,
  height = 300,
  valueFormatter = (value) => `${value}`,
  colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"],
}: EnhancedChartProps) {
  const [chartType, setChartType] = useState<"bar" | "line">("bar")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as "bar" | "line")} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bar">Barras</TabsTrigger>
            <TabsTrigger value="line">Linha</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={valueFormatter} />
                <Tooltip formatter={(value) => [valueFormatter(Number(value)), "Valor"]} />
                <Legend />
                <Bar dataKey="value" fill={colors[0]} name="Valor" />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={valueFormatter} />
                <Tooltip formatter={(value) => [valueFormatter(Number(value)), "Valor"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors[0]}
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Valor"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
