import fsExtra from 'fs-extra';
import path from 'path';
import { sync as globSync } from 'glob';
import { Plugin, PluginContext } from 'rollup';

interface CopyComponentsPluginOptions {
  sourceDirectories: string[];
  targetDirectory: string;
}

export default function copyComponentsPlugin(options: CopyComponentsPluginOptions): Plugin {
  let initialized = false;

  async function copyFiles(this: PluginContext) {
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
        // console.log(`Copying ${sourceFile} tp ${targetFile}`)
        await fsExtra.ensureDir(path.dirname(targetFile));
        await fsExtra.copyFile(sourceFile, targetFile);
      }
    }
  }

  return {
    name: 'copy-components-plugin',    
    async buildStart() {
      // Only copy the files on the first build
      if (!initialized) {
        await copyFiles.call(this);
        initialized = true;
      }      
    }
    
  };
}
