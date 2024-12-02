import { inject, InjectionToken } from "@angular/core";
import { mkenum } from "../../core/utils";
import { BehaviorSubject } from "rxjs";
import { DOCUMENT } from "@angular/common";

interface ThemeTokenProps {
    theme: IgxTheme,
    preferToken?: boolean
}

export type ThemeToken = BehaviorSubject<ThemeTokenProps>;
export function ThemeTokenFactory(options?: ThemeTokenProps): ThemeToken {
    return new BehaviorSubject<ThemeTokenProps>({
        theme: options?.theme ?? 'material',
        preferToken: options?.preferToken ?? false
    });
}

export const THEME_TOKEN = new InjectionToken<ThemeToken>('ThemeToken', {
    providedIn: 'root',
    factory: () => {
        const document = inject(DOCUMENT);

        const theme = globalThis.window
            ?.getComputedStyle(document.body)
            .getPropertyValue("--ig-theme")
            .trim() || 'material';

        return ThemeTokenFactory({
            theme: theme as IgxTheme,
        });
    }
});

const Theme = /*@__PURE__*/ mkenum({
    Material: "material",
    Fluent: "fluent",
    Bootstrap: "bootstrap",
    IndigoDesign: "indigo",
});

/**
 * Determines the component theme.
 */
export type IgxTheme = (typeof Theme)[keyof typeof Theme];
