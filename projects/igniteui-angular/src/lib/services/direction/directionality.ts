import { Injectable, Inject, InjectionToken, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * @hidden
 */
export type Direction = 'ltr' | 'rtl';

/**
 * Injection token is used to inject the document into Directionality
 * which factory could be faked for testing purposes.
 *
 * We can't provide and mock the DOCUMENT token from platform-browser because configureTestingModule
 * allows override of the default providers, directive, pipes, modules of the test injector
 * which causes errors.
 *
 * @hidden
 */
export const DIR_DOCUMENT = new InjectionToken<Document>('dir-doc', {
    providedIn: 'root',
    factory: DIR_DOCUMENT_FACTORY
});

/**
 * @hidden
 */
export function DIR_DOCUMENT_FACTORY(): Document {
    return inject(DOCUMENT);
}

/**
 * @hidden
 *
 * Bidirectional service that extracts the value of the direction attribute on the body or html elements.
 *
 * The dir attribute over the body element takes precedence.
 */
@Injectable({
    providedIn: 'root'
})
export class Directionality {
    private _dir: Direction;

    public get value(): Direction {
        return this._dir;
    }

    constructor(@Inject(DIR_DOCUMENT) private _document?: Document) {
        const bodyDir = this._document.body ? this._document.body.dir : null;
        const htmlDir = this._document.documentElement ? this._document.documentElement.dir : null;
        const extractedDir = bodyDir || htmlDir;
        this._dir = (extractedDir === 'ltr' || extractedDir === 'rtl') ? extractedDir : 'ltr';
    }
}
