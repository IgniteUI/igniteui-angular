import { Component, ElementRef, HostBinding, Input, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { IgxIconService } from './icon.service';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DeprecateProperty } from '../core/deprecateDecorators';

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
    selector: 'igx-icon',
    templateUrl: 'icon.component.html'
})
export class IgxIconComponent implements OnInit, OnDestroy {
    /**
     *  This allows you to change the value of `class.igx-icon`. By default it's `igx-icon`.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-icon')
    public cssClass = 'igx-icon';

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
    @HostBinding('attr.aria-hidden')
    public ariaHidden = true;

    /**
     * An @Input property that sets the value of the `family`. By default it's "material".
     *
     * @example
     * ```html
     * <igx-icon family="material">settings</igx-icon>
     * ```
     */
    @Input('family')
    public family: string;

    /**
     * An @Input property that allows you to disable the `active` property. By default it's applied.
     *
     * @example
     * ```html
     * <igx-icon [active]="false">settings</igx-icon>
     * ```
     */
    @Input('active')
    public active = true;

    /**
     * An @Input property that allows you to change the `color` of the icon.
     *
     * * @deprecated
     *
     * @example
     * ```html
     * <igx-icon color="blue">settings</igx-icon>
     * ```
     */
    @DeprecateProperty('`color` is deprecated.')
    @Input('color')
    public color: string;

    /**
     *  An @Input property that allows you to set the `name` of the icon.
     *
     *  @example
     * ```html
     * <igx-icon name="contains" family="filter-icons"></igx-icon>
     * ```
     */
    @Input('name')
    public name: string;

    @ViewChild('noLigature', { read: TemplateRef, static: true })
    private noLigature: TemplateRef<HTMLElement>;

    @ViewChild('explicitLigature', { read: TemplateRef, static: true })
    private explicitLigature: TemplateRef<HTMLElement>;

    @ViewChild('svgImage', { read: TemplateRef, static: true })
    private svgImage: TemplateRef<HTMLElement>;

    private destroy$ = new Subject<void>();

    constructor(public el: ElementRef,
                private iconService: IgxIconService,
                private ref: ChangeDetectorRef) {
        this.family = this.iconService.defaultFamily;
        this.iconService.registerFamilyAlias('material', 'material-icons');
        this.iconService.iconLoaded.pipe(
            first(e => e.name === this.name && e.family === this.family),
            takeUntil(this.destroy$)
        )
        .subscribe(_ => this.ref.detectChanges());
    }

    /**
     * @hidden
     * @internal
     */
    ngOnInit() {
        this.updateIconClass();
    }

    /**
     * @hidden
     * @internal
     */
    ngOnDestroy() {
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
    get getFamily(): string {
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
    get getActive(): boolean {
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
    @HostBinding('class.igx-icon--inactive')
    get getInactive(): boolean {
        return !this.active;
    }

    /**
     * An accessor that returns the opposite value of the `color` property.
     *
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let color = this.icon.getColor;
     * }
     * ```
     */
    @HostBinding('style.color')
    get getColor(): string {
        return this.color;
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
    get getName(): string {
        return this.name;
    }

    /**
     *  An accessor that returns the key of the SVG image.
     *  The key consists of the font-family and the name separated by underscore.
     *
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let svgKey = this.icon.getSvgKey;
     * }
     * ```
     */
    get getSvgKey(): string {
        if (this.iconService.isSvgIconCached(this.name, this.family)) {
            return '#' + this.iconService.getSvgIconKey(this.name, this.family);
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
    get template(): TemplateRef<HTMLElement> {
        if (this.name) {
            if (this.iconService.isSvgIconCached(this.name, this.family)) {
                return this.svgImage;
            }

            return this.noLigature;
        }

        return this.explicitLigature;
    }

    /**
     * @hidden
     * @internal
     */
    private updateIconClass() {
        const className = this.iconService.familyClassName(this.family);
        this.el.nativeElement.classList.add(className);

        if (this.name && !this.iconService.isSvgIconCached(this.name, this.family)) {
            this.el.nativeElement.classList.add(this.name);
        }
    }
}
