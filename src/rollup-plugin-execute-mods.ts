import { Plugin } from 'rollup';
import { readdirSync, lstatSync, realpathSync } from 'fs';
import { emptyDirSync, existsSync } from 'fs-extra';
import { getWithTemplate, TemplateMod } from './helpers';
// import chokidar from 'chokidar'

export interface ModsPluginOptions {
  modsDir: string;
  componentsDir: string[];
}

function executeMods(callback: TemplateMod, dirPath: string): void {  
  if(!existsSync(dirPath)) return;
  const files = readdirSync(dirPath).sort();

  files.forEach((file) => {
    const filePath = `${dirPath}/${file}`;
    if (lstatSync(filePath).isDirectory()) {
      executeMods(callback, filePath);
    } else if (filePath.endsWith('.mod.ts')) {
      
      const mod = require(realpathSync(filePath));
      if (typeof mod === 'function') {
        mod(callback);
      }
    }
  });
}

export default function modsPlugin(options: ModsPluginOptions): Plugin {
  const withTemplate = getWithTemplate(options.componentsDir);
  let initialized = false;

  const onWatchChange = (id: string) => {
    if (id.endsWith('.mod.ts')) {
      executeMods(withTemplate, options.modsDir);
    }
  };

  //@ts-ignore
  // const chokidarHandler = (event, path) => {
  //   console.log(`${event} ${path}`);
  //   emptyDirSync(options.componentsDir[0]);
  //   executeMods(withTemplate, options.modsDir);
  // }
  

  return {
    name: 'mods-plugin',
    async buildStart() {
      if(!initialized) {
        emptyDirSync(options.componentsDir[0]);
        initialized = true;
        executeMods(withTemplate, options.modsDir);
        this.addWatchFile(realpathSync(options.modsDir+"/test1.mod.ts"));
        //chokidar.watch(`${options.modsDir}/**/*.mod.ts`).on('all', chokidarHandler);
        //chokidar.watch(`${options.componentsDir[1]}/**/*.vue`).on('all', chokidarHandler);
      }
    },
    watchChange: onWatchChange,
  };
}
