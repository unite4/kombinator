import { VueElementFinder } from "./VueElementFinder";

export class VueModifyAttributes extends VueElementFinder {
  public fromTemplate(template: string): VueModifyAttributes {
    super.fromTemplate(template);
    return this;
  }

  public findByTag(tagName: string): VueModifyAttributes {
    super.findByTag(tagName);
    return this;
  }

  public findByAttribute(name: string): VueModifyAttributes {
    super.findByAttribute(name);
    return this;
  }

  public findByAttributeValue(name: string, value: string): VueModifyAttributes {
    super.findByAttributeValue(name,value);
    return this;
  }

  public findFirst(): VueModifyAttributes {
    super.findFirst()
    return this;
  }  

  public removeAttribute(name: string): VueModifyAttributes {
    const { element } = this.findElement(this.modifiedCode);
    const modifiedElement = this.modifiedCode.slice(element.startIndex, element.endIndex).replace(new RegExp(` ${name}="([^"]*)?"`, 'g'), '').trim();
    this.modifiedCode = this.modifiedCode.slice(0, element.startIndex) + modifiedElement + this.modifiedCode.slice(element.endIndex);
    return this;
  }
  
  public reduceAttribute(name: string, value: string): VueModifyAttributes {    
    const { element } = this.findElement(this.modifiedCode);
    let modifiedElement = this.modifiedCode.slice(element.startIndex, element.endIndex);
    modifiedElement = modifiedElement.replace(new RegExp(` ${name}="([^"]*)"?`, 'g'), (match, p1) => {
      const newValue = p1.replace(value, '').trim();
      return newValue ? ` ${name}="${newValue}"` : '';
    }).trim();
    this.modifiedCode = this.modifiedCode.slice(0, element.startIndex) + modifiedElement + this.modifiedCode.slice(element.endIndex);
  
    return this;
  }

  public regexpAttribute(name: string, regexp: RegExp, replace: string): VueModifyAttributes {
    const { element } = this.findElement(this.modifiedCode);
    let modifiedElement = this.modifiedCode.slice(element.startIndex, element.endIndex);
    modifiedElement = modifiedElement.replace(new RegExp(` ${name}="([^"]*)"?`), (match, p1) => {
      if (!p1) {
        throw new Error(`Attribute "${name}" does not exist.`);
      }
      return ` ${name}="${p1.replace(regexp, replace)}"`;
    }).trim();
    this.modifiedCode = this.modifiedCode.slice(0, element.startIndex) + modifiedElement + this.modifiedCode.slice(element.endIndex);
    return this;
  }

  public extendAttribute(name: string, value: string, glue = ' '): VueModifyAttributes {
    const { element } = this.findElement(this.modifiedCode);
    let modifiedElement = this.modifiedCode.slice(element.startIndex, element.endIndex);
    modifiedElement = modifiedElement.replace(new RegExp(` ${name}="([^"]*)"?`, 'g'), (match, p1) => {
      const newValue = p1 ? `${p1.trim()}${glue}${value.trim()}` : value.trim();
      return ` ${name}="${newValue}"`;
    }).trim();
    if (!modifiedElement.includes(name)) {
      const newAttribute = ` ${name}="${value.trim()}"`;
      const isSelfClosing = modifiedElement.endsWith('/>');
      const indexOfClosingBracket = modifiedElement.lastIndexOf('>');
      if (isSelfClosing) {
        modifiedElement = `${modifiedElement.slice(0, -2)}${newAttribute}/>`;
      } else {
        modifiedElement = `${modifiedElement.slice(0, indexOfClosingBracket)}${newAttribute}${modifiedElement.slice(indexOfClosingBracket)}`;
      }
    }
    this.modifiedCode = this.modifiedCode.slice(0, element.startIndex) + modifiedElement + this.modifiedCode.slice(element.endIndex);
    return this;
  }  
  
  public setAttribute(name: string, value: string): VueModifyAttributes {
    const { element } = this.findElement(this.modifiedCode);
    let modifiedElement = this.modifiedCode.slice(element.startIndex, element.endIndex);
    const existingAttributeRegex = new RegExp(`\\s${name}="[^"]*"`);
    if (existingAttributeRegex.test(modifiedElement)) {
      modifiedElement = modifiedElement.replace(existingAttributeRegex, ` ${name}="${value}"`);
    } else {
      modifiedElement = modifiedElement.replace(/(\/?>)$/, ` ${name}="${value}"$1`);
    }
    this.modifiedCode = this.modifiedCode.slice(0, element.startIndex) + modifiedElement + this.modifiedCode.slice(element.endIndex);
    return this;
  }
    
}

export default function attr() {
  return new VueModifyAttributes();
}


