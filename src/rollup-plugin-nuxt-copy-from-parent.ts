import * as fse from 'fs-extra';
import * as fs from 'fs';
import * as path from 'path';
import { Plugin } from 'rollup';

interface CopyParentPluginOptions {
  items?: string[];
  sourceDir: string;
  destinationDir: string;
}

function copyParentPlugin(options: CopyParentPluginOptions): Plugin {
  let items = options.items || ['components', 'pages', 'layouts'];
  let initialized = false;

  return {
    name: 'rollup-plugin-nuxt-copy-from-parent',

    async buildStart() {
      if (initialized) {
        console.log("Seems this is started second time. Skipping.");
        return;
      }

      initialized = true;

      if (fs.existsSync(path.join(options.destinationDir, '.git'))) {
        this.warn(`.git exists in ${options.destinationDir}. Copy from parent skipped.`);
      }

      for (let what of items) {
        let targetDir = path.join(options.destinationDir, what);
        let sourceDir = path.join(options.sourceDir, what);

        try {
          await fse.emptyDir(targetDir);

          if (fs.existsSync(sourceDir)) {
            await fse.copy(sourceDir, targetDir);
          }
        } catch (error) {
          this.error(error as string);
        }
      }
    },
  };
}

export default copyParentPlugin;
