import { DOCUMENT, NgIf, NgTemplateOutlet, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    DestroyRef,
    ElementRef,
    HostBinding,
    HostListener, Inject, Input,
    Optional, QueryList, booleanAttribute,
    inject
} from '@angular/core';
import { IInputResourceStrings, InputResourceStringsEN } from '../core/i18n/input-resources';
import { PlatformUtil, getComponentTheme } from '../core/utils';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxHintDirective } from '../directives/hint/hint.directive';
import {
    IgxInputDirective,
    IgxInputState
} from '../directives/input/input.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';

import { IgxInputGroupBase } from './input-group.common';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from './inputGroupType';
import { IgxIconComponent } from '../icon/icon.component';
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { IgxTheme, THEME_TOKEN, ThemeToken } from '../services/theme/theme.token';

@Component({
    selector: 'igx-input-group',
    templateUrl: 'input-group.component.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxInputGroupComponent }],
    imports: [NgIf, NgTemplateOutlet, IgxPrefixDirective, IgxButtonDirective, NgClass, IgxSuffixDirective, IgxIconComponent, NgSwitch, NgSwitchCase, NgSwitchDefault]
})
export class IgxInputGroupComponent implements IgxInputGroupBase {
    /**
     * Sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IInputResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * Returns the resource strings.
     */
    public get resourceStrings(): IInputResourceStrings {
        return this._resourceStrings;
    }

    /**
     * Property that enables/disables the auto-generated class of the `IgxInputGroupComponent`.
     * By default applied the class is applied.
     * ```typescript
     *  @ViewChild("MyInputGroup")
     *  public inputGroup: IgxInputGroupComponent;
     *  ngAfterViewInit(){
     *  this.inputGroup.defaultClass = false;
     * ```
     * }
     */
    @HostBinding('class.igx-input-group')
    public defaultClass = true;

    /** @hidden */
    @HostBinding('class.igx-input-group--placeholder')
    public hasPlaceholder = false;

    /** @hidden */
    @HostBinding('class.igx-input-group--required')
    public isRequired = false;

    /** @hidden */
    @HostBinding('class.igx-input-group--focused')
    public isFocused = false;

    /**
     * @hidden @internal
     * When truthy, disables the `IgxInputGroupComponent`.
     * Controlled by the underlying `IgxInputDirective`.
     * ```html
     * <igx-input-group [disabled]="true"></igx-input-group>
     * ```
     */
    @HostBinding('class.igx-input-group--disabled')
    public disabled = false;

    /**
     * Prevents automatically focusing the input when clicking on other elements in the input group (e.g. prefix or suffix).
     *
     * @remarks Automatic focus causes software keyboard to show on mobile devices.
     *
     * @example
     * ```html
     * <igx-input-group [suppressInputAutofocus]="true"></igx-input-group>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public suppressInputAutofocus = false;

    /** @hidden */
    @HostBinding('class.igx-input-group--warning')
    public hasWarning = false;

    /** @hidden */
    @ContentChildren(IgxHintDirective, { read: IgxHintDirective })
    protected hints: QueryList<IgxHintDirective>;

    @ContentChildren(IgxPrefixDirective, { read: IgxPrefixDirective, descendants: true })
    protected _prefixes: QueryList<IgxPrefixDirective>;

    @ContentChildren(IgxSuffixDirective, { read: IgxSuffixDirective, descendants: true })
    protected _suffixes: QueryList<IgxSuffixDirective>;

    /** @hidden */
    @ContentChild(IgxInputDirective, { read: IgxInputDirective, static: true })
    protected input: IgxInputDirective;

    private _destroyRef = inject(DestroyRef);
    private _type: IgxInputGroupType = null;
    private _filled = false;
    private _theme: IgxTheme;
    private _resourceStrings = getCurrentResourceStrings(InputResourceStringsEN);

    /** @hidden */
    @HostBinding('class.igx-input-group--valid')
    public get validClass(): boolean {
        return this.input.valid === IgxInputState.VALID;
    }

