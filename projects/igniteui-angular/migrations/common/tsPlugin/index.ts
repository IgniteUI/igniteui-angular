function init(modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) {
    const ts = modules.typescript;
    let tsLanguageService = null;

    /**
     * Returns a cached version of the TSLS.
     * Useful if other global or local plugins modify it.
     */
    function getTypeScriptLanguageService(): ts.LanguageService {
        return tsLanguageService;
    }

    function create(info: ts.server.PluginCreateInfo) {
        tsLanguageService = info.languageService;
        return {
            ...info.languageService,
            getTypeScriptLanguageService
        };
    }

    return { create };
}

export = init;
