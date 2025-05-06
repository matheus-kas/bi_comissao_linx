# Analisador de Comissões Linx

<div align="center">
  <img src="./public/logo.png" alt="Logo do Analisador de Comissões" width="200"/>
  <h3>Plataforma inteligente para análise e visualização de comissões da franquia Linx</h3>
  
  [![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)](https://github.com/seu-usuario/bi-comissao-linx)
  [![Versão](https://img.shields.io/badge/versão-1.1.24-blue)](https://github.com/seu-usuario/bi-comissao-linx/releases)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-38B2AC)](https://tailwindcss.com/)
</div>

## 📊 Visão Geral

O **Analisador de Comissões Linx** é uma ferramenta moderna e eficiente desenvolvida para transformar dados brutos de comissões em insights acionáveis. Projetada especificamente para franquias Linx, a plataforma facilita o processamento, análise, comparação e visualização de relatórios de comissões através de uma interface intuitiva e poderosa.

### Por que usar o Analisador de Comissões?

- **Aumente a visibilidade** sobre as fontes de receita
- **Identifique inconsistências** nos relatórios de comissões
- **Compare períodos** para análise de tendências e crescimento
- **Economize tempo** na análise manual de planilhas Excel
- **Tome decisões mais inteligentes** baseadas em dados reais

## ✨ Funcionalidades principais

| Funcionalidade | Descrição |
|----------------|-----------|
| 📤 **Upload Inteligente** | Processamento automático de arquivos Excel (.xls/.xlsx) |
| 📊 **Dashboard Interativo** | Visualizações dinâmicas e métricas-chave em tempo real |
| 📈 **Comparação Temporal** | Análise lado a lado de diferentes períodos |
| 🔍 **Auditoria Detalhada** | Verificação aprofundada dos dados brutos |
| 📋 **Exportação Flexível** | Exportação para múltiplos formatos (CSV, PDF) |
| 💾 **Backup e Restauração** | Proteção e recuperação de dados importantes |
| 🐛 **Ferramentas de Depuração** | Identificação e correção de problemas nos dados |
| 🔐 **Relatório "Dedo Duro"** | Detecção automática de anomalias e inconsistências (em desenvolvimento) |

## 🚀 Stack Tecnológica

```
Frontend: Next.js 14 + React + TypeScript
Estilização: Tailwind CSS + shadcn/ui
Visualização: Recharts
Processamento: XLSX + PapaParse
Análise de dados: Math.js + Lodash
```

## 💻 Instalação

```bash
# Clone o repositório
git clone https://github.com/matheus-kas/bi_comissao_linx.git

# Entre no diretório
cd bi-comissao-linx

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

🌐 Acesse [http://localhost:3000](http://localhost:3000) no seu navegador

## 📖 Guia de Uso

### 1️⃣ Upload e Processamento

1. Acesse a página inicial e clique em "Upload"
2. Arraste e solte seu arquivo Excel ou use o seletor de arquivos
3. Aguarde o processamento automatizado
4. Verifique a validação inicial de dados

### 2️⃣ Exploração do Dashboard

1. Navegue entre as diferentes visões do dashboard usando o menu lateral
2. Visualize métricas-chave de desempenho no topo da página
3. Interaja com os gráficos para obter informações detalhadas
4. Use os filtros para refinar a visualização por período, cliente ou produto

### 3️⃣ Análise Comparativa

1. Vá para a seção "Comparação" no menu
2. Selecione dois ou mais períodos para análise
3. Examine as diferenças percentuais entre períodos
4. Identifique tendências de crescimento ou queda

### 4️⃣ Auditoria e Depuração

1. Acesse "Auditoria" para visualizar os dados brutos
2. Use a ferramenta de busca para localizar registros específicos
3. No modo "Depuração", identifique valores inconsistentes
4. Exporte dados filtrados para análise externa

## 📈 Roadmap

### Em Desenvolvimento

#### Interface e UX (Q2 2025)
- [ ] Tema personalizado para a marca
- [ ] Dashboard consolidado com visão 360°
- [ ] Comparação multi-período aprimorada
- [ ] Interface de depuração intuitiva

#### Funcionalidades Core (Q3 2025)
- [ ] Exportação para múltiplos formatos
- [ ] Validação robusta de dados
- [ ] Análise preditiva automatizada
- [ ] Sistema de detecção de anomalias

#### Relatório "Dedo Duro" (Q4 2025)
- [ ] Algoritmos de comparação inteligente
- [ ] Métricas de impacto financeiro
- [ ] Alertas automáticos de inconsistências
- [ ] Visualização de discrepâncias históricas

#### Infraestrutura e Qualidade
- [ ] Análise contínua com SonarCloud
- [ ] Cobertura de testes unitários >80%
- [ ] CI/CD via GitHub Actions
- [ ] Otimização para arquivos de grande porte

## 👥 Como Contribuir

Valorizamos sua contribuição para tornar o Analisador de Comissões ainda melhor!

1. 🔀 Faça um fork do projeto
2. 🌿 Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. 💻 Desenvolva sua funcionalidade seguindo as boas práticas
4. ✅ Adicione testes quando possível
5. 📝 Faça commit das alterações (`git commit -m 'feat: adiciona nova funcionalidade'`)
6. 🚀 Faça push para sua branch (`git push origin feature/nova-funcionalidade`)
7. 🔄 Abra um Pull Request detalhando suas alterações

Consulte nossa [documentação de contribuição](CONTRIBUTING.md) para mais detalhes.

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

---

<div align="center">
  <p>
    Desenvolvido com ❤️ por <a href="https://ialinformatica.com.br">GRUPO IAL SOLUÇÕES</a>
  </p>
  <p>
    <a href="mailto:matheus@ialinformatica.com.br">matheus@ialinformatica.com.br</a> | © 2025
  </p>
</div>