import { CommonModule } from '@angular/common';
import {
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    QueryList,
    Inject,
    Optional
} from '@angular/core';
import { IgxHintDirective } from '../directives/hint/hint.directive';
import { IgxInputDirective, IgxInputState } from '../directives/input/input.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective, IgxPrefixModule} from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective, IgxSuffixModule } from '../directives/suffix/suffix.directive';
import { DisplayDensity, IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase } from '../core/displayDensity';
import { IgxInputGroupBase } from './input-group.common';

let NEXT_ID = 0;

enum IgxInputGroupType {
    LINE,
    BOX,
    BORDER,
    SEARCH
}

@Component({
    selector: 'igx-input-group',
    templateUrl: 'input-group.component.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxInputGroupComponent }]
})
export class IgxInputGroupComponent extends DisplayDensityBase implements IgxInputGroupBase {
    private _type = IgxInputGroupType.LINE;
    private _filled = false;
    private _supressInputAutofocus = false;

    /**
     * An ElementRef property of the `IgxInputGroupComponent`.
     */
    public element: ElementRef;

    /**
     * An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-input-group [id]="'igx-input-group-55'"></igx-input-group>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-input-group-${NEXT_ID++}`;

    /**
     * Property that enables/disables the autogenerated class of the `IgxInputGroupComponent`.
     * By default applied the class is applied.
     *```typescript
     *@ViewChild("MyInputGroup")
     *public inputGroup: IgxInputGroupComponent;
     *ngAfterViewInit(){
     *this.inputGroup.defaultClass = false;
     *```
     *}
     */
    @HostBinding('class.igx-input-group')
    public defaultClass = true;

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--placeholder')
    public hasPlaceholder = false;

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--required')
    public isRequired = false;

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--focused')
    public isFocused = false;


    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--box')
    public isBox = false;

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--border')
    public isBorder = false;

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--search')
    public isSearch = false;

