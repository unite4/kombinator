import { Plugin } from 'vite';
import { readdirSync, lstatSync, realpathSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { emptyDirSync, existsSync } from 'fs-extra';
import { getWithComponent, TemplateMod } from './helpers';
import { green, yellow } from 'colorette'
import path from 'path';
import VueFileHandler from './VueFileHandler';


export interface ModsPluginOptions {
  modsDir: string;
  componentsDir: string[];
  verbose: boolean;
}


export default function modsPlugin(options: ModsPluginOptions): Plugin {

  const withComponent = getWithComponent(options.componentsDir);
  // const touched: string[] = [];
  // const extendedWithComponent:TemplateMod = (name)=> {
  //   // This will remember touched files
  //   let filePath = new VueFileHandler(options.componentsDir).load(name).getFullPath();
  //   if(!touched.includes(filePath!)) {
  //     touched.push(name);

  //   }
  //   return withComponent(name);
  // }

  let initialized = false;

  // const onWatchChange = (id: string) => {
  //   if (id.endsWith('.mod.ts')) {
  //     executeMods(withTemplate, options.modsDir);
  //   }
  // };

  function executeMods(callback: TemplateMod, dirPath: string): void {  
    if(!existsSync(dirPath)) return;
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
  }
/*
  function emptyFiles(dirPath: string): void {
    const files = readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      if (lstatSync(filePath).isDirectory()) {
        emptyFiles(filePath); // recurse into subdirectories
      } else {
        writeFileSync(filePath, '<template></template>');
      }
    }
  }

  function removeEmptyFiles(this: Plugin, dirPath: string): void {
    const files = readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      if (lstatSync(filePath).isDirectory()) {
        removeEmptyFiles.call(this, filePath); // recurse into subdirectories
      } else {
        const content = readFileSync(filePath, 'utf8');
        if (content.trim() === '<template></template>') {
          if(options.verbose) {
            console.log(yellow(`${filePath} is empty - removing`))
          }                    
          unlinkSync(filePath);
        }
      }
    }
  } 
*/
  return {
    name: 'mods-plugin',
    buildStart: {
      order: "pre",
      handler() {
        if(!initialized) {
          //emptyFiles(options.componentsDir[0]);
          emptyDirSync(options.componentsDir[0]);
          initialized = true;
          executeMods(withComponent, options.modsDir);
          //removeEmptyFiles.call(this, options.componentsDir[0]);
        }        
      }
    },
    // async handleHotUpdate({ file, server }) {      
    //   if (file.endsWith('.mod.ts')) {
    //     emptyDirSync(options.componentsDir[0]);
    //     executeMods.call(this, withComponent, options.modsDir);
    //   }    
    // },
  };
}
