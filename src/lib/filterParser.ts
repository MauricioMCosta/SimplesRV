export interface Token {
  type: 'IDENTIFIER' | 'COLUMN_IDENTIFIER' | 'LITERAL' | 'OPERATOR' | 'AND' | 'OR' | 'LPAREN' | 'RPAREN' | 'EOF';
  value: string;
}

export type ASTNode =
  | { type: 'LOGICAL'; operator: 'AND' | 'OR'; left: ASTNode; right: ASTNode }
  | { type: 'COMPARISON'; operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | '~'; identifier: string; value: string | number | boolean; isColumn?: boolean }
  | { type: 'EMPTY' };

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Check multi-character operators: >=, <=, !=
    if (input.startsWith('>=', i)) {
      tokens.push({ type: 'OPERATOR', value: '>=' });
      i += 2;
      continue;
    }
    if (input.startsWith('<=', i)) {
      tokens.push({ type: 'OPERATOR', value: '<=' });
      i += 2;
      continue;
    }
    if (input.startsWith('!=', i)) {
      tokens.push({ type: 'OPERATOR', value: '!=' });
      i += 2;
      continue;
    }

    // Single character operators: =, >, <, ~
    if (char === '=' || char === '>' || char === '<' || char === '~') {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
      continue;
    }

    // Column identifiers, e.g. :tipo:
    if (char === ':') {
      let val = '';
      i++; // skip first colon
      while (i < input.length && input[i] !== ':') {
        if (input[i] === '\\') {
          i++; // skip backslash if any
        }
        if (i < input.length) {
          val += input[i];
          i++;
        }
      }
      if (i < input.length) {
        i++; // skip closing colon
      }
      tokens.push({ type: 'COLUMN_IDENTIFIER', value: val });
      continue;
    }

    // String literals
    if (char === "'" || char === '"') {
      const quote = char;
      let val = '';
      i++; // skip quote
      while (i < input.length && input[i] !== quote) {
        if (input[i] === '\\') {
          i++; // skip backslash
        }
        if (i < input.length) {
          val += input[i];
          i++;
        }
      }
      if (i < input.length) {
        i++; // skip closing quote
      }
      tokens.push({ type: 'LITERAL', value: val });
      continue;
    }

    // Numeric literals
    if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(input[i + 1] || ''))) {
      let val = char;
      i++;
      while (i < input.length && /[0-9.]/.test(input[i])) {
        val += input[i];
        i++;
      }
      tokens.push({ type: 'LITERAL', value: val });
      continue;
    }

    // Identifiers and keywords (AND, OR, true, false)
    if (/[a-zA-Z_]/.test(char)) {
      let val = char;
      i++;
      while (i < input.length && /[a-zA-Z0-9_.]/.test(input[i])) {
        val += input[i];
        i++;
      }

      const upperVal = val.toUpperCase();
      if (upperVal === 'AND') {
        tokens.push({ type: 'AND', value: 'AND' });
      } else if (upperVal === 'OR') {
        tokens.push({ type: 'OR', value: 'OR' });
      } else {
        tokens.push({ type: 'IDENTIFIER', value: val });
      }
      continue;
    }

    // fallback for unknown characters
    i++;
  }

  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

export class FilterParser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private match(types: Token['type'][]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: Token['type']): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private consume(type: Token['type'], message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(message);
  }

  public parse(): ASTNode {
    if (this.tokens.length === 0 || this.tokens[0].type === 'EOF') {
      return { type: 'EMPTY' };
    }
    return this.expression();
  }

  // Expression -> Term { OR Term }
  private expression(): ASTNode {
    let expr = this.term();

    while (this.match(['OR'])) {
      const right = this.term();
      expr = {
        type: 'LOGICAL',
        operator: 'OR',
        left: expr,
        right: right
      };
    }

    return expr;
  }

  // Term -> Factor { AND Factor }
  private term(): ASTNode {
    let expr = this.factor();

    while (this.match(['AND'])) {
      const right = this.factor();
      expr = {
        type: 'LOGICAL',
        operator: 'AND',
        left: expr,
        right: right
      };
    }

    return expr;
  }

  // Factor -> Primary
  private factor(): ASTNode {
    return this.primary();
  }

  // Primary -> LPAREN Expression RPAREN | Comparison
  private primary(): ASTNode {
    if (this.match(['LPAREN'])) {
      const expr = this.expression();
      this.consume('RPAREN', "Espera-se ')' após a expressão.");
      return expr;
    }

    return this.comparison();
  }

  // Comparison -> (IDENTIFIER | COLUMN_IDENTIFIER) OPERATOR LITERAL
  private comparison(): ASTNode {
    const isColumn = this.check('COLUMN_IDENTIFIER');
    const identifierToken = this.match(['COLUMN_IDENTIFIER'])
      ? this.previous()
      : this.consume('IDENTIFIER', "Espera-se um identificador ou :coluna:.");
    const operatorToken = this.consume('OPERATOR', "Espera-se um operador de comparação (=, !=, >, <, >=, <=, ~).");

    let value: string | number | boolean = '';
    if (this.match(['LITERAL'])) {
      const val = this.previous().value;
      if (!isNaN(Number(val)) && val.trim() !== '') {
        value = Number(val);
      } else if (val === 'true') {
        value = true;
      } else if (val === 'false') {
        value = false;
      } else {
        value = val;
      }
    } else if (this.match(['IDENTIFIER'])) {
      const val = this.previous().value;
      if (val === 'true') value = true;
      else if (val === 'false') value = false;
      else value = val;
    } else if (this.match(['COLUMN_IDENTIFIER'])) {
      const val = this.previous().value;
      value = val;
    } else {
      throw new Error("Espera-se um valor literal, identificador ou :coluna: após o operador.");
    }

    return {
      type: 'COMPARISON',
      operator: operatorToken.value as any,
      identifier: identifierToken.value,
      value: value,
      isColumn: isColumn
    };
  }
}

