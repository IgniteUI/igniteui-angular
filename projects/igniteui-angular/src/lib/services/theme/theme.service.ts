import { ElementRef, Inject, Injectable } from "@angular/core";
import { mkenum } from "../../core/utils";
import { BehaviorSubject } from "rxjs";
import { DOCUMENT } from "@angular/common";

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

@Injectable({
    providedIn: "root",
})
export class ThemeService {
    /**
     * Sets the theme of the component.
     * Allowed values of type IgxTheme.
     */
    public globalTheme: IgxTheme;
    private theme$ = new BehaviorSubject<IgxTheme>("material");

    constructor(
        @Inject(DOCUMENT)
        private document: any,
    ) {
        this.theme$.asObservable().subscribe((value) => {
            this.globalTheme = value as IgxTheme;
        });

        this.init();
    }

    private init() {
        const theme = globalThis.window
            ?.getComputedStyle(this.document.body)
            .getPropertyValue("--ig-theme")
            .trim();

        if (theme !== "") {
            this.theme$.next(theme as IgxTheme);
        }
    }

    public getComponentTheme(el: ElementRef) {
        return globalThis.window
        ?.getComputedStyle(el.nativeElement)
        .getPropertyValue('--theme')
        .trim() as IgxTheme;
    }
}
