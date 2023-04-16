import fsExtra from 'fs-extra';
import path from 'path';
import {globSync} from 'glob';

interface CopyComponentsPluginOptions {
  sourceDirectories: string[];
  targetDirectory: string;
}

export default function copyComponentsPlugin(options: CopyComponentsPluginOptions) {
  let initialized = false;

  async function copyFiles() {
    // Copy each component file from the source directories to the target directory
    for (const sourceDirectory of options.sourceDirectories.reverse()) {
      const sourceFiles = globSync(`${sourceDirectory}/**/*.vue`);
      if (!sourceFiles || sourceFiles.length === 0) {        
        console.log(`Source directory ${sourceDirectory} is empty. Skipping.`);
        continue;
      }
      
      for (const sourceFile of sourceFiles) {
        const relativePath = path.relative(sourceDirectory, sourceFile);
        const targetFile = path.join(options.targetDirectory, relativePath);
        console.log(`Copying ${sourceFile} tp ${targetFile}`)
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
        await copyFiles();
        initialized = true;
      }
    },
    async watchChange(filePath: string) {
      console.log(filePath);
      // Only copy the files if the changed file is a component in one of the source directories
      for (const sourceDirectory of options.sourceDirectories) {
        if (filePath.startsWith(sourceDirectory) && filePath.endsWith('.vue')) {
          await copyFiles();
          break;
        }
      }
    },
  };
}
