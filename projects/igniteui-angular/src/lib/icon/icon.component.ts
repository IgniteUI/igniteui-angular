import {
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnInit,
    OnDestroy,
    OnChanges,
    ChangeDetectorRef,
    booleanAttribute,
} from "@angular/core";
import { IgxIconService } from "./icon.service";
import type { IconReference } from "./types";
import { filter, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { SafeHtml } from "@angular/platform-browser";
import { NgIf, NgTemplateOutlet } from "@angular/common";

/**
 * Icon provides a way to include material icons to markup
 *
 * @igxModule IgxIconModule
 *
 * @igxTheme igx-icon-theme
 *
 * @igxKeywords icon, picture
 *
 * @igxGroup Display
 *
 * @remarks
 *
 * The Ignite UI Icon makes it easy for developers to include material design icons directly in their markup. The icons
 * support different icon families and can be marked as active or disabled using the `active` property. This will change the appearance
 * of the icon.
 *
 * @example
 * ```html
 * <igx-icon family="filter-icons" active="true">home</igx-icon>
 * ```
 */
@Component({
    selector: "igx-icon",
    templateUrl: "icon.component.html",
})
export class IgxIconComponent implements OnInit, OnChanges, OnDestroy {
    private _iconRef: IconReference;
    private _destroy$ = new Subject<void>();
    private _userClasses = new Set<string>();
    private _iconClasses = new Set<string>();

    @HostBinding("class")
    protected get elementClasses() {
        const icon = Array.from(this._iconClasses).join(" ");
        const user = Array.from(this._userClasses).join(" ");

        return `igx-icon ${icon} ${user}`.trim();
    }

    private addIconClass(className: string) {
        this._iconClasses.add(className);
    }

    private clearIconClasses() {
        this._iconClasses.clear();
    }

    /**
     *  An accessor that returns inactive property.
     *
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconActive = this.icon.getInactive;
     * }
     * ```
     */
    @HostBinding("class.igx-icon--inactive")
    public get getInactive(): boolean {
        return !this.active;
    }

    /**
     * An @Input property that sets the value of the `family`. By default it's "material".
     *
     * @example
     * ```html
     * <igx-icon family="material">settings</igx-icon>
     * ```
     */
    @Input()
    public family: string;

    /**
     *  Set the `name` of the icon.
     *
     *  @example
     * ```html
     * <igx-icon name="contains" family="filter-icons"></igx-icon>
     * ```
     */
    @Input()
    public name: string;

    /**
     * An @Input property that allows you to disable the `active` property. By default it's applied.
     *
     * @example
     * ```html
     * <igx-icon [active]="false">settings</igx-icon>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public active = true;

    constructor(
        public el: ElementRef,
        private iconService: IgxIconService,
        private ref: ChangeDetectorRef,
    ) {
        this.family = this.iconService.defaultFamily.name;

        this.iconService.iconLoaded
            .pipe(
                filter((e) => e.name === this.name && e.family === this.family),
                takeUntil(this._destroy$),
            )
            .subscribe(() => {
                this.setIcon();
                this.ref.detectChanges()
            });
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnInit() {
        this.setIcon();
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnChanges() {
        this.setIcon();
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    protected get iconRef() {
        return this._iconRef;
    }

    protected set iconRef(ref: IconReference) {
        this._iconRef = ref;
    }

    /**
     *  An accessor that returns the value of the family property.
     *
     * @example
     * ```typescript
     *  @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconFamily = this.icon.getFamily;
     * }
     * ```
     */
    public get getFamily(): string {
        return this.iconRef.family;
    }

    /**
     *  An accessor that returns the value of the active property.
     *
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconActive = this.icon.getActive;
     * }
     * ```
     */
    public get getActive(): boolean {
        return this.active;
    }

    /**
     * An accessor that returns the value of the iconName property.
     *
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let name = this.icon.getName;
     * }
     * ```
     */
    public get getName(): string {
        return this.iconRef.name;
    }

    /**
     *  An accessor that returns the underlying SVG image as SafeHtml.
     *
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let svg: SafeHtml = this.icon.getSvg;
     * }
     * ```
     */
    public get getSvg(): SafeHtml {
        const { name, family } = this.iconRef;

        if (this.iconService.isSvgIconCached(name, family)) {
            return this.iconService.getSvgIcon(name, family);
        }

        return null;
    }

    /**
     * @hidden
     * @internal
     */
    private setIcon() {
        this.iconRef = this.iconService.getIconRef(this.name, this.family);
        this.clearIconClasses();

        const { name, type, className } = this.iconRef;

        if (name && type === "font") {
            this.addIconClass(name);
        }

        this.addIconClass(className);
    }
}
