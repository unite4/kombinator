import { VueElementFinder } from "./VueElementFinder";

export class VueModifyTemplate extends VueElementFinder {
  public fromTemplate(template: string): VueModifyTemplate {
    super.fromTemplate(template);
    return this;
  }

  public findByTag(tagName: string): VueModifyTemplate {
    super.findByTag(tagName);
    return this;
  }

  public findByAttribute(name: string): VueModifyTemplate {
    super.findByAttribute(name);
    return this;
  }

  public findByAttributeValue(name: string, value: string): VueModifyTemplate {
    super.findByAttributeValue(name, value);
    return this;
  }

  public findFirst(): VueModifyTemplate {
    super.findFirst();
    return this;
  }

  public removeElement(): VueModifyTemplate {
    const { element } = this.findElement(this.modifiedCode);
    if (element.closingTagEndIndex) {
      this.modifiedCode = this.modifiedCode.slice(0, element.startIndex) + this.modifiedCode.slice(element.closingTagEndIndex);
    } else {
      this.modifiedCode = this.modifiedCode.slice(0, element.startIndex) + this.modifiedCode.slice(element.endIndex);
    }
    return this;
  }

  public renameElement(newTagName: string): VueModifyTemplate {
    const { element } = this.findElement(this.modifiedCode);
    const tagNameStartIndex = element.startIndex!;
    const tagNameEndIndex = element.tagNameEndIndex!;
    const newTag = `<${newTagName}`;    
    this.modifiedCode = `${this.modifiedCode.slice(0, tagNameStartIndex)}${newTag}${this.modifiedCode.slice(tagNameEndIndex)}`;
    if(element.closingTagEndIndex) {
      const lengthDiff = newTagName.length - element.tagNameEndIndex! + 1;
      const closingTagStartIndex = element.closingTagStartIndex! + lengthDiff;
      const closingTagEndIndex = element.closingTagEndIndex! + lengthDiff;
      const closingTag = `</${newTagName}>`;
      this.modifiedCode = `${this.modifiedCode.slice(0, closingTagStartIndex)}${closingTag}${this.modifiedCode.slice(closingTagEndIndex)}`;
    }
    return this;  
  }  

  private insertHtml(html: string, before: boolean): VueModifyTemplate {
    const { element } = this.findElement(this.modifiedCode);
    const index = before ? element.startIndex : element.closingTagEndIndex ?? element.endIndex;
    this.modifiedCode = `${this.modifiedCode.slice(0, index)}${html}${this.modifiedCode.slice(index)}`;
    return this;
  }

  public insertBefore(html: string): VueModifyTemplate {
    return this.insertHtml(html, true);
  }

  public insertAfter(html: string): VueModifyTemplate {
    return this.insertHtml(html, false);
  }

  public unwrap(): VueModifyTemplate {
    const { element } = this.findElement(this.modifiedCode);

    if (!element.closingTagStartIndex) {
      // Element is not wrapping -> remove it
      this.removeElement();
      return this;
    }

    const innerHTMLStart = element.endIndex;
    const innerHTMLEnd = element.closingTagStartIndex;

    const beforeInnerHTML = this.modifiedCode.slice(0, element.startIndex);
    const afterInnerHTML = this.modifiedCode.slice(element.closingTagEndIndex);

    this.modifiedCode = `${beforeInnerHTML}${this.modifiedCode.slice(innerHTMLStart, innerHTMLEnd)}${afterInnerHTML}`;
    return this;
  }

  public getElementCode(): string {
    const { element } = this.findElement(this.modifiedCode);
    return this.modifiedCode.slice(element.startIndex, element.closingTagEndIndex ?? element.endIndex);
  }

  public insertInside(html: string): VueModifyTemplate {
    const { element } = this.findElement(this.modifiedCode);
    if (!element.closingTagStartIndex) {
      throw new Error('insertInside does not support self closing tags');
    }
    this.modifiedCode = `${this.modifiedCode.slice(0, element.closingTagStartIndex)}${html}${this.modifiedCode.slice(element.closingTagStartIndex)}`;
    return this;
  }  
}
