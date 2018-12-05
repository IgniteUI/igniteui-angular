import { Injectable, SecurityContext, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

/**
 * **Ignite UI for Angular Icon Service** -
 *
 * The Ignite UI Icon Service makes it easy for developers to include custom SVG images and use them with IgxIconComponent.
 * In addition it could be used to associate a custom class to be applied on IgxIconComponent according to given fontSet.
 *
 * Example:
 * ```typescript
 * this.iconService.registerFontSetAlias('material', 'material-icons');
 * this.iconService.addSvgIcon('aruba', '/assets/svg/country_flags/aruba.svg', 'svg-flags');
 * ```
 */

@Injectable({
    providedIn: 'root'
})
export class IgxIconService {
    private _fontSet = 'material-icons';
    private _fontSetAliases = new Map<string, string>();
    private _svgContainer: HTMLElement;
    private _cachedSvgIcons: Set<string> = new Set<string>();

    constructor (private _sanitizer: DomSanitizer, private _httpClient: HttpClient, @Inject(DOCUMENT) private _document: any) { }

    /**
     *  Returns the default font set.
     *```typescript
     *   const defaultFontSet = this.iconService.defaultFontSet;
     * ```
     */
    get defaultFontSet(): string {
        return this._fontSet;
    }

    /**
     *  Sets the default font set.
     *```typescript
     *   this.iconService.defaultFontSet = 'svg-flags';
     * ```
     */
    set defaultFontSet(className: string) {
        this._fontSet = className;
    }

    /**
     *  Registers a custom class to be applied to IgxIconComponent for a given fontSet.
     *```typescript
     *   this.iconService.registerFontSetAlias('material', 'material-icons');
     * ```
     */
    public registerFontSetAlias(alias: string, className: string = alias): this {
        this._fontSetAliases.set(alias, className);
        return this;
    }

    /**
     *  Returns the custom class, if any, associated to a given fontSet.
     *```typescript
     *   const fontSetClass = this.iconService.fontSetClassName('material');
     * ```
     */
    public fontSetClassName(alias: string): string {
        return this._fontSetAliases.get(alias) || alias;
    }

    /**
     *  Adds an SVG image to the cache. SVG source is an url.
     *```typescript
     *   this.iconService.addSvgIcon('aruba', '/assets/svg/country_flags/aruba.svg', 'svg-flags');
     * ```
     */
    public addSvgIcon(iconName: string, url: string, fontSet: string = '') {
        if (iconName && url) {
            const safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(url);
            if (!safeUrl) {
                throw new Error(`The provided URL could not be processed as trusted resource URL by Angular's DomSanitizer: "${url}".`);
            }

            const sanitizedUrl = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl);
            if (!sanitizedUrl) {
                throw new Error(`The URL provided was not trusted as a resource URL: "${url}".`);
            }

            this.fetchSvg(iconName, url, fontSet);
        } else {
            throw new Error('You should provide at least `iconName` and `url` to register an svg icon.');
        }
    }

    /**
     *  Adds an SVG image to the cache. SVG source is its text.
     *```typescript
     *   this.iconService.addSvgIcon('simple', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
     *   <path d="M74 74h54v54H74" /></svg>', 'svg-flags');
     * ```
     */
    public addSvgIconFromText(iconName: string, iconText: string, fontSet: string = '') {
        if (iconName && iconText) {
            this.cacheSvgIcon(iconName, iconText, fontSet);
        } else {
            throw new Error('You should provide at least `iconName` and `iconText` to register an svg icon.');
        }
    }

    /**
     *  Returns wheather a given SVG image is present in the cache.
     *```typescript
     *   const isSvgCached = this.iconService.isSvgIconCached('aruba', 'svg-flags');
     * ```
     */
    public isSvgIconCached(iconName: string, fontSet: string = ''): boolean {
        const iconKey = this.getSvgIconKey(iconName, fontSet);
        return this._cachedSvgIcons.has(iconKey);
    }

    /**
     *  Returns the key of a cached SVG image.
     *```typescript
     *   const svgIconKey = this.iconService.getSvgIconKey('aruba', 'svg-flags');
     * ```
     */
    public getSvgIconKey(iconName: string, fontSet: string = '') {
        return fontSet + '_' + iconName;
    }

    /**
     * @hidden
     */
    private fetchSvg(iconName: string, url: string, fontSet: string = '') {
        const request = this._httpClient.get(url, { responseType: 'text' });
        const subscription = request.subscribe((value: string) => {
            this.cacheSvgIcon(iconName, value, fontSet);
        }, (error) => {
            subscription.unsubscribe();
            throw new Error(`Could not fetch SVG from url: ${url}; error: ${error.message}`);
        }, () => {
            subscription.unsubscribe();
        });
    }

    /**
     * @hidden
     */
    private cacheSvgIcon(iconName: string, value: string, fontSet: string = '') {
        if (iconName && value) {
            this.ensureSvgContainerCreated();

            const div = this._document.createElement('DIV');
            div.innerHTML = value;
            const svg = div.querySelector('svg') as SVGElement;

            if (svg) {
                const iconKey = this.getSvgIconKey(iconName, fontSet);

                svg.setAttribute('id', iconKey);
                svg.setAttribute('fit', '');
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                svg.setAttribute('focusable', 'false'); // Disable IE11 default behavior to make SVGs focusable.

                if (this._cachedSvgIcons.has(iconKey)) {
                    const oldChild = this._svgContainer.querySelector(`svg[id='${iconKey}']`);
                    this._svgContainer.removeChild(oldChild);
                }

                this._svgContainer.appendChild(svg);
                this._cachedSvgIcons.add(iconKey);
            }
        }
    }

    /**
     * @hidden
     */
    private ensureSvgContainerCreated() {
        if (!this._svgContainer) {
            this._svgContainer = this._document.documentElement.querySelector('.igx-svg-container');
            if (!this._svgContainer) {
                this._svgContainer = this._document.createElement('DIV');
                this._svgContainer.classList.add('igx-svg-container');
                this._document.documentElement.appendChild(this._svgContainer);
            }
        }
    }
}
