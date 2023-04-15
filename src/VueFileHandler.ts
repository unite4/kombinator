import fs from 'fs';
import path from 'path';

class VueFileHandler {
  private directories: string[];
  private filePath: string | null = null;
  private fileName: string | null = null;
  private fileContent: string | null = null;
  private newFileContent: string | null = null;

  constructor(directories: string[]) {
    this.directories = directories;
  }

  loadVueFile(fileName: string): void {
    this.fileName = fileName;
    const filePathParts = fileName.split('/');
    for (const directory of this.directories) {
      const fullPath = [...filePathParts];
      fullPath.unshift(directory);
      const filePath = path.join(...fullPath);
      if (fs.existsSync(filePath)) {
        this.filePath = filePath;
        this.fileContent = fs.readFileSync(this.filePath, 'utf8');
        break;
      }
    }

    if (!this.filePath) {
      throw new Error(`File ${fileName} not found in ${this.directories.join(', ')}`);
    }
  }

  getTemplateAsString(): string {
    const templateMatch = this.fileContent?.match(/<template>([\s\S]*)<\/template>/);
    if (!templateMatch) {
      throw new Error(`No template found in ${this.filePath}`);
    }
    return templateMatch[1].trim();
  }

  setNewTemplate(newTemplateString: string): void {
    this.newFileContent = this.fileContent?.replace(/<template>[\s\S]*<\/template>/, `<template>\n${newTemplateString}\n</template>`) ?? null;
  }

  addTemplateComment(comment: string): void {
    if(!this.newFileContent) {
      throw new Error("Set new template first");
    }
    const templateMatch = this.newFileContent?.match(/<template>([\s\S]*)<\/template>/);
    if (!templateMatch) {
      throw new Error(`No template found in ${this.filePath}`);
    }
    const templateContent = templateMatch[1];
    const newTemplateContent = templateContent + `\n<!-- Kombinator: ${comment} -->\n`;
    this.newFileContent = this.newFileContent.replace(templateContent, newTemplateContent);
  }

  write(newFilePath?: string): void {
    if (!newFilePath) {
      newFilePath = this.fileName!;
    }

    const firstDirectory = this.directories[0];
    const newDirectoryPath = newFilePath.split('/').slice(0, -1).join('/');
    const newDirectory = path.join(firstDirectory, newDirectoryPath);

    if (!fs.existsSync(newDirectory)) {
      fs.mkdirSync(newDirectory, { recursive: true });
    }

    const newFileContent = this.newFileContent ?? this.fileContent;
    const newFile = path.join(firstDirectory, newFilePath);

    fs.writeFileSync(newFile, newFileContent!);
  }
}

export default VueFileHandler;