    /**
     * An @Input property that disables the `IgxInputGroupComponent`.
     * ```html
     * <igx-input-group [disabled]="'true'"></igx-input-group>
     * ```
     */
    @HostBinding('class.igx-input-group--disabled')
    @Input()
    public disabled = false;

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--valid')
    public get validClass(): boolean {
        return this.input.valid === IgxInputState.VALID;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--invalid')
    public get invalidClass(): boolean {
        return this.input.valid === IgxInputState.INVALID;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--warning')
    public hasWarning = false;

    /**
     * @hidden
     */
    @ContentChildren(IgxHintDirective, { read: IgxHintDirective })
    protected hints: QueryList<IgxHintDirective>;

    /**
     * @hidden
     */
    @ContentChild(IgxInputDirective, { read: IgxInputDirective })
    protected input: IgxInputDirective;

    /**
     *@hidden
     */
    @HostListener('click', ['$event'])
    public onClick(event) {
        if (!this._supressInputAutofocus) {
            this.input.focus();
        }
    }

    /**
     * An @Input property that sets how the input will be styled.
     * The allowed values are `line`, `box`, `border` and `search`. The default is `line`.
     * ```html
     *<igx-input-group [type]="'search'">
     * ```
     */
    @Input('type')
    set type(value: string) {
        const type: IgxInputGroupType = (IgxInputGroupType as any)[value.toUpperCase()];
        if (type !== undefined) {
            this.isBox = this.isBorder = this.isSearch = false;
            switch (type) {
                case IgxInputGroupType.BOX:
                    this.isBox = true;
                    break;
                case IgxInputGroupType.BORDER:
                    this.isBorder = true;
                    break;
                case IgxInputGroupType.SEARCH:
                    this.isSearch = true;
                    break;
                default: break;
            }

            this._type = type;
        }
    }

    /**
     * Returns whether the input element of the input group will be automatically focused on click.
     * ```typescript
     * let supressInputAutofocus = this.inputGroup.supressInputAutofocus;
     * ```
     */
    @Input()
    public get supressInputAutofocus(): boolean {
        return this._supressInputAutofocus;
    }

    /**
     * Sets whether the input element of the input group will be automatically focused on click.
     * ```html
     * <igx-input-group [supressInputAutofocus]="true"></igx-input-group>
     * ```
     */
    public set supressInputAutofocus(value: boolean) {
        this._supressInputAutofocus = value;
    }

    /**
     *@hidden
     */
    @HostBinding('class.igx-input-group--filled')
    get isFilled() {
        return this._filled || (this.input && this.input.value);
    }

    /**
     *@hidden
     */
    @HostBinding('class.igx-input-group--cosy')
    get isDisplayDensityCosy() {
        return this.isCosy();
    }

    /**
     *@hidden
     */
    @HostBinding('class.igx-input-group--comfortable')
    get isDisplayDensityComfortable() {
        return this.isComfortable();
    }

    /**
     *@hidden
     */
    @HostBinding('class.igx-input-group--compact')
    get isDisplayDensityCompact() {
        return this.isCompact();
    }

    /**
     * Returns the type of the `IgxInputGroupComponent`. How the input is styled.
     * Values are `line` - 0, `box` - 1, `border` - 2  and `search` - 3. The default is `line`.
     * ```typescript
     *@ViewChild("MyInputGroup")
     *public inputGroup: IgxInputGroupComponent;
     *ngAfterViewInit(){
     *    let inputType = this.inputGroup.type;
     *}
     * ```
     */
    get type() {
        return this._type.toString();
    }

    constructor(private _element: ElementRef,
        @Optional() @Inject(DisplayDensityToken) private _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
        this.element = _element;
    }

    /**
     * Returns whether the `IgxInputGroupComponent` has hints.
     * ```typescript
     *@ViewChild("MyInputGroup")
     *public inputGroup: IgxInputGroupComponent;
     *ngAfterViewInit(){
     *    let inputHints = this.inputGroup.hasHints;
     *}
     * ```
     */
    get hasHints() {
        return this.hints.length > 0;
    }

    /**
     * Returns whether the `IgxInputGroupComponent` has border.
     * ```typescript
     *@ViewChild("MyInputGroup")
     *public inputGroup: IgxInputGroupComponent;
     *ngAfterViewInit(){
     *    let inputBroder = this.inputGroup.hasBorder;
     *}
     * ```
     */
    get hasBorder() {
        return this._type === IgxInputGroupType.LINE ||
            this._type === IgxInputGroupType.BOX;
    }

    /**
     * Returns whether the `IgxInputGroupComponent` type is line.
     * ```typescript
     *@ViewChild("MyInputGroup1")
     *public inputGroup: IgxInputGroupComponent;
     *ngAfterViewInit(){
     *    let isTypeLine = this.inputGroup.isTypeLine;
     *}
     * ```
     */
    public get isTypeLine(): boolean {
        return  this._type === IgxInputGroupType.LINE;
    }

    /**
     * Returns whether the `IgxInputGroupComponent` type is box.
     * ```typescript
     *@ViewChild("MyInputGroup1")
     *public inputGroup: IgxInputGroupComponent;
     *ngAfterViewInit(){
     *    let isTypeBox = this.inputGroup.isTypeBox;
     *}
     *```
     */
    get isTypeBox() {
        return this._type === IgxInputGroupType.BOX;
    }

    /**
     * Returns whether the `IgxInputGroupComponent` type is border.
     * ```typescript
     *@ViewChild("MyInputGroup1")
     *public inputGroup: IgxInputGroupComponent;
     *ngAfterViewInit(){
     *    let isTypeBorder = this.inputGroup.isTypeBorder;
     *}
     * ```
     */
    get isTypeBorder() {
        return this._type === IgxInputGroupType.BORDER;
    }

    /**
     * Returns whether the `IgxInputGroupComponent` type is search.
     * ```typescript
     *@ViewChild("MyInputGroup1")
     *public inputGroup: IgxInputGroupComponent;
     *ngAfterViewInit(){
     *    let isTypeSearch = this.inputGroup.isTypeSearch;
     *}
     * ```
     */
    get isTypeSearch() {
        return  this._type === IgxInputGroupType.SEARCH;
    }

    get filled() {
        return this._filled;
    }

    set filled(val) {
        this._filled = val;
    }
}

/**
 * The IgxInputGroupModule provides the {@link IgxInputGroupComponent} inside your application.
 */
@NgModule({
    declarations: [IgxInputGroupComponent, IgxHintDirective, IgxInputDirective, IgxLabelDirective],
    exports: [IgxInputGroupComponent,  IgxHintDirective, IgxInputDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective],
    imports: [CommonModule, IgxPrefixModule, IgxSuffixModule]
})
export class IgxInputGroupModule { }
