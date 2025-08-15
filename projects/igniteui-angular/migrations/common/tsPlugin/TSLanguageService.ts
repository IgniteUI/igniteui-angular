import * as tss from 'typescript/lib/tsserverlibrary.js';

export interface TSLanguageService extends tss.LanguageService {
    getTypeScriptLanguageService(): tss.LanguageService;
}
