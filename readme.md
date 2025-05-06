# 📊 Analisador de Comissões Linx

<p align="center">
  <img src="https://raw.githubusercontent.com/ialinformatica/analisador-comissoes/main/public/logo.png" alt="Logo IAL Soluções" width="200"/>
</p>

<p align="center">
  <strong>Plataforma web para análise, comparação e visualização de comissões da franquia Linx</strong>
</p>

<p align="center">
  <a href="#-sobre">Sobre</a> •
  <a href="#-principais-recursos">Principais Recursos</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-arquitetura">Arquitetura</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-guia-de-uso">Guia de Uso</a> •
  <a href="#-troubleshooting">Troubleshooting</a> •
  <a href="#-suporte">Suporte</a> •
  <a href="#-licença">Licença</a>
</p>

## 🔍 Sobre

O **Analisador de Comissões Linx** é uma aplicação web intuitiva desenvolvida pela **IAL SOLUÇÕES** que transforma arquivos de comissões da Linx em insights acionáveis. A ferramenta automatiza a análise de dados, permitindo:

- **Visualização instantânea** de tendências e métricas-chave
- **Comparação inteligente** entre períodos diferentes
- **Detecção de anomalias** em pagamentos de comissões
- **Acompanhamento da evolução** da carteira de clientes
- **Exportação de relatórios** em formatos diversos

Ideal para franqueados Linx que desejam otimizar o monitoramento de receitas com comissões e identificar oportunidades de crescimento.

## ✨ Principais Recursos

### 🔄 Processamento Inteligente de Dados
- Upload simplificado de arquivos Excel (.xls, .xlsx)
- Reconhecimento automático de colunas e normalização
- Limpeza e estruturação de dados sem esforço manual
- Validação avançada com feedback detalhado

### 📈 Dashboard Analítico
- Visão consolidada com métricas de performance
- Gráficos interativos e personalizáveis
- Filtragem dinâmica por cliente, produto e período
- Alternância entre visualizações gráficas e tabulares

### 🔄 Análise Comparativa
- Comparação lado a lado entre dois períodos
- Acompanhamento evolutivo multi-período
- Cálculo automático de variações percentuais
- Destaque para mudanças significativas

### 🔍 Auditoria Detalhada
- Exploração registro a registro dos dados
- Filtragem avançada e ordenação personalizada
- Rastreamento de alterações entre períodos
- Exportação para análise externa

### 🛠️ Ferramentas Avançadas
- Sistema de backup e restauração integrado
- Temas claro/escuro para conforto visual
- Exportação de relatórios em PDF
- Interface responsiva para desktop e dispositivos móveis

## 🚀 Tecnologias

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=recharts&logoColor=white" alt="Recharts" />
  <img src="https://img.shields.io/badge/xlsx-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white" alt="xlsx" />
</p>

Nossa stack foi cuidadosamente selecionada para oferecer performance e flexibilidade:

| Tecnologia | Função |
|------------|--------|
| **Next.js** | Framework React com renderização do lado do servidor para performance otimizada |
| **React** | Biblioteca de UI para interfaces modernas e responsivas |
| **TypeScript** | Linguagem tipada para desenvolvimento mais seguro e produtivo |
| **Tailwind CSS** | Framework CSS utilitário para estilização rápida e consistente |
| **shadcn/ui** | Componentes de interface reutilizáveis e acessíveis |
| **Recharts** | Biblioteca avançada para visualização de dados |
| **xlsx** | Processamento eficiente de arquivos Excel |

## 🏗️ Arquitetura

A aplicação segue uma arquitetura modular e escalável:

```
analisador-comissoes/
├── 📁 app/                   # Core da aplicação Next.js
│   ├── 📁 api/               # Endpoints de API REST
│   ├── 📁 audit/             # Módulo de auditoria
│   ├── 📁 comparison/        # Módulo de comparação
│   ├── 📁 dashboard/         # Módulo de dashboard
│   └── 📁 upload/            # Módulo de upload
├── 📁 components/            # Componentes React reutilizáveis
│   ├── 📁 layout/            # Componentes estruturais
│   ├── 📁 ui/                # Componentes de interface
│   └── 📄 [component].tsx    # Componentes específicos
├── 📁 lib/                   # Utilitários e serviços
├── 📁 public/                # Arquivos estáticos
└── 📁 types/                 # Definições de tipos TypeScript
```

