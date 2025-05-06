# Analisador de Comissões Linx

<div align="center">
  <img src="./public/logo.png" alt="Logo do Analisador de Comissões" width="200"/>
  <br/>
  <h3>Sistema para análise, comparação e visualização de dados de comissões recebidas pela franquia Linx</h3>
</div>

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Versão](https://img.shields.io/badge/versão-1.1.24-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Roadmap de Melhorias](#-roadmap-de-melhorias)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🔍 Visão Geral

O **Analisador de Comissões Linx** é uma ferramenta desenvolvida para facilitar a análise, comparação e visualização de dados de comissões recebidas pela franquia Linx. O sistema permite o upload de arquivos Excel contendo dados de comissões, processa esses dados e apresenta visualizações interativas para auxiliar na tomada de decisões.

## ✨ Funcionalidades

- **Upload de Arquivos**: Suporte para arquivos Excel (.xls e .xlsx) com dados de comissões
- **Dashboard Interativo**: Visualização de métricas-chave e gráficos
- **Comparação de Períodos**: Análise comparativa entre diferentes períodos
- **Auditoria de Dados**: Visualização detalhada dos dados brutos
- **Exportação de Dados**: Exportação para CSV e PDF
- **Backup e Restauração**: Funcionalidade para backup e restauração de dados
- **Modo de Depuração**: Ferramentas para identificação e correção de problemas nos dados

## 🚀 Tecnologias

- **Frontend**: Next.js, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Gráficos**: Recharts
- **Processamento de Dados**: XLSX
- **Armazenamento**: LocalStorage (versão atual), API REST (planejado)

## 💻 Instalação

# Clone o repositório
git clone https://github.com/seu-usuario/bi-comissao-linx.git

# Entre no diretório
cd bi-comissao-linx

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

## 📖 Como Usar

1. **Upload de Arquivo**:

1. Acesse a página de upload
2. Arraste e solte um arquivo Excel ou clique para selecionar
3. O sistema processará automaticamente o arquivo



2. **Dashboard**:

1. Visualize métricas-chave como total de comissões, clientes e produtos
2. Explore gráficos de comissões por cliente e produto



3. **Comparação**:

1. Selecione dois arquivos para comparação
2. Analise diferenças em comissões, clientes e produtos
3. Visualize tendências com a comparação multi-período



4. **Auditoria**:

1. Acesse os dados brutos para verificação
2. Exporte dados para CSV para análise externa



5. **Depuração**:

1. Utilize a página de depuração para identificar problemas nos dados
2. Verifique valores inválidos e inconsistências





## 📈 Roadmap de Melhorias

### Em Desenvolvimento

#### Interface e Experiência do Usuário

- **Criar tema personalizado** - Implementação de tema específico para a marca
- **Melhorar a comparação multi-período** - Aprimorar visualizações e interatividade
- **Adicionar dashboard consolidado** - Visão unificada de todos os dados
- **Melhorar o modo de depuração** - Interface mais intuitiva para identificação de problemas


#### Funcionalidades

- **Implementar exportação de dados** - Suporte para mais formatos de exportação
- **Adicionar validação de dados** - Verificação mais robusta durante o upload
- **Implementar análise automática** - Detecção automática de padrões e anomalias
- **Adicionar detecção de anomalias** - Identificação de valores atípicos


#### Relatório "Dedo Duro"

- **Detalhar implementação do Dedo Duro** - Relatório para identificação de inconsistências
- **Definir algoritmo de comparação** - Metodologia para detecção de discrepâncias
- **Criar métricas de impacto** - Quantificação do impacto financeiro das anomalias
- **Iniciar implementação do Dedo Duro** - Desenvolvimento da funcionalidade


#### Infraestrutura e Qualidade

- **Configurar SonarCloud** - Análise contínua de qualidade de código
- **Adicionar testes unitários** - Cobertura de testes para funções críticas
- **Configurar mocks para processamento de arquivos** - Simulação de dados para testes
- **Implementar testes para o relatório Dedo Duro** - Validação da funcionalidade


#### Performance e Monitoramento

- **Otimizar performance** - Melhorias no processamento de arquivos grandes
- **Implementar monitoramento** - Rastreamento de erros e performance
- **Melhorar processamento de importação** - Otimização do parser de arquivos Excel


### Correções Recentes

- **Corrigir erros de TypeScript** - Resolução de problemas de tipagem
- **Melhorar validação de dados** - Tratamento de valores NaN e inválidos
- **Adicionar DebugDataViewer à interface** - Ferramenta para visualização de dados problemáticos
- **Melhorar processamento de planilhas** - Suporte para diferentes formatos de planilhas

<Actions>
  <Action name="Implementar relatório Dedo Duro" description="Desenvolver a funcionalidade de detecção de inconsistências" />
  <Action name="Melhorar visualizações de gráficos" description="Adicionar mais opções de visualização e interatividade" />
  <Action name="Implementar autenticação" description="Adicionar sistema de login e controle de acesso" />
  <Action name="Migrar para banco de dados" description="Substituir localStorage por uma solução de banco de dados" />
  <Action name="Adicionar suporte a mais formatos" description="Permitir importação de CSV e outros formatos" />
</Actions>

## 👥 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request


## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido por [IAL SOLUCOES](mailto:matheus@ialinformatica.com.br) - 2025