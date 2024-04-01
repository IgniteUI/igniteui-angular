import { Injectable, SecurityContext, Inject, Optional } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { PlatformUtil } from '../core/utils';

type IconType = "svg" | "font" | "liga";

interface Icon {
    name: string;
    familyAlias: string;
    type?: IconType;
}

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

    private _family = 'material';
    private _defaultIcons = new Map<string, Map<string, Icon>>;
    private _familyAliases = new Map<string, { className: string, type: IconType }>();
    private _cachedSvgIcons = new Map<string, Map<string, SafeHtml>>();
    private _iconLoaded = new Subject<IgxIconLoadedEvent>();
    private _domParser: DOMParser;

    constructor(
        @Optional() private _sanitizer: DomSanitizer,
        @Optional() private _httpClient: HttpClient,
        @Optional() private _platformUtil: PlatformUtil,
        @Optional() @Inject(DOCUMENT) private _document: any,
    ) {
        this.iconLoaded = this._iconLoaded.asObservable();

        if(this._platformUtil?.isBrowser) {
            this._domParser = new DOMParser();
        }
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
    public registerFamilyAlias(alias: string, className: string = alias, type: IconType = "font"): this {
        this._familyAliases.set(alias, { className, type });
        return this;
    }

    /**
     *  Returns the custom class, if any, associated to a given font-family.
     * ```typescript
     *   const familyClass = this.iconService.familyClassName('material');
     * ```
     */
    public familyClassName(alias: string): string {
        return this._familyAliases.get(alias)?.className || alias;
    }

    public familyType(alias: string): IconType {
        return this._familyAliases.get(alias)?.type;
    }

    public mapIcons(alias: string, name: string, reference: { familyAlias: string, name: string }) {
        const ref = new Map<string, {familyAlias: string, name: string}>();
        ref.set(name, reference);
        this._defaultIcons.set(alias, ref);
    }

    public getIcon(alias: string, name: string) {
        const mapping = this._defaultIcons.get(alias)?.get(name);
        const className = this.familyClassName(mapping?.familyAlias || alias);
        const type = this.familyType(mapping?.familyAlias || alias);

        return {
            className,
            type,
            name: mapping?.name || name
        }
    }

    /**
     *  Adds an SVG image to the cache. SVG source is an url.
     * ```typescript
     *   this.iconService.addSvgIcon('aruba', '/assets/svg/country_flags/aruba.svg', 'svg-flags');
     * ```
     */
    public addSvgIcon(name: string, url: string, family = this._family, stripMeta = false) {
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
                this._familyAliases.set(family, { className: family, type: 'svg' });
                this.fetchSvg(url).subscribe((res) => {
                    this.cacheSvgIcon(name, res, family, stripMeta);
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
    public addSvgIconFromText(name: string, iconText: string, family = '', stripMeta = false) {
        if (name && iconText) {
            if (this.isSvgIconCached(name, family)) {
                return;
            }

            this.cacheSvgIcon(name, iconText, family, stripMeta);
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
    public isSvgIconCached(name: string, family = ''): boolean {
        const familyClassName = this.familyClassName(family);
        if (this._cachedSvgIcons.has(familyClassName)) {
            const familyRegistry = this._cachedSvgIcons.get(familyClassName) as Map<string, SafeHtml>;
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
    public getSvgIcon(name: string, family = '') {
        const familyClassName = this.familyClassName(family);
        return this._cachedSvgIcons.get(familyClassName)?.get(name);
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
    private cacheSvgIcon(name: string, value: string, family = this._family, stripMeta: boolean) {
        family = family ? family : this._family;

        if (this._platformUtil?.isBrowser && name && value) {
            const doc = this._domParser.parseFromString(value, 'image/svg+xml');
            const svg = doc.querySelector('svg') as SVGElement;

            if (!this._cachedSvgIcons.has(family)) {
                this._cachedSvgIcons.set(family, new Map<string, SafeHtml>());
            }

            if (svg) {
                svg.setAttribute('fit', '');
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                if (stripMeta) {
                    const title = svg.querySelector('title');
                    const desc = svg.querySelector('desc');

                    if (title) {
                        svg.removeChild(title);
                    }

                    if (desc) {
                        svg.removeChild(desc);
                    }
                }

                const safeSvg = this._sanitizer.bypassSecurityTrustHtml(svg.outerHTML);
                this._cachedSvgIcons.get(family).set(name, safeSvg);
            }
        }
    }
}
