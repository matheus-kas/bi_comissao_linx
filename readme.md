# Analisador de Comissões Linx

Este aplicativo permite analisar e comparar os dados de comissões da franqueadora Linx, facilitando a identificação de divergências e o acompanhamento dos valores de repasse.

## Índice

- [Instruções de Execução](#instruções-de-execução)
- [Tutorial Passo a Passo](#tutorial-passo-a-passo)
- [Explicação Técnica](#explicação-técnica)

## Instruções de Execução

### Requisitos

Antes de começar, certifique-se de ter os seguintes requisitos instalados:

```bash
pip install flask pandas numpy matplotlib seaborn openpyxl xlrd plotly
```

### Estrutura de Diretórios

Crie a seguinte estrutura de diretórios:

```
analisador-comissoes-linx/
├── app.py                      # Arquivo principal da aplicação
├── templates/                  # Diretório de templates HTML
│   ├── base.html               # Template base
│   ├── index.html              # Página inicial
│   ├── visualizar.html         # Página de visualização dos dados
│   ├── comparar.html           # Página para selecionar arquivos a comparar
│   └── resultado_comparacao.html  # Página de resultado da comparação
├── uploads/                    # Diretório para armazenar arquivos enviados (criado automaticamente)
└── processados/                # Diretório para armazenar arquivos processados (criado automaticamente)
```

### Como Executar

1. Coloque todos os arquivos nos diretórios corretos conforme a estrutura acima
2. Navegue até o diretório raiz do projeto
3. Execute o seguinte comando:

```bash
python app.py
```

4. Acesse a aplicação no navegador: `http://localhost:5000`

### Funcionalidades da Aplicação

#### 1. Upload e Processamento de Arquivos

- A aplicação permite o upload de arquivos Excel (.xls e .xlsx) contendo os dados de comissões da Linx
- Quando um arquivo é enviado, ele é processado e salvo na pasta `processados/`
- A aplicação extrai as informações relevantes das colunas especificadas
- A análise é baseada nas seguintes colunas:
  - `contato`: Nome da sua franquia
  - `clifor_cliente`, `nome_clifor`, `cnpj_cliente`: Dados do cliente
  - `fatura`, `codigo_item`, `emissao`, `vencimento_real`: Dados da fatura
  - `valor_recebido_total`, `percent_comissao_item_contrato`, `valor_comissao_total`: Informações financeiras
  - `taxa_imposto`, `valor_imposto`, `valor_a_pagar_sem_imposto`, `valor_menos_imposto`: Impostos e valores finais

#### 2. Visualização dos Dados

Após o processamento, você pode visualizar:

- **Resumo Estatístico**: Total de comissões, impostos, valores a pagar
- **Gráficos**:
  - Top 5 clientes por valor de comissão
  - Distribuição dos percentuais de comissão
  - Top 10 itens por valor de comissão
- **Tabela de Clientes**: Detalhamento de valores por cliente

#### 3. Comparação de Arquivos

Uma das funcionalidades mais importantes é a comparação entre arquivos de diferentes meses:

- Selecione dois arquivos processados para comparar
- A aplicação identifica:
  - Diferenças nos valores totais de comissão
  - Clientes e itens exclusivos em cada arquivo
  - Diferenças de valores para clientes comuns a ambos os arquivos
- Os resultados são apresentados em gráficos comparativos e tabelas detalhadas

#### 4. Exportação de Dados

Em várias seções da aplicação, você pode exportar dados para CSV:

- Tabela de análise por cliente
- Divergências identificadas na comparação

### Dicas de Uso

1. **Organização dos Arquivos**: Nomeie seus arquivos Excel de forma que seja fácil identificar o mês/período (ex: `comissoes_linx_jan2025.xlsx`)

2. **Comparação Mensal**: Para melhor acompanhamento, faça upload dos arquivos mensais assim que recebê-los e compare com o mês anterior

3. **Busca de Divergências**: Preste atenção especial aos itens marcados em vermelho na tabela de comparação, pois indicam valores menores no arquivo mais recente

4. **Validação de Dados**: Sempre verifique os clientes exclusivos em cada arquivo, pois podem indicar omissões

### Resolução de Problemas

Se encontrar problemas ao usar a aplicação, verifique:

1. **Formato do Arquivo**: Certifique-se de que o arquivo Excel está no formato correto com todas as colunas necessárias
2. **Permissões de Diretório**: Verifique se as pastas `uploads/` e `processados/` têm permissões de escrita
3. **Problemas de Memória**: Se os arquivos forem muito grandes, pode ser necessário aumentar o limite de memória no Flask
4. **Logs de Erro**: Confira o terminal onde a aplicação está sendo executada para mensagens de erro detalhadas

### Extendendo a Aplicação

Você pode estender a aplicação para atender a necessidades específicas:

1. **Filtros Adicionais**: Adicione mais filtros por período, produto ou cliente no módulo de visualização
2. **Exportação para Outros Formatos**: Implemente exportação para PDF ou Excel completo
3. **Dashboard Automático**: Configure um relatório mensal automático que compare os últimos meses
4. **Alerta de Divergências**: Adicione um sistema de alerta que notifique sobre divergências significativas

### Segurança dos Dados

Como esta aplicação lida com dados financeiros importantes:

1. **Backup**: Faça backup regular dos dados processados
2. **Acesso Restrito**: Considere adicionar autenticação para restringir o acesso à aplicação
3. **Criptografia**: Se os dados forem sensíveis, implemente criptografia para os arquivos processados

### Analisando Resultados

Para tirar o máximo proveito da análise:

1. **Padrões de Comissão**: Verifique se os percentuais de comissão estão de acordo com o contrato
2. **Tendências**: Compare meses consecutivos para identificar tendências de crescimento ou queda
3. **Clientes Ausentes**: Preste atenção especial a clientes que aparecem em um mês e não em outro
4. **Itens de Alto Valor**: Identifique os itens que geram mais comissão e foque neles

### Futuras Melhorias

Para versões futuras, considere implementar:

1. **Previsão de Comissões**: Adicione análise preditiva para estimar comissões futuras
2. **Integração Direta**: Integre com o sistema da Linx para obter dados automaticamente
3. **Notificações**: Implemente alertas por e-mail sobre novos arquivos ou divergências
4. **Visualização Avançada**: Adicione painéis de controle mais sofisticados com mais métricas

## Tutorial Passo a Passo

### 1. Preparação do Ambiente

Primeiro, vamos configurar o ambiente de desenvolvimento:

```bash
# Criar um diretório para o projeto
mkdir analisador-comissoes-linx
cd analisador-comissoes-linx

# Opcional: Criar e ativar um ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar as dependências necessárias
pip install flask pandas numpy matplotlib seaborn openpyxl xlrd plotly
```

### 2. Criação da Estrutura de Arquivos

Agora, vamos criar a estrutura de diretórios e arquivos:

```bash
# Criar diretórios necessários
mkdir templates
mkdir static
```

### 3. Salvando os Arquivos

#### Arquivo principal: app.py

Salve o código da aplicação (fornecido anteriormente) em um arquivo chamado `app.py` na raiz do projeto.

#### Templates HTML

Salve cada um dos templates HTML nos seguintes arquivos dentro da pasta `templates/`:

1. `base.html`: Template base com o layout comum
2. `index.html`: Página inicial com upload de arquivos
3. `visualizar.html`: Página de visualização dos dados
4. `comparar.html`: Página para selecionar arquivos a comparar
5. `resultado_comparacao.html`: Página com o resultado da comparação

### 4. Executando a Aplicação

Agora você está pronto para executar a aplicação:

```bash
# Na raiz do projeto
python app.py
```

A aplicação deve mostrar uma mensagem como:
```
* Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

Acesse o endereço indicado no seu navegador para começar a usar a aplicação.

### 5. Usando a Aplicação

#### 5.1. Upload de Arquivos

1. Na página inicial, clique no botão "Escolher arquivo" para selecionar o arquivo Excel de comissões
2. Selecione um arquivo .xls ou .xlsx contendo os dados de comissões da Linx
3. Clique em "Enviar Arquivo"
4. Se o upload for bem-sucedido, você será redirecionado para a página de visualização

#### 5.2. Visualizando Análises

Na página de visualização, você verá:

1. **Resumo Estatístico**: Cards mostrando totais de comissões, valores a pagar, etc.
2. **Gráficos**:
   - Gráfico de barras dos top clientes por valor de comissão
   - Gráfico de pizza com distribuição de percentuais de comissão
   - Gráfico de barras dos top itens por comissão
3. **Tabela de Clientes**: Listagem detalhada por cliente com todos os valores relevantes
4. **Opção de Exportar**: Botão para exportar a tabela em formato CSV

#### 5.3. Comparando Arquivos

Para comparar dois arquivos de meses diferentes:

1. Clique em "Comparar Arquivos" no menu superior
2. Selecione o primeiro arquivo na lista suspensa
3. Selecione o segundo arquivo na lista suspensa
4. Clique em "Comparar Arquivos"
5. Analise os resultados na página de comparação:
   - Diferença no total de comissões
   - Gráficos comparativos
   - Tabela de divergências por cliente
   - Listas de clientes e itens exclusivos em cada arquivo

#### 5.4. Exportando Dados

Em várias partes da aplicação, você pode exportar dados:

1. Na página de visualização, clique em "Exportar CSV" para baixar a análise por cliente
2. Na página de resultado de comparação, clique em "Exportar CSV" para baixar a tabela de divergências

### 6. Analisando Resultados

Algumas dicas para analisar os resultados:

1. **Verifique os Totais**: Compare o total de comissões com seus registros internos
2. **Identifique Divergências**: Preste atenção especial às linhas em vermelho na tabela de comparação
3. **Acompanhe Tendências**: Compare meses consecutivos para identificar padrões
4. **Monitore Clientes Ausentes**: Confira se algum cliente deixou de aparecer no relatório mais recente

### 7. Personalizando a Aplicação

Você pode personalizar a aplicação editando os seguintes arquivos:

- `app.py`: Para alterar a lógica de processamento e análise
- Templates HTML: Para modificar a interface do usuário
- Adicione arquivos CSS/JS em uma pasta `static/` para personalizar o visual

### 8. Resolução de Problemas Comuns

#### Erro ao fazer upload de arquivos

Se ocorrer erro no upload:
- Verifique se o arquivo está no formato correto (.xls ou .xlsx)
- Certifique-se de que o arquivo não excede o limite de 16MB
- Verifique as permissões da pasta `uploads/`

#### Erro ao processar o arquivo

Se ocorrer erro no processamento:
- Verifique se o arquivo contém todas as colunas necessárias
- Confira se os tipos de dados nas colunas estão corretos (números, datas, etc.)
- Olhe os logs no terminal para mensagens de erro específicas

### 9. Mantendo Seus Dados Organizados

Para uma análise eficiente ao longo do tempo:

1. Use nomes de arquivos consistentes, preferencialmente com o mês e ano (ex: comissoes_jan2025.xlsx)
2. Mantenha uma cópia de backup dos arquivos originais
3. Documente quaisquer discrepâncias identificadas para futuras referências

## Explicação Técnica

### 1. Visão Geral da Arquitetura

A aplicação segue uma arquitetura MVC (Model-View-Controller) simplificada:

- **Model**: Funções de processamento de dados em `app.py`
- **View**: Templates HTML na pasta `templates/`
- **Controller**: Rotas Flask em `app.py`

### 2. Processamento de Arquivos Excel

#### 2.1. Upload e Leitura do Excel

O processo começa com o upload do arquivo:

```python
@app.route('/upload', methods=['POST'])
def upload_file():
    # Receber o arquivo
    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Processar o arquivo
    df, estatisticas, erro = processar_arquivo(filepath, filename)
    
    # Redirecionar para visualização
    return redirect(url_for('visualizar', filename=filename))
```

A função `processar_arquivo()` utiliza pandas para ler e analisar o Excel:

```python
def processar_arquivo(filepath, filename):
    # Carregar o arquivo
    df = pd.read_excel(filepath)
    
    # Verificar colunas importantes
    colunas_faltantes = [col for col in COLUNAS_IMPORTANTES if col not in df.columns]
    
    # Converter datas para formato datetime
    for col in ['emissao', 'vencimento_real']:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Extrair mês e ano para análises
    if 'emissao' in df.columns:
        df['mes_ano'] = df['emissao'].dt.strftime('%Y-%m')
        df['mes'] = df['emissao'].dt.month
        df['ano'] = df['emissao'].dt.year
    
    # Converter valores numéricos
    for col in ['valor_recebido_total', 'percent_comissao_item_contrato', ...]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Calcular estatísticas e salvar
    estatisticas = calcular_estatisticas(df)
    output_path = os.path.join(app.config['PROCESSED_FOLDER'], f"processado_{filename}")
    df.to_excel(output_path, index=False)
    
    return df, estatisticas, None
```

#### 2.2. Cálculo de Estatísticas

A função `calcular_estatisticas()` extrai informações importantes do DataFrame:

```python
def calcular_estatisticas(df):
    estatisticas = {}
    
    # Total de comissões
    estatisticas['total_comissao'] = df['valor_comissao_total'].sum()
    estatisticas['total_a_pagar'] = df['valor_a_pagar_sem_imposto'].sum()
    estatisticas['total_menos_imposto'] = df['valor_menos_imposto'].sum()
    estatisticas['total_imposto'] = df['valor_imposto'].sum()
    
    # Estatísticas por cliente
    por_cliente = df.groupby('nome_clifor').agg({
        'valor_recebido_total': 'sum',
        'valor_comissao_total': 'sum',
        'valor_a_pagar_sem_imposto': 'sum',
        'valor_menos_imposto': 'sum'
    }).reset_index()
    
    estatisticas['por_cliente'] = por_cliente.to_dict('records')
    
    # Top 5 clientes
    top_clientes = por_cliente.sort_values('valor_comissao_total', ascending=False).head(5)
    estatisticas['top_clientes'] = top_clientes.to_dict('records')
    
    # Estatísticas por item
    por_item = df.groupby('codigo_item').agg({...}).reset_index()
    estatisticas['por_item'] = por_item.to_dict('records')
    
    # Distribuição de percentuais
    estatisticas['dist_percentuais'] = df['percent_comissao_item_contrato'].value_counts().to_dict()
    
    return estatisticas
```

### 3. Visualização de Dados

#### 3.1. Geração de Gráficos com Plotly

A aplicação utiliza a biblioteca Plotly para gerar gráficos interativos:

```python
def gerar_grafico_barras(df, coluna_x, coluna_y, titulo):
    fig = px.bar(df, x=coluna_x, y=coluna_y, title=titulo)
    fig.update_layout(height=600)
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def gerar_grafico_pizza(df, names, values, titulo):
    fig = px.pie(df, names=names, values=values, title=titulo)
    fig.update_layout(height=500)
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
```

Na rota de visualização, esses gráficos são criados e passados para o template:

```python
@app.route('/visualizar/<filename>')
def visualizar(filename):
    # Carregar dados
    df = pd.read_excel(filepath)
    estatisticas = calcular_estatisticas(df)
    
    # Gerar gráficos
    top_clientes = pd.DataFrame(estatisticas['top_clientes'])
    grafico_clientes = gerar_grafico_barras(
        top_clientes, 'nome_clifor', 'valor_comissao_total', 
        f'Top 5 Clientes por Valor de Comissão - {filename}'
    )
    
    # Outros gráficos...
    
    return render_template(
        'visualizar.html', 
        filename=filename, 
        estatisticas=estatisticas,
        grafico_clientes=grafico_clientes,
        grafico_percentuais=grafico_percentuais,
        grafico_itens=grafico_itens,
        tabela_clientes=tabela_clientes.to_dict('records')
    )
```

No template, os gráficos são renderizados com JavaScript:

```html
<script>
    // Renderizar gráficos
    var graficosClientes = {{ grafico_clientes|safe }};
    var graficoPercentuais = {{ grafico_percentuais|safe }};
    var graficoItens = {{ grafico_itens|safe }};
    
    Plotly.newPlot('grafico-clientes', graficosClientes.data, graficosClientes.layout);
    Plotly.newPlot('grafico-percentuais', graficoPercentuais.data, graficoPercentuais.layout);
    Plotly.newPlot('grafico-itens', graficoItens.data, graficoItens.layout);
</script>
```

### 4. Comparação de Arquivos

#### 4.1. Algoritmo de Comparação

O coração da aplicação é a função `comparar_arquivos()` que identifica diferenças entre dois conjuntos de dados:

```python
def comparar_arquivos(df1, df2, nome1, nome2):
    divergencias = {}
    
    # Comparar total de comissões
    divergencias['total_comissao'] = {
        nome1: float(df1['valor_comissao_total'].sum()),
        nome2: float(df2['valor_comissao_total'].sum()),
        'diferenca': float(df1['valor_comissao_total'].sum() - df2['valor_comissao_total'].sum())
    }
    
    # Comparar clientes únicos
    clientes1 = set(df1['nome_clifor'])
    clientes2 = set(df2['nome_clifor'])
    
    divergencias['clientes_exclusivos'] = {
        nome1: list(clientes1 - clientes2),
        nome2: list(clientes2 - clientes1),
        'comuns': len(clientes1 & clientes2)
    }
    
    # Comparar itens únicos
    itens1 = set(df1['codigo_item'])
    itens2 = set(df2['codigo_item'])
    
    divergencias['itens_exclusivos'] = {
        nome1: list(itens1 - itens2),
        nome2: list(itens2 - itens1),
        'comuns': len(itens1 & itens2)
    }
    
    # Comparar valores por cliente comum
    clientes_comuns = clientes1 & clientes2
    valores_por_cliente = []
    
    for cliente in clientes_comuns:
        valor1 = df1[df1['nome_clifor'] == cliente]['valor_comissao_total'].sum()
        valor2 = df2[df2['nome_clifor'] == cliente]['valor_comissao_total'].sum()
        
        if abs(valor1 - valor2) > 0.01:  # Ignorar diferenças mínimas
            valores_por_cliente.append({
                'cliente': cliente,
                nome1: float(valor1),
                nome2: float(valor2),
                'diferenca': float(valor1 - valor2),
                'percentual': float((valor1 - valor2) / max(valor1, valor2) * 100) if max(valor1, valor2) > 0 else 0
            })
    
    divergencias['valores_por_cliente'] = valores_por_cliente
    
    return divergencias
```

### 5. Exportação de Dados

A exportação para CSV é implementada com JavaScript para executar do lado do cliente:

```javascript
document.getElementById('btn-exportar-tabela').addEventListener('click', function() {
    // Selecionar a tabela
    const table = document.getElementById('tabela-clientes');
    let csv = [];
    
    // Cabeçalho
    let header = [];
    const headers = table.querySelectorAll('thead th');
    headers.forEach(head => {
        header.push('"' + head.textContent.trim() + '"');
    });
    csv.push(header.join(','));
    
    // Linhas
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        let data = [];
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            data.push('"' + cell.textContent.trim() + '"');
        });
        csv.push(data.join(','));
    });
    
    // Criar e baixar o arquivo CSV
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'analise_clientes.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
```

### 6. Segurança e Validação

A aplicação implementa várias medidas de segurança:

#### 6.1. Validação de Arquivos

```python
ALLOWED_EXTENSIONS = {'xls', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
```

#### 6.2. Proteção contra Nomes de Arquivo Maliciosos

```python
from werkzeug.utils import secure_filename

filename = secure_filename(file.filename)
```

#### 6.3. Limite de Tamanho de Upload

```python
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limite de 16MB
```

### 7. Estrutura de Pastas e Armazenamento

A aplicação gerencia automaticamente as pastas necessárias:

```python
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processados'
for folder in [UPLOAD_FOLDER, PROCESSED_FOLDER]:
    os.makedirs(folder, exist_ok=True)
```

Os arquivos processados são salvos com um prefixo para diferenciação:

```python
output_path = os.path.join(app.config['PROCESSED_FOLDER'], f"processado_{filename}")
df.to_excel(output_path, index=False)
```

### 8. Adaptando a Aplicação

#### 8.1. Adicionando Novas Colunas para Análise

Se você precisar incluir mais colunas na análise:

1. Atualize a lista `COLUNAS_IMPORTANTES`:
   ```python
   COLUNAS_IMPORTANTES = [
       'contato', 'clifor_cliente', ..., 'sua_nova_coluna'
   ]
   ```

2. Adicione processamento para a nova coluna em `processar_arquivo()`:
   ```python
   if 'sua_nova_coluna' in df.columns:
       # Processamento específico
   ```

3. Inclua a coluna nas estatísticas em `calcular_estatisticas()`:
   ```python
   por_cliente = df.groupby('nome_clifor').agg({
       ...,
       'sua_nova_coluna': 'sum'  # ou outra operação
   })
   ```

#### 8.2. Criando Novas Visualizações

Para adicionar um novo tipo de gráfico:

1. Crie uma função de geração do gráfico:
   ```python
   def gerar_novo_grafico(df, ...):
       fig = px.scatter(...)  # ou outro tipo
       return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
   ```

2. Use a função na rota de visualização:
   ```python
   novo_grafico = gerar_novo_grafico(...)
   ```

3. Atualize o template para incluir o novo gráfico:
   ```html
   <div id="novo-grafico"></div>
   <script>
       var novoGrafico = {{ novo_grafico|safe }};
       Plotly.newPlot('novo-grafico', novoGrafico.data, novoGrafico.layout);
   </script>
   ```

### 9. Fluxo de Dados Completo

Para entender como os dados fluem pela aplicação:

1. Upload do arquivo Excel pelo usuário
2. Salvamento temporário na pasta `uploads/`
3. Processamento com Pandas para extrair dados e estatísticas
4. Salvamento do arquivo processado na pasta `processados/`
5. Geração de visualizações com Plotly
6. Renderização do template HTML com os dados e gráficos
7. Interação do usuário com visualizações e opções de exportação