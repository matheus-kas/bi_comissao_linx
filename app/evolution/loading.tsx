import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
