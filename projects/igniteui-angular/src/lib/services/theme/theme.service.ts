import { ElementRef, Inject, Injectable } from "@angular/core";
import { mkenum } from "../../core/utils";
import { BehaviorSubject } from "rxjs";
import { DOCUMENT } from "@angular/common";

export interface ThemedComponent {
    elementRef: ElementRef;
    themeService: ThemeService;
}

const Theme = /*@__PURE__*/ mkenum({
    Material: "material",
    Fluent: "fluent",
    Bootstrap: "bootstrap",
    IndigoDesign: "indigo",
});

export type ThemeVariant = 'light' | 'dark';

/**
 * Determines the component theme.
 */
export type IgxTheme = (typeof Theme)[keyof typeof Theme];

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Themes = {
    base: string;
    shared?: {
        [K in IgxTheme | 'shared']?: string;
    };
    light: {
        [K in IgxTheme | 'shared']?: string;
    };
    dark: {
        [K in IgxTheme | 'shared']?: string;
    };
};

@Injectable({
    providedIn: "root",
})
export class ThemeService {
    /**
     * Sets the theme of the component.
     * Allowed values of type IgxTheme.
     */
    public globalTheme: IgxTheme;
    public themeVariant: ThemeVariant;
    private themeVariant$ = new BehaviorSubject<ThemeVariant>("light");
    private theme$ = new BehaviorSubject<IgxTheme>("material");
    private componentThemes = new WeakMap<Function, CSSStyleSheet>();

    constructor(
        @Inject(DOCUMENT)
        private document: any,
    ) {
        this.theme$.asObservable().subscribe((value) => {
            this.globalTheme = value as IgxTheme;
        });

        this.themeVariant$.asObservable().subscribe((value) => {
            this.themeVariant = value as ThemeVariant;
        });

        this.init();
    }

    private init() {
        const theme = globalThis.window
            ?.getComputedStyle(this.document.body)
            .getPropertyValue("--ig-theme")
            .trim();

        const themeVariant = globalThis.window
            ?.getComputedStyle(this.document.body)
            .getPropertyValue("--ig-theme-variant")
            .trim();

        if (theme !== "") {
            this.theme$.next(theme as IgxTheme);
        }

        if (themeVariant !== "") {
            this.themeVariant$.next(themeVariant as ThemeVariant);
        }
    }

    public getComponentTheme(el: ElementRef) {
        return globalThis.window
        ?.getComputedStyle(el.nativeElement)
        .getPropertyValue('--theme')
        .trim() as IgxTheme;
    }


    public adoptStyles(componentInstance: Function, themes: Themes) {
        let componentStyles = this.componentThemes.get(componentInstance);

        if (!componentStyles) {
            componentStyles = new CSSStyleSheet();
            this.componentThemes.set(componentInstance, componentStyles);
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, componentStyles];
        }

        componentStyles.replaceSync(
            Array.from(this.composeStyleSheet(themes).cssRules)
            .map(rules => rules.cssText)
            .join('\n')
        );
    }

    private composeStyleSheet(themes: Themes) {
        const sheet = new CSSStyleSheet();

        sheet.insertRule(`@layer base {${themes.base}}`);

        for (const [key, value] of Object.entries(themes)) {
            if (key === 'shared') {
                for (const [theme, styleSheet] of Object.entries(value)) {
                    sheet.insertRule(`@layer ${theme} {${styleSheet}}`)
                }
            }
        }

        sheet.insertRule(`@layer ${this.globalTheme}-overrides {
            ${themes[this.themeVariant][this.globalTheme]}
        }`);


        return sheet;
    }
}