    /** @hidden */
    @HostBinding('class.igx-input-group--invalid')
    public get invalidClass(): boolean {
        return this.input.valid === IgxInputState.INVALID;
    }

    /** @hidden */
    @HostBinding('class.igx-input-group--filled')
    public get isFilled() {
        return this._filled || (this.input && this.input.value);
    }

    /** @hidden */
    @HostBinding('class.igx-input-group--textarea-group')
    public get textAreaClass(): boolean {
        return this.input.isTextArea;
    }

    /**
     * Sets how the input will be styled.
     * Allowed values of type IgxInputGroupType.
     * ```html
     * <igx-input-group [type]="'search'">
     * ```
     */
    @Input()
    public set type(value: IgxInputGroupType) {
        this._type = value;
    }

    /**
     * Returns the type of the `IgxInputGroupComponent`. How the input is styled.
     * The default is `line`.
     * ```typescript
     * @ViewChild("MyInputGroup")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let inputType = this.inputGroup.type;
     * }
     * ```
     */
    public get type() {
        return this._type || this._inputGroupType || 'line';
    }

    /**
     * Sets the theme of the input.
     * Allowed values of type IgxInputGroupTheme.
     * ```typescript
     * @ViewChild("MyInputGroup")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit() {
     *  let inputTheme = 'fluent';
     * }
     */
    @Input()
    public set theme(value: IgxTheme) {
        this._theme = value;
    }

    /**
     * Returns the theme of the input.
     * The returned value is of type IgxInputGroupType.
     * ```typescript
     * @ViewChild("MyInputGroup")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit() {
     *  let inputTheme = this.inputGroup.theme;
     * }
     */
    public get theme(): IgxTheme {
        return this._theme;
    }

    constructor(
        public element: ElementRef<HTMLElement>,
        @Optional()
        @Inject(IGX_INPUT_GROUP_TYPE)
        private _inputGroupType: IgxInputGroupType,
        @Inject(DOCUMENT)
        private document: any,
        private platform: PlatformUtil,
        private cdr: ChangeDetectorRef,
        @Inject(THEME_TOKEN)
        private themeToken: ThemeToken
    ) {
        this._theme = this.themeToken.theme;
        const themeChange = this.themeToken.onChange((theme) => {
            if (this._theme !== theme) {
                this._theme = theme;
                this.cdr.detectChanges();
            }
        });
        this._destroyRef.onDestroy(() => themeChange.unsubscribe());
    }

