import fs from 'fs';
import path from 'path';
import temp from 'temp';
import VueFileHandler from '../src/VueFileHandler';

temp.track(); // Automatically track and clean up files at exit

describe('VueFileHandler', () => {
  let generatedDir: string;
  let coreDir: string;

  beforeAll(() => {
    generatedDir = temp.mkdirSync('generated');
    coreDir = temp.mkdirSync('core');
    
    // Create a test Vue file in the core directory
    const filePath = path.join(path.join(coreDir, 'subdirectory', 'my-component.vue'));
    const fileContent = '<template>\n<div>Hello world</div>\n</template>';
    fs.mkdirSync(path.join(coreDir, 'subdirectory'))
    fs.writeFileSync(filePath, fileContent, 'utf8');
  });

  afterAll(() => {
    temp.cleanupSync();
  });

  it('should load a Vue file from a given location', () => {
    const vueFile = new VueFileHandler([generatedDir, coreDir]);
    vueFile.loadVueFile('subdirectory/my-component.vue');
    const templateString = vueFile.getTemplateAsString();

    expect(templateString).toBe('<div>Hello world</div>');
  });

  it('should set a new template string', () => {
    const vueFile = new VueFileHandler([generatedDir, coreDir]);
    vueFile.loadVueFile('subdirectory/my-component.vue');
    vueFile.setNewTemplate('<div>New template</div>');    
    vueFile.write();
    const vueFileOut = new VueFileHandler([generatedDir, coreDir]);
    vueFileOut.loadVueFile('subdirectory/my-component.vue');
    fs.unlinkSync(path.join(generatedDir, 'subdirectory/my-component.vue'));
    const templateString = vueFileOut.getTemplateAsString();
    
    expect(templateString).toBe('<div>New template</div>');
  });

  it('should add a comment to the template', () => {
    const vueFile = new VueFileHandler([generatedDir, coreDir]);
    vueFile.loadVueFile('subdirectory/my-component.vue');
    vueFile.setNewTemplate('<div>New template</div>');    
    vueFile.addTemplateComment('This is a comment');    
    vueFile.write();
    const vueFileOut = new VueFileHandler([generatedDir, coreDir]);
    vueFileOut.loadVueFile('subdirectory/my-component.vue');
    const templateString = vueFileOut.getTemplateAsString();
    fs.unlinkSync(path.join(generatedDir, 'subdirectory/my-component.vue'));
    expect(templateString).toBe('<div>New template</div>\n\n<!-- Kombinator: This is a comment -->');
  });

  it('should write the updated file to a new location / name', () => {
    const vueFile = new VueFileHandler([generatedDir, coreDir]);
    vueFile.loadVueFile('subdirectory/my-component.vue');
    vueFile.setNewTemplate('<div>New template</div>');
    // Write the updated file to a temporary directory
    const newFilePath = path.join(temp.mkdirSync('new-subdirectory'), 'new-component.vue');
    vueFile.write('foo/new-component.vue');
    // Read the file content and check if it contains the new template and comment
    const newFileContent = fs.readFileSync(generatedDir + '/foo/new-component.vue', 'utf8');
    expect(newFileContent).toContain('<div>New template</div>');

  });
});
