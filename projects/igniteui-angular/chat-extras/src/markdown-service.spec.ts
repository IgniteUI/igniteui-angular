import { TestBed } from '@angular/core/testing';
import { IgxChatMarkdownService } from './markdown-service';

import { describe, it, expect, beforeEach } from 'vitest';
describe('IgxChatMarkdownService', () => {
    let service: IgxChatMarkdownService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IgxChatMarkdownService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should parse basic markdown to HTML', async () => {
        const markdown = '**Hello** *World*';
        const expectedHtml = '<p><strong>Hello</strong> <em>World</em></p>\n';

        const result = await service.parse(markdown);
        expect(result).toBe(expectedHtml);
    });

    it('should parse a code block with shiki highlighting', async () => {
        const markdown = '```typescript\nconst x = 5;\n```';
        const result = await service.parse(markdown);

        expect(result).toContain('<pre class="shiki shiki-themes github-light github-dark"');
        expect(result).toContain('const');
        expect(result).toMatch(/--shiki-.*?/);
        expect(result).toContain('code');
    });

    it('should apply custom link extension', async () => {
        const markdown = '[Infragistics](https://www.infragistics.com)';
        const expectedLink = '<p><a href="https://www.infragistics.com" rel="noopener noreferrer">Infragistics</a></p>';

        const result = await service.parse(markdown);
        expect(result).toContain(expectedLink);
    });
});
