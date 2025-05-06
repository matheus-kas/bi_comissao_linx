# Manual de Branches Git/GitHub

## Introdução

Este documento descreve o fluxo de trabalho para desenvolvimento e manutenção do código-fonte deste projeto utilizando o sistema de branches do Git.

## Estrutura de Branches

Este projeto utiliza duas branches principais:

- **main**: Branch de produção, contém apenas código estável e testado.
- **desenvolvimento**: Branch para desenvolvimento e testes.

## Comandos Básicos

### Verificar em qual branch você está

```bash
git branch
```

### Alternar entre branches

```bash
# Mudar para a branch main
git checkout main

# Mudar para a branch desenvolvimento
git checkout desenvolvimento
```

### Criar e configurar a branch de desenvolvimento (primeira vez)

```bash
# Criar branch a partir da main
git checkout -b desenvolvimento

# Enviar para o GitHub
git push -u origin desenvolvimento
```

## Fluxo de Trabalho

### Desenvolvimento

1. **Sempre desenvolva na branch de desenvolvimento**:
   ```bash
   git checkout desenvolvimento
   ```

2. **Faça alterações no código**

3. **Adicione as alterações e faça o commit**:
   ```bash
   git add .
   git commit -m "Descrição clara da alteração"
   ```

4. **Envie para o GitHub**:
   ```bash
   git push
   ```

### Atualização da branch de produção

Quando o código estiver testado e pronto para produção:

1. **Mude para a branch principal**:
   ```bash
   git checkout main
   ```

2. **Faça o merge da branch de desenvolvimento**:
   ```bash
   git merge desenvolvimento
   ```

3. **Envie as alterações para o GitHub**:
   ```bash
   git push
   ```

### Criação de uma feature específica (opcional)

Para funcionalidades mais complexas, considere criar branches específicas:

1. **Crie uma branch a partir de desenvolvimento**:
   ```bash
   git checkout desenvolvimento
   git checkout -b feature/nome-da-funcionalidade
   ```

2. **Após concluir, faça o merge de volta para desenvolvimento**:
   ```bash
   git checkout desenvolvimento
   git merge feature/nome-da-funcionalidade
   ```

## Boas Práticas

1. **Nunca commite diretamente na branch main**
2. **Faça commits frequentes com mensagens claras**
3. **Resolva conflitos na branch de desenvolvimento antes de fazer merge para main**
4. **Mantenha suas branches locais atualizadas**:
   ```bash
   git pull
   ```

## Utilizando Git com Visual Studio Code

O Visual Studio Code oferece uma interface gráfica intuitiva para gerenciar branches e operações Git:

### Visualizar e Trocar Branches

1. **Abrir o Controle de Código-Fonte:**
   - Clique no ícone de ramificação na barra lateral esquerda (3º ícone) ou pressione `Ctrl+Shift+G`

2. **Ver Branches e Status:**
   - No painel inferior do VS Code, você verá o nome da branch atual
   - Clique neste nome para ver todas as branches e trocar entre elas

3. **Criar Nova Branch:**
   - Clique no nome da branch atual na barra inferior
   - Selecione "+ Criar nova branch..." no menu que aparece
   - Digite o nome da nova branch (ex: "desenvolvimento")

### Realizar Commits

1. **Visualizar Alterações:**
   - As alterações pendentes aparecerão no painel de Controle de Código-Fonte
   - Você pode ver as diferenças clicando em cada arquivo

2. **Preparar Alterações (Staging):**
   - Clique no "+" ao lado de cada arquivo para adicionar ao staging
   - Ou use o "+" na seção "Alterações" para adicionar todos os arquivos

3. **Fazer Commit:**
   - Digite uma mensagem de commit no campo de texto
   - Clique no botão ✓ (Commit) acima do campo de texto

### Operações de Push e Pull

1. **Enviar para o GitHub (Push):**
   - Clique nos três pontos "..." no topo do painel de Controle de Código-Fonte
   - Selecione "Push" no menu
   - Na primeira vez, pode ser necessário clicar em "Publicar Branch"

2. **Atualizar do GitHub (Pull):**
   - Clique nos três pontos "..." 
   - Selecione "Pull" no menu

### Merge no VS Code

1. **Para fazer merge entre branches:**
   - Mude para a branch de destino (ex: main)
   - Clique nos três pontos "..." 
   - Selecione "Branch" e depois "Merge Branch..."
   - Escolha a branch de origem (ex: desenvolvimento)

### Resolvendo Conflitos

Quando ocorrem conflitos durante um merge:
1. Os arquivos com conflitos aparecerão na seção "Merged Changes"
2. Clique em cada arquivo para abrir o editor de conflitos
3. Escolha "Accept Current", "Accept Incoming", ou edite manualmente o código
4. Depois de resolver todos os conflitos, faça o staging e commit das alterações

---

*Última atualização: Maio de 2025*