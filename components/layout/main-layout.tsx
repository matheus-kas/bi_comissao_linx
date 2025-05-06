"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Upload, BarChart2, GitCompare, FileSearch, Menu, FileText, Moon, Sun, CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const { setTheme, theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  // Verificar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Evitar problemas de hidratação
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const navigation = [
    {
      name: "Upload",
      href: "/upload",
      icon: Upload,
      current: pathname === "/upload",
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart2,
      current: pathname === "/dashboard",
    },
    {
      name: "Comparação",
      href: "/comparison",
      icon: GitCompare,
      current: pathname === "/comparison",
    },
    {
      name: "Auditoria",
      href: "/audit",
      icon: FileSearch,
      current: pathname === "/audit",
    },
  ]

  const uploadProgress = [
    { name: "Upload", href: "/upload", status: "complete" },
    { name: "Dashboard", href: "/dashboard", status: pathname === "/dashboard" ? "current" : "pending" },
    { name: "Comparação", href: "/comparison", status: pathname === "/comparison" ? "current" : "pending" },
    { name: "Auditoria", href: "/audit", status: pathname === "/audit" ? "current" : "pending" },
  ]

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-3 py-2 mb-8">
        <FileText className="h-6 w-6" />
        <div>
          <h1 className="text-xl font-bold">Analisador de Comissões</h1>
          <p className="text-sm text-muted-foreground">IAL SOLUCOES - 2025</p>
        </div>
      </div>
      {pathname === "/upload" && (
        <div className="px-3 mb-4">
          <div className="flex items-center">
            {uploadProgress.map((step, index) => (
              <div key={step.name} className="flex items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    step.status === "complete"
                      ? "bg-primary text-primary-foreground"
                      : step.status === "current"
                        ? "border-2 border-primary text-primary"
                        : "border border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {step.status === "complete" ? <CheckIcon className="h-3 w-3" /> : index + 1}
                </div>
                {index < uploadProgress.length - 1 && (
                  <div
                    className={`h-0.5 w-10 ${
                      uploadProgress[index + 1].status === "complete" || step.status === "complete"
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              item.current ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <p>matheus@ialinformatica.com.br</p>
            <p>+55 61 98211-0317</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Alternar tema</span>
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <div className="flex flex-col flex-grow border-r bg-background pt-5 pb-4 overflow-y-auto">
          <ScrollArea className="flex-1 px-3 py-2">
            <NavContent />
          </ScrollArea>
        </div>
      </aside>

      {/* Sidebar móvel */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-40">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <ScrollArea className="h-full pt-5 pb-4">
            <NavContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Conteúdo principal */}
      <main className="flex-1 md:pl-64">
        <div className="py-6">
          <div className="mx-auto px-4 sm:px-6 md:px-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
