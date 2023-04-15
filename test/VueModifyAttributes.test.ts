import attr, { VueModifyAttributes } from '../src/VueModifyAttributes';

describe('VueModifyAttributes', () => {
  describe('findByTag', () => {
    it('finds an element by tag name', () => {
      const template = '<div class="foo"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByTag('div').getTemplate();
      expect(result).toEqual(template);
    });
  
    it('finds an self closing component by tag name', () => {
      const template = '<div><comp/></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByTag('comp').getTemplate();
      expect(result).toEqual(template);
    });

    it('finds the first occurrence of an element by tag name', () => {
      const template = '<div class="foo"></div><div class="foo"></div>';
      const expected = '<div class="foo bar"></div><div class="foo"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByTag('div').extendAttribute('class', 'bar').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('throws an error if no elements match the tag name', () => {
      const template = '<div class="foo"></div>';
      expect(() => new VueModifyAttributes().fromTemplate(template).findByTag('span').getTemplate()).toThrowError('Failed to find element in template.');
    });
  
  });

  describe('findByAttribute', () => {
    it('finds an element by attribute name', () => {
      const template = '<div class="foo"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('class').getTemplate();
      expect(result).toEqual(template);
    });

    it('finds an element by attribute name with no value', () => {
      const template = '<div class="foo" data-qa-info></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('data-qa-info').getTemplate();
      expect(result).toEqual(template);
    });
  
    it('finds the first occurrence of an element by attribute name', () => {
      const template = '<div class="foo"></div><div class="foo"></div>';
      const expected = '<div class="foo bar"></div><div class="foo"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('class').extendAttribute('class', 'bar').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('throws an error if no elements have the attribute', () => {
      const template = '<div></div>';
      expect(() => new VueModifyAttributes().fromTemplate(template).findByAttribute('class').getTemplate()).toThrowError('Failed to find element in template.');
    });

    it('throws an error if only partially matched', () => {
      const template = '<div data-attr-foo-bar></div>';
      expect(() => new VueModifyAttributes().fromTemplate(template).findByAttribute('class').getTemplate()).toThrowError('Failed to find element in template.');
    });

  });
  
  describe('findByAttributeValue', () => {
    it('finds an element by attribute value', () => {
      const template = '<some-component data-for="money"></some-component>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttributeValue('data-for', 'money').getTemplate();
      expect(result).toEqual(template);
    });
  
    it('finds an element by attribute value with extra spaces', () => {
      const template = '<some-component data-for = "money"></some-component>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttributeValue('data-for', 'money').getTemplate();
      expect(result).toEqual(template);
    });
  
    it('finds the first element with the matching attribute value', () => {
      const template = '<some-component data-for="money"></some-component><some-component data-for="money"></some-component>';
      const expected = '<some-component data-for="fun"></some-component><some-component data-for="money"></some-component>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttributeValue('data-for', 'money').setAttribute('data-for','fun').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('throws an error when the attribute value does not exist', () => {
      const template = '<some-component data-for></some-component>';
      expect(() => {
        new VueModifyAttributes().fromTemplate(template).findByAttributeValue('data-for', 'money').getTemplate();
      }).toThrowError('Failed to find element in template.');
    });
  
    it('throws an error when the attribute value matches only partially', () => {
      const template = '<some-component data-for="money"></some-component>';
      expect(() => {
        new VueModifyAttributes().fromTemplate(template).findByAttributeValue('data-for', 'mo').getTemplate();
      }).toThrowError('Failed to find element in template.');
    });

    it('throws an error when the attribute name does not exist', () => {
      const template = '<some-component data-for="money"></some-component>';
      expect(() => {
        new VueModifyAttributes().fromTemplate(template).findByAttributeValue('invalid', 'money').getTemplate();
      }).toThrowError('Failed to find element in template.');
    });
  });
  
  describe('findFirst', () => {
    it('should find the first tag in the template', () => {
      const template = '<div><span></span></div>';
      const expected = '<div id="foo"><span></span></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findFirst().setAttribute('id', 'foo').getTemplate();
      expect(result).toBe(expected);
    });

    it('should find the first tag in the template, but not <template>', () => {
      const template = '<template><div><span></span></div></template>';
      const expected = '<template><div id="foo"><span></span></div></template>';
      const result = new VueModifyAttributes().fromTemplate(template).findFirst().setAttribute('id', 'foo').getTemplate();
      expect(result).toBe(expected);
    });

    it('should find the first tag in the template if it is self closing', () => {
      const template = '<component/>';
      const expected = '<component id="foo"/>';
      const result = new VueModifyAttributes().fromTemplate(template).findFirst().setAttribute('id', 'foo').getTemplate();
      expect(result).toBe(expected);
    });
  });
  
  describe('extendAttribute', () => {
    const template = '<template><div id="test" class="old-class"></div></template>';

    test('should extend attribute with space glue', () => {
      const expected = '<template><div id="test" class="old-class new-class"></div></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('div')
        .extendAttribute('class', 'new-class')
        .getTemplate();
      expect(result).toBe(expected);
    });

    test('should extend attribute with custom glue', () => {
      const expected = '<template><div id="test" class="old-class xD new-class"></div></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('div')
        .extendAttribute('class', 'new-class', ' xD ')
        .getTemplate();
      expect(result).toBe(expected);
    });

    test('should add attribute if it does not exist', () => {
      const expected = '<template><div id="test" class="old-class" data-why="test"></div></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('div')
        .extendAttribute('data-why', 'test')
        .getTemplate();
      expect(result).toBe(expected);
    });

    test('should whork independent from finding method', () => {
      const expected = '<template><div id="test" class="old-class" data-why="test"></div></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByAttributeValue('id', 'test')
        .extendAttribute('data-why', 'test')
        .getTemplate();
      expect(result).toBe(expected);
      const result2 = new VueModifyAttributes()
        .fromTemplate(template)
        .findByAttribute('id')
        .extendAttribute('data-why', 'test')
        .getTemplate();
      expect(result2).toBe(expected);
    });

    test('should chain modifications', () => {
      const expected = '<template><div id="test" class="old-class a b"></div></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('div')
        .extendAttribute('class', 'a')
        .extendAttribute('class', 'b')
        .getTemplate();
      expect(result).toBe(expected);
    });

    test('should work with vue attributes and components', () => {
      const template = '<template><nice-one id="test" :class="old-class" @click="go">OK</nice-one></template>';
      const expected = '<template><nice-one id="test" :class="old-class new-class" @click="go" @look="scare()">OK</nice-one></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('nice-one')
        .extendAttribute(':class', 'new-class')
        .extendAttribute('@look', 'scare()')
        // .extendAttribute('v-if', 'nice')
        .getTemplate();
      expect(result).toBe(expected);
    });

    test('should work with single component', () => {
      const template = '<template><nice-one></nice-one></template>';
      const expected = '<template><nice-one :class="new-class"></nice-one></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('nice-one')
        .extendAttribute(':class', 'new-class')
        .getTemplate();
      expect(result).toBe(expected);
    });

    test('should work with deep structure', () => {
      const template = '<template><nice-one><div><other/><br/></div></nice-one></template>';
      const expected = '<template><nice-one><div><other :class="new-class"/><br/></div></nice-one></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('other')
        .extendAttribute(':class', 'new-class')
        .getTemplate();
      expect(result).toBe(expected);
    });

    test('should work with single tag', () => {
      const template = '<template><div></div></template>';
      const expected = '<template><div class="new-class"></div></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('div')
        .extendAttribute('class', 'new-class')
        .getTemplate();
      expect(result).toBe(expected);
    });

    test('should work with self closing tag', () => {
      const template = '<template><nice-one/></template>';
      const expected = '<template><nice-one :class="new-class"/></template>';
      const result = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('nice-one')
        .extendAttribute(':class', 'new-class')
        .getTemplate();
      expect(result).toBe(expected);
    });
  });

  describe('setAttribute', () => {
    it('replaces the value of an existing attribute', () => {
      const template = '<div class="foo" id="bar"></div>';
      const expected = '<div class="foo" id="baz"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('id').setAttribute('id', 'baz').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('adds a new attribute if it does not already exist', () => {
      const template = '<div class="foo"></div>';
      const expected = '<div class="foo" id="bar"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByTag('div').setAttribute('id', 'bar').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('does not modify the template if the attribute value is already set to the new value', () => {
      const template = '<div class="foo" id="bar"></div>';
      const expected = '<div class="foo" id="bar"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('id').setAttribute('id', 'bar').getTemplate();
      expect(result).toEqual(expected);
    });

    it('adds a new attribute to a self-closing tag', () => {
      const template = '<input type="text"/>';
      const expected = '<input type="text" id="foo"/>';
      const result = new VueModifyAttributes().fromTemplate(template).findByTag('input').setAttribute('id', 'foo').getTemplate();
      expect(result).toEqual(expected);
    });

    it('should set the value of an existing attribute in a multiline template', () => {
      const template = `
        <div
          class="my-class"
          data-testid="my-test-id"
        >
          <p
            id="my-id"
            data-value="old value"
          >
            This is a paragraph.
          </p>
        </div>
      `.trim();
      const expectedOutput = `
        <div
          class="my-class"
          data-testid="my-test-id"
        >
          <p
            id="my-id"
            data-value="new value"
          >
            This is a paragraph.
          </p>
        </div>
      `.trim();
      const actualOutput = new VueModifyAttributes()
        .fromTemplate(template)
        .findByTag('p')
        .setAttribute('data-value', 'new value')
        .getTemplate();

      expect(actualOutput).toBe(expectedOutput);
    });
  });
  
  describe('reduceAttribute', () => {
    it('reduces the value of an existing attribute', () => {
      const template = '<div class="foo bar"></div>';
      const expected = '<div class="foo"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('class').reduceAttribute('class', 'bar').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('removes the attribute if its value is reduced to an empty string', () => {
      const template = '<div class="foo"></div>';
      const expected = '<div></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('class').reduceAttribute('class', 'foo').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('ignores whitespace in the attribute value', () => {
      const template = '<div class="foo   bar   baz"></div>';
      const expected = '<div class="foo      baz"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('class').reduceAttribute('class', 'bar').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('does not modify the template if the attribute value does not contain the value to be reduced', () => {
      const template = '<div class="foo"></div>';
      const expected = '<div class="foo"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('class').reduceAttribute('class', 'bar').getTemplate();
      expect(result).toEqual(expected);
    });
   });
  
   describe('removeAttribute', () => {
    it('removes an existing attribute', () => {
      const template = '<div class="foo" id="bar"></div>';
      const expected = '<div class="foo"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttribute('id').removeAttribute('id').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('does not modify the template if the attribute does not exist', () => {
      const template = '<div class="foo"></div>';
      const expected = '<div class="foo"></div>';
      const result = new VueModifyAttributes().fromTemplate(template).findByTag('div').removeAttribute('id').getTemplate();
      expect(result).toEqual(expected);
    });
  
    it('removes an attribute with a complex value', () => {
      const template = '<comp class="foo" :some="value1 value2"></comp>';
      const expected = '<comp class="foo"></comp>';
      const result = new VueModifyAttributes().fromTemplate(template).findByAttributeValue('class', 'foo').removeAttribute(':some').getTemplate();
      expect(result).toEqual(expected);
    });
    
  });

  describe('regexpAttribute', () => {
    it('replaces attribute value with regular expression', () => {
      const template = '<some-component data-for="money"></some-component>';
      const result = new VueModifyAttributes().fromTemplate(template).findByTag('some-component').regexpAttribute('data-for', /mon/g, 'h').getTemplate();
      expect(result).toEqual('<some-component data-for="hey"></some-component>');
    });
  });

  describe('other features', () => {
    it('shall be possible to move around with multiple finds', () => {
      const vm = new VueModifyAttributes();
    
      const template = '<div><p class="foo">Hello world</p><p class="bar">Hello again</p></div>';
      const expectedOutput = '<div><p>Hello world</p><p class="bar baz">Hello again</p></div>';
    
      const output = vm.fromTemplate(template)
        .findByTag('p')
        .removeAttribute('class')
        .findByAttributeValue('class', 'bar')
        .extendAttribute('class', 'baz')
        .getTemplate();
    
      expect(output).toBe(expectedOutput);
    });

    it('has attr helper for faster scripting', () => {
      const template = '<div class="foo" id="bar"></div>';
      const expected = '<div class="foo"></div>';
      const result = attr()
        .fromTemplate(template)
        .findByAttribute('id')
        .removeAttribute('id')
        .getTemplate();
      expect(result).toEqual(expected);
    });
  });

  
  
});