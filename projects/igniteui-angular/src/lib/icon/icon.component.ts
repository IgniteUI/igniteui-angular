import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IgxIconService } from './icon.service';
/**
 * **Ignite UI for Angular Icon** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/icon.html)
 *
 * The Ignite UI Icon makes it easy for developers to include material design icons directly in their markup. The icons
 * support custom colors and can be marked as active or disabled using the `isActive` property. This will change the appearence
 * of the icon.
 *
 * Example:
 * ```html
 * <igx-icon name="home" color="#00ff00" isActive="true">
 * </igx-icon>
 * ```
 */
let NEXT_ID = 0;

@Component({
    selector: 'igx-icon',
    templateUrl: 'icon.component.html'
})

export class IgxIconComponent implements OnInit {
    @ViewChild('noLigature', { read: TemplateRef })
    private noLigature: TemplateRef<HTMLElement>;

    @ViewChild('implicitLigature', { read: TemplateRef })
    private implicitLigature: TemplateRef<HTMLElement>;

    @ViewChild('explicitLigature', { read: TemplateRef })
    private explicitLigature: TemplateRef<HTMLElement>;

    /**
     *  This allows you to change the value of `class.igx-icon`. By default it's `igx-icon`.
     *```html
     *@ViewChild("MyIcon") public icon: IgxIconComponent;
     *constructor(private cdRef:ChangeDetectorRef) {}
     *ngAfterViewInit() {
     *    this.icon.cssClass = "";
     *    this.cdRef.detectChanges();
     *}
     * ```
     */
    @HostBinding('class.igx-icon')
    public cssClass = 'igx-icon';

    /**
     *  This allows you to disable the `aria-hidden` attribute. By default it's applied.
     *```html
     *@ViewChild("MyIcon") public icon: IgxIconComponent;
     *constructor(private cdRef:ChangeDetectorRef) {}
     *ngAfterViewInit() {
     *    this.icon.ariaHidden = false;
     *    this.cdRef.detectChanges();
     *}
     * ```
     */
    @HostBinding('attr.aria-hidden')
    public ariaHidden = true;

    /**
    *    An @Input property that sets the value of the `id` attribute.
    *```html
    *<igx-icon id="igx-icon-1" fontSet="material" name="settings" color="blue" [isActive]="false"></igx-icon>
    *```
    */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-icon-${NEXT_ID++}`;

    /**
    *    An @Input property that sets the value of the `fontSet`. By default it's "material".
    *```html
    *<igx-icon fontSet="material" name="settings" color="blue" [isActive]="false"></igx-icon>
    *```
    */
    @Input('fontSet')
    public font: string;

    /**
    *    An @Input property that allows you to disable the `active` property. By default it's applied.
    *```html
    *<igx-icon [isActive]="false" fontSet="material" name="settings" color="blue"></igx-icon>
    *```
    */
    @Input('isActive')
    public active = true;

    /**
    *    An @Input property that allows you to change the `iconColor` of the icon.
    *```html
    *<igx-icon color="blue" [isActive]="true" fontSet="material" name="settings" ></igx-icon>
    *```
    */
    @Input('color')
    public iconColor: string;

    /**
    *    An @Input property that allows you to change the `iconName` of the icon.
    *    The `iconName` can be set using the `name`.
    *    You can provide either ligature `name` or glyph `iconName`, but not both at the same time.
    *```html
    *<igx-icon name="question_answer" color="blue" [isActive]="true" fontSet="material"></igx-icon>
    *```
    */
    @Input('name')
    public iconName: string;

    /**
    *    An @Input property that allows you to change the `glyphName` of the icon.
    *    The `glyphName` can be set using `iconName`.
    *    You can provide either ligature `name` or glyph `iconName`, but not both at the same time.
    *```html
    *<igx-icon iconName="question_answer" color="blue" [isActive]="true" fontSet="material"></igx-icon>
    *```
    */
    @Input('iconName')
    public glyphName: string;

    /**
     * An ElementRef property of the `igx-icon` component.
     */
    public el: ElementRef;

    constructor(private _el: ElementRef, private iconService: IgxIconService) {
        this.el = _el;
        this.font = this.iconService.defaultFontSet;
        this.iconService.registerFontSetAlias('material', 'material-icons');
    }

    /**
     * @hidden
     */
    ngOnInit() {
        this.checkInputProps();
        this.updateIconClass();
    }

        /**
     *   An accessor that returns the value of the font property.
     *```html
     *@ViewChild("MyIcon")
     *public icon: IgxIconComponent;
     *ngAfterViewInit() {
     *    let iconFont = this.icon.getFontSet;
     * }
     * ```
     */
    get getFontSet(): string {
        return this.font;
    }

    /**
     *   An accessor that returns the value of the active property.
     *```html
     *@ViewChild("MyIcon")
     *public icon: IgxIconComponent;
     *ngAfterViewInit() {
     *    let iconActive = this.icon.getActive;
     * }
     * ```
     */
    get getActive(): boolean {
        return this.active;
    }

    /**
     *   An accessor that returns the opposite value of the active property.
     *```html
     *@ViewChild("MyIcon")
     *public icon: IgxIconComponent;
     *ngAfterViewInit() {
     *    let iconActive = this.icon.getInactive;
     * }
     * ```
     */
    @HostBinding('class.igx-icon--inactive')
    get getInactive(): boolean {
        return !this.active;
    }

    /**
     *   An accessor that returns the opposite value of the `iconColor` property.
     *```html
     *@ViewChild("MyIcon")
     *public icon: IgxIconComponent;
     *ngAfterViewInit() {
     *    let iconActive = this.icon.getIconColor;
     * }
     * ```
     */
    @HostBinding('style.color')
    get getIconColor(): string {
        return this.iconColor;
    }

    /**
     *   An accessor that returns the value of the iconName property.
     *```html
     *@ViewChild("MyIcon")
     *public icon: IgxIconComponent;
     *ngAfterViewInit() {
     *    let iconName = this.icon.getIconName;
     * }
     * ```
     */
    get getIconName(): string {
        return this.iconName;
    }

    /**
     *   An accessor that returns a TemplateRef to explicit, implicit or no ligature.
     *```html
     *@ViewChild("MyIcon")
     *public icon: IgxIconComponent;
     *ngAfterViewInit() {
     *    let iconTemplate = this.icon.template;
     * }
     * ```
     */
    get template(): TemplateRef<HTMLElement> {
        if (this.glyphName) {
            return this.noLigature;
        }

        if (this.iconName) {
            return this.implicitLigature;
        }

        return this.explicitLigature;
    }

    private checkInputProps() {
        if (this.iconName && this.glyphName) {
            throw new Error(
                'You can provide either ligature `name` or glyph `iconName`, but not both at the same time.'
            );
        }
    }

    private updateIconClass() {
        const className = this.iconService.fontSetClassName(this.font);
        this.el.nativeElement.classList.add(className);

        if (this.glyphName) {
            this.el.nativeElement.classList.add(this.glyphName);
        }
    }
}
