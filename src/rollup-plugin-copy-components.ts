import fsExtra from 'fs-extra';
import path from 'path';
import { globSync } from 'glob';
import { Plugin, PluginContext } from 'rollup';
import { green } from 'colorette';
import chokidar from 'chokidar';

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

  function removeFile(targetFile: string) {
    if (options.verbose) {
      console.log(green(`Removing ${targetFile}`));
    }
    fsExtra.ensureDirSync(path.dirname(targetFile));
    fsExtra.unlink(targetFile);
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

  function watchFiles(this: PluginContext) {
    chokidar
      .watch(options.sourceDirectories, {
        ignoreInitial: true,
      })
      .on('all', (event, sourceFile) => {
        const targetFileName = path.basename(sourceFile);
        const targetFile = path.join(options.targetDirectory, targetFileName);

        if (event === 'add' || event === 'change') {
          copyFile(sourceFile, targetFile);
        } else if (event === 'unlink') {
          removeFile(targetFile);
        }
      });
  }

  return {
    name: 'copy-components-plugin',
    buildStart: {
      order: 'pre',
      handler() {
        if (!initialized) {
          copyFiles.call(this);
          watchFiles.call(this);
          initialized = true;
        }
      },
    },
  };
}
