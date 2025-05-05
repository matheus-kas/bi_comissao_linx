import { ModeToggle } from "@/components/mode-toggle"
import { FileText } from "lucide-react"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">Analisador de Comissões</h1>
            <p className="text-sm text-muted-foreground">IAL SOLUCOES - 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-right">
            <p>matheus@ialinformatica.com.br</p>
            <p>+55 61 98211-0317</p>
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
