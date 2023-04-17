import fsExtra from 'fs-extra';
import path from 'path';
import { globSync } from 'glob';
import { Plugin, PluginContext } from 'rollup';
import { green } from 'colorette'

interface CopyComponentsPluginOptions {
  sourceDirectories: string[];
  targetDirectory: string;
  verbose: boolean;
}

export default function copyComponentsPlugin(options: CopyComponentsPluginOptions): Plugin {
  let initialized = false;

  function copyFiles(this: PluginContext) {
    // Copy each component file from the source directories to the target directory
    for (const sourceDirectory of options.sourceDirectories.reverse()) {
      const sourceFiles = globSync(`${sourceDirectory}/**/*.vue`);
      if (!sourceFiles || sourceFiles.length === 0) {                
        this.warn(`Source directory ${sourceDirectory} is empty. Skipping.`);
        continue;
      }
      
      for (const sourceFile of sourceFiles) {
        const relativePath = path.relative(sourceDirectory, sourceFile);
        const targetFile = path.join(options.targetDirectory, relativePath);
        if(options.verbose) {
          console.log(green(`Copying ${sourceFile} to ${targetFile}`))
        }
        fsExtra.ensureDirSync(path.dirname(targetFile));
        fsExtra.copyFileSync(sourceFile, targetFile);
        this.addWatchFile(sourceFile);
      }
    }
  }

  return {
    name: 'copy-components-plugin',    
    buildStart: {
      order: "pre",
      handler() {
        if (!initialized) {
          copyFiles.call(this);
          initialized = true;
        }      
      }
    }
    
    
  };
}
