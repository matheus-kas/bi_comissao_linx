import { ModeToggle } from "@/components/mode-toggle"
import Image from "next/image"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/images/simbolo.png" alt="BridgeX Logo" width={24} height={24} className="h-6 w-6" />
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
