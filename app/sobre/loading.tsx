import { Skeleton } from "@/components/ui/skeleton"
import { MainLayout } from "@/components/layout/main-layout"

export default function Loading() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        <Skeleton className="h-10 w-full mb-8" />

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
          </div>

          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </MainLayout>
  )
}
