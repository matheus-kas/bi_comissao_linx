"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart, Upload, Home, Search, ArrowLeftRight, TrendingUp, Info } from "lucide-react"
import Image from "next/image"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Image src="/images/simbolo.png" alt="BridgeX Logo" width={24} height={24} className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">BI Comissão Linx</span>
            </Link>
            <nav className="flex items-center space-x-2 text-sm font-medium">
              <Link href="/">
                <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" className="gap-1">
                  <Home className="h-4 w-4" />
                  <span>Início</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant={pathname === "/dashboard" ? "default" : "ghost"} size="sm" className="gap-1">
                  <BarChart className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant={pathname === "/upload" ? "default" : "ghost"} size="sm" className="gap-1">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Button>
              </Link>
              <Link href="/audit">
                <Button variant={pathname === "/audit" ? "default" : "ghost"} size="sm" className="gap-1">
                  <Search className="h-4 w-4" />
                  <span>Auditoria</span>
                </Button>
              </Link>
              <Link href="/comparison">
                <Button variant={pathname === "/comparison" ? "default" : "ghost"} size="sm" className="gap-1">
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Comparação</span>
                </Button>
              </Link>
              <Link href="/evolution">
                <Button variant={pathname === "/evolution" ? "default" : "ghost"} size="sm" className="gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Evolução</span>
                </Button>
              </Link>
              <Link href="/sobre">
                <Button variant={pathname === "/sobre" ? "default" : "ghost"} size="sm" className="gap-1">
                  <Info className="h-4 w-4" />
                  <span>Sobre</span>
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p className="mb-2">Desenvolvido com ❤️ por GRUPO IAL SOLUÇÕES</p>
          <p>matheus@ialinformatica.com.br | © 2025</p>
        </div>
      </footer>
    </div>
  )
}
