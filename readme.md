# Analisador de Comissões Linx

Sistema para análise, visualização e comparação de dados de repasse de comissões da franqueadora Linx para franquias.

![Versão](https://img.shields.io/badge/Versão-1.0.0-blue)
![Flask](https://img.shields.io/badge/Flask-2.3.3-green)
![Python](https://img.shields.io/badge/Python-3.12-yellow)

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Colunas Analisadas](#colunas-analisadas)
- [Resolução de Problemas](#resolução-de-problemas)
- [Personalizações](#personalizações)
- [Licença](#licença)

## Visão Geral

O Analisador de Comissões Linx é uma aplicação web desenvolvida em Python com Flask para auxiliar franquias na análise de dados de comissões recebidas da franqueadora Linx. A aplicação permite o upload de arquivos Excel contendo dados de comissão, realiza análises detalhadas e possibilita a visualização através de gráficos e tabelas interativas. Um recurso chave é a capacidade de comparar arquivos de diferentes períodos para identificar divergências.

## Funcionalidades

- **Upload e Processamento de Arquivos**: 
  - Suporte para arquivos Excel (.xls e .xlsx)
  - Interface drag-and-drop
  - Processamento automático de dados

- **Visualização de Dados**:
  - Gráficos interativos com Plotly
  - Cards de estatísticas gerais
  - Tabelas de dados detalhados com filtros
  - Exibição de CNPJ e dados do cliente

- **Auditoria de Dados**:
  - Visualização dos dados brutos do arquivo
  - Filtros e seleção de colunas
  - Exportação de dados filtrados para CSV

- **Comparação de Arquivos**:
  - Comparação de valores totais de comissão
  - Identificação de clientes exclusivos em cada arquivo
  - Detecção de divergências de valores
  - Análise de itens exclusivos
  - Insights automatizados sobre as diferenças

- **Exportação**:
  - Exportação de tabelas e análises para CSV
  - Download de arquivos processados

- **Gerenciamento de Arquivos**:
  - Exclusão de arquivos processados
  - Auditoria de dados brutos
  - Visualização de metadados do arquivo

## Requisitos

- Python 3.12+
- Flask 2.3.3+
- Pandas 2.1.4+
- NumPy 1.26.3+
- Plotly 5.18.0+
- OpenPyXL 3.1.2+
- PyExcel 0.7.0+
- PyExcel-XLS 0.7.0+
- PyExcel-XLSX 0.6.1+
- XLRD 1.2.0 (específico para compatibilidade com arquivos .xls antigos)

## Instalação

### Passo 1: Configuração do Ambiente

```bash
# Criar e ativar um ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install numpy==1.26.3
pip install pandas==2.1.4
pip install matplotlib==3.8.2
pip install seaborn==0.13.0
pip install openpyxl==3.1.2
pip install flask==2.3.3
pip install plotly==5.18.0
pip install pyexcel==0.7.0
pip install pyexcel-xls==0.7.0
pip install pyexcel-xlsx==0.6.1
pip install xlrd==1.2.0
```

### Passo 2: Estrutura de Diretórios

Organize os arquivos da seguinte forma:

```
analisador-comissoes-linx/
├── app.py                      # Arquivo principal
├── templates/                  # Templates HTML
│   ├── base.html               # Template base
│   ├── index.html              # Página inicial
│   ├── visualizar.html         # Visualização dos dados
│   ├── auditar.html            # Auditoria de dados brutos
│   ├── comparar.html           # Seleção para comparação
│   └── resultado_comparacao.html # Resultado da comparação
├── uploads/                    # Diretório para uploads (criado automaticamente)
└── processados/                # Diretório para arquivos processados (criado automaticamente)
```

### Passo 3: Verificação

Certifique-se de que todos os arquivos estão nos locais corretos e execute:

```bash
python app.py
```

Acesse a aplicação em: http://localhost:8080

## Uso

### 1. Upload de Arquivos

1. Na página inicial, arraste e solte um arquivo Excel contendo dados de comissão da Linx, ou clique no botão "Selecionar Arquivo"
2. Clique em "Enviar Arquivo"
3. O sistema processará o arquivo e redirecionará para a página de visualização

### 2. Visualização de Dados

Após o processamento do arquivo, você terá acesso a:

- **Estatísticas Gerais**: Total de comissões, impostos, valores a pagar
- **Gráficos**: Top clientes por comissão, distribuição de percentuais, top itens
- **Tabela Detalhada**: Valores por cliente, incluindo CNPJ

### 3. Auditoria de Dados

Para examinar os dados brutos do arquivo:

1. Na página inicial, clique no botão "Auditar" ao lado do arquivo desejado
2. Use os filtros e seleção de colunas para facilitar a análise
3. Exporte os dados filtrados para CSV se necessário

### 4. Comparação de Arquivos

Para comparar dois arquivos de períodos diferentes:

1. Clique em "Comparar Arquivos" no menu principal
2. Selecione dois arquivos para comparar
3. Examine as diferenças apresentadas nos seguintes formatos:
   - Resumo e insights automatizados
   - Gráficos comparativos
   - Tabela de divergências por cliente
   - Listas de clientes e itens exclusivos

### 5. Exportação de Dados

Em várias seções da aplicação, você pode exportar dados:

- Na visualização: tabela de clientes para CSV
- Na auditoria: dados brutos filtrados para CSV
- Na comparação: tabela de divergências para CSV

## Estrutura do Projeto

- **app.py**: Arquivo principal contendo toda a lógica da aplicação
  - Rotas Flask para cada página da aplicação
  - Funções de processamento de dados
  - Funções para geração de visualizações

- **Templates**:
  - **base.html**: Template base com o layout comum a todas as páginas
  - **index.html**: Página inicial para upload e listagem de arquivos
  - **visualizar.html**: Visualização de análises e gráficos
  - **auditar.html**: Visualização dos dados brutos do arquivo
  - **comparar.html**: Seleção de arquivos para comparação
  - **resultado_comparacao.html**: Resultado da comparação entre arquivos

## Colunas Analisadas

A aplicação analisa as seguintes colunas do arquivo Excel:

### Dados do Cliente
- **contato**: Nome da franquia
- **clifor_cliente**: ID do cliente
- **nome_clifor**: Nome do cliente
- **cnpj_cliente**: CNPJ do cliente

### Dados da Fatura
- **fatura**: Número da fatura
- **codigo_item**: Código do produto/serviço
- **emissao**: Data de emissão
- **vencimento_real**: Data de vencimento

### Dados Financeiros
- **valor_recebido_total**: Valor recebido total
- **percent_comissao_item_contrato**: Percentual de comissão
- **valor_comissao_total**: Valor da comissão total
- **taxa_imposto**: Taxa de imposto aplicada
- **valor_imposto**: Valor do imposto
- **valor_a_pagar_sem_imposto**: Valor a pagar sem imposto
- **valor_menos_imposto**: Valor líquido (menos imposto)

## Resolução de Problemas

### Problemas com Arquivos XLS

Se encontrar problemas ao processar arquivos XLS antigos:

1. Verifique se o xlrd 1.2.0 está instalado corretamente
2. Use o recurso de auditoria para verificar se os dados foram lidos corretamente
3. Se persistir, tente converter o arquivo para XLSX usando o Excel ou LibreOffice

### Erro "Address already in use" (Porta 5000)

No macOS, a porta 5000 é frequentemente usada pelo AirPlay:

1. A aplicação está configurada para usar a porta 8080 por padrão
2. Se necessário, altere a porta em app.py:
   ```python
   app.run(debug=True, host='0.0.0.0', port=NOVA_PORTA)
   ```

### Problemas com Formatação de Valores ou Datas

Se os valores ou datas não forem exibidos corretamente:

1. Verifique o formato dos dados no arquivo original
2. Use a função de auditoria para examinar os dados brutos
3. Se necessário, modifique as funções de processamento em app.py

## Personalizações

### Adicionando Novas Análises

Para adicionar novas análises ou gráficos:

1. Modifique a função `calcular_estatisticas()` em app.py
2. Adicione novos gráficos na função de visualização
3. Atualize o template HTML correspondente

### Alterando o Design

Para personalizar a aparência da aplicação:

1. Modifique o arquivo base.html para alterações globais
2. Ajuste o CSS nas seções `{% block extra_css %}` de cada template

### Adicionando Novos Tipos de Comparação

Para adicionar novas métricas de comparação:

1. Atualize a função `comparar_arquivos()` para incluir novas métricas
2. Modifique o template resultado_comparacao.html para exibir as novas métricas

## Licença

Desenvolvido por IAL Soluções em TI. Todos os direitos reservados.