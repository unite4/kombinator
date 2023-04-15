type FindByOptions = {
  tagName?: string;
  attributeName?: string;
  attributeValue?: string;
};

export abstract class VueElementFinder {
  protected findBy = '';
  protected findByOptions: FindByOptions | null = null;
  protected template = '';
  protected modifiedCode = '';

  protected findElement(code: string): { element: { startIndex: number; endIndex: number } } {
    let element: { startIndex: number; endIndex: number } | null = null;
    if (this.findBy === 'tagName') {
      element = this.findElementByTag(code, element);
    } else if (this.findBy === 'attributeValue') {
      element = this.findElementByAttributeValue(code, element);
    } else if (this.findBy === 'attribute') {
      element = this.findElementByAttribute(code, element);
    } else {
      throw new Error('Invalid find options.');
    }
    if (!element) {
      throw new Error('Failed to find element in template.');
    }
    return { element };
  }

  private findElementByTag(code: string, element: { startIndex: number; endIndex: number; } | null) {
    if(!this.findByOptions?.tagName) {
      throw new Error('Invalid find options.');
    }
    const tagName = this.findByOptions.tagName;
    const regexp = new RegExp(`<${tagName}(?:\\s|\/?>)`);
    const startIndexMatch = code.match(regexp);
    if (startIndexMatch?.index !== undefined) {
      const endIndexMatch = code.slice(startIndexMatch.index).match(/>/);
      if (endIndexMatch?.index !== undefined) {
        const startIndex = startIndexMatch.index;
        const endIndex = startIndexMatch.index + endIndexMatch.index + 1;
        element = { startIndex, endIndex };
      }
    }
    return element;
  }

  private findElementByAttribute(code: string, element: { startIndex: number; endIndex: number; } | null) {
    if(!this.findByOptions?.attributeName) {
      throw new Error('Invalid find options.');
    }
    const attributeName = this.findByOptions.attributeName;
    const regexp = new RegExp(`<[^>]*\\s${attributeName}(?:\\s*=\\s*['"][^'"]*['"])?[^>]*>`);
    const match = code.match(regexp);
    if (match?.index !== undefined) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;
      element = { startIndex, endIndex };
    }
    return element;
  }

  private findElementByAttributeValue(code: string, element: { startIndex: number; endIndex: number; } | null) {
    if(!this.findByOptions?.attributeName || !this.findByOptions?.attributeValue) {
      throw new Error('Invalid find options.');
    }
    const attributeName = this.findByOptions.attributeName;
    const attributeValue = this.findByOptions.attributeValue;
    const regexp = new RegExp(`<[^>]*\\s${attributeName}\\s*=\\s*"${attributeValue}"[^>]*>`);
    const match = code.match(regexp);
    if (match?.index !== undefined) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;
      element = { startIndex, endIndex };
    }
    return element;
  }

  public fromTemplate(template: string): VueElementFinder {
    this.template = template;
    this.modifiedCode = template;
    return this;
  }

  public findByTag(tagName: string): VueElementFinder {
    this.findBy = 'tagName';
    this.findByOptions = { tagName };
    return this;
  }

  public findByAttribute(name: string): VueElementFinder {
    this.findBy = 'attribute';
    this.findByOptions = { attributeName: name };
    return this;
  }

  public findByAttributeValue(name: string, value: string): VueElementFinder {
    this.findBy = 'attributeValue';
    this.findByOptions = { attributeName: name, attributeValue: value };
    return this;
  }

  public findFirst(): VueElementFinder {
    this.findBy = 'tagName';
    this.findByOptions = {};
    const code = this.modifiedCode;
    const firstTemplateMatch = code.match(/<template[^>]*>/);
    if (firstTemplateMatch) {
      const templateStartIndex = firstTemplateMatch.index! + firstTemplateMatch[0].length;
      const templateEndMatch = code.slice(templateStartIndex).match(/<\/template>/);
      if (templateEndMatch) {
        const templateEndIndex = templateStartIndex + templateEndMatch.index!;
        const templateCode = code.slice(templateStartIndex, templateEndIndex);
        const tagMatch = templateCode.match(/<([^>\s/]+)/);
        if (tagMatch) {
          this.findByOptions = { tagName: tagMatch[1] };
        }
      }
    } else {
      const tagMatch = code.match(/<([^>\s/]+)/);
      if (tagMatch) {
        this.findByOptions = { tagName: tagMatch[1] };
      }
    }
    return this;
  }  

  public getTemplate(): string {
    if (this.template == this.modifiedCode) {
      this.findElement(this.template); // Used only to throw selector errrors used in tests
    }
    return this.modifiedCode;
  }
}
