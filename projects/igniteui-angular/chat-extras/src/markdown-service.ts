import { Injectable } from '@angular/core';
import { setupMarkdownRenderer, type MarkdownRenderer } from 'igniteui-webcomponents/extras';


@Injectable({ providedIn: 'root' })
export class IgxChatMarkdownService {

    private _renderer: MarkdownRenderer | null = null;

    private async _getRenderer(): Promise<MarkdownRenderer> {
        if (!this._renderer) {
            this._renderer = await setupMarkdownRenderer();
        }
        return this._renderer;
    }

    public async parse(text: string): Promise<string> {
        const renderer = await this._getRenderer();
        return await renderer.parse(text);
    }
}
