# Funcionalidades do Analisador de Comissões

Este documento detalha as principais funcionalidades do sistema Analisador de Comissões desenvolvido para a IAL SOLUCOES, explicando como cada recurso funciona e seus benefícios para o gerenciamento e análise de dados de comissão.

## Índice

1. [Visão Geral](#visão-geral)
2. [Upload e Processamento de Arquivos](#upload-e-processamento-de-arquivos)
3. [Dashboard Analítico](#dashboard-analítico)
4. [Comparação de Períodos](#comparação-de-períodos)
5. [Auditoria de Dados](#auditoria-de-dados)
6. [Interface e Navegação](#interface-e-navegação)
7. [Tratamento de Erros](#tratamento-de-erros)

## Visão Geral

O Analisador de Comissões é um sistema web desenvolvido para processar, analisar e visualizar dados de comissões recebidas pela franquia Linx. O sistema permite que usuários façam upload de arquivos Excel contendo dados de comissão, processem esses dados, visualizem métricas e gráficos relevantes, comparem diferentes períodos e realizem auditorias detalhadas.

O fluxo de trabalho típico inclui:
1. Upload de arquivo Excel com dados de comissão
2. Visualização de métricas e gráficos no dashboard
3. Comparação com outros períodos (opcional)
4. Auditoria detalhada dos dados

## Upload e Processamento de Arquivos

### Funcionalidade de Upload

O sistema oferece uma interface intuitiva para upload de arquivos Excel:

- **Drag and Drop**: Arraste e solte arquivos diretamente na área designada
- **Seleção de Arquivo**: Clique para abrir o explorador de arquivos e selecionar manualmente
- **Validação de Formato**: Aceita apenas arquivos nos formatos .xls e .xlsx
- **Feedback Visual**: Exibe o progresso do upload e processamento

### Processamento de Dados

Após o upload, o sistema processa automaticamente o arquivo:

- **Validação Estrutural**: Verifica se o arquivo contém todas as colunas obrigatórias
- **Normalização de Dados**: Converte formatos de data e valores numéricos para um padrão consistente
- **Cálculo de Métricas**: Gera estatísticas como total de comissões, número de clientes e produtos
- **Detecção de Período**: Identifica automaticamente o período dos dados com base nas datas de emissão

### Tratamento de Erros no Processamento

O sistema implementa mecanismos robustos para lidar com problemas comuns em arquivos Excel:

- **Detecção de Formatos Incompatíveis**: Identifica e trata registros Excel não suportados
- **Fallback Automático**: Tenta métodos alternativos de leitura quando o método padrão falha
- **Mensagens Detalhadas**: Fornece instruções claras sobre como resolver problemas específicos
- **Recuperação Graciosa**: Permite que o usuário tente novamente após corrigir o arquivo

## Dashboard Analítico

### Visão Geral do Dashboard

O dashboard principal oferece uma visão consolidada dos dados de comissão:

- **Seletor de Arquivo**: Permite alternar entre diferentes arquivos processados
- **Cards de Métricas**: Exibe estatísticas-chave com indicadores visuais de tendência
- **Filtros Rápidos**: Permite filtrar dados por critérios comuns como "Top 10 Clientes"
- **Período Personalizado**: Filtragem por intervalo de datas específico

### Cards de Estatísticas

Os cards de estatísticas fornecem uma visão rápida das métricas mais importantes:

- **Total de Comissões**: Valor total de comissões no período
- **Total de Clientes**: Número de clientes únicos no período
- **Total de Produtos**: Número de produtos únicos no período
- **Comissão Média**: Valor médio de comissão por transação

Cada card inclui:
- Ícone representativo
- Valor atual
- Indicador de tendência (quando comparado com período anterior)
- Percentual de variação

### Visualizações Gráficas

O sistema oferece visualizações gráficas interativas:

- **Gráfico de Barras**: Ideal para comparar valores entre diferentes categorias
- **Gráfico de Linhas**: Útil para visualizar tendências ao longo do tempo
- **Interatividade**: Tooltips detalhados ao passar o mouse sobre os elementos
- **Alternância**: Possibilidade de alternar entre diferentes tipos de visualização

### Tabela de Dados

A visualização em tabela permite uma análise detalhada dos dados:

- **Ordenação**: Clique nos cabeçalhos para ordenar por qualquer coluna
- **Filtragem**: Filtro global e por coluna específica
- **Paginação**: Navegação fácil entre grandes conjuntos de dados
- **Formatação Automática**: Valores monetários e datas exibidos em formato adequado

## Comparação de Períodos

### Seleção de Arquivos para Comparação

A funcionalidade de comparação permite analisar diferenças entre dois períodos:

- **Seleção Dual**: Interface para selecionar dois arquivos diferentes
- **Prevenção de Erros**: Impede a seleção do mesmo arquivo duas vezes
- **Identificação Clara**: Exibe nomes e períodos dos arquivos selecionados

### Métricas Comparativas

O sistema calcula e exibe métricas comparativas entre os dois períodos:

- **Diferença Total**: Variação absoluta no valor total de comissões
- **Variação Percentual**: Mudança percentual entre os períodos
- **Clientes Exclusivos**: Identificação de clientes presentes em apenas um dos períodos
- **Produtos Exclusivos**: Identificação de produtos presentes em apenas um dos períodos

### Visualizações Comparativas

Gráficos especializados para análise comparativa:

- **Comparação por Cliente**: Exibe as maiores diferenças por cliente
- **Comparação por Produto**: Exibe as maiores diferenças por produto
- **Indicadores Visuais**: Uso de cores para indicar aumento (verde) ou diminuição (vermelho)

### Tabela de Comparação Detalhada

Uma tabela detalhada mostra as diferenças item a item:

- **Valores Lado a Lado**: Exibe valores de ambos os períodos para fácil comparação
- **Diferença Absoluta**: Calcula a diferença numérica entre os valores
- **Variação Percentual**: Mostra a mudança percentual para cada item
- **Ordenação Inteligente**: Permite ordenar por maior diferença, maior aumento, etc.

## Auditoria de Dados

### Visualização de Dados Brutos

A funcionalidade de auditoria permite examinar os dados em seu formato mais detalhado:

- **Visualização Completa**: Acesso a todos os campos e registros do arquivo
- **Filtragem Avançada**: Busca e filtragem por qualquer campo ou valor
- **Ordenação Múltipla**: Possibilidade de ordenar por várias colunas
- **Paginação Eficiente**: Navegação otimizada mesmo com grandes volumes de dados

### Exportação de Dados

Facilidade para exportar dados para análise externa:

- **Exportação para CSV**: Gera arquivo CSV com todos os dados ou filtrados
- **Nomeação Automática**: Sugere nome de arquivo baseado no período e data de exportação
- **Preservação de Formatação**: Mantém formatação adequada de valores e datas

### Validação e Verificação

Ferramentas para validar a integridade e consistência dos dados:

- **Detecção de Anomalias**: Destaque para valores fora do padrão esperado
- **Verificação de Consistência**: Identificação de possíveis inconsistências nos dados
- **Rastreabilidade**: Capacidade de rastrear a origem de cada registro

## Interface e Navegação

### Sidebar de Navegação

O sistema utiliza uma sidebar persistente para navegação:

- **Acesso Rápido**: Links diretos para todas as seções principais
- **Indicador Visual**: Destaque para a seção atual
- **Responsividade**: Adaptação para dispositivos móveis com menu retrátil
- **Informações de Contato**: Exibição de informações de suporte

### Tema Claro/Escuro

Suporte para tema claro e escuro:

- **Alternância Simples**: Botão para alternar entre os temas
- **Preferência do Sistema**: Detecção automática da preferência do usuário
- **Persistência**: Lembra a escolha do usuário entre sessões
- **Contraste Adequado**: Garantia de boa legibilidade em ambos os temas

### Responsividade

Interface totalmente responsiva:

- **Adaptação Automática**: Layout se ajusta a diferentes tamanhos de tela
- **Mobile-Friendly**: Experiência otimizada para dispositivos móveis
- **Reorganização de Conteúdo**: Priorização de informações importantes em telas menores

## Tratamento de Erros

### Erros de Processamento de Arquivo

O sistema lida com erros comuns no processamento de arquivos Excel:

- **Erro "Missing Info for XLS Record"**: Tratamento específico para registros não suportados
- **Tentativas Múltiplas**: Implementação de fallback com configurações alternativas
- **Instruções Detalhadas**: Orientações claras sobre como resolver o problema

### Validação de Estrutura

Verificação da estrutura do arquivo antes do processamento completo:

- **Verificação de Colunas**: Garante que todas as colunas obrigatórias estejam presentes
- **Mensagens Específicas**: Indica exatamente quais colunas estão faltando
- **Prevenção de Processamento Parcial**: Evita processamento incompleto de arquivos inválidos

### Feedback ao Usuário

Sistema abrangente de feedback:

- **Indicadores de Progresso**: Barras de progresso durante operações longas
- **Mensagens de Erro Claras**: Explicações compreensíveis sobre problemas encontrados
- **Sugestões de Solução**: Orientações sobre como resolver problemas específicos
- **Estados Vazios Informativos**: Mensagens úteis quando não há dados para exibir

---

Este documento fornece uma visão detalhada das funcionalidades do Analisador de Comissões. Para informações sobre instalação, requisitos técnicos e contribuição, consulte o arquivo README.md principal.