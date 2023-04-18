import { Plugin } from 'vite';
import { readdirSync, lstatSync, realpathSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { emptyDirSync, existsSync } from 'fs-extra';
import { getWithComponent, TemplateMod } from './helpers';
import { green, yellow } from 'colorette'

export interface ModsPluginOptions {
  modsDir: string;
  componentsDir: string[];
  verbose: boolean;
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
        const fullFilePath = realpathSync(filePath);
        const mod = require(fullFilePath);
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

  return {
    name: 'mods-plugin',
    buildStart: {
      order: "pre",
      handler() {
        if(!initialized) {
          emptyDirSync(options.componentsDir[0]);
          initialized = true;
          executeMods(withComponent, options.modsDir).forEach(file => this.addWatchFile(file));
        }        
      }
    },
    async handleHotUpdate({ file, server }) {      
      if (file.endsWith('.mod.ts')) {
        emptyDirSync(options.componentsDir[0]);
        executeMods.call(this, withComponent, options.modsDir);
      }    
    },
  };
}
