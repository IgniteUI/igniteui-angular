import { Injectable, SecurityContext, Inject, Optional } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

/**
 * Event emitted when a SVG icon is loaded through
 * a HTTP request.
 */
export interface IgxIconLoadedEvent {
    /** Name of the icon */
    name: string;
    /** The actual SVG text */
    value: string;
    /** The font-family for the icon. Defaults to material. */
    family: string;
}

/**
 * **Ignite UI for Angular Icon Service** -
 *
 * The Ignite UI Icon Service makes it easy for developers to include custom SVG images and use them with IgxIconComponent.
 * In addition it could be used to associate a custom class to be applied on IgxIconComponent according to given font-family.
 *
 * Example:
 * ```typescript
 * this.iconService.registerFamilyAlias('material', 'material-icons');
 * this.iconService.addSvgIcon('aruba', '/assets/svg/country_flags/aruba.svg', 'svg-flags');
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class IgxIconService {
    /**
     * Observable that emits when an icon is successfully loaded
     * through a HTTP request.
     *
     * @example
     * ```typescript
     * this.service.iconLoaded.subscribe((ev: IgxIconLoadedEvent) => ...);
     * ```
     */
    public iconLoaded: Observable<IgxIconLoadedEvent>;

    private _family = 'material-icons';
    private _familyAliases = new Map<string, string>();
    private _cachedSvgIcons = new Map<string, Map<string, SafeHtml>>();
    private _iconLoaded = new Subject<IgxIconLoadedEvent>();
    private _domParser = new DOMParser();

    constructor(
        @Optional() private _sanitizer: DomSanitizer,
        @Optional() private _httpClient: HttpClient,
        @Optional() @Inject(DOCUMENT) private _document: any
    ) {
        this.iconLoaded = this._iconLoaded.asObservable();
    }

    /**
     *  Returns the default font-family.
     * ```typescript
     *   const defaultFamily = this.iconService.defaultFamily;
     * ```
     */
    public get defaultFamily(): string {
        return this._family;
    }

    /**
     *  Sets the default font-family.
     * ```typescript
     *   this.iconService.defaultFamily = 'svg-flags';
     * ```
     */
    public set defaultFamily(className: string) {
        this._family = className;
    }

    /**
     *  Registers a custom class to be applied to IgxIconComponent for a given font-family.
     * ```typescript
     *   this.iconService.registerFamilyAlias('material', 'material-icons');
     * ```
     */
    public registerFamilyAlias(alias: string, className: string = alias): this {
        this._familyAliases.set(alias, className);
        return this;
    }

    /**
     *  Returns the custom class, if any, associated to a given font-family.
     * ```typescript
     *   const familyClass = this.iconService.familyClassName('material');
     * ```
     */
    public familyClassName(alias: string): string {
        return this._familyAliases.get(alias) || alias;
    }

    /**
     *  Adds an SVG image to the cache. SVG source is an url.
     * ```typescript
     *   this.iconService.addSvgIcon('aruba', '/assets/svg/country_flags/aruba.svg', 'svg-flags');
     * ```
     */
    public addSvgIcon(name: string, url: string, family: string = '') {
        if (name && url) {
            const safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(url);
            if (!safeUrl) {
                throw new Error(`The provided URL could not be processed as trusted resource URL by Angular's DomSanitizer: "${url}".`);
            }

            const sanitizedUrl = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl);
            if (!sanitizedUrl) {
                throw new Error(`The URL provided was not trusted as a resource URL: "${url}".`);
            }

            if (!this.isSvgIconCached(name, family)) {
                this.fetchSvg(url).subscribe((res) => {
                    this.cacheSvgIcon(name, res, family);
                    this._iconLoaded.next({ name, value: res, family });
                });
            }
        } else {
            throw new Error('You should provide at least `name` and `url` to register an svg icon.');
        }
    }

    /**
     *  Adds an SVG image to the cache. SVG source is its text.
     * ```typescript
     *   this.iconService.addSvgIconFromText('simple', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
     *   <path d="M74 74h54v54H74" /></svg>', 'svg-flags');
     * ```
     */
    public addSvgIconFromText(name: string, iconText: string, family: string = '') {
        if (name && iconText) {
            if(this.isSvgIconCached(name, family)) {
                return;
            }

            this.cacheSvgIcon(name, iconText, family);
        } else {
            throw new Error('You should provide at least `name` and `iconText` to register an svg icon.');
        }
    }

    /**
     *  Returns whether a given SVG image is present in the cache.
     * ```typescript
     *   const isSvgCached = this.iconService.isSvgIconCached('aruba', 'svg-flags');
     * ```
     */
    public isSvgIconCached(name: string, family: string = ''): boolean {
        if(this._cachedSvgIcons.has(family)) {
            const familyRegistry = this._cachedSvgIcons.get(family) as Map<string, SafeHtml>;
            return familyRegistry.has(name);
        }

        return false;
    }

    /**
     *  Returns the cached SVG image as string.
     * ```typescript
     *   const svgIcon = this.iconService.getSvgIcon('aruba', 'svg-flags');
     * ```
     */
    public getSvgIcon(name: string, family: string = '') {
        return this._cachedSvgIcons.get(family)?.get(name);
    }

    /**
     * @hidden
     */
    private fetchSvg(url: string): Observable<string> {
        const req = this._httpClient.get(url, { responseType: 'text' });
        return req;
    }

    /**
     * @hidden
     */
    private cacheSvgIcon(name: string, value: string, family: string = '') {
        if (name && value) {
            const doc = this._domParser.parseFromString(value, 'image/svg+xml');
            const svg = doc.querySelector('svg') as SVGElement;

            if (!this._cachedSvgIcons.has(family)) {
                this._cachedSvgIcons.set(family, new Map<string, SafeHtml>());
            }

            if (svg) {
                svg.setAttribute('fit', '');
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                const safeSvg = this._sanitizer.bypassSecurityTrustHtml(svg.outerHTML);
                this._cachedSvgIcons.get(family).set(name, safeSvg);
            }
        }
    }
}
