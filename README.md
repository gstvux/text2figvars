# Token Paste to Variables 🎨

[cite_start]Cole uma lista de tokens em texto simples e gere automaticamente Figma Variables tipadas, com exportação opcional para JSON e YAML. [cite: 27]

[cite_start]O **Token Paste to Variables** permite que designers e desenvolvedores criem rascunhos de design tokens em texto puro e os convertam instantaneamente em Figma Variables locais tipadas. [cite: 29] Esqueça o trabalho manual e repetitivo — apenas escreva, valide e crie.

## ✨ Funcionalidades

- [cite_start]**Inferência Automática de Tipo:** Detecta automaticamente `BOOLEAN`, `FLOAT`, `COLOR` e `STRING` com base no valor inserido. [cite: 5]
- [cite_start]**Suporte a Aliases:** Referencie outros tokens facilmente (suporta alias curto e expandido). [cite: 7, 30]
- [cite_start]**Parsing Inteligente:** Ignora linhas vazias e comentários iniciados com `#`. [cite: 5]
- [cite_start]**Preview na UI:** Verifique os tokens processados antes da criação. [cite: 29]
- [cite_start]**Opções de Exportação:** Exporte instantaneamente os tokens validados para os formatos `JSON` ou `YAML`. [cite: 29]
- [cite_start]**Criação Segura:** Cria uma nova _Variable Collection_ caso não exista [cite: 18][cite_start], e alerta sobre conflitos de nomenclatura sem sobrescrever variáveis existentes. [cite: 32]

## 📖 Como Usar (Sintaxe)

[cite_start]Os tokens são definidos usando o formato simples `caminho: valor`. [cite: 5] [cite_start]O caminho se tornará o nome da variável no Figma. [cite: 8]

**1. Tipos Literais**

[cite_start]O plugin lê o valor e deduz o tipo correto: [cite: 5]

`# BOOLEAN (true ou false) feature/newNavbar: true

# FLOAT (Números inteiros ou decimais)

space/8: 8 opacity/half: 0.5

# COLOR (Hex, RGB, etc. - convertidos para RGBA)

color/brand/500: #00ff00

# STRING (Qualquer outro texto)

label/button/primary: Confirmar``

### 2. Aliases (Referências)

Você pode referenciar outros tokens utilizando chaves `{}`. Os aliases são resolvidos automaticamente após a criação das variáveis literais.

**Alias Curto:**

Plaintext

`gap/stack/md: {space/16}`

**Alias Expandido (com descrição):**

Plaintext

`gap/stack/lg: {alias: space/24, description: "Gap padrão para stacks grandes"}`

## 🛠️ Ambiente de Desenvolvimento (Local)

Para rodar ou contribuir com este plugin localmente:

1. **Clone o repositório:**Bash
    
    `git clone <https://github.com/SEU_USUARIO/text2figvars.git> cd text2figvars`
    
2. **Instale as dependências:**Bash
    
    `npm install`
    
3. **Rode o script de build em modo watch:**Bash
    
    `npm run watch`
    
4. **Carregue no Figma:**
    
    - Abra o Figma Desktop App.
    - Clique com botão direito no canvas > **Plugins** > **Development** > **Import plugin from manifest...**
    - Selecione o arquivo `manifest.json` na raiz do projeto.