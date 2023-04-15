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
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('h1').insertAfter('<h2>Greetings, earthlings!</h2>');
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });
  });

  describe('unwrap', () => {
    it('replaces the element with its inner HTML', () => {
      const expectedTemplate = trimMultilineString(`
        <template>

            <h1>Hello, world!</h1>
            <p>Lorem ipsum dolor sit amet.</p>

        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('div').unwrap();
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });
    it('works like remove for self closing tags', () => {
      const template = trimMultilineString(`
        <template>
          <h1>Hello, world!</h1>
          <component/>
        </template>
      `);
      const expectedTemplate = trimMultilineString(`
        <template>
          <h1>Hello, world!</h1>

        </template>
      `);
      const modifier = new VueModifyTemplate().fromTemplate(template).findByTag('component').unwrap();
      const modifiedTemplate = modifier.getTemplate();
      expect(modifiedTemplate).toBe(expectedTemplate);
    });

  });
});
