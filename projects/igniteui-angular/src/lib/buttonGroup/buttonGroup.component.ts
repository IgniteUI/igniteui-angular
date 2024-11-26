import { NgFor, NgIf } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ContentChildren,
    ChangeDetectorRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    QueryList,
    Renderer2,
    ViewChildren,
    OnDestroy,
    ElementRef,
    booleanAttribute
} from '@angular/core';
import { Subject } from 'rxjs';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';

import { takeUntil } from 'rxjs/operators';
import { IBaseEventArgs } from '../core/utils';
import { mkenum } from '../core/utils';
import { IgxIconComponent } from '../icon/icon.component';

/**
 * Determines the Button Group alignment
 */
export const ButtonGroupAlignment = mkenum({
    horizontal: 'horizontal',
    vertical: 'vertical'
});
export type ButtonGroupAlignment = typeof ButtonGroupAlignment[keyof typeof ButtonGroupAlignment];

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Button Group** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/buttongroup.html)
 *
 * The Ignite UI Button Group displays a group of buttons either vertically or horizontally. The group supports
 * single, multi and singleRequired selection.
 *
 * Example:
 * ```html
 * <igx-buttongroup selectionMode="multi" [values]="fontOptions">
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
    templateUrl: 'buttongroup-content.component.html',
    imports: [NgFor, IgxButtonDirective, IgxRippleDirective, NgIf, IgxIconComponent]
})
export class IgxButtonGroupComponent implements AfterViewInit, OnDestroy {
    /**
     * A collection containing all buttons inside the button group.
     */
    public get buttons(): IgxButtonDirective[] {
        return [...this.viewButtons.toArray(), ...this.templateButtons.toArray()];
    }

    /**
     * Gets/Sets the value of the `id` attribute. If not set it will be automatically generated.
     * ```html
     *  <igx-buttongroup [id]="'igx-dialog-56'" [selectionMode]="'multi'" [values]="alignOptions">
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-buttongroup-${NEXT_ID++}`;

    /**
     * @hidden
     */
    @HostBinding('style.zIndex')
    public zIndex = 0;

    /**
     * Allows you to set a style using the `itemContentCssClass` input.
     * The value should be the CSS class name that will be applied to the button group.
     * ```typescript
     * public style1 = "styleClass";
     *  //..
     * ```
     *  ```html
     * <igx-buttongroup [itemContentCssClass]="style1" [selectionMode]="'multi'" [values]="alignOptions">
     * ```
     */
    @Input()
    public set itemContentCssClass(value: string) {
        this._itemContentCssClass = value || this._itemContentCssClass;
    }

    /**
     * Returns the CSS class of the item content of the `IgxButtonGroup`.
     * ```typescript
     *  @ViewChild("MyChild")
     * public buttonG: IgxButtonGroupComponent;
     * ngAfterViewInit(){
     *    let buttonSelect = this.buttonG.itemContentCssClass;
     * }
     * ```
     */
    public get itemContentCssClass(): string {
        return this._itemContentCssClass;
    }

    /**
     * Enables selecting multiple buttons. By default, multi-selection is false.
     *
     * @deprecated in version 16.1.0. Use the `selectionMode` property instead.
     */
    @Input()
    public get multiSelection() {
        if (this.selectionMode === 'multi') {
            return true;
        } else {
            return false;
        }
    }
    public set multiSelection(selectionMode: boolean) {
        if (selectionMode) {
            this.selectionMode = 'multi';
        } else {
            this.selectionMode = 'single';
        }
    }

    /**
     * Gets/Sets the selection mode to 'single', 'singleRequired' or 'multi' of the buttons. By default, the selection mode is 'single'.
     * ```html
     * <igx-buttongroup [selectionMode]="'multi'" [alignment]="alignment"></igx-buttongroup>
     * ```
     */
    @Input()
    public get selectionMode() {
        return this._selectionMode;
    }
    public set selectionMode(selectionMode: 'single' | 'singleRequired' | 'multi') {
        if (this.viewButtons && selectionMode !== this._selectionMode) {
            this.buttons.forEach((b,i) => {
                this.deselectButton(i);
            });
            this._selectionMode = selectionMode;
        } else {
            this._selectionMode = selectionMode;
        }
    }

    /**
     * Property that configures the buttons in the button group using a collection of `Button` objects.
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
     *  <igx-buttongroup [selectionMode]="'single'" [values]="cities"></igx-buttongroup>
     * ```
     */
    @Input() public values: any;

    /**
     * Disables the `igx-buttongroup` component. By default it's false.
     * ```html
     * <igx-buttongroup [disabled]="true" [selectionMode]="'multi'" [values]="fontOptions"></igx-buttongroup>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get disabled(): boolean {
        return this._disabled;
    }
    public set disabled(value: boolean) {
        if (this._disabled !== value) {
            this._disabled = value;

            if (this.viewButtons && this.templateButtons) {
                this.buttons.forEach((b) => (b.disabled = this._disabled));
            }
        }
    }

    /**
     * Allows you to set the button group alignment.
     * Available options are `ButtonGroupAlignment.horizontal` (default) and `ButtonGroupAlignment.vertical`.
     * ```typescript
     * public alignment = ButtonGroupAlignment.vertical;
     * //..
     * ```
     * ```html
     * <igx-buttongroup [selectionMode]="'single'" [values]="cities" [alignment]="alignment"></igx-buttongroup>
     * ```
     */
    @Input()
    public set alignment(value: ButtonGroupAlignment) {
        this._isVertical = value === ButtonGroupAlignment.vertical;
    }
    /**
     * Returns the alignment of the `igx-buttongroup`.
     * ```typescript
     * @ViewChild("MyChild")
     * public buttonG: IgxButtonGroupComponent;
     * ngAfterViewInit(){
     *    let buttonAlignment = this.buttonG.alignment;
     * }
     * ```
     */
    public get alignment(): ButtonGroupAlignment {
        return this._isVertical ? ButtonGroupAlignment.vertical : ButtonGroupAlignment.horizontal;
    }

    /**
     * An @Ouput property that emits an event when a button is selected.
     * ```typescript
     * @ViewChild("toast")
     * private toast: IgxToastComponent;
     * public selectedHandler(buttongroup) {
     *     this.toast.open()
     * }
     *  //...
     * ```
     * ```html
     * <igx-buttongroup #MyChild [selectionMode]="'multi'" (selected)="selectedHandler($event)"></igx-buttongroup>
     * <igx-toast #toast>You have made a selection!</igx-toast>
     * ```
     */
    @Output()
    public selected = new EventEmitter<IButtonGroupEventArgs>();

    /**
     * An @Ouput property that emits an event when a button is deselected.
     * ```typescript
     *  @ViewChild("toast")
     *  private toast: IgxToastComponent;
     *  public deselectedHandler(buttongroup){
     *     this.toast.open()
     * }
     *  //...
     * ```
     * ```html
     * <igx-buttongroup> #MyChild [selectionMode]="'multi'" (deselected)="deselectedHandler($event)"></igx-buttongroup>
     * <igx-toast #toast>You have deselected a button!</igx-toast>
     * ```
     */
    @Output()
    public deselected = new EventEmitter<IButtonGroupEventArgs>();

    @ViewChildren(IgxButtonDirective) private viewButtons: QueryList<IgxButtonDirective>;
    @ContentChildren(IgxButtonDirective) private templateButtons: QueryList<IgxButtonDirective>;

    /**
     * Returns true if the `igx-buttongroup` alignment is vertical.
     * Note that in order for the accessor to work correctly the property should be set explicitly.
     * ```html
     * <igx-buttongroup #MyChild [alignment]="alignment" [values]="alignOptions">
     * ```
     * ```typescript
     * //...
     * @ViewChild("MyChild")
     * private buttonG: IgxButtonGroupComponent;
     * ngAfterViewInit(){
     *    let orientation = this.buttonG.isVertical;
     * }
     * ```
     */
    public get isVertical(): boolean {
        return this._isVertical;
    }

    /**
     * @hidden
     */
    public selectedIndexes: number[] = [];

    protected buttonClickNotifier$ = new Subject<void>();
    protected queryListNotifier$ = new Subject<void>();

    private _isVertical: boolean;
    private _itemContentCssClass: string;
    private _disabled = false;
    private _selectionMode: 'single' | 'singleRequired' | 'multi' = 'single';

    private mutationObserver: MutationObserver;
    private observerConfig: MutationObserverInit = {
      attributeFilter: ["data-selected"],
      childList: true,
      subtree: true,
    };

    constructor(
        private _cdr: ChangeDetectorRef,
        private _renderer: Renderer2,
        private _el: ElementRef
    ) {}

    /**
     * Gets the selected button/buttons.
     * ```typescript
     * @ViewChild("MyChild")
     * private buttonG: IgxButtonGroupComponent;
     * ngAfterViewInit(){
     *    let selectedButton = this.buttonG.selectedButtons;
     * }
     * ```
     */
    public get selectedButtons(): IgxButtonDirective[] {
        return this.buttons.filter((_, i) => this.selectedIndexes.indexOf(i) !== -1);
    }

    /**
     * Selects a button by its index.
     * ```typescript
     * @ViewChild("MyChild")
     * private buttonG: IgxButtonGroupComponent;
     * ngAfterViewInit(){
     *    this.buttonG.selectButton(2);
     *    this.cdr.detectChanges();
     * }
     * ```
     *
     * @memberOf {@link IgxButtonGroupComponent}
     */
    public selectButton(index: number) {
        if (index >= this.buttons.length || index < 0) {
            return;
        }

        const button = this.buttons[index];
        button.select();
    }

    /**
     * @hidden
     * @internal
     */
    public updateSelected(index: number) {
        const button = this.buttons[index];

        if (this.selectedIndexes.indexOf(index) === -1) {
            this.selectedIndexes.push(index);
        }

        this._renderer.setAttribute(button.nativeElement, 'aria-pressed', 'true');
        this._renderer.addClass(button.nativeElement, 'igx-button-group__item--selected');

        const indexInViewButtons = this.viewButtons.toArray().indexOf(button);
        if (indexInViewButtons !== -1) {
            this.values[indexInViewButtons].selected = true;
        }

        // deselect other buttons if selectionMode is not multi
        if (this.selectionMode !== 'multi' && this.selectedIndexes.length > 1) {
            this.buttons.forEach((_, i) => {
                if (i !== index && this.selectedIndexes.indexOf(i) !== -1) {
                    this.deselectButton(i);
                    this.updateDeselected(i);
                }
            });
        }

    }

    public updateDeselected(index: number) {
        const button = this.buttons[index];
        if (this.selectedIndexes.indexOf(index) !== -1) {
            this.selectedIndexes.splice(this.selectedIndexes.indexOf(index), 1);
        }

        this._renderer.setAttribute(button.nativeElement, 'aria-pressed', 'false');
        this._renderer.removeClass(button.nativeElement, 'igx-button-group__item--selected');

        const indexInViewButtons = this.viewButtons.toArray().indexOf(button);
        if (indexInViewButtons !== -1) {
            this.values[indexInViewButtons].selected = false;
        }
    }

    /**
     * Deselects a button by its index.
     * ```typescript
     * @ViewChild("MyChild")
     * private buttonG: IgxButtonGroupComponent;
     * ngAfterViewInit(){
     *    this.buttonG.deselectButton(2);
     *    this.cdr.detectChanges();
     * }
     * ```
     *
     * @memberOf {@link IgxButtonGroupComponent}
     */
    public deselectButton(index: number) {
        if (index >= this.buttons.length || index < 0) {
            return;
        }

        const button = this.buttons[index];
        button.deselect();
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
                this._renderer.addClass(buttonElement, 'igx-button-group__item');

                if (this.disabled) {
                    button.disabled = true;
                }

                if (button.selected) {
                    this.updateSelected(index);
                }

                button.buttonClick.pipe(takeUntil(this.buttonClickNotifier$)).subscribe((_) => this._clickHandler(index));
            });
        };

        this.mutationObserver = this.setMutationsObserver();

        this.viewButtons.changes.pipe(takeUntil(this.queryListNotifier$)).subscribe(() => {
            this.mutationObserver.disconnect();
            initButtons();
            this.mutationObserver?.observe(this._el.nativeElement, this.observerConfig);
        });
        this.templateButtons.changes.pipe(takeUntil(this.queryListNotifier$)).subscribe(() => {
            this.mutationObserver.disconnect();
            initButtons();
            this.mutationObserver?.observe(this._el.nativeElement, this.observerConfig);
        });

        initButtons();
        this._cdr.detectChanges();
        this.mutationObserver?.observe(this._el.nativeElement, this.observerConfig);
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.buttonClickNotifier$.next();
        this.buttonClickNotifier$.complete();

        this.queryListNotifier$.next();
        this.queryListNotifier$.complete();

        this.mutationObserver?.disconnect();
    }

    /**
     * @hidden
     */
    public _clickHandler(index: number) {
        const button = this.buttons[index];
        const args: IButtonGroupEventArgs = { owner: this, button, index };

        if (this.selectionMode !== 'multi') {
            this.buttons.forEach((b, i) => {
                if (i !== index && this.selectedIndexes.indexOf(i) !== -1) {
                    this.deselected.emit({ owner: this, button: b, index: i });
                }
            });
        }

        if (this.selectedIndexes.indexOf(index) === -1) {
            this.selectButton(index);
            this.selected.emit(args);
        } else {
            if (this.selectionMode !== 'singleRequired') {
                this.deselectButton(index);
                this.deselected.emit(args);
            }
        }
    }

    private setMutationsObserver() {
        if (typeof MutationObserver !== 'undefined') {
            return new MutationObserver((records, observer) => {
                // Stop observing while handling changes
                observer.disconnect();

                const updatedButtons = this.getUpdatedButtons(records);

                if (updatedButtons.length > 0) {
                    updatedButtons.forEach((button) => {
                        const index = this.buttons.map((b) => b.nativeElement).indexOf(button);

                        this.updateButtonSelectionState(index);
                    });
                }

                // Watch for changes again
                observer.observe(this._el.nativeElement, this.observerConfig);
            });
        }
    }

    private getUpdatedButtons(records: MutationRecord[]) {
        const updated: HTMLButtonElement[] = [];

        records
          .filter((x) => x.type === 'attributes')
          .reduce((prev, curr) => {
            prev.push(
              curr.target as HTMLButtonElement
            );
            return prev;
          }, updated);

        return updated;
    }

    private updateButtonSelectionState(index: number) {
        if (this.buttons[index].selected) {
            this.updateSelected(index);
        } else {
            this.updateDeselected(index);
        }
    }
}

export interface IButtonGroupEventArgs extends IBaseEventArgs {
    owner: IgxButtonGroupComponent;
    button: IgxButtonDirective;
    index: number;
}
