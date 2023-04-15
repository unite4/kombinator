import { VueModifyTemplate } from '../src/VueModifyTemplate';

export function trimMultilineString(str:string, keepLines = true) {
  return str
    .split('\n') // Split the string into an array of lines
    .map((line) => line.trim()) // Trim each line
    .join(keepLines ? '\n' : ''); // Join the lines back into a string
}

describe('VueModifyTemplate', () => {
  const template = trimMultilineString(`
        <template>
          <div class="container">
            <h1>Hello, world!</h1>
            <component/>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </template>
  `);

  const templateLine = trimMultilineString(template);
  

  describe('remove', () => {
    it('removes the element from the template', () => {
      const expectedTemplate = trimMultilineString(`
        <template>
          <div class="container">

            <component/>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('h1').remove();
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });
  });

  describe('insertBefore', () => {
    it('inserts HTML before the element', () => {
      const expectedTemplate = trimMultilineString(`
        <template>
          <div class="container">
            <h2>Greetings, earthlings!</h2><h1>Hello, world!</h1>
            <component/>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('h1').insertBefore('<h2>Greetings, earthlings!</h2>');
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });
  });

  describe('insertAfter', () => {
    it('inserts HTML after the element', () => {
      const expectedTemplate = trimMultilineString(`
        <template>
          <div class="container">
            <h1>Hello, world!</h1><h2>Greetings, earthlings!</h2>
            <component/>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('h1').insertAfter('<h2>Greetings, earthlings!</h2>');
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });

    it('inserts HTML after the self closing element', () => {
      const expectedTemplate = trimMultilineString(`
        <template>
          <div class="container">
            <h1>Hello, world!</h1>
            <component/><h2>Greetings, earthlings!</h2>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('component').insertAfter('<h2>Greetings, earthlings!</h2>');
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });
  });

  describe('unwrap', () => {
    it('replaces the element with its inner HTML', () => {
      const expectedTemplate = trimMultilineString(`
        <template>

            <h1>Hello, world!</h1>
            <component/>
            <p>Lorem ipsum dolor sit amet.</p>

        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('div').unwrap();
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });
    it('works like remove for self closing tags', () => {
      const expectedTemplate = trimMultilineString(`
        <template>
          <div class="container">
            <h1>Hello, world!</h1>

            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('component').unwrap();
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });

  });

  describe('insertInside', () => {
    it('should insert HTML into the element', () => {
      const expected = trimMultilineString(`
        <template>
          <div class="container">
            <h1>Hello, world!</h1>
            <component/>
            <p>Lorem ipsum dolor sit amet.<strong>bold text</strong></p>
          </div>
        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('p').insertInside("<strong>bold text</strong>");
      const result = modifier.getTemplate();
      expect(result).toBe(expected);
    });

    it('does not support self closing tags', () => {            
      expect(()=>{
        const modifier = new VueModifyTemplate().fromTemplate(trimMultilineString(template, false)).findByTag('component').insertInside("<strong>bold text</strong>");
        modifier.getTemplate();
      }).toThrowError("insertInside does not support self closing tags");
    });
  });

  describe('possibility to wrap', () => {
    it('shall be possible to wrap few elements', () => {
      const template = trimMultilineString(`
        <template>
          <h1>Hello, world!</h1>
          <component/>
        </template>
      `);
      const expectedTemplate = trimMultilineString(`
        <template>
          <div class="container"><h1>Hello, world!</h1>
          <component/></div>
        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template)
        .findByTag('h1')
        .insertBefore('<div class="container">')
        .findByTag('component')
        .insertAfter('</div>');
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });

  });

});
