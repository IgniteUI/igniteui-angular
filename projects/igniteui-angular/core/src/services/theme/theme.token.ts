import { inject, InjectionToken, DOCUMENT } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export class ThemeToken {
    private document = inject(DOCUMENT);
    public subject: BehaviorSubject<IgxTheme>;

    constructor(private t?: IgxTheme, private v?: IgxThemeVariant) {
        const globalTheme = globalThis.window
            ?.getComputedStyle(this.document.body)
            .getPropertyValue("--ig-theme")
            .trim() || 'material' as IgxTheme;

        const globalVariant = globalThis.window
            ?.getComputedStyle(this.document.body)
            .getPropertyValue("--ig-theme-variant")
            .trim() || 'light' as IgxThemeVariant;

        const _theme = t ?? globalTheme as IgxTheme;
        const _variant = v ?? globalVariant as IgxThemeVariant;

        this.subject = new BehaviorSubject(_theme);
        this.document.documentElement.setAttribute("data-ig-theme", _theme);
        this.document.documentElement.setAttribute("data-ig-theme-variant", _variant);
    }

    public onChange(callback: (theme: IgxTheme) => void) {
        return this.subject.subscribe(callback);
    }

    public set(theme: IgxTheme) {
        this.subject.next(theme);
    }

    public get theme() {
        return this.subject.getValue();
    }

    public get preferToken() {
        return !!this.t;
    }
}

export const THEME_TOKEN = new InjectionToken<ThemeToken>('ThemeToken', {
    providedIn: 'root',
    factory: () => new ThemeToken()
});

const Theme = {
    Material: "material",
    Fluent: "fluent",
    Bootstrap: "bootstrap",
    IndigoDesign: "indigo",
} as const;

const Variant = {
    Light: "light",
    Dark: "dark",
}

/**
 * Determines the component theme.
 */
export type IgxTheme = (typeof Theme)[keyof typeof Theme];
export type IgxThemeVariant = (typeof Variant)[keyof typeof Variant];
