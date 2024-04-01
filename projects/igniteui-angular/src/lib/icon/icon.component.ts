import {
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
    ChangeDetectorRef,
    OnDestroy,
    booleanAttribute,
} from "@angular/core";
import { IgxIconService } from "./icon.service";
import { first, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { SafeHtml } from "@angular/platform-browser";
import { NgTemplateOutlet } from "@angular/common";

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
    standalone: true,
    imports: [NgTemplateOutlet],
})
export class IgxIconComponent implements OnInit, OnDestroy {
    /**
     *  This allows you to change the value of `class.igx-icon`. By default it's `igx-icon`.
     *
     * @hidden
     * @internal
     */
    @HostBinding("class.igx-icon")
    public cssClass = "igx-icon";

    /**
     *  This allows you to disable the `aria-hidden` attribute. By default it's applied.
     *
     * @example
     * ```typescript
     * @ViewChild("MyIcon") public icon: IgxIconComponent;
     * constructor(private cdRef:ChangeDetectorRef) {}
     * ngAfterViewInit() {
     *     this.icon.ariaHidden = false;
     *     this.cdRef.detectChanges();
     * }
     * ```
     */
    @HostBinding("attr.aria-hidden")
    public ariaHidden = true;

    /**
     * An @Input property that sets the value of the `family`. By default it's "material".
     *
     * @example
     * ```html
     * <igx-icon family="material">settings</igx-icon>
     * ```
     */
    @Input("family")
    public family: string;

    /**
     * An @Input property that allows you to disable the `active` property. By default it's applied.
     *
     * @example
     * ```html
     * <igx-icon [active]="false">settings</igx-icon>
     * ```
     */
    @Input({ alias: "active", transform: booleanAttribute })
    public active = true;

    /**
     *  An @Input property that allows you to set the `name` of the icon.
     *
     *  @example
     * ```html
     * <igx-icon name="contains" family="filter-icons"></igx-icon>
     * ```
     */
    @Input("name")
    public name: string;

    @ViewChild("default", { read: TemplateRef, static: true })
    private default: TemplateRef<HTMLElement>;

    @ViewChild("svgImage", { read: TemplateRef, static: true })
    private svgImage: TemplateRef<HTMLElement>;

    private destroy$ = new Subject<void>();

    constructor(
        public el: ElementRef,
        private iconService: IgxIconService,
        private ref: ChangeDetectorRef,
    ) {
        this.family = "material";
        this.iconService.registerFamilyAlias(
            this.family,
            "material-icons",
            "liga",
        );
        this.iconService.iconLoaded
            .pipe(
                first((e) => e.name === this.name && e.family === this.family),
                takeUntil(this.destroy$),
            )
            .subscribe(() => this.ref.detectChanges());
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnInit() {
        this.updateIcon();
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
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
        return this.family;
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
        return this.name;
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
        if (this.iconService.isSvgIconCached(this.name, this.family)) {
            return this.iconService.getSvgIcon(this.name, this.family);
        }

        return null;
    }

    /**
     *   An accessor that returns a TemplateRef to explicit, svg or no ligature.
     *
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconTemplate = this.icon.template;
     * }
     * ```
     */
    public get template(): TemplateRef<HTMLElement> {
        if (this.iconService.isSvgIconCached(this.name, this.family)) {
            return this.svgImage;
        }

        return this.default;
    }

    /**
     * @hidden
     * @internal
     */
    private updateIcon() {
        const { className, type, name } = this.iconService.getIcon(
            this.family,
            this.name,
        );

        this.el.nativeElement.classList.add(className);

        if (name && type === 'svg') {
            this.family = className;
            this.name = name;
        }

        if (name && type === 'font') {
            this.el.nativeElement.classList.add(name);
        }

        if (name && type === 'liga') {
            this.el.nativeElement.textContent = name;
        }
    }
}
