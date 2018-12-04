import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    forwardRef,
    Input,
    NgModule,
    QueryList,
    Self,
    Optional,
    HostListener,
    Directive
} from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxComboDropDownComponent } from '../combo/combo-dropdown.component';
import { IgxDropDownBase, IgxDropDownItemBase } from './drop-down.base';


@Directive({
    selector: '[igxDropDownItemNavigation]'
})
export class IgxDropDownItemNavigationDirective {

    private _target;

    constructor(@Self() @Optional() public dropdown: IgxDropDownBase) { }

    /**
     * @hidden
     */
    get target() {
        return this._target;
    }

    /**
     * @hidden
     */
    @Input('igxDropDownItemNavigation')
    set target(target: IgxDropDownBase) {
        this._target = target ? target : this.dropdown;
    }
    @HostListener('focus')
    handleFocus() {
        if ((<any>this.target).combo) {
            this.target.focusedItem = this.target.getFirstSelectableItem();
            this.target.focusedItem.isFocused = true;
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (event) {
            const key = event.key.toLowerCase();
            if (!this.target.collapsed) { // If dropdown is opened
                const navKeys = ['esc', 'escape', 'enter', 'space', 'spacebar', ' ',
            'arrowup', 'up', 'arrowdown', 'down', 'home', 'end'];
                if (navKeys.indexOf(key) === -1) { // If key has appropriate function in DD
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
            } else { // If dropdown is closed, do nothing
                return;
            }
            switch (key) {
                case 'esc':
                case 'escape':
                // case 'tab':
                    this.onEscapeKeyDown(event);
                    break;
                case 'enter':
                    this.onEnterKeyDown(event);
                    break;
                case 'space':
                case 'spacebar':
                case ' ':
                    this.onSpaceKeyDown(event);
                    break;
                case 'arrowup':
                case 'up':
                    this.onArrowUpKeyDown(event);
                    break;
                case 'arrowdown':
                case 'down':
                    this.onArrowDownKeyDown(event);
                    break;
                case 'home':
                    this.onHomeKeyDown(event);
                    break;
                case 'end':
                    this.onEndKeyDown(event);
                    break;
                default:
                    return;
            }
        }
    }

    /**
     * @hidden
     */
    onEscapeKeyDown(event) {
        this.target.close();
    }

    /**
     * @hidden
     */
    onSpaceKeyDown(event) {
        // V.S. : IgxDropDownComponent.selectItem needs event to be true in order to close DD as per specification
        this.target.selectItem(this.target.focusedItem, this.target instanceof IgxDropDownComponent);
    }

    /**
     * @hidden
     */
    onEnterKeyDown(event) {
        if (!(this.target instanceof IgxDropDownComponent)) {
            if (this.target.focusedItem.value === 'ADD ITEM') {
                // TODO: refactor:
                const targetC = this.target as IgxComboDropDownComponent;
                targetC.combo.addItemToCollection();
            } else {
                this.target.close();
            }
            return;
        }
        this.target.selectItem(this.target.focusedItem, event);
    }

    /**
     * @hidden
     */
    onArrowDownKeyDown(event) {
        this.target.navigateNext();
    }

    /**
     * @hidden
     */
    onArrowUpKeyDown(event) {
        this.target.navigatePrev();
    }

    /**
     * @hidden
     */
    onEndKeyDown(event) {
        this.target.navigateLast();
    }

    /**
     * @hidden
     */
    onHomeKeyDown(event) {
        this.target.navigateFirst();
    }
}

/**
 * **Ignite UI for Angular DropDown** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop-down.html)
 *
 * The Ignite UI for Angular Drop Down displays a scrollable list of items which may be visually grouped and
 * supports selection of a single item. Clicking or tapping an item selects it and closes the Drop Down
 *
 * Example:
 * ```html
 * <igx-drop-down>
 *   <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}} isHeader={{item.header}}>
 *     {{ item.value }}
 *   </igx-drop-down-item>
 * </igx-drop-down>
 * ```
 */
@Component({
    selector: 'igx-drop-down',
    templateUrl: './drop-down.component.html',
    providers: [{ provide: IgxDropDownBase, useExisting: IgxDropDownComponent }]
})
export class IgxDropDownComponent extends IgxDropDownBase {

    @ContentChildren(forwardRef(() => IgxDropDownItemComponent))
    protected children: QueryList<IgxDropDownItemBase>;

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxSelectionAPIService) {
        super(elementRef, cdr, selection);
    }

    protected changeSelectedItem(newSelection?: IgxDropDownItemComponent): boolean {
        const oldSelection = this.selectedItem;
        const selectionChanged = super.changeSelectedItem(newSelection);

        if (selectionChanged) {
            if (oldSelection) {
                oldSelection.isSelected = false;
            }
            if (newSelection) {
                newSelection.isSelected = true;
            }
        }

        return selectionChanged;
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective],
    imports: [CommonModule, IgxToggleModule],
    providers: [IgxSelectionAPIService]
})
export class IgxDropDownModule { }

export { ISelectionEventArgs } from './drop-down.common';
