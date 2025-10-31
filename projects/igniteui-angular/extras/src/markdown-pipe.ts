import DOMPurify from 'dompurify';
import { inject, Pipe, type PipeTransform } from '@angular/core';
import { IgxChatMarkdownService } from './markdown-service';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';


@Pipe({ name: 'fromMarkdown' })
export class MarkdownPipe implements PipeTransform {
    private _service = inject(IgxChatMarkdownService);
    private _sanitizer = inject(DomSanitizer);


    public async transform(text?: string): Promise<SafeHtml> {
        return this._sanitizer.bypassSecurityTrustHtml(DOMPurify.sanitize(
            await this._service.parse(text ?? '')
        ));
    }
}
