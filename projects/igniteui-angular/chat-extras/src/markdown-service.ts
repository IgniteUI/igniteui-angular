import { Injectable } from '@angular/core';
import { Marked } from 'marked';
import markedShiki from 'marked-shiki';
import { bundledThemes, createHighlighter } from 'shiki/bundle/web';


const DEFAULT_LANGUAGES = ['javascript', 'typescript', 'html', 'css'];
const DEFAULT_THEMES = {
    light: 'github-light',
    dark: 'github-dark'
};

@Injectable({ providedIn: 'root' })
export class IgxChatMarkdownService {

    private _instance: Marked;
    private _isInitialized: Promise<void>;

    private _initializeMarked(): void {
        this._instance = new Marked({
            breaks: true,
            gfm: true,
            extensions: [
                {
                    name: 'link',
                    renderer({ href, title, text }) {
                        return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
                    }
                }
            ]
        });
    }

    private async _initializeShiki(): Promise<void> {
        const highlighter = await createHighlighter({
            langs: DEFAULT_LANGUAGES,
            themes: Object.keys(bundledThemes)
        });

        this._instance.use(
            markedShiki({
                highlight(code, lang, _) {
                    try {
                        return highlighter.codeToHtml(code, {
                            lang,
                            themes: DEFAULT_THEMES,
                        });

                    } catch {
                        return `<pre><code>${code}</code></pre>`;
                    }
                }
            })
        );
    }


    constructor() {
        this._initializeMarked();
        this._isInitialized = this._initializeShiki();
    }

    public async parse(text: string): Promise<string> {
        await this._isInitialized;
        return await this._instance.parse(text);
    }
}
