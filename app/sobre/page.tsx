import Image from "next/image"
import Link from "next/link"
import { BarChart3, TrendingUp, Search, FileSpreadsheet, PieChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function SobrePage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Analisador de Comissões
          </h1>
          <p className="text-muted-foreground text-lg">
            Uma ferramenta completa para análise e gestão de dados de comissão
          </p>
          <div className="flex justify-center mt-4">
            <Badge
              variant="outline"
              className="text-sm py-1 px-3 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
            >
              Versão 1.0
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="funcionalidades" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="funcionalidades">Funcionalidades</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
            <TabsTrigger value="tecnologias">Tecnologias</TabsTrigger>
            <TabsTrigger value="suporte">Suporte</TabsTrigger>
          </TabsList>

          <TabsContent value="funcionalidades" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                      <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">Dashboard Interativo</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualize e analise seus dados de comissão com gráficos e tabelas interativas que facilitam a
                    identificação de padrões e tendências.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                      <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-lg">Comparação Multi-Período</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Compare dados de comissão entre diferentes períodos para identificar tendências, variações sazonais
                    e oportunidades de crescimento.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-t-4 border-t-rose-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900">
                      <Search className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <CardTitle className="text-lg">Detecção de Anomalias</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Identifique automaticamente valores discrepantes e anomalias nos seus dados, permitindo ações
                    corretivas rápidas e eficientes.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900">
                      <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg">Análise de Evolução</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Acompanhe a evolução das comissões ao longo do tempo com visualizações detalhadas que revelam
                    tendências de longo prazo.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                      <FileSpreadsheet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-lg">Importação Simplificada</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Importe facilmente seus dados de planilhas Excel com um processo simplificado que detecta
                    automaticamente os campos necessários.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                      <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg">Relatórios Personalizados</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Crie e exporte relatórios personalizados com os dados mais relevantes para sua análise, facilitando
                    a tomada de decisões.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metricas" className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold mb-4">Métricas e Indicadores</h2>
              <p className="text-muted-foreground mb-6">
                O Analisador de Comissões utiliza diversas métricas para fornecer insights valiosos sobre seus dados.
                Conheça as principais:
              </p>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      Valor Total de Comissão
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Soma de todas as comissões no período selecionado, permitindo uma visão geral do volume
                      financeiro.
                    </p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                        valor_comissao_total
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                      Quantidade de Clientes
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Número total de clientes únicos que geraram comissões no período, indicando a diversificação da
                      carteira.
                    </p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">clientCount</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                      Quantidade de Produtos
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Número total de produtos únicos que geraram comissões, mostrando a amplitude do portfólio
                      comercializado.
                    </p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">productCount</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-400 mb-2">Comissão Média</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Valor médio de comissão por registro, útil para identificar a qualidade média das vendas
                      realizadas.
                    </p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                        avgCommission
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Métricas de Comparação</h3>

                  <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h4 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-2">
                      Variação Percentual
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Indica a mudança percentual entre períodos, permitindo identificar crescimento ou queda nas
                      comissões.
                    </p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                        totalPercentChange
                      </span>
                    </div>
                    <div className="mt-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Fórmula:{" "}
                        <span className="font-mono">((valor_atual - valor_anterior) / valor_anterior) * 100</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h4 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                      Diferença Absoluta
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Mostra a diferença absoluta em valor monetário entre períodos comparados.
                    </p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                        totalDifference
                      </span>
                    </div>
                    <div className="mt-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Fórmula: <span className="font-mono">valor_atual - valor_anterior</span>
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Métricas de Detecção de Anomalias</h3>

                  <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h4 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 mb-2">Desvio Padrão</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Utilizado para identificar valores que estão significativamente fora da média, indicando possíveis
                      anomalias.
                    </p>
                    <div className="mt-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Método: Valores que estão a mais de 2 desvios padrão da média são marcados como potenciais
                        anomalias.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h4 className="text-lg font-semibold text-teal-600 dark:text-teal-400 mb-2">Variação Histórica</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Compara valores atuais com o histórico para identificar mudanças bruscas que podem indicar erros
                      ou oportunidades.
                    </p>
                    <div className="mt-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Método: Valores que apresentam variação superior a 50% em relação à média histórica são
                        destacados para análise.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tecnologias" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stack Tecnológica</CardTitle>
                <CardDescription>Tecnologias utilizadas no desenvolvimento do Analisador de Comissões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="relative h-12 w-12">
                      <Image src="/nextjs-logo.png" alt="Next.js" width={48} height={48} />
                    </div>
                    <span className="font-medium">Next.js</span>
                    <span className="text-xs text-muted-foreground">Framework React</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="relative h-12 w-12">
                      <Image src="/react-logo.png" alt="React" width={48} height={48} />
                    </div>
                    <span className="font-medium">React</span>
                    <span className="text-xs text-muted-foreground">Biblioteca UI</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="relative h-12 w-12">
                      <Image src="/typescript-logo.png" alt="TypeScript" width={48} height={48} />
                    </div>
                    <span className="font-medium">TypeScript</span>
                    <span className="text-xs text-muted-foreground">Linguagem</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="relative h-12 w-12">
                      <Image src="/tailwind-css-logo.png" alt="Tailwind CSS" width={48} height={48} />
                    </div>
                    <span className="font-medium">Tailwind CSS</span>
                    <span className="text-xs text-muted-foreground">Framework CSS</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="relative h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full">
                      <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-800 dark:text-white">
                        <path
                          fill="currentColor"
                          d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C1.698 17.93 1.328 14.954 1.272 14.511a.733.733 0 0 1 .167-.565.755.755 0 0 1 .544-.239h.001l9.861.54a.736.736 0 0 1 .706.806.757.757 0 0 1-.736.685l-9.101-.5c.117.764.555 2.834 1.907 4.852 1.551 2.313 3.891 3.441 6.96 3.36 3.061-.08 5.236-1.27 6.473-3.545 1.338-2.457 1.285-5.6 1.283-5.65a.736.736 0 0 1 .736-.738.745.745 0 0 1 .736.736c.007.145.07 3.602-1.472 6.467-1.539 2.86-4.206 4.364-7.935 4.48zm-.695-9.949a.736.736 0 0 1-.736-.736V.735a.736.736 0 1 1 1.472 0v12.58a.736.736 0 0 1-.736.736z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">shadcn/ui</span>
                    <span className="text-xs text-muted-foreground">Componentes UI</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="relative h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full">
                      <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-800 dark:text-white">
                        <path
                          fill="currentColor"
                          d="M16.214 6.762l-.075.391c-.116.741-.074.953.244 1.228l.307.254-.318 1.418c-.19.846-.423 1.555-.571 1.788-.127.201-.275.497-.307.656-.053.19-.233.381-.508.55-.243.138-.72.508-1.058.805-.27.243-.456.392-.557.456l-.33.261c-.106.17-.166.307-.189.411-.023.107-.01.178.024.23.033.05.09.085.168.107a.954.954 0 0 0 .282.023 3 3 0 0 0 .632-.112c.07-.019.125-.037.173-.053.074-.091.245-.263.548-.562.804-.793 1.111-1.227.794-1.11-.117.042-.064-.064.137-.276.424-.413.667-1.037 1.175-2.994.402-1.545.402-1.567.698-1.567.139 0 .532.024.532.024V6.762h-.902zm3.839 3.165c-.064 0-.17.096-.233.202-.116.19.021.306 1.767 1.396 1.037.657 1.873 1.217 1.852 1.26-.021.031-.868.582-1.883 1.217-1.842 1.142-1.852 1.153-1.683 1.386.212.275 0 .328 2.335-1.07 2.351-1.407 2.351-1.396 2.351-1.396l-.97-.776c-.53-.424-1.386-1.07-1.914-1.471-.66-.508-1.558-.657-1.622-.747zm-8.183.137c-.064 0-.148.096-.212.212-.106.201.032.307 1.767 1.396 1.037.657 1.883 1.217 1.862 1.26-.021.032-.878.582-1.893 1.217-1.842 1.142-1.852 1.153-1.683 1.386.212.275 0 .328 2.335-1.07 2.351-1.407 2.351-1.396 2.351-1.396l-.97-.776c-.53-.424-1.386-1.07-1.914-1.471-.66-.508-1.557-.657-1.643-.758zm10.086 2.223c-.064 0-.137.096-.201.212-.117.201.021.307 1.767 1.396 1.037.657 1.873 1.217 1.852 1.26-.021.031-.868.582-1.883 1.217-1.842 1.142-1.852 1.153-1.683 1.386.212.275 0 .328 2.335-1.07 2.351-1.407 2.351-1.396 2.351-1.396l-.97-.776c-.53-.424-1.386-1.07-1.914-1.471-.66-.508-1.557-.657-1.654-.758zm-7.127 3.165c-.063 0-.137.096-.201.212-.116.201.021.307 1.767 1.396 1.037.657 1.873 1.217 1.852 1.26-.021.031-.868.582-1.883 1.217-1.842 1.142-1.852 1.153-1.683 1.386.212.275 0 .328 2.335-1.07 2.351-1.407 2.351-1.396 2.351-1.396l-.97-.776c-.53-.424-1.386-1.07-1.914-1.471-.66-.508-1.557-.657-1.654-.758zm-4.953.328c-.075 0-.148.096-.222.212-.117.201.021.307 1.767 1.396 1.037.657 1.873 1.217 1.852 1.26-.021.031-.868.582-1.883 1.217-1.842 1.142-1.852 1.153-1.683 1.386.212.275 0 .328 2.335-1.07 2.351-1.407 2.351-1.396 2.351-1.396l-.97-.776c-.53-.424-1.386-1.07-1.914-1.471-.66-.508-1.557-.657-1.633-.758zm8.171 3.418c-.064 0-.137.096-.201.212-.116.201.021.307 1.767 1.396 1.037.657 1.873 1.217 1.852 1.26-.021.031-.868.582-1.883 1.217-1.842 1.142-1.852 1.153-1.683 1.386.212.275 0 .328 2.335-1.07 2.351-1.407 2.351-1.396 2.351-1.396l-.97-.776c-.53-.424-1.386-1.07-1.914-1.471-.66-.508-1.557-.657-1.654-.758z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Recharts</span>
                    <span className="text-xs text-muted-foreground">Biblioteca de Gráficos</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="relative h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full">
                      <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-800 dark:text-white">
                        <path
                          fill="currentColor"
                          d="M12 1.5c-2.363 0-4.5.86-6.14 2.308L3.5 1.5v5h5L6.48 4.482A8.124 8.124 0 0 1 12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9H1.5a10.5 10.5 0 0 0 10.5 10.5 10.5 10.5 0 0 0 10.5-10.5A10.5 10.5 0 0 0 12 1.5M11.25 7.5v6H15v-1.5h-2.25V7.5Z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">React Query</span>
                    <span className="text-xs text-muted-foreground">Gerenciamento de Estado</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="relative h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full">
                      <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-800 dark:text-white">
                        <path
                          fill="currentColor"
                          d="M12 3a9 9 0 0 0-9 9H0l4 4 4-4H5a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7 7 7 0 0 1-7-7H3a9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9m-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8Z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Zustand</span>
                    <span className="text-xs text-muted-foreground">Gerenciamento de Estado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suporte" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Suporte e Contato</CardTitle>
                <CardDescription>Precisa de ajuda ou tem sugestões? Entre em contato conosco</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 max-w-md">
                    <p className="text-muted-foreground">
                      Nossa equipe está disponível para ajudar com qualquer dúvida, sugestão ou problema que você possa
                      ter com o Analisador de Comissões.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                      <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Horário de Atendimento</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Segunda a Sexta: 8h às 18h</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Sábado: 9h às 13h</p>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Link
                        href="https://wa.me/5561998885106"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                          <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                          <path d="M9.5 13.5c.5 1 1.5 1 2 1s1.5 0 2-1" />
                        </svg>
                        Contato via WhatsApp
                      </Link>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <div className="mb-4">
                      <Image src="/images/simbolo.png" alt="BridgeX Logo" width={80} height={80} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">GRUPO IAL SOLUÇÕES</h3>
                    <p className="text-muted-foreground mb-4">Soluções tecnológicas para o seu negócio</p>
                    <div className="text-sm text-muted-foreground">
                      <p>matheus@ialinformatica.com.br</p>
                      <p>+55 61 98211-0317</p>
                      <p className="mt-4">© 2025 - Todos os direitos reservados</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-6 rounded-lg border border-blue-100 dark:border-blue-900 text-center">
              <p className="text-lg mb-2">Desenvolvido com ❤️ por GRUPO IAL SOLUÇÕES</p>
              <p className="text-sm text-muted-foreground">matheus@ialinformatica.com.br | © 2025</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
