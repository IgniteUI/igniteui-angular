import { Inject, Injectable } from "@angular/core";
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
    public theme: IgxTheme;
    private theme$ = new BehaviorSubject<IgxTheme>("material");

    constructor(
        @Inject(DOCUMENT)
        private document: any,
    ) {
        this.theme$.asObservable().subscribe((value) => {
            this.theme = value as IgxTheme;
        });

        this.init();
    }

    private init() {
        const theme = globalThis
            .getComputedStyle(this.document.body)
            .getPropertyValue("--ig-theme")
            .trim();

        if (theme !== "") {
            this.theme$.next(theme as IgxTheme);
        }
    }
}