function getNestedValue(obj: any, path: string): any {
  if (!obj) return undefined;
  let val = path.split('.').reduce((acc, part) => acc && acc[part], obj);
  if (val === undefined && obj.data !== undefined) {
    val = path.split('.').reduce((acc, part) => acc && acc[part], obj.data);
  }
  return val;
}

function matchLike(value: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexStr = '^' + escaped.replace(/\*/g, '.*') + '$';
  const regex = new RegExp(regexStr, 'i');
  return regex.test(value);
}

export function evaluateAST(node: ASTNode, item: any, columns?: any): boolean {
  if (node.type === 'EMPTY') return true;

  if (node.type === 'LOGICAL') {
    if (node.operator === 'AND') {
      return evaluateAST(node.left, item, columns) && evaluateAST(node.right, item, columns);
    } else {
      return evaluateAST(node.left, item, columns) || evaluateAST(node.right, item, columns);
    }
  }

  if (node.type === 'COMPARISON') {
    let resolvedIdentifier = node.identifier;
    if (node.isColumn && columns) {
      const targetLabel = node.identifier.toLowerCase().trim();
      for (const key of Object.keys(columns)) {
        const colObj = columns[key];
        const label = typeof colObj === 'string' ? colObj : colObj.label;
        if (label && label.toLowerCase().trim() === targetLabel) {
          resolvedIdentifier = key;
          break;
        }
      }
    }

    const itemVal = getNestedValue(item, resolvedIdentifier);
    const filterVal = node.value;

    if (itemVal === undefined || itemVal === null) return false;

    const op = node.operator;

    if (op === '~') {
      return matchLike(String(itemVal), String(filterVal));
    }

    if (typeof filterVal === 'number') {
      const numItemVal = Number(itemVal);
      if (isNaN(numItemVal)) return false;

      switch (op) {
        case '=': return numItemVal === filterVal;
        case '!=': return numItemVal !== filterVal;
        case '>': return numItemVal > filterVal;
        case '<': return numItemVal < filterVal;
        case '>=': return numItemVal >= filterVal;
        case '<=': return numItemVal <= filterVal;
        default: return false;
      }
    }

    if (typeof filterVal === 'boolean') {
      const boolItemVal = itemVal === true || String(itemVal).toLowerCase() === 'true';
      switch (op) {
        case '=': return boolItemVal === filterVal;
        case '!=': return boolItemVal !== filterVal;
        default: return false;
      }
    }

    const strItemVal = String(itemVal).toLowerCase();
    const strFilterVal = String(filterVal).toLowerCase();

    switch (op) {
      case '=': return strItemVal === strFilterVal;
      case '!=': return strItemVal !== strFilterVal;
      case '>': return strItemVal > strFilterVal;
      case '<': return strItemVal < strFilterVal;
      case '>=': return strItemVal >= strFilterVal;
      case '<=': return strItemVal <= strFilterVal;
      default: return false;
    }
  }

  return true;
}

export function filterAST(filterStr: string): ASTNode {
  try {
    const tokens = tokenize(filterStr);
    const parser = new FilterParser(tokens);
    return parser.parse();
  } catch (err) {
    console.warn("Parse filter error:", err);
    return { type: 'EMPTY' };
  }
}

export function filter(data: any[], filterStrOrNode: string | ASTNode, columns?: any): any[] {
  let node: ASTNode;
  if (typeof filterStrOrNode === 'string') {
    node = filterAST(filterStrOrNode);
  } else {
    node = filterStrOrNode;
  }
  return data.filter(item => evaluateAST(node, item, columns));
}
