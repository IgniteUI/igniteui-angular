import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ContentChildren,
    ChangeDetectorRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    Output,
    QueryList,
    Renderer2,
    ViewChildren,
    OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { IgxButtonDirective, IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxIconModule } from '../icon/index';
import { takeUntil } from 'rxjs/operators';

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

export class IgxButtonGroupComponent implements AfterViewInit, OnDestroy {
    private _disabled = false;
    protected buttonClickNotifier$ = new Subject<boolean>();
    protected queryListNotifier$ = new Subject<boolean>();

    @ViewChildren(IgxButtonDirective) private viewButtons: QueryList<IgxButtonDirective>;
    @ContentChildren(IgxButtonDirective) private templateButtons: QueryList<IgxButtonDirective>;

    /**
     * A collection containing all buttons inside the button group.
     */
    public get buttons(): IgxButtonDirective[] {
        return [...this.viewButtons.toArray(), ...this.templateButtons.toArray()];
    }

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
    @Input()
    public get disabled(): boolean {
        return this._disabled;
    }
    public set disabled(value: boolean) {
        if (this._disabled !== value) {
            this._disabled = value;

            if (this.viewButtons && this.templateButtons) {
                this.buttons.forEach((b) => b.disabled = this._disabled);
            }
        }
    }

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

    constructor(private _cdr: ChangeDetectorRef, private _renderer: Renderer2) {
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
    get selectedButtons(): IgxButtonDirective[] {
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
        if (index >= this.buttons.length || index < 0) {
            return;
        }

        const button = this.buttons[index];
        const buttonElement = button.nativeElement;

        if (buttonElement.classList.contains('igx-button--disabled')) {
            return;
        }

        this.selectedIndexes.push(index);
        button.selected = true;

        this._renderer.setAttribute(buttonElement, 'aria-pressed', 'true');
        this._renderer.addClass(buttonElement, 'igx-button-group__item--selected');

        this.onSelect.emit({ button: button, index: index });

        const indexInViewButtons = this.viewButtons.toArray().indexOf(button);
        if (indexInViewButtons !== -1) {
            this.values[indexInViewButtons].selected = true;
        }

        // deselect other buttons if multiSelection is not enabled
        if (!this.multiSelection && this.selectedIndexes.length > 1) {
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
        if (index >= this.buttons.length || index < 0) {
            return;
        }

        const button = this.buttons[index];
        const buttonElement = button.nativeElement;

        if (buttonElement.classList.contains('igx-button--disabled')) {
            return;
        }

        this.selectedIndexes.splice(this.selectedIndexes.indexOf(index), 1);
        button.selected = false;

        this._renderer.setAttribute(buttonElement, 'aria-pressed', 'false');
        this._renderer.removeClass(buttonElement, 'igx-button-group__item--selected');

        this.onUnselect.emit({ button: button, index: index });

        const indexInViewButtons = this.viewButtons.toArray().indexOf(button);
        if (indexInViewButtons !== -1) {
            this.values[indexInViewButtons].selected = false;
        }
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        const initButtons = () => {
            // Cancel any existing buttonClick subscriptions
            this.buttonClickNotifier$.next();

            this.selectedIndexes.splice(0, this.selectedIndexes.length);

            // initial configuration
            this.buttons.forEach((button, index) => {
                const buttonElement = button.nativeElement;

                if (this.disabled) {
                    button.disabled = true;
                }

                if (!button.disabled && button.selected) {
                    this.selectButton(index);
                }

                button.buttonClick.pipe(takeUntil(this.buttonClickNotifier$)).subscribe((ev) => this._clickHandler(ev, index));
                this._renderer.addClass(buttonElement, 'igx-button-group__item');
            });
        };

        this.viewButtons.changes.pipe(takeUntil(this.queryListNotifier$)).subscribe(() => initButtons());
        this.templateButtons.changes.pipe(takeUntil(this.queryListNotifier$)).subscribe(() => initButtons());
        initButtons();

        this._cdr.detectChanges();
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.buttonClickNotifier$.next();
        this.buttonClickNotifier$.complete();

        this.queryListNotifier$.next();
        this.queryListNotifier$.complete();
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
    button: IgxButtonDirective;
    index: number;
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxButtonGroupComponent],
    exports: [IgxButtonGroupComponent],
    imports: [IgxButtonModule, CommonModule, IgxRippleModule, IgxIconModule]
})

export class IgxButtonGroupModule {
}
