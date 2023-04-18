import { VueFileHandler } from "./VueFileHandler";
import { VueModifyTemplate } from "./VueModifyTemplate";

export type TemplateMod = (filenameIn: string) => {
  templateModificator: VueModifyTemplate,
  addComment: (comment: string) => void,
  saveModifiedTemplate: (filenameOut?: string) => void
};

export const getWithComponent = (dirs: string[]): TemplateMod => {

  const withComponent = (filenameIn: string) => {
    const fileHandler = new VueFileHandler(dirs);  
    let extraComment: string |  null = null; 
    fileHandler.load(filenameIn);
    const template = fileHandler.getTemplateAsString();
    const templateModificator = new VueModifyTemplate().fromTemplate(template);
  
    // This method sets the comment with file name that actually used the helper
    const getCallerFilename = () => {
      const error = new Error();
      const stackTrace = error.stack;
      const callerLine = stackTrace?.split('\n').find(line=>line.match('at ') && !line.match('helpers'));
      const callerFile = callerLine?.match(/([^\/)]+)\)/);
      return callerFile ? callerFile[1] : '?!?';
    }
  
    return {
      templateModificator,
      addComment(comment: string) {
        extraComment = comment;
      },
      saveModifiedTemplate(filenameOut?:string) {
        fileHandler.setNewTemplate(templateModificator.getTemplate());
        if(extraComment) {
          fileHandler.addTemplateComment(extraComment);
        }
        fileHandler.addTemplateComment(getCallerFilename());
        fileHandler.write(filenameOut);
      }
    }
  
  }

  return withComponent

}
