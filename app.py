import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from flask import Flask, request, render_template, redirect, url_for, flash, jsonify, send_file
from werkzeug.utils import secure_filename
import json
import datetime
import io
import base64
from matplotlib.figure import Figure
from io import BytesIO
import plotly
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import traceback

app = Flask(__name__)
app.secret_key = 'analisador_comissoes_linx'

# Configuração de pastas
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processados'
for folder in [UPLOAD_FOLDER, PROCESSED_FOLDER]:
    os.makedirs(folder, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limite de 16MB para upload

# Lista de colunas importantes para análise
COLUNAS_IMPORTANTES = [
    'contato', 'clifor_cliente', 'nome_clifor', 'cnpj_cliente', 'fatura',
    'codigo_item', 'emissao', 'vencimento_real', 'valor_recebido_total',
    'percent_comissao_item_contrato', 'valor_comissao_total', 'taxa_imposto',
    'valor_imposto', 'valor_a_pagar_sem_imposto', 'valor_menos_imposto'
]

# Formatos de arquivo permitidos
ALLOWED_EXTENSIONS = {'xls', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def processar_arquivo(filepath, filename):
    """
    Processa o arquivo Excel e retorna o DataFrame e as estatísticas
    """
    try:
        # Tentar várias abordagens para lidar com o arquivo Excel
        df = None
        error_messages = []
        
        # Abordagem 1: Tentar ler diretamente com engine padrão
        try:
            df = pd.read_excel(filepath)
            print("Sucesso: Leitura com engine padrão")
        except Exception as e:
            error_messages.append(f"Erro com engine padrão: {str(e)}")
        
        # Abordagem 2: Tentar com engine openpyxl para XLSX
        if df is None and filepath.lower().endswith('.xlsx'):
            try:
                df = pd.read_excel(filepath, engine='openpyxl')
                print("Sucesso: Leitura com openpyxl")
            except Exception as e:
                error_messages.append(f"Erro com openpyxl: {str(e)}")
        
        # Abordagem 3: Tentar com engine xlrd específica para XLS
        if df is None and filepath.lower().endswith('.xls'):
            try:
                # Primeiro tente com xlrd (melhor para arquivos XLS)
                import xlrd
                df = pd.read_excel(filepath, engine='xlrd')
                print("Sucesso: Leitura com xlrd")
            except Exception as e:
                error_messages.append(f"Erro com xlrd: {str(e)}")
                
                # Tente com outras configurações para xlrd
                try:
                    df = pd.read_excel(filepath, engine='xlrd', encoding_override='latin1')
                    print("Sucesso: Leitura com xlrd e encoding latin1")
                except Exception as e:
                    error_messages.append(f"Erro com xlrd e encoding latin1: {str(e)}")
        
        # Abordagem 4: Último recurso - tentar com xlrd diretamente sem pandas
        if df is None and filepath.lower().endswith('.xls'):
            try:
                import xlrd
                workbook = xlrd.open_workbook(filepath, encoding_override='latin1')
                sheet = workbook.sheet_by_index(0)
                
                # Obter cabeçalhos
                headers = [str(cell.value) for cell in sheet.row(0)]
                
                # Criar listas para armazenar dados
                data = []
                for row_idx in range(1, sheet.nrows):
                    row_data = {}
                    for col_idx, header in enumerate(headers):
                        cell = sheet.cell(row_idx, col_idx)
                        # Tratar diferentes tipos de célula
                        if cell.ctype == xlrd.XL_CELL_DATE:
                            # Converter datas do Excel para datetime
                            value = xlrd.xldate.xldate_as_datetime(cell.value, workbook.datemode)
                        else:
                            value = cell.value
                        row_data[header] = value
                    data.append(row_data)
                
                # Criar DataFrame a partir dos dados extraídos
                df = pd.DataFrame(data)
                print("Sucesso: Leitura manual com xlrd")
            except Exception as e:
                error_messages.append(f"Erro com leitura manual por xlrd: {str(e)}")
        
        # Abordagem 5: Tentar usar o comando externo libreoffice para converter para CSV
        if df is None and (os.path.exists('/usr/bin/libreoffice') or os.path.exists('/Applications/LibreOffice.app/Contents/MacOS/soffice')):
            try:
                import subprocess
                import tempfile
                
                # Criar um diretório temporário
                temp_dir = tempfile.mkdtemp()
                temp_csv = os.path.join(temp_dir, 'temp.csv')
                
                # Determinar caminho para o LibreOffice
                libreoffice_path = '/usr/bin/libreoffice'
                if os.path.exists('/Applications/LibreOffice.app/Contents/MacOS/soffice'):
                    libreoffice_path = '/Applications/LibreOffice.app/Contents/MacOS/soffice'
                
                # Executar o comando para converter para CSV
                cmd = [libreoffice_path, '--headless', '--convert-to', 'csv', 
                       '--outdir', temp_dir, filepath]
                subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                
                # Ler o CSV gerado
                df = pd.read_csv(temp_csv, encoding='latin1')
                print("Sucesso: Conversão com LibreOffice para CSV")
                
                # Limpar arquivos temporários
                os.remove(temp_csv)
                os.rmdir(temp_dir)
            except Exception as e:
                error_messages.append(f"Erro com conversão LibreOffice: {str(e)}")
        
        # Se nenhuma abordagem funcionou, retornar erro
        if df is None:
            return None, None, f"Não foi possível ler o arquivo Excel. Erros encontrados: {'; '.join(error_messages)}"
        
        # Verificar se todas as colunas importantes existem
        colunas_faltantes = [col for col in COLUNAS_IMPORTANTES if col not in df.columns]
        if colunas_faltantes:
            return None, None, f"Colunas faltantes no arquivo: {', '.join(colunas_faltantes)}"
        
        # Converter datas para o formato datetime
        for col in ['emissao', 'vencimento_real']:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Extrair mês e ano da data de emissão para facilitar agrupamentos
        if 'emissao' in df.columns:
            df['mes_ano'] = df['emissao'].dt.strftime('%Y-%m')
            df['mes'] = df['emissao'].dt.month
            df['ano'] = df['emissao'].dt.year
        
        # Garantir que valores numéricos sejam tratados corretamente
        for col in ['valor_recebido_total', 'percent_comissao_item_contrato', 'valor_comissao_total', 
                   'taxa_imposto', 'valor_imposto', 'valor_a_pagar_sem_imposto', 'valor_menos_imposto']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Calcular estatísticas
        estatisticas = calcular_estatisticas(df)
        
        # Salvar arquivo processado
        output_path = os.path.join(app.config['PROCESSED_FOLDER'], f"processado_{filename}")
        # Tentar salvar como XLSX para evitar problemas futuros
        if not output_path.lower().endswith('.xlsx'):
            output_path = output_path + '.xlsx'
        df.to_excel(output_path, index=False, engine='openpyxl')
        
        return df, estatisticas, None
    
    except Exception as e:
        # Capturar e retornar o traceback completo para debug
        traceback_str = traceback.format_exc()
        return None, None, f"Erro ao processar o arquivo: {str(e)}\n\nDetalhes: {traceback_str}"

def calcular_estatisticas(df):
    """
    Calcula estatísticas do DataFrame para análise
    """
    # Inicializar dicionário de estatísticas
    estatisticas = {}
    
    # Total de comissões
    estatisticas['total_comissao'] = df['valor_comissao_total'].sum()
    estatisticas['total_a_pagar'] = df['valor_a_pagar_sem_imposto'].sum()
    estatisticas['total_menos_imposto'] = df['valor_menos_imposto'].sum()
    estatisticas['total_imposto'] = df['valor_imposto'].sum()
    
    # Estatísticas por cliente (ADICIONADO CNPJ)
    por_cliente = df.groupby(['nome_clifor', 'cnpj_cliente']).agg({
        'valor_recebido_total': 'sum',
        'valor_comissao_total': 'sum',
        'valor_a_pagar_sem_imposto': 'sum',
        'valor_menos_imposto': 'sum'
    }).reset_index()
    
    estatisticas['por_cliente'] = por_cliente.to_dict('records')
    
    # Top 5 clientes por valor de comissão
    top_clientes = por_cliente.sort_values('valor_comissao_total', ascending=False).head(5)
    estatisticas['top_clientes'] = top_clientes.to_dict('records')
    
    # Estatísticas por item
    por_item = df.groupby('codigo_item').agg({
        'valor_recebido_total': 'sum',
        'valor_comissao_total': 'sum',
        'valor_a_pagar_sem_imposto': 'sum'
    }).reset_index()
    
    estatisticas['por_item'] = por_item.to_dict('records')
    
    # Distribuição de percentuais de comissão
    estatisticas['dist_percentuais'] = df['percent_comissao_item_contrato'].value_counts().to_dict()
    
    return estatisticas

def comparar_arquivos(df1, df2, nome1, nome2):
    """
    Compara dois DataFrames e identifica divergências
    """
    divergencias = {}
    
    # Verificar se ambos têm as mesmas colunas
    colunas_comuns = list(set(df1.columns) & set(df2.columns))
    
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
        # Filtrar DataFrames por cliente
        df1_cliente = df1[df1['nome_clifor'] == cliente]
        df2_cliente = df2[df2['nome_clifor'] == cliente]
        
        valor1 = df1_cliente['valor_comissao_total'].sum()
        valor2 = df2_cliente['valor_comissao_total'].sum()
        
        # Obter CNPJ do cliente (pegar o primeiro que aparecer)
        cnpj_cliente = df1_cliente['cnpj_cliente'].iloc[0] if not df1_cliente['cnpj_cliente'].empty else "N/A"
        
        if abs(valor1 - valor2) > 0.01:  # Considerar diferenças acima de 1 centavo
            valores_por_cliente.append({
                'cliente': cliente,
                'cnpj_cliente': cnpj_cliente,  # Adicionando CNPJ
                nome1: float(valor1),
                nome2: float(valor2),
                'diferenca': float(valor1 - valor2),
                'percentual': float((valor1 - valor2) / max(valor1, valor2) * 100) if max(valor1, valor2) > 0 else 0
            })
    
    divergencias['valores_por_cliente'] = valores_por_cliente
    
    return divergencias

def gerar_grafico_barras(df, coluna_x, coluna_y, titulo):
    """
    Gera um gráfico de barras usando Plotly
    """
    fig = px.bar(df, x=coluna_x, y=coluna_y, title=titulo)
    fig.update_layout(height=600)
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def gerar_grafico_pizza(df, names, values, titulo):
    """
    Gera um gráfico de pizza usando Plotly
    """
    fig = px.pie(df, names=names, values=values, title=titulo)
    fig.update_layout(height=500)
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def gerar_grafico_linha(df, x, y, titulo):
    """
    Gera um gráfico de linha usando Plotly
    """
    fig = px.line(df, x=x, y=y, title=titulo)
    fig.update_layout(height=500)
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

@app.route('/')
def index():
    """Página inicial"""
    # Listar arquivos processados
    arquivos_processados = []
    for arquivo in os.listdir(app.config['PROCESSED_FOLDER']):
        if arquivo.startswith('processado_'):
            nome_arquivo = arquivo.replace('processado_', '')
            # Remover extensão extra .xlsx se foi adicionada no processamento
            if nome_arquivo.endswith('.xls.xlsx'):
                nome_arquivo = nome_arquivo.replace('.xlsx', '')
            arquivos_processados.append(nome_arquivo)
    
    return render_template('index.html', arquivos_processados=arquivos_processados)

@app.route('/upload', methods=['POST'])
def upload_file():
    """Recebe o upload de um arquivo"""
    if 'file' not in request.files:
        flash('Nenhum arquivo enviado')
        return redirect(request.url)
    
    file = request.files['file']
    
    if file.filename == '':
        flash('Nenhum arquivo selecionado')
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Processar o arquivo
        df, estatisticas, erro = processar_arquivo(filepath, filename)
        
        if erro:
            flash(f'Erro: {erro}')
            return redirect(url_for('index'))
        
        flash(f'Arquivo {filename} processado com sucesso!')
        return redirect(url_for('visualizar', filename=filename))
    
    flash('Formato de arquivo não permitido. Use apenas XLS ou XLSX')
    return redirect(url_for('index'))

@app.route('/visualizar/<filename>')
def visualizar(filename):
    """Visualiza os dados de um arquivo"""
    # Verificar diferentes possíveis nomes de arquivo
    possibleFilepaths = [
        os.path.join(app.config['PROCESSED_FOLDER'], f'processado_{filename}'),
        os.path.join(app.config['PROCESSED_FOLDER'], f'processado_{filename}.xlsx')
    ]
    
    filepath = None
    for possiblePath in possibleFilepaths:
        if os.path.exists(possiblePath):
            filepath = possiblePath
            break
    
    if not filepath:
        flash(f'Arquivo processado não encontrado: {filename}')
        return redirect(url_for('index'))
    
    try:
        df = pd.read_excel(filepath, engine='openpyxl')
        estatisticas = calcular_estatisticas(df)
        
        # Obter data atual para mostrar quando foi processado
        today_date = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
        
        # Gerar gráficos
        # Top 5 clientes por valor de comissão
        top_clientes = pd.DataFrame(estatisticas['top_clientes'])
        grafico_clientes = gerar_grafico_barras(
            top_clientes, 'nome_clifor', 'valor_comissao_total', 
            f'Top 5 Clientes por Valor de Comissão - {filename}'
        )
        
        # Distribuição de percentuais de comissão
        dist_percentuais = pd.DataFrame([
            {'percentual': k, 'contagem': v} 
            for k, v in estatisticas['dist_percentuais'].items()
        ])
        grafico_percentuais = gerar_grafico_pizza(
            dist_percentuais, 'percentual', 'contagem',
            f'Distribuição de Percentuais de Comissão - {filename}'
        )
        
        # Top itens por valor de comissão
        top_itens = pd.DataFrame(estatisticas['por_item']).sort_values('valor_comissao_total', ascending=False).head(10)
        grafico_itens = gerar_grafico_barras(
            top_itens, 'codigo_item', 'valor_comissao_total',
            f'Top 10 Itens por Valor de Comissão - {filename}'
        )
        
        # Preparar dados para a tabela
        tabela_clientes = pd.DataFrame(estatisticas['por_cliente']).sort_values('valor_comissao_total', ascending=False)
        
        return render_template(
            'visualizar.html', 
            filename=filename, 
            estatisticas=estatisticas,
            grafico_clientes=grafico_clientes,
            grafico_percentuais=grafico_percentuais,
            grafico_itens=grafico_itens,
            tabela_clientes=tabela_clientes.to_dict('records'),
            today_date=today_date  # Adicionado data atual
        )
    except Exception as e:
        traceback_str = traceback.format_exc()
        flash(f'Erro ao visualizar o arquivo: {str(e)}\n\nDetalhes: {traceback_str}')
        return redirect(url_for('index'))

@app.route('/api/dados/<filename>')
def api_dados(filename):
    """API para obter dados do arquivo"""
    possibleFilepaths = [
        os.path.join(app.config['PROCESSED_FOLDER'], f'processado_{filename}'),
        os.path.join(app.config['PROCESSED_FOLDER'], f'processado_{filename}.xlsx')
    ]
    
    filepath = None
    for possiblePath in possibleFilepaths:
        if os.path.exists(possiblePath):
            filepath = possiblePath
            break
    
    if not filepath:
        return jsonify({'erro': f'Arquivo não encontrado: {filename}'}), 404
    
    try:
        df = pd.read_excel(filepath, engine='openpyxl')
        estatisticas = calcular_estatisticas(df)
        
        return jsonify(estatisticas)
    except Exception as e:
        return jsonify({'erro': f'Erro ao processar o arquivo: {str(e)}'}), 500

@app.route('/comparar', methods=['GET', 'POST'])
def comparar():
    """Página para comparar dois arquivos"""
    # Listar arquivos processados
    arquivos_processados = []
    for arquivo in os.listdir(app.config['PROCESSED_FOLDER']):
        if arquivo.startswith('processado_'):
            nome_arquivo = arquivo.replace('processado_', '')
            # Remover extensão extra .xlsx se foi adicionada no processamento
            if nome_arquivo.endswith('.xls.xlsx'):
                nome_arquivo = nome_arquivo.replace('.xlsx', '')
            arquivos_processados.append(nome_arquivo)
    
    if request.method == 'POST':
        arquivo1 = request.form.get('arquivo1')
        arquivo2 = request.form.get('arquivo2')
        
        if not arquivo1 or not arquivo2:
            flash('Selecione dois arquivos para comparar')
            return redirect(url_for('comparar'))
        
        if arquivo1 == arquivo2:
            flash('Selecione arquivos diferentes para comparar')
            return redirect(url_for('comparar'))
        
        # Verificar diferentes possíveis nomes de arquivo
        def encontrar_arquivo(nome):
            possiblePaths = [
                os.path.join(app.config['PROCESSED_FOLDER'], f'processado_{nome}'),
                os.path.join(app.config['PROCESSED_FOLDER'], f'processado_{nome}.xlsx')
            ]
            for path in possiblePaths:
                if os.path.exists(path):
                    return path
            return None
        
        filepath1 = encontrar_arquivo(arquivo1)
        filepath2 = encontrar_arquivo(arquivo2)
        
        if not filepath1 or not filepath2:
            flash('Um dos arquivos selecionados não existe')
            return redirect(url_for('comparar'))
        
        try:
            df1 = pd.read_excel(filepath1, engine='openpyxl')
            df2 = pd.read_excel(filepath2, engine='openpyxl')
            
            divergencias = comparar_arquivos(df1, df2, arquivo1, arquivo2)
            
            # Gerar gráfico comparativo
            comp_data = pd.DataFrame([
                {
                    'Arquivo': arquivo1, 
                    'Valor': divergencias['total_comissao'][arquivo1]
                },
                {
                    'Arquivo': arquivo2, 
                    'Valor': divergencias['total_comissao'][arquivo2]
                }
            ])
            
            grafico_comparativo = gerar_grafico_barras(
                comp_data, 'Arquivo', 'Valor', 
                f'Comparativo de Valor Total de Comissão entre {arquivo1} e {arquivo2}'
            )
            
            # Criar dados para gráfico de comparação por cliente
            if divergencias['valores_por_cliente']:
                clientes = [item['cliente'] for item in divergencias['valores_por_cliente']]
                valores1 = [item[arquivo1] for item in divergencias['valores_por_cliente']]
                valores2 = [item[arquivo2] for item in divergencias['valores_por_cliente']]
                
                fig = go.Figure()
                fig.add_trace(go.Bar(name=arquivo1, x=clientes, y=valores1))
                fig.add_trace(go.Bar(name=arquivo2, x=clientes, y=valores2))
                fig.update_layout(
                    title=f'Comparativo por Cliente - {arquivo1} vs {arquivo2}',
                    barmode='group',
                    height=600
                )
                grafico_por_cliente = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
            else:
                grafico_por_cliente = None
            
            # Calcular valores para a barra de progresso
            percentual = (divergencias['total_comissao']['diferenca'] / divergencias['total_comissao'][arquivo1] * 100) if divergencias['total_comissao'][arquivo1] != 0 else 0
            percentual_limitado = min(abs(percentual), 100)
                
            return render_template(
                'resultado_comparacao.html',
                arquivo1=arquivo1,
                arquivo2=arquivo2,
                divergencias=divergencias,
                grafico_comparativo=grafico_comparativo,
                grafico_por_cliente=grafico_por_cliente,
                percentual_limitado=percentual_limitado
            )
        except Exception as e:
            traceback_str = traceback.format_exc()
            flash(f'Erro ao comparar os arquivos: {str(e)}\n\nDetalhes: {traceback_str}')
            return redirect(url_for('comparar'))
    
    return render_template('comparar.html', arquivos_processados=arquivos_processados)

@app.route('/download/<filename>')
def download(filename):
    """Download do arquivo processado"""
    # Verificar diferentes possíveis nomes de arquivo
    possibleFilepaths = [
        os.path.join(app.config['PROCESSED_FOLDER'], f'processado_{filename}'),
        os.path.join(app.config['PROCESSED_FOLDER'], f'processado_{filename}.xlsx')
    ]
    
    filepath = None
    for possiblePath in possibleFilepaths:
        if os.path.exists(possiblePath):
            filepath = possiblePath
            break
    
    if not filepath:
        flash(f'Arquivo não encontrado: {filename}')
        return redirect(url_for('index'))
    
    return send_file(filepath, as_attachment=True, download_name=f'processado_{filename}')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)