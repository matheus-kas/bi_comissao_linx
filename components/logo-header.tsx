import Image from "next/image"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

export function LogoHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/bridgex-logo.png"
            alt="BridgeX Logo"
            width={180}
            height={50}
            className="h-12 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