    /** @hidden */
    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        if (
            !this.isFocused &&
            event.target !== this.input.nativeElement &&
            !this.suppressInputAutofocus
        ) {
            this.input.focus();
        }
    }

    /** @hidden */
    @HostListener('pointerdown', ['$event'])
    public onPointerDown(event: PointerEvent) {
        if (this.isFocused && event.target !== this.input.nativeElement) {
            event.preventDefault();
        }
    }

    /** @hidden @internal */
    public hintClickHandler(event: MouseEvent) {
        event.stopPropagation();
    }

    /**
     * Returns whether the `IgxInputGroupComponent` has hints.
     * ```typescript
     * @ViewChild("MyInputGroup")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let inputHints = this.inputGroup.hasHints;
     * }
     * ```
     */
    public get hasHints() {
        return this.hints.length > 0;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-input-group--prefixed')
    public get hasPrefixes() {
        return this._prefixes.length > 0 || this.isFileType;
    }

    /** @hidden @internal */
    public set prefixes(items: QueryList<IgxPrefixDirective>) {
        this._prefixes = items;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-input-group--suffixed')
    public get hasSuffixes() {
        return this._suffixes.length > 0 || this.isFileType && this.isFilled;
    }

    /** @hidden @internal */
    public set suffixes(items: QueryList<IgxPrefixDirective>) {
        this._suffixes = items;
    }

    /**
     * Returns whether the `IgxInputGroupComponent` has border.
     * ```typescript
     * @ViewChild("MyInputGroup")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let inputBorder = this.inputGroup.hasBorder;
     * }
     * ```
     */
    public get hasBorder() {
        return (
            (this.type === 'line' || this.type === 'box') &&
            this._theme === 'material'
        );
    }

    /**
     * Returns whether the `IgxInputGroupComponent` type is line.
     * ```typescript
     * @ViewChild("MyInputGroup1")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let isTypeLine = this.inputGroup.isTypeLine;
     * }
     * ```
     */
    public get isTypeLine(): boolean {
        return this.type === 'line' && this._theme === 'material';
    }

    /**
     * Returns whether the `IgxInputGroupComponent` type is box.
     * ```typescript
     * @ViewChild("MyInputGroup1")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let isTypeBox = this.inputGroup.isTypeBox;
     * }
     * ```
     */
    @HostBinding('class.igx-input-group--box')
    public get isTypeBox() {
        return this.type === 'box' && this._theme === 'material';
    }

    /** @hidden @internal */
    public uploadButtonHandler() {
        this.input.nativeElement.click();
    }

    /** @hidden @internal */
    public clearValueHandler() {
        this.input.clear();
    }

    /** @hidden @internal */
    @HostBinding('class.igx-input-group--file')
    public get isFileType() {
        return this.input.type === 'file';
    }

    /** @hidden @internal */
    public get fileNames() {
        return this.input.fileNames || this._resourceStrings.igx_input_file_placeholder;
    }

    /**
     * Returns whether the `IgxInputGroupComponent` type is border.
     * ```typescript
     * @ViewChild("MyInputGroup1")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let isTypeBorder = this.inputGroup.isTypeBorder;
     * }
     * ```
     */
    @HostBinding('class.igx-input-group--border')
    public get isTypeBorder() {
        return this.type === 'border' && this._theme === 'material';
    }

    /**
     * Returns true if the `IgxInputGroupComponent` theme is Fluent.
     * ```typescript
     * @ViewChild("MyInputGroup1")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let isTypeFluent = this.inputGroup.isTypeFluent;
     * }
     * ```
     */
    @HostBinding('class.igx-input-group--fluent')
    public get isTypeFluent() {
        return this._theme === 'fluent';
    }

    /**
     * Returns true if the `IgxInputGroupComponent` theme is Bootstrap.
     * ```typescript
     * @ViewChild("MyInputGroup1")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let isTypeBootstrap = this.inputGroup.isTypeBootstrap;
     * }
     * ```
     */
    @HostBinding('class.igx-input-group--bootstrap')
    public get isTypeBootstrap() {
        return this._theme === 'bootstrap';
    }

    /**
     * Returns true if the `IgxInputGroupComponent` theme is Indigo.
     * ```typescript
     * @ViewChild("MyInputGroup1")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let isTypeIndigo = this.inputGroup.isTypeIndigo;
     * }
     * ```
     */
    @HostBinding('class.igx-input-group--indigo')
    public get isTypeIndigo() {
        return this._theme === 'indigo';
    }

    /**
     * Returns whether the `IgxInputGroupComponent` type is search.
     * ```typescript
     * @ViewChild("MyInputGroup1")
     * public inputGroup: IgxInputGroupComponent;
     * ngAfterViewInit(){
     *    let isTypeSearch = this.inputGroup.isTypeSearch;
     * }
     * ```
     */
    @HostBinding('class.igx-input-group--search')
    public get isTypeSearch() {
        if(!this.isFileType && !this.input.isTextArea) {
            return this.type === 'search';
        }
    }

    /** @hidden */
    public get filled() {
        return this._filled;
    }

    /** @hidden */
    public set filled(val) {
        this._filled = val;
    }

    private setComponentTheme() {
        if (!this.themeToken.preferToken) {
            const theme = getComponentTheme(this.element.nativeElement);

            if (theme && theme !== this._theme) {
                this.theme = theme;
                this.cdr.markForCheck();
            }
        }
    }

    /** @hidden @internal */
    public ngAfterContentChecked() {
        this.setComponentTheme();
    }
}
