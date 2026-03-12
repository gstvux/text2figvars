// Tipos baseados no Schema Interno da Spec
type TokenNode = 
  | { name: string; kind: 'BOOLEAN'; value: boolean; description?: string }
  | { name: string; kind: 'FLOAT'; value: number; description?: string }
  | { name: string; kind: 'COLOR'; value: string; rgba: { r: number; g: number; b: number; a: number }; description?: string }
  | { name: string; kind: 'STRING'; value: string; description?: string }
  | { name: string; kind: 'ALIAS'; target: string; description?: string };

figma.showUI(__html__, { width: 400, height: 500 }); // API do figma para UI [cite: 3]

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'PARSE') {
    const { tokens, errors } = parseInput(msg.text);
    if (errors.length > 0) {
      figma.ui.postMessage({ type: 'ERROR', errors });
    } else {
      figma.ui.postMessage({ type: 'PREVIEW_DATA', data: tokens });
    }
  }

  if (msg.type === 'CREATE') {
    const { tokens, errors } = parseInput(msg.text);
    if (errors.length > 0) {
      figma.ui.postMessage({ type: 'ERROR', errors });
      return;
    }

    try {
      await createVariablesInFigma(tokens, msg.collection || 'tokens');
      figma.ui.postMessage({ type: 'SUCCESS', message: 'Variáveis criadas com sucesso!' });
    } catch (err: any) {
      figma.ui.postMessage({ type: 'ERROR', errors: [err.message] });
    }
  }
};

// Fase 1 e 2: Parse e Inferência de Tipos [cite: 16]
function parseInput(text: string): { tokens: TokenNode[], errors: string[] } {
  const lines = text.split('\n');
  const tokens: TokenNode[] = [];
  const errors: string[] = [];
  const namesSeen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Ignora linhas vazias e comentários de linha inteira 
    if (!line || line.startsWith('#')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      errors.push(`Linha ${i + 1}: INVALID_LINE_FORMAT`);
      continue;
    }

    const name = line.substring(0, colonIndex).trim(); // Nome é o path [cite: 8]
    const rawValue = line.substring(colonIndex + 1).trim();

    if (!name) { errors.push(`Linha ${i + 1}: EMPTY_NAME`); continue; }
    if (!rawValue) { errors.push(`Linha ${i + 1}: EMPTY_VALUE`); continue; }
    if (namesSeen.has(name)) { errors.push(`Linha ${i + 1}: DUPLICATE_NAME - ${name}`); continue; }
    
    namesSeen.add(name);

    // Parse de Alias [cite: 22]
    if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
      const inner = rawValue.slice(1, -1).trim();
      
      // Alias expandido vs Alias Curto
      if (inner.includes('alias:')) {
        try {
          // Simplificação de parse para o formato pseudo-JSON do alias expandido
          const aliasMatch = inner.match(/alias:\s*([^,]+)/);
          const descMatch = inner.match(/description:\s*"([^"]+)"/);
          
          if (aliasMatch) {
            tokens.push({
              name,
              kind: 'ALIAS',
              target: aliasMatch[1].trim(),
              description: descMatch ? descMatch[1] : undefined
            });
            continue;
          }
        } catch (e) {
          errors.push(`Linha ${i + 1}: INVALID_ALIAS_OBJECT`);
          continue;
        }
      } else {
        tokens.push({ name, kind: 'ALIAS', target: inner });
        continue;
      }
    }

    // Inferência de Tipos [cite: 6, 8]
    if (rawValue === 'true') {
      tokens.push({ name, kind: 'BOOLEAN', value: true });
    } else if (rawValue === 'false') {
      tokens.push({ name, kind: 'BOOLEAN', value: false });
    } else if (!isNaN(Number(rawValue))) {
      tokens.push({ name, kind: 'FLOAT', value: Number(rawValue) });
    } else if (rawValue.startsWith('#') || rawValue.startsWith('rgb')) {
      // Cores convertidas para RGBA [cite: 13, 31]
      const rgba = parseColorToRGBA(rawValue);
      if (rgba) {
        tokens.push({ name, kind: 'COLOR', value: rawValue, rgba });
      } else {
        errors.push(`Linha ${i + 1}: INVALID_COLOR`);
      }
    } else {
      // Fallback String [cite: 8]
      tokens.push({ name, kind: 'STRING', value: rawValue });
    }
  }

  return { tokens, errors };
}

// Helper básico de cor (Para v1 real usar biblioteca externa se precisar oklch [cite: 25])
function parseColorToRGBA(val: string) {
  if (val.startsWith('#')) {
    let hex = val.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length === 6) hex += 'ff';
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16) / 255,
        g: parseInt(hex.slice(2, 4), 16) / 255,
        b: parseInt(hex.slice(4, 6), 16) / 255,
        a: parseInt(hex.slice(6, 8), 16) / 255
      };
    }
  }
  return null; // Simplificado para o exemplo
}

// Fase 3, 4 e 5: Criação no Figma [cite: 17, 18, 19]
async function createVariablesInFigma(tokens: TokenNode[], collectionName: string) {
  // Política de Collection: Reutilizar ou criar [cite: 19]
  let collection = figma.variables.getLocalVariableCollections().find(c => c.name === collectionName);
  if (!collection) {
    collection = figma.variables.createVariableCollection(collectionName);
  }

  const defaultModeId = collection.modes[0].modeId; // Sempre usar default mode existente [cite: 19]
  const createdVariables = new Map<string, Variable>();

  // Verificação de conflito: NAME_ALREADY_EXISTS_IN_COLLECTION [cite: 20]
  const existingVars = figma.variables.getLocalVariables().filter(v => v.variableCollectionId === collection!.id);
  for (const token of tokens) {
    if (existingVars.some(v => v.name === token.name)) {
      throw new Error(`NAME_ALREADY_EXISTS_IN_COLLECTION: ${token.name}`);
    }
  }

  // Criar variáveis literais primeiro [cite: 17]
  for (const token of tokens) {
    if (token.kind !== 'ALIAS') {
      const figmaType = token.kind === 'BOOLEAN' ? 'BOOLEAN' : token.kind === 'FLOAT' ? 'FLOAT' : token.kind === 'COLOR' ? 'COLOR' : 'STRING';
      const figmaVar = figma.variables.createVariable(token.name, collection.id, figmaType);
      
      const val = token.kind === 'COLOR' ? token.rgba : token.value;
      figmaVar.setValueForMode(defaultModeId, val);
      
      if (token.description) figmaVar.description = token.description;
      
      createdVariables.set(token.name, figmaVar);
    }
  }

  // Aplicar Aliases depois que todas as variáveis existirem [cite: 18]
  for (const token of tokens) {
    if (token.kind === 'ALIAS') {
      const targetVar = createdVariables.get(token.target);
      if (!targetVar) {
         throw new Error(`ALIAS_TARGET_NOT_FOUND: ${token.target}`); // [cite: 21]
      }

      // No figma alias não é um tipo, ele referencia outra variável [cite: 3]
      const figmaVar = figma.variables.createVariable(token.name, collection.id, targetVar.resolvedType);
      figmaVar.setValueForMode(defaultModeId, figma.variables.createVariableAlias(targetVar));
      
      if (token.description) figmaVar.description = token.description;
      
      createdVariables.set(token.name, figmaVar);
    }
  }
}