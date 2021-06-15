import { Injectable, SecurityContext, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
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
    private _svgContainer: HTMLElement;
    private _cachedSvgIcons: Set<string> = new Set<string>();
    private _iconLoaded = new Subject<IgxIconLoadedEvent>();

    constructor(private _sanitizer: DomSanitizer, @Inject(DOCUMENT) private _document: any) {
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

            this.fetchSvg(name, url, family);
        } else {
            throw new Error('You should provide at least `name` and `url` to register an svg icon.');
        }
    }

    /**
     *  Adds an SVG image to the cache. SVG source is its text.
     * ```typescript
     *   this.iconService.addSvgIcon('simple', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
     *   <path d="M74 74h54v54H74" /></svg>', 'svg-flags');
     * ```
     */
    public addSvgIconFromText(name: string, iconText: string, family: string = '') {
        if (name && iconText) {
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
        const iconKey = this.getSvgIconKey(name, family);
        return this._cachedSvgIcons.has(iconKey);
    }

    /**
     *  Returns the key of a cached SVG image.
     * ```typescript
     *   const svgIconKey = this.iconService.getSvgIconKey('aruba', 'svg-flags');
     * ```
     */
    public getSvgIconKey(name: string, family: string = '') {
        return family + '_' + name;
    }

    /**
     * @hidden
     */
    private fetchSvg(name: string, url: string, family: string = '') {
        const instance = this;
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', url, true);
        httpRequest.responseType = 'text';

        // load – when the result is ready, that includes HTTP errors like 404.
        httpRequest.onload = (event: ProgressEvent) => {
            if (event) {
                const request = event.target as XMLHttpRequest;
                if (request.status === 200) {
                    instance.cacheSvgIcon(name, request.responseText, family);
                    instance._iconLoaded.next({ name, value: request.responseText, family });
                } else {
                    throw new Error(`Could not fetch SVG from url: ${url}; error: ${request.status} (${request.statusText})`);
                }
            } else {
                throw new Error(`Could not fetch SVG from url: ${url};`);
            }
        };

        // error – when the request couldn’t be made, e.g.network down or invalid URL.
        httpRequest.onerror = (event: ProgressEvent) => {
            if (event) {
                const request = event.target as XMLHttpRequest;
                throw new Error(`Could not fetch SVG from url: ${url}; error status code: ${request.status} (${request.statusText})`);
            }
            throw new Error(`Could not fetch SVG from url: ${url};`);
        };

        httpRequest.send();
    }

    /**
     * @hidden
     */
    private cacheSvgIcon(name: string, value: string, family: string = '') {
        if (name && value) {
            this.ensureSvgContainerCreated();

            const div = this._document.createElement('DIV');
            div.innerHTML = value;
            const svg = div.querySelector('svg') as SVGElement;

            if (svg) {
                const iconKey = this.getSvgIconKey(name, family);

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
                this._document.body.appendChild(this._svgContainer);
            }
        }
    }
}
