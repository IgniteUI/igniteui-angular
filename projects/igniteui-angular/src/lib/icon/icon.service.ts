import { DestroyRef, Inject, Injectable, Optional, SecurityContext } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { DOCUMENT } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { PlatformUtil } from "../core/utils";
import { iconReferences } from './icon.references'
import { IconFamily, IconMeta, FamilyMeta } from "./types";
import type { IconType, IconReference } from './types';
import { IgxTheme, THEME_TOKEN, ThemeToken } from "../services/theme/theme.token";
import { IndigoIcons } from "./icons.indigo";

/**
 * Event emitted when a SVG icon is loaded through
 * a HTTP request.
 */
export interface IgxIconLoadedEvent {
    /** Name of the icon */
    name: string;
    /** The actual SVG text, if any */
    value?: string;
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
 * this.iconService.setFamily('material', { className: 'material-icons', type: 'font' });
 * this.iconService.addSvgIcon('aruba', '/assets/svg/country_flags/aruba.svg', 'svg-flags');
 * ```
 */
@Injectable({
    providedIn: "root",
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

    private _defaultFamily: IconFamily = {
        name: "material",
        meta: { className: "material-icons", type: "liga" },
    };
    private _iconRefs = new Map<string, Map<string, IconMeta>>();
    private _families = new Map<string, FamilyMeta>();
    private _cachedIcons = new Map<string, Map<string, SafeHtml>>();
    private _iconLoaded = new Subject<IgxIconLoadedEvent>();
    private _domParser: DOMParser;

    constructor(
        @Optional() private _sanitizer: DomSanitizer,
        @Optional() private _httpClient: HttpClient,
        @Optional() private _platformUtil: PlatformUtil,
        @Optional() @Inject(THEME_TOKEN) private _themeToken: ThemeToken,
        @Optional() @Inject(DestroyRef) private _destroyRef: DestroyRef,
        @Optional() @Inject(DOCUMENT) protected document: Document,
    ) {

        this.iconLoaded = this._iconLoaded.asObservable();
        this.setFamily(this._defaultFamily.name, this._defaultFamily.meta);

        const { unsubscribe } = this._themeToken?.onChange((theme) => {
            this.setRefsByTheme(theme);
        });

        this._destroyRef.onDestroy(() => unsubscribe);

        if (this._platformUtil?.isBrowser) {
            this._domParser = new DOMParser();

            for (const [name, svg] of IndigoIcons) {
                this.addSvgIconFromText(name, svg.value, `internal_${svg.fontSet}`, true);
            }
        }
    }

    /**
     *  Returns the default font-family.
     * ```typescript
     *   const defaultFamily = this.iconService.defaultFamily;
     * ```
     */
    public get defaultFamily(): IconFamily {
        return this._defaultFamily;
    }

    /**
     *  Sets the default font-family.
     * ```typescript
     *   this.iconService.defaultFamily = 'svg-flags';
     * ```
     */
    public set defaultFamily(family: IconFamily) {
        this._defaultFamily = family;
        this.setFamily(this._defaultFamily.name, this._defaultFamily.meta);
    }

    /**
     *  Registers a custom class to be applied to IgxIconComponent for a given font-family.
     * ```typescript
     *   this.iconService.registerFamilyAlias('material', 'material-icons');
     * ```
     * @deprecated in version 18.1.0. Use `setFamily` instead.
     */
    public registerFamilyAlias(
        alias: string,
        className: string = alias,
        type: IconType = "font",
    ): this {
        this.setFamily(alias, { className, type });
        return this;
    }

    /**
     *  Returns the custom class, if any, associated to a given font-family.
     * ```typescript
     *   const familyClass = this.iconService.familyClassName('material');
     * ```
     */
    public familyClassName(alias: string): string {
        return this._families.get(alias)?.className || alias;
    }

    /** @hidden @internal */
    private familyType(alias: string): IconType {
        return this._families.get(alias)?.type;
    }

    /** @hidden @internal */
    public setRefsByTheme(theme: IgxTheme) {
        for (const { alias, target } of iconReferences) {
            const external = this._iconRefs.get(alias.family)?.get(alias.name)?.external;

            const _ref = this._iconRefs.get('default')?.get(alias.name) ?? {};
            const _target = target.get(theme) ?? target.get('default')!;

            const icon = target.get(theme) ?? target.get('default')!;
            const overwrite = !external && !(JSON.stringify(_ref) === JSON.stringify(_target));

            this._setIconRef(
                alias.name,
                alias.family,
                icon,
                overwrite
            );
        }
    }

    /**
     *  Creates a family to className relationship that is applied to the IgxIconComponent
     *   whenever that family name is used.
     * ```typescript
     *   this.iconService.setFamily('material', { className: 'material-icons', type: 'liga' });
     * ```
     */
    public setFamily(name: string, meta: FamilyMeta) {
        this._families.set(name, meta);
    }

    /**
     *  Adds an icon reference meta for an icon in a meta family.
     *  Executes only if no icon reference is found.
     * ```typescript
     *   this.iconService.addIconRef('aruba', 'default', { name: 'aruba', family: 'svg-flags' });
     * ```
     */
    public addIconRef(name: string, family: string, icon: IconMeta) {
        const iconRef = this._iconRefs.get(family)?.get(name);

        if (!iconRef) {
            this.setIconRef(name, family, icon);
        }
    }

    private _setIconRef(name: string, family: string, icon: IconMeta, overwrite = false) {
        if (overwrite) {
            this.setIconRef(name, family, {
                ...icon,
                external: false
            });
        }
    }

    /**
     *  Similar to addIconRef, but always sets the icon reference meta for an icon in a meta family.
     * ```typescript
     *   this.iconService.setIconRef('aruba', 'default', { name: 'aruba', family: 'svg-flags' });
     * ```
     */
    public setIconRef(name: string, family: string, icon: IconMeta) {
        let familyRef = this._iconRefs.get(family);

        if (!familyRef) {
            familyRef = new Map<string, IconMeta>();
            this._iconRefs.set(family, familyRef);
        }

        const external = icon.external ?? true;
        const familyType = this.familyType(icon?.family);
        familyRef.set(name, { ...icon, type: icon.type ?? familyType, external });

        this._iconLoaded.next({ name, family });
    }

    /**
     *  Returns the icon reference meta for an icon in a given family.
     * ```typescript
     *   const iconRef = this.iconService.getIconRef('aruba', 'default');
     * ```
     */
    public getIconRef(name: string, family: string): IconReference {
        const icon = this._iconRefs.get(family)?.get(name);

        const iconFamily = icon?.family ?? family;
        const _name = icon?.name ?? name;
        const className = this.familyClassName(iconFamily);
        const prefix = this._families.get(iconFamily)?.prefix;

        // Handle name prefixes
        let iconName = _name;

        if (iconName && prefix) {
            iconName = _name.includes(prefix) ? _name : `${prefix}${_name}`;
        }

        const cached = this.isSvgIconCached(iconName, iconFamily);
        const type = cached ? "svg" : icon?.type ?? this.familyType(iconFamily);

        return {
            className,
            type,
            name: iconName,
            family: iconFamily,
        };
    }

    private getOrCreateSvgFamily(family: string) {
        if (!this._families.has(family)) {
            this._families.set(family, { className: family, type: "svg" });
        }

        return this._families.get(family);
    }
    /**
     *  Adds an SVG image to the cache. SVG source is an url.
     * ```typescript
     *   this.iconService.addSvgIcon('aruba', '/assets/svg/country_flags/aruba.svg', 'svg-flags');
     * ```
     */
    public addSvgIcon(
        name: string,
        url: string,
        family = this._defaultFamily.name,
        stripMeta = false,
    ) {
        if (name && url) {
            const safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(url);

            if (!safeUrl) {
                throw new Error(
                    `The provided URL could not be processed as trusted resource URL by Angular's DomSanitizer: "${url}".`,
                );
            }

            const sanitizedUrl = this._sanitizer.sanitize(
                SecurityContext.RESOURCE_URL,
                safeUrl,
            );

            if (!sanitizedUrl) {
                throw new Error(
                    `The URL provided was not trusted as a resource URL: "${url}".`,
                );
            }

            if (!this.isSvgIconCached(name, family)) {
                this.getOrCreateSvgFamily(family);

                this.fetchSvg(url).subscribe((res) => {
                    this.cacheSvgIcon(name, res, family, stripMeta);
                });
            }
        } else {
            throw new Error(
                "You should provide at least `name` and `url` to register an svg icon.",
            );
        }
    }

    /**
     *  Adds an SVG image to the cache. SVG source is its text.
     * ```typescript
     *   this.iconService.addSvgIconFromText('simple', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
     *   <path d="M74 74h54v54H74" /></svg>', 'svg-flags');
     * ```
     */
    public addSvgIconFromText(
        name: string,
        iconText: string,
        family = this._defaultFamily.name,
        stripMeta = false,
    ) {
        if (name && iconText) {
            if (this.isSvgIconCached(name, family)) {
                return;
            }

            this.getOrCreateSvgFamily(family);
            this.cacheSvgIcon(name, iconText, family, stripMeta);
        } else {
            throw new Error(
                "You should provide at least `name` and `iconText` to register an svg icon.",
            );
        }
    }

    /**
     *  Returns whether a given SVG image is present in the cache.
     * ```typescript
     *   const isSvgCached = this.iconService.isSvgIconCached('aruba', 'svg-flags');
     * ```
     */
    public isSvgIconCached(name: string, family: string): boolean {
        if (this._cachedIcons.has(family)) {
            const familyRegistry = this._cachedIcons.get(
                family,
            ) as Map<string, SafeHtml>;

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
    public getSvgIcon(name: string, family: string) {
        return this._cachedIcons.get(family)?.get(name);
    }

    /**
     * @hidden
     */
    private fetchSvg(url: string): Observable<string> {
        const req = this._httpClient.get(url, { responseType: "text" });
        return req;
    }

    /**
     * @hidden
     */
    private cacheSvgIcon(
        name: string,
        value: string,
        family = this._defaultFamily.name,
        stripMeta: boolean,
    ) {
        if (this._platformUtil?.isBrowser && name && value) {
            const doc = this._domParser.parseFromString(value, "image/svg+xml");
            const svg = doc.querySelector("svg") as SVGElement;

            if (!this._cachedIcons.has(family)) {
                this._cachedIcons.set(family, new Map<string, SafeHtml>());
            }

            if (svg) {
                svg.setAttribute("fit", "");
                svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

                if (stripMeta) {
                    const title = svg.querySelector("title");
                    const desc = svg.querySelector("desc");

                    if (title) {
                        svg.removeChild(title);
                    }

                    if (desc) {
                        svg.removeChild(desc);
                    }
                }

                const safeSvg = this._sanitizer.bypassSecurityTrustHtml(
                    svg.outerHTML,
                );

                this._cachedIcons.get(family).set(name, safeSvg);
                this._iconLoaded.next({ name, value, family });
            }
        }
    }
}
