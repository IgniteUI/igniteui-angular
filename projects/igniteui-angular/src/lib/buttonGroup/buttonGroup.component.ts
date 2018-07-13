import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding, Inject,
    Input, NgModule, Output, QueryList, Renderer2, ViewChildren
} from '@angular/core';
import { IgxButtonDirective, IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxIconModule } from '../icon/index';

export enum ButtonGroupAlignment { horizontal, vertical }
let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Button Group** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/buttongroup.html)
 *
 * The Ignite UI Button Group displays a group of buttons either vertically or horizontally.  The group supports
 * single, multiple and toggle selection.
 *
 * Example:
 * ```html
 * <igx-buttongroup multiSelection="true" [values]="fontOptions">
 * </igx-buttongroup>
 * ```
 * The `fontOptions` value shown above is defined as:
 * ```typescript
 * this.fontOptions = [
 *   { icon: 'format_bold', selected: false },
 *   { icon: 'format_italic', selected: false },
 *   { icon: 'format_underlined', selected: false }];
 * ```
 */
@Component({
    selector: 'igx-buttongroup',
    templateUrl: 'buttongroup-content.component.html'
})

export class IgxButtonGroupComponent implements AfterViewInit {
    /**
     * @hidden
     */
    @ViewChildren(IgxButtonDirective) public buttons: QueryList<IgxButtonGroupComponent>;

    /**
     * An @Input property that sets the value of the `id` attribute. If not set it will be automatically generated.
     * ```html
     *  <igx-buttongroup [id]="'igx-dialog-56'" [multiSelection]="!multi" [values]="alignOptions">
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-buttongroup-${NEXT_ID++}`;

    /**
     * Allows you to set a style using the `itemContentCssClass` input.
     * The value should be the CSS class name that will be applied to the button group.
     *```typescript
     *public style1 = "styleClass";
     * //..
     *```
     * ```html
     *<igx-buttongroup [itemContentCssClass]="style1" [multiSelection]="!multi" [values]="alignOptions">
     *```
     */
    @Input() set itemContentCssClass(value: string) {
        this._itemContentCssClass = value || this._itemContentCssClass;
    }

    /**
     * Returns the CSS class of the item content of the `IgxButtonGroup`.
     *```typescript
     *@ViewChild("MyChild")
     *public buttonG: IgxButtonGroupComponent;
     *ngAfterViewInit(){
     *   let buttonSelect = this.buttonG.itemContentCssClass;
     *}
     *```
     */
    get itemContentCssClass(): string {
        return this._itemContentCssClass;
    }

    /**
     * An @Input property that enables selecting multiple buttons. By default, multi-selection is false.
     * ```html
     * <igx-buttongroup [multiSelection]="false" [alignment]="alignment"></igx-buttongroup>
     * ```
     */
    @Input() public multiSelection = false;
    /**
     * An @Input property that allows setting the buttons in the button group.
     * ```typescript
     *  public ngOnInit() {
     *      this.cities = [
     *        new Button({
     *          label: "Sofia"
     *      }),
     *        new Button({
     *          label: "London"
     *      }),
     *        new Button({
     *          label: "New York",
     *          selected: true
     *      }),
     *        new Button({
     *          label: "Tokyo"
     *      })
     *  ];
     *  }
     *  //..
     * ```
     * ```html
     *  <igx-buttongroup [multiSelection]="false" [values]="cities"></igx-buttongroup>
     * ```
     */
    @Input() public values: any;
    /**
     * An @Input property that allows you to disable the `igx-buttongroup` component. By default it's false.
     * ```html
     * <igx-buttongroup [disabled]="true" [multiSelection]="multi" [values]="fontOptions"></igx-buttongroup>
     * ```
     */
    @Input() public disabled = false;


    /**
     * @hidden
     */
    public selectedIndexes: number[] = [];

    /**
     * Allows you to set the button group alignment.
     * Available options are `ButtonGroupAlignment.horizontal` (default) and `ButtonGroupAlignment.vertical`.
     * ```typescript
     *public alignment = ButtonGroupAlignment.vertical;
     * //..
     * ```
     * ```html
     *<igx-buttongroup [multiSelection]="false" [values]="cities" [alignment]="alignment"></igx-buttongroup>
     * ```
     */
    @Input() set alignment(value: ButtonGroupAlignment) {
        this._isVertical = value === ButtonGroupAlignment.vertical;
    }
    /**
     * Returns the alignment of the `igx-buttongroup`.
     *```typescript
     *@ViewChild("MyChild")
     *public buttonG: IgxButtonGroupComponent;
     *ngAfterViewInit(){
     *    let buttonAlignment = this.buttonG.alignment;
     *}
     *```
     */
    get alignment(): ButtonGroupAlignment {
        return this._isVertical ? ButtonGroupAlignment.vertical : ButtonGroupAlignment.horizontal;
    }

