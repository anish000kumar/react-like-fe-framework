/**
 * node - "<" text (attribute)* ">"  node | primitive* "</" text ">" | text
 * primitive - text | self_tag | node*
 * self_tag - "<"text (attribute)* "/>"
 */

export function tokenize(str) {
  return str.replaceAll("\n", " ").replaceAll("\t", " ").replaceAll("\r", " ");
}

export function el(tageName, properties, children) {
  return {
    tageName,
    properties,
    children,
  };
}

export class Parser {
  current = 0;
  tokens = "";

  constructor(tokens) {
    this.tokens = tokens;
    console.log(tokens);
  }

  parse() {
    return this.nodes();
  }

  nodes() {
    const nodes = [];
    while (!this.isAtEnd()) {
      nodes.push(this.node());
    }
    return nodes;
  }

  node() {
    this.eatSpaces();
    if (this.matchToken("<")) {
      const tagName = this.advanceBy("[a-zA-Z]+");
      const attributes = {};
      let children = null;

      while (this.peek() !== ">") {
        // console.log("at >>", this.current, this.peek());
        this.eatSpaces();
        const attributeName = this.advanceBy("[a-zA-Z]+");
        this.eatSpaces();
        this.consume("=");
        const quote = this.consume('"', "'");
        const attributeValue = this.advanceBy("[a-zA-Z]+");
        const endQuote = this.consume('"', "'");
        if (quote !== endQuote) {
          throw new Error(
            `Not matching quote end. Expected quote: ${quote} but got; ${endQuote}`
          );
        }
        attributes[attributeName] = attributeValue;
        this.eatSpaces();
        // console.log("at >>>", this.current, this.peek());
      }

      this.consume(">");

      this.eatSpaces();

      if (this.matchToken("</")) {
        this.eatSpaces();
        const closingTagName = this.advanceBy("\\w+");
        if (closingTagName !== tagName) {
          throw new Error("tag not closed properly:", tagName);
        }
        this.consume(">");
      } else if (this.peek() === "<") {
        children = this.nodes();
      } else {
        children = this.text();
      }
      return el(tagName, attributes, children);
    }
    return this.text();
  }

  text() {
    this.eatSpaces();
    const text = this.advanceBy("[a-zA-Z0-9 ,\\.&\n]+");
    this.eatSpaces();
    return el("TEXTNODE", {}, text);
  }

  eatSpaces() {
    while (this.peek() === " ") {
      this.advance();
    }
  }

  advanceBy(regex) {
    const str = this.tokens.substring(this.current);
    const match = str.match(regex);
    if (match && match[0]) {
      this.current += match[0].length;
    }
    return match[0];
  }

  consume(token) {
    if (this.peek() !== token) {
      // debugger;
      throw new Error(`expected token at ${this.current}: ${token}`);
    }
    return this.advance();
  }

  advance() {
    if (this.isAtEnd()) return null;
    const curr = this.peek();
    this.current++;
    return curr;
  }

  matchToken(token) {
    // debugger;
    if (
      token === this.tokens.substring(this.current, this.current + token.length)
    ) {
      this.current = this.current + token.length;
      return true;
    }
    return false;
  }

  isAtEnd() {
    return this.current >= this.tokens.length;
  }

  peek() {
    return this.tokens[this.current] ?? null;
  }

  previous() {
    return this.tokens[this.current - 1] ?? null;
  }
}
