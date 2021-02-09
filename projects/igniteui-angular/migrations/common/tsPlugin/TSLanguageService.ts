import * as tss from 'typescript/lib/tsserverlibrary';

export interface TSLanguageService extends tss.LanguageService {
    getTypeScriptLanguageService(): tss.LanguageService;
}