    /**
     * An @Ouput property that emits an event when a button is selected.
     *```typescript
     *@ViewChild("toast")
     *private toast: IgxToastComponent;
     *public onSelect(buttongroup){
     *    this.toast.show()
     *}
     * //...
     *```
     *```html
     * <igx-buttongroup #MyChild [multiSelection]="!multi" (onSelect)="onSelect($event)"></igx-buttongroup>
     *<igx-toast #toast message="You have made a selection!"></igx-toast>
     *```
     */
    @Output() public onSelect = new EventEmitter<IButtonGroupEventArgs>();

    /**
     * An @Ouput property that emits an event when a button is deselected.
     *```typescript
     *@ViewChild("toast")
     *private toast: IgxToastComponent;
     *public onUnselect(buttongroup){
     *    this.toast.show()
     *}
     * //...
     *```
     *```html
     * igx-buttongroup #MyChild [multiSelection]="multi" (onUnselect)="onUnselect($event)"></igx-buttongroup>
     *<igx-toast #toast message="You have deselected a button!"></igx-toast>
     *```
     */
    @Output() public onUnselect = new EventEmitter<IButtonGroupEventArgs>();

    /**
     * Returns true if the `igx-buttongroup` alignment is vertical.
     * Note that in order for the accessor to work correctly the property should be set explicitly.
     * ```html
     * <igx-buttongroup #MyChild [alignment]="alignment" [values]="alignOptions">
     * ```
     * ```typescript
     * //...
     *@ViewChild("MyChild")
     *private buttonG: IgxButtonGroupComponent;
     *ngAfterViewInit(){
     *    let orientation = this.buttonG.isVertical;
     *}
     *```
     */
    public get isVertical(): boolean {
        return this._isVertical;
    }
    private _isVertical: boolean;
    private _itemContentCssClass: string;

    constructor(private _el: ElementRef, private _renderer: Renderer2, cdr: ChangeDetectorRef) {
    }

    /**
     * Gets the selected button/buttons.
     *```typescript
     *@ViewChild("MyChild")
     *private buttonG: IgxButtonGroupComponent;
     *ngAfterViewInit(){
     *    let selectedButton = this.buttonG.selectedButtons;
     *}
     *```
     */
    get selectedButtons(): IgxButtonGroupComponent[] {
        return this.buttons.filter((b, i) => {
            return this.selectedIndexes.indexOf(i) !== -1;
        });

    }

    /**
     * Selects a button by its index.
     * @memberOf {@link IgxButtonGroupComponent}
     *```typescript
     *@ViewChild("MyChild")
     *private buttonG: IgxButtonGroupComponent;
     *ngAfterViewInit(){
     *    this.buttonG.selectButton(2);
     *    this.cdr.detectChanges();
     *}
     *```
     */
    public selectButton(index: number) {
        if (this.buttons.toArray()[index]._el.nativeElement.getAttribute('data-togglable') === 'false'
            || this.buttons.toArray()[index]._el.nativeElement.classList.contains('igx-button--disabled')) {
            return;
        }
        const buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.push(index);
        buttonElement.setAttribute('data-selected', true);
        this.onSelect.emit({ button: this.buttons.toArray()[index], index });
        this.values[index].selected = true;

        // deselect other buttons if multiSelection is not enabled
        if (!this.multiSelection && this.selectedIndexes.length > 0) {
            this.buttons.forEach((b, i) => {
                if (i !== index && this.selectedIndexes.indexOf(i) !== -1) {
                    this.deselectButton(i);
                }
            });
        }
    }

    /**
     * Deselects a button by its index.
     * @memberOf {@link IgxButtonGroupComponent}
     * ```typescript
     *@ViewChild("MyChild")
     *private buttonG: IgxButtonGroupComponent;
     *ngAfterViewInit(){
     *    this.buttonG.deselectButton(2);
     *    this.cdr.detectChanges();
     *}
     * ```
     */
    public deselectButton(index: number) {
        if (this.buttons.toArray()[index]._el.nativeElement.getAttribute('data-togglable') === 'false'
            || this.buttons.toArray()[index]._el.nativeElement.classList.contains('igx-button--disabled')) {
            return;
        }
        const buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.splice(this.selectedIndexes.indexOf(index), 1);
        buttonElement.setAttribute('data-selected', false);
        this.onUnselect.emit({ button: this.buttons.toArray()[index], index });
        this.values[index].selected = false;
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        // initial selection
        setTimeout(() => {
            this.buttons.forEach((button, index) => {
                if (!button.disabled && button._el.nativeElement.getAttribute('data-selected') === 'true') {
                    this.selectButton(index);
                }
            });
        }, 0);
    }

    /**
     *@hidden
     */
    public _clickHandler(event, i) {
        if (this.selectedIndexes.indexOf(i) !== -1) {
            this.deselectButton(i);
        } else {
            this.selectButton(i);
        }
    }
}

export interface IButtonGroupEventArgs {
    button: IgxButtonGroupComponent;
    index: number;
}

/**
 * The IgxButtonGroupModule provides the {@link IgxButtonGroupComponent} inside your application.
 */
@NgModule({
    declarations: [IgxButtonGroupComponent],
    exports: [IgxButtonGroupComponent],
    imports: [IgxButtonModule, CommonModule, IgxRippleModule, IgxIconModule]
})

export class IgxButtonGroupModule {
}
