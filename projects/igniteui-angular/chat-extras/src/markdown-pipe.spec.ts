import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { IgxChatMarkdownService } from './markdown-service';
import { MarkdownPipe } from './markdown-pipe';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Spy = jasmine.Spy;

// Mock the Service: We trust the service to provide safe HTML from Shiki.
const mockSafeHtml = `
  <pre class="shiki" style="color: var(--shiki-fg);"><code><span style="color: #FF0000;">unsafe</span></code></pre>
  <img src="x">
`;

class MockChatMarkdownService {
    public async parse(_: string): Promise<string> {
        return mockSafeHtml;
    }
}

describe('MarkdownPipe', () => {
    let pipe: MarkdownPipe;
    let sanitizer: DomSanitizer;
    let bypassSpy: Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MarkdownPipe,
                { provide: IgxChatMarkdownService, useClass: MockChatMarkdownService },
            ],
        });

        pipe = TestBed.inject(MarkdownPipe);
        sanitizer = TestBed.inject(DomSanitizer);
        bypassSpy = vi.spyOn(sanitizer, 'bypassSecurityTrustHtml');
    });

    it('should be created', () => {
        expect(pipe).toBeTruthy();
    });

    it('should call the service and return SafeHtml with styles preserved', async () => {
        await pipe.transform('some markdown');

        expect(bypassSpy).toHaveBeenCalledTimes(1);

        const htmlString = bypassSpy.mock.lastCall[0];

        expect(htmlString).toContain('style="color: var(--shiki-fg);"');
        expect(htmlString).toContain('<pre class="shiki"');
    });

    it('should trust the service to provide safe HTML', async () => {
        const result = await pipe.transform('# Test');

        expect(bypassSpy).toHaveBeenCalledWith(mockSafeHtml);
        expect(result).toBeTruthy();
    });

    it('should handle undefined input text', async () => {
        await pipe.transform(undefined);
        expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
    });
});