## 🔧 Instalação

### Pré-requisitos

- Node.js 16.x ou superior
- npm ou yarn
- Git

### Passo a passo

1. **Clone o repositório**

```bash
git clone https://github.com/matheus-kas/bi_comissao_linx.git
cd bi_comissao_linx
```

2. **Instale as dependências**

```bash
# Com npm
npm install

# Com yarn
yarn install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

4. **Inicie o servidor de desenvolvimento**

```bash
# Com npm
npm run dev

# Com yarn
yarn dev
```

5. **Acesse a aplicação**

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Deployment para produção

```bash
# Construir a aplicação
npm run build
# ou
yarn build

# Iniciar em modo produção
npm start
# ou
yarn start
```

## 📘 Guia de Uso

### 📤 Upload de Arquivos

1. Acesse a página **Upload** no menu principal
2. Arraste e solte o arquivo Excel ou clique para selecionar
3. Acompanhe o progresso de processamento
4. Após conclusão, você será redirecionado ao Dashboard

> **💡 Dica:** Para melhores resultados, use arquivos Excel sem macros ou formatações complexas.

### 📊 Análise no Dashboard

1. Selecione o arquivo processado no seletor superior
2. Visualize os indicadores principais na seção de cards
3. Explore os gráficos de distribuição por cliente e produto
4. Use os filtros rápidos para refinar a análise
5. Alterne entre visualizações de gráfico e tabela conforme necessário

### 🔄 Comparação de Períodos

1. Navegue até a página **Comparação**
2. Selecione dois arquivos nos seletores superiores
3. Analise as variações percentuais no resumo comparativo
4. Explore os gráficos de evolução e as tabelas detalhadas
5. Para análise temporal mais ampla, use o modo **Evolução Multi-Período**

### 🔍 Auditoria de Dados

1. Acesse a página **Auditoria**
2. Selecione o arquivo para análise detalhada
3. Utilize os filtros avançados para localizar registros específicos
4. Exporte dados filtrados para CSV se necessário

### 💾 Backup e Restauração

1. Clique no botão **Backup e Restauração** no menu superior
2. Para salvar dados:
   - Selecione a aba **Backup**
   - Clique em **Exportar Dados**
   - Salve o arquivo JSON gerado
3. Para restaurar:
   - Selecione a aba **Restauração**
   - Arraste ou selecione o arquivo de backup
   - Clique em **Importar Dados**

## ⚠️ Troubleshooting

### Erro "Missing Info for XLS Record"

**Problema:** Arquivo Excel com recursos avançados não suportados.

**Soluções:**
- Salve como Excel 97-2003 (.xls) e tente novamente
- Exporte para CSV e reconverta para Excel
- Remova formatações complexas, macros e fórmulas avançadas

### Conflitos de Versão React

**Problema:** Erros relacionados à versão do React nas dependências.

**Solução:**
1. Edite `package.json` e atualize:
```json
"dependencies": {
  "react": "18.2.0",
  "react-dom": "18.2.0"
}
```
2. Execute `npm install` ou `yarn install`

### Problemas de Persistência de Dados

**Problema:** Dados processados desaparecem após recarregar a página.

**Soluções:**
- Verifique permissões de localStorage no navegador
- Limpe cache do navegador e tente novamente
- Use Chrome ou Firefox mais recentes
- Utilize a funcionalidade de Backup regularmente

## 📞 Suporte

Encontrou algum problema? Entre em contato:

- **Email:** suporte@ialinformatica.com.br
- **WhatsApp:** (XX) XXXXX-XXXX
- **GitHub:** Abra uma [issue](https://github.com/ialinformatica/analisador-comissoes/issues)

## 📜 Licença

© 2025 IAL SOLUÇÕES. Todos os direitos reservados.

---

<p align="center">
  <a href="https://ialinformatica.com.br">
    <img src="https://raw.githubusercontent.com/ialinformatica/analisador-comissoes/main/public/logo-footer.png" alt="IAL Soluções" width="150"/>
  </a>
  <br>
  <small>Desenvolvido com ❤️ pela <a href="https://ialinformatica.com.br">IAL SOLUÇÕES</a></small>
</p>