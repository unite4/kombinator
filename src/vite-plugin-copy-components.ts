import fsExtra from 'fs-extra';
import path from 'path';
import { globSync } from 'glob';
import { Plugin } from 'vite';
import { PluginContext } from 'rollup';
import { green } from 'colorette';

interface CopyComponentsPluginOptions {
  sourceDirectories: string[];
  targetDirectory: string;
  verbose: boolean;
}

export default function copyComponentsPlugin(options: CopyComponentsPluginOptions): Plugin {
  let initialized = false;

  function copyFile(sourceFile: string, targetFile: string) {
    if (options.verbose) {
      console.log(green(`Copying ${sourceFile} to ${targetFile}`));
    }
    fsExtra.ensureDirSync(path.dirname(targetFile));
    fsExtra.copyFileSync(sourceFile, targetFile);
  }

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
        copyFile(sourceFile, targetFile);
        this.addWatchFile(sourceFile);
      }
    }
  }

  return {
    name: 'copy-components-plugin',
    buildStart: {
      order: 'pre',
      handler() {
        if (!initialized) {
          copyFiles.call(this);
          initialized = true;
        }
      },
    },
    // TODO: temporary solution, to be refactored
    handleHotUpdate({ file: sourceFile }) {
      const isFromSourceDirectory = options.sourceDirectories
        .map((directory) => {
          const sourceDirectoryPath = path.join(process.cwd(), directory);
          return sourceFile.startsWith(sourceDirectoryPath);
        })
        .some(Boolean);

      if (isFromSourceDirectory) {
        const targetFileName = path.basename(sourceFile);
        const targetFile = path.join(options.targetDirectory, targetFileName);

        copyFile(sourceFile, targetFile);
      }
    },
  };
}
