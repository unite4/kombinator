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

  public remove(): VueModifyTemplate {
    const { element } = this.findElement(this.modifiedCode);
    if (element.closingTagEndIndex) {
      this.modifiedCode = this.modifiedCode.slice(0, element.startIndex) + this.modifiedCode.slice(element.closingTagEndIndex);
    } else {
      this.modifiedCode = this.modifiedCode.slice(0, element.startIndex) + this.modifiedCode.slice(element.endIndex);
    }
    return this;
  }

  private insertHtml(html: string, before: boolean): VueModifyTemplate {
    const { element } = this.findElement(this.modifiedCode);
    const index = before ? element.startIndex : element.closingTagEndIndex;
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
      this.remove();
      return this;
    }

    const innerHTMLStart = element.endIndex;
    const innerHTMLEnd = element.closingTagStartIndex;

    const beforeInnerHTML = this.modifiedCode.slice(0, element.startIndex);
    const afterInnerHTML = this.modifiedCode.slice(element.closingTagEndIndex);

    this.modifiedCode = `${beforeInnerHTML}${this.modifiedCode.slice(innerHTMLStart, innerHTMLEnd)}${afterInnerHTML}`;
    return this;
  }
}
