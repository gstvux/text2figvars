# text2figvars 🎨

  

Cole uma lista de tokens em texto simples e gere automaticamente Figma Variables tipadas, com exportação opcional para JSON e YAML.

  

O **text2figvars** permite que designers e desenvolvedores criem rascunhos de design tokens em texto puro e os convertam instantaneamente em Figma Variables locais tipadas.  Esqueça o trabalho manual e repetitivo — apenas escreva, valide e crie.

  

## ✨ Funcionalidades

  

- **Inferência Automática de Tipo:** Detecta automaticamente `BOOLEAN`, `FLOAT`, `COLOR` e `STRING` com base no valor inserido.

- **Suporte a Aliases:** Referencie outros tokens facilmente (suporta alias curto e expandido).

- **Parsing Inteligente:** Ignora linhas vazias e comentários iniciados com `#`.

- **Preview na UI:** Verifique os tokens processados antes da criação.

- **Opções de Exportação:** Exporte instantaneamente os tokens validados para os formatos `JSON` ou `YAML`.

- **Criação Segura:** Cria uma nova _Variable Collection_ caso não exista , e alerta sobre conflitos de nomenclatura sem sobrescrever variáveis existentes.

  

## 📖 Como Usar (Sintaxe)

  

Os tokens são definidos usando o formato simples `caminho: valor`.  O caminho se tornará o nome da variável no Figma.

  

**1. Tipos Literais**

  

O plugin lê o valor e deduz o tipo correto:

  

```text

# BOOLEAN

(true ou false) feature/newNavbar: true

```

  

# FLOAT (Números inteiros ou decimais)

  
```text
space/8: 8 opacity/half: 0.5
```
  

# COLOR (Hex, RGB, etc. - convertidos para RGBA)

  
```text
color/brand/500: #00ff00
```
  

# STRING (Qualquer outro texto)

  
```text
label/button/primary: Confirmar``
```
  

### 2. Aliases (Referências)

  

Você pode referenciar outros tokens utilizando chaves `{}`. Os aliases são resolvidos automaticamente após a criação das variáveis literais.

  

**Alias Curto:**

  
```text
gap/stack/md: {space/16}
```
  

**Alias Expandido (com descrição):**

  
```text
gap/stack/lg: {alias: space/24, description: "Gap padrão para stacks grandes"}
```
  

## 🛠️ Ambiente de Desenvolvimento (Local)

  

Para rodar ou contribuir com este plugin localmente:

  

1. **Clone o repositório:**

```bash
git clone https://github.com/gstvux/text2figvars cd text2figvars
```
2. **Instale as dependências:**
```bash
npm install
```
3. **Rode o script de build em modo watch:**
```bash
npm run watch
```
4. **Carregue no Figma:**

    - Abra o Figma Desktop App.

    - Clique com botão direito no canvas > **Plugins** > **Development** > **Import plugin from manifest...**

    - Selecione o arquivo `manifest.json` na raiz do projeto.