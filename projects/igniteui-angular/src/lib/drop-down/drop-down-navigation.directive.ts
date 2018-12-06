import { Directive, Optional, Self, Input, HostListener } from '@angular/core';
import { DropDownNavigationDirective, IDropDownBase } from './drop-down-utils';
import { IgxDropDownBase } from './drop-down.base';

@Directive({
    selector: '[igxDropDownItemNavigation]'
})
export class IgxDropDownItemNavigationDirective implements DropDownNavigationDirective {

    protected _target;

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
    set target(target: IDropDownBase) {
        this._target = target ? target : this.dropdown;
    }

    /**
     * @hidden
     */
    @HostListener('keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (event) {
            const key = event.key.toLowerCase();
            if (!this.target.collapsed) { // If dropdown is opened
                const navKeys = ['esc', 'escape', 'enter', 'tab', 'space', 'spacebar', ' ',
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
                    this.onEscapeKeyDown();
                    break;
                case 'enter':
                case 'tab':
                    this.onEnterKeyDown(event);
                    break;
                case 'space':
                case 'spacebar':
                case ' ':
                    this.onSpaceKeyDown(event);
                    break;
                case 'arrowup':
                case 'up':
                    this.onArrowUpKeyDown();
                    break;
                case 'arrowdown':
                case 'down':
                    this.onArrowDownKeyDown();
                    break;
                case 'home':
                    this.onHomeKeyDown();
                    break;
                case 'end':
                    this.onEndKeyDown();
                    break;
                default:
                    return;
            }
        }
    }

    /**
     * @hidden
     */
    onEscapeKeyDown() {
        this.target.close();
    }

    /**
     * @hidden
     */
    onSpaceKeyDown(event) {
        this.target.selectItem(this.target.focusedItem, event);
    }

    /**
     * @hidden
     */
    onEnterKeyDown(event) {
        this.target.selectItem(this.target.focusedItem, event);
    }

    /**
     * @hidden
     */
    onArrowDownKeyDown() {
        this.target.navigateNext();
    }

    /**
     * @hidden
     */
    onArrowUpKeyDown() {
        this.target.navigatePrev();
    }

    /**
     * @hidden
     */
    onEndKeyDown() {
        this.target.navigateLast();
    }

    /**
     * @hidden
     */
    onHomeKeyDown() {
        this.target.navigateFirst();
    }
}

@Directive({
    selector: '[igxComboItemNavigation]'
})
export class IgxComboItemNavigationDirective extends IgxDropDownItemNavigationDirective implements DropDownNavigationDirective {

    get target() {
        return this._target;
    }
    /**
     * @hidden
     */
    @Input('igxComboItemNavigation')
    set target(target: IDropDownBase) {
        this._target = target ? target : this.dropdown;
    }
    onEnterKeyDown() {
        if (this.target.focusedItem.value === 'ADD ITEM') {
            this.target.combo.addItemToCollection();
        } else {
            this.target.close();
        }
    }

    onSpaceKeyDown() {
        this.target.selectItem(this.target.focusedItem, null);
    }
}
