import type { Mock } from "vitest";
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { IgxChatMarkdownService } from './markdown-service';
import { MarkdownPipe } from './markdown-pipe';
import Spy = Mock;

// Mock the Service: We only care that the pipe calls the service and gets an HTML string.
// We provide a *known* unsafe HTML string to ensure sanitization is working.
const mockUnsafeHtml = `
  <pre class="shiki" style="color: var(--shiki-fg);"><code><span style="color: #FF0000;">unsafe</span></code></pre>
  <img src="x" onerror="alert(1)">
`;

class MockChatMarkdownService {
    public async parse(_: string): Promise<string> {
        return mockUnsafeHtml;
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

    it('should call the service, sanitize content, and return SafeHtml', async () => {
        await pipe.transform('some markdown');

        expect(bypassSpy).toHaveBeenCalledTimes(1);

        const sanitizedString = vi.mocked(bypassSpy).mock.lastCall[0];

        expect(sanitizedString).not.toContain('onerror');
        expect(sanitizedString).toContain('style="color: var(--shiki-fg);"');
    });

    it('should handle undefined input text', async () => {
        await pipe.transform(undefined);
        expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
    });
});
