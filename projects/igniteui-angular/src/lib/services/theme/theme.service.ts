import { ElementRef, inject, Injectable } from "@angular/core";
import { THEME_TOKEN, ThemeToken, IgxTheme } from "igniteui-angular";

export interface ThemedComponent {
    elementRef: ElementRef;
    themeService: ThemeService;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Themes = {
    base: string;
    shared?: {
        [K in IgxTheme]?: string;
    };
    light: {
        [K in IgxTheme]?: string;
    };
    dark: {
        [K in IgxTheme]?: string;
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
    private themeToken: ThemeToken = inject(THEME_TOKEN);
    private componentThemes = new WeakMap<Function, CSSStyleSheet>();

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

        for (const theme of ['indigo', 'material', 'bootstrap', 'fluent']) {
            if (themes.shared[theme]) {
                sheet.insertRule(`@layer ${theme} {${themes.shared[theme]}}`);
            }

            sheet.insertRule(`@layer theme {${themes[this.themeToken.variant][theme]}`);
        }

        return sheet;
    }
}
