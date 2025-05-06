import type React from "react"
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
import { CardContent } from "@mui/material"

interface EnhancedChartProps {
  data: { name: string; value: number }[]
  chartType: "bar" | "line"
  height: number
  colors: string[]
  valueFormatter: (value: number) => string
}

const EnhancedChart: React.FC<EnhancedChartProps> = ({ data, chartType, height, colors, valueFormatter }) => {
  return (
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
  )
}

export default EnhancedChart
