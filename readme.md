# Analisador de Comissões - IAL SOLUCOES

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)

Um sistema completo para análise, comparação e visualização de dados de comissões recebidas pela franquia Linx. Esta aplicação permite o processamento de arquivos Excel contendo dados de comissão, oferecendo dashboards interativos, comparações entre períodos e auditoria detalhada dos dados.

## 📋 Funcionalidades

### Upload e Processamento de Arquivos
- Suporte para arquivos Excel (.xls e .xlsx)
- Processamento robusto com tratamento de erros
- Validação de estrutura e dados
- Normalização automática de valores e datas

### Dashboard Analítico
- Visualização de métricas-chave (total de comissões, clientes, produtos)
- Gráficos interativos (barras e linhas)
- Filtros rápidos para análises específicas
- Tabela de dados detalhada com ordenação e filtragem

### Comparação de Períodos
- Análise comparativa entre dois arquivos de períodos diferentes
- Visualização de diferenças absolutas e percentuais
- Identificação de clientes e produtos exclusivos
- Tabela detalhada de comparação

### Auditoria de Dados
- Visualização completa dos dados brutos
- Exportação para CSV
- Validação e verificação de integridade

## 🚀 Tecnologias Utilizadas

- **Next.js**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Estilização moderna e responsiva
- **shadcn/ui**: Componentes de UI reutilizáveis
- **Recharts**: Biblioteca para visualização de dados
- **XLSX**: Processamento de arquivos Excel
- **TanStack Table**: Tabelas avançadas com ordenação e filtragem
- **date-fns**: Manipulação de datas
- **UUID**: Geração de identificadores únicos

## 🗂️ Estrutura do Projeto

```
bi_comissao_linx/
├── app/                    # Rotas e páginas da aplicação
│   ├── dashboard/          # Página de dashboard
│   ├── upload/             # Página de upload
│   ├── comparison/         # Página de comparação
│   ├── audit/              # Página de auditoria
│   ├── layout.tsx          # Layout principal
│   └── globals.css         # Estilos globais
├── components/             # Componentes React
│   ├── layout/             # Componentes de layout
│   ├── ui/                 # Componentes de UI reutilizáveis
│   └── ...                 # Outros componentes específicos
├── lib/                    # Utilitários e funções
│   └── file-processor.ts   # Processador de arquivos Excel
├── types/                  # Definições de tipos TypeScript
│   └── file-types.ts       # Tipos para arquivos e dados
└── public/                 # Arquivos estáticos
```

## ⚙️ Requisitos e Instalação

### Pré-requisitos
- Node.js 18.0.0 ou superior
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/ial-solucoes/bi_comissao_linx.git
cd bi_comissao_linx
```markdown project="Bi_Comissao_Linx" file="README.md"
...
```

2. Instale as dependências:


```shellscript
npm install
# ou
yarn install
```

3. Execute o servidor de desenvolvimento:


```shellscript
npm run dev
# ou
yarn dev
```

4. Acesse a aplicação em `http://localhost:3000`


## 📖 Como Usar

### Upload de Arquivos

1. Navegue até a página de Upload
2. Arraste e solte um arquivo Excel ou clique para selecionar
3. Clique em "Processar Arquivo"
4. Após o processamento, você será redirecionado para o Dashboard


### Visualização de Dados

1. No Dashboard, selecione o arquivo desejado no seletor superior
2. Utilize os filtros rápidos para análises específicas
3. Alterne entre visualizações de gráficos e tabela de dados


### Comparação de Períodos

1. Navegue até a página de Comparação
2. Selecione dois arquivos diferentes para comparar
3. Analise as diferenças através dos gráficos e tabelas detalhadas


### Auditoria de Dados

1. Navegue até a página de Auditoria
2. Selecione o arquivo que deseja auditar
3. Utilize a tabela para visualizar todos os dados brutos
4. Exporte para CSV se necessário


## ⚠️ Tratamento de Erros Comuns

### Erro "Missing Info for XLS Record"

Este erro ocorre quando o arquivo Excel contém recursos avançados não suportados. Para resolver:

1. Salve o arquivo em formato Excel 97-2003 (.xls)
2. Salve como CSV e depois converta para Excel novamente
3. Remova formatações complexas, macros, e fórmulas avançadas
4. Abra o arquivo no Excel e salve como uma nova cópia


### Colunas Obrigatórias

O sistema requer as seguintes colunas no arquivo Excel:

- contato
- clifor_cliente
- nome_clifor
- cnpj_cliente
- fatura
- codigo_item
- emissao
- vencimento_real
- valor_recebido_total
- percent_comissao_item_contrato
- valor_comissao_total
- taxa_imposto
- valor_imposto
- valor_a_pagar_sem_imposto
- valor_menos_imposto


## 🔍 Recursos Adicionais

### Interface de Usuário

O sistema possui uma interface moderna e intuitiva com:

- Tema claro/escuro
- Layout responsivo para desktop e dispositivos móveis
- Navegação via sidebar para acesso rápido às funcionalidades
- Cards de estatísticas com indicadores visuais de tendência
- Gráficos interativos com opções de visualização


### Processamento de Dados

- Normalização automática de formatos de data
- Conversão de valores numéricos considerando formatação brasileira
- Cálculo automático de estatísticas e métricas
- Detecção inteligente de períodos baseada nos dados


### Segurança

- Processamento local dos arquivos (sem envio para servidores externos)
- Validação de dados para prevenir injeção de código
- Tratamento seguro de erros sem exposição de detalhes sensíveis


## 🔄 Fluxo de Trabalho Recomendado

1. **Preparação dos Dados**

1. Certifique-se de que o arquivo Excel contém todas as colunas obrigatórias
2. Verifique se os formatos de data e valores estão consistentes
3. Remova quaisquer formatações complexas ou macros



2. **Upload e Processamento**

1. Faça upload do arquivo na página de Upload
2. Aguarde o processamento completo



3. **Análise Inicial**

1. Verifique as métricas principais no Dashboard
2. Explore os gráficos para identificar padrões e tendências
3. Use os filtros rápidos para focar em aspectos específicos



4. **Comparação (se necessário)**

1. Faça upload de um segundo arquivo para comparação
2. Analise as diferenças entre os períodos
3. Identifique clientes e produtos com variações significativas



5. **Auditoria e Exportação**

1. Verifique os dados brutos na página de Auditoria
2. Exporte para CSV para análises externas ou backup





## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request


## 📝 Roadmap

### Próximas Funcionalidades Planejadas

- **Autenticação de usuários**: Implementação de sistema de login para controle de acesso
- **Filtros avançados**: Adição de opções de filtragem mais complexas
- **Relatórios personalizados**: Criação de relatórios customizados pelo usuário
- **Histórico de uploads**: Registro e gerenciamento de histórico de arquivos processados
- **Análise preditiva**: Implementação de algoritmos para previsão de tendências futuras
- **Suporte a outros formatos**: Adição de suporte para CSV e outros formatos de dados
- **Validação de dados**: Ferramentas avançadas para validação e correção de dados
- **Dashboards personalizáveis**: Permitir que usuários criem seus próprios dashboards


## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 📞 Contato

IAL SOLUCOES - [matheus@ialinformatica.com.br](mailto:matheus@ialinformatica.com.br) - +55 61 98211-0317

---

Desenvolvido com ❤️ por IAL SOLUCOES © 2025
