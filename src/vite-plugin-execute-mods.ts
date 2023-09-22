import { Plugin } from 'vite';
import { readdirSync, lstatSync, realpathSync, readFileSync, writeFileSync } from 'fs';
import { emptyDirSync, existsSync } from 'fs-extra';
import { getWithComponent, TemplateMod } from './helpers';
import { green, yellow } from 'colorette'
import { VueFileHandler } from './VueFileHandler';
import { VueCombinedTagLoader } from './VueCombinedTagLoader';
import path from 'path';
import temp from 'temp';

export interface ModsPluginOptions {
  modsDir: string;
  localComponentsDir: string;
  componentsDir: string[];
  verbose: boolean;
  tags:string[];
}

// Automatically track and clean up files at exit
temp.track();

function copyFileToTemp(filePath: string) {
  if (!existsSync(filePath)) {
    throw new Error('File does not exist');
  }
  
  // Create a temporary directory
  const tempDir = temp.mkdirSync('tempDir');
  const fileName = path.basename(filePath);
  const tempFilePath = path.join(tempDir, fileName)
  const data = readFileSync(filePath);

  writeFileSync(tempFilePath, data);

  return tempFilePath;
}

export default function modsPlugin(options: ModsPluginOptions): Plugin {

  const withComponent = getWithComponent(options.componentsDir);
  let initialized = false;

  function executeMods(callback: TemplateMod, dirPath: string): string[] {  
    const executed: string[] = [];
    if(!existsSync(dirPath)) return [];
    const files = readdirSync(dirPath).sort();
  
    files.forEach((file) => {
      const filePath = `${dirPath}/${file}`;
      if (lstatSync(filePath).isDirectory()) {
        if(options.verbose) {
          console.log(green(`Reading directory ${filePath}`))
        }
        executeMods(callback, filePath);
      } else if (filePath.endsWith('.mod.ts')) {
        const fullFilePath = realpathSync(filePath)
        const tempFilePath = copyFileToTemp(fullFilePath)
        const mod = require(tempFilePath);
        executed.push(fullFilePath);
        if(options.verbose) {
          console.log(green(`Processing ${filePath}`))
        }
        if (typeof mod === 'function') {
          if(options.verbose) {
            console.log(green(`Calling ${filePath}`))
          }
          mod(callback);
        }
      }
    });
    return executed;
  }

  function processVueMods(componentsPath: string): string[] {  
    const executed: string[] = [];
    console.log(yellow(componentsPath))
    if(!existsSync(componentsPath)) return executed;
    const files = readdirSync(componentsPath);
    console.log(files)
  
    files.forEach((file) => {
      const filePath = `${componentsPath}/${file}`;
      if (lstatSync(filePath).isDirectory()) {
        if(options.verbose) {
          console.log(green(`Reading directory ${filePath}`))
        }
        processVueMods(filePath);
      } else if (filePath.endsWith('.mod.vue')) {                
        const modFilePath = realpathSync(filePath);        
        const componentFileName = filePath.replace('.mod.vue','.vue').replace(options.localComponentsDir,'');
                
        if(options.verbose) {
          console.log(green(`Processing ${modFilePath}`));
        }
        executed.push(modFilePath);
        const fileHandler = new VueFileHandler(options.componentsDir).loadVueFile(componentFileName);
        const componentFilePath = fileHandler.getFullPath();

        const newCode = new VueCombinedTagLoader().setTag(options.tags).loadComponent(componentFilePath!, modFilePath).getCode();
        fileHandler.setNewFileContent(newCode);
        fileHandler.addTemplateComment("Applied vue mod " + filePath);
        fileHandler.write();
      }
    });
    return executed
  }

  return {
    name: 'mods-plugin',
    buildStart: {
      order: "pre",
      handler() {
        if(!initialized) {
          emptyDirSync(options.componentsDir[0]);
          initialized = true;
          processVueMods(options.localComponentsDir).forEach(file => this.addWatchFile(file));
          executeMods(withComponent, options.modsDir).forEach(file => this.addWatchFile(file));
        }        
      }
    },
    async handleHotUpdate({ file, server }) {      
      const parentComponentsPath = path.resolve(process.cwd(), options.componentsDir[1])
      const fileIsParentComponent = file.startsWith(parentComponentsPath)
      if (file.endsWith('.mod.ts') || file.endsWith('.mod.vue') || fileIsParentComponent) {
        emptyDirSync(options.componentsDir[0]);
        processVueMods(options.localComponentsDir);
        executeMods(withComponent, options.modsDir);
      }    
    },
  };
}
