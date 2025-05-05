import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  className?: string
}

export function StatCard({ title, value, icon, trend, trendLabel, className }: StatCardProps) {
  const formattedTrend = trend ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%` : null

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {trend !== undefined && (
              <div
                className={cn(
                  "flex items-center mt-1 text-xs",
                  trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground",
                )}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : (
                  <Minus className="h-3 w-3 mr-1" />
                )}
                <span>
                  {formattedTrend} {trendLabel}
                </span>
              </div>
            )}
          </div>
          <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
