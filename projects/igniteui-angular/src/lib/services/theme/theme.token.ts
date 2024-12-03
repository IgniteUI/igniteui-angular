import { inject, InjectionToken } from "@angular/core";
import { mkenum } from "../../core/utils";
import { BehaviorSubject } from "rxjs";
import { DOCUMENT } from "@angular/common";

export interface ThemeTokenProps {
    theme: IgxTheme,
    preferToken?: boolean
}

export class ThemeToken {
    public subject: BehaviorSubject<ThemeTokenProps>;

    constructor(props: ThemeTokenProps) {
        this.subject = new BehaviorSubject(props);
    }

    public onChange(callback: (props: ThemeTokenProps) => void) {
        return this.subject.subscribe(callback);
    }

    public set(props: ThemeTokenProps) {
        this.subject.next({
            theme: props.theme,
            preferToken: props.preferToken ?? this.preferToken
        });
    }

    public get theme() {
        return this.subject.getValue().theme;
    }

    public get preferToken() {
        return this.subject.getValue().preferToken;
    }
}

export function ThemeTokenFactory(options?: ThemeTokenProps): ThemeToken {
    const document = inject(DOCUMENT);

    const theme = globalThis.window
        ?.getComputedStyle(document.body)
        .getPropertyValue("--ig-theme")
        .trim() || 'material';

    return new ThemeToken({
        theme: options?.theme ?? theme as IgxTheme,
        preferToken: options?.preferToken ?? false
    });
}

export const THEME_TOKEN = new InjectionToken<ThemeToken>('ThemeToken', {
    providedIn: 'root',
    factory: ThemeTokenFactory
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
