import { Directive, Optional, Self, Input, HostListener, Inject } from '@angular/core';
import { IGX_DROPDOWN_BASE } from './drop-down.common';
import { IDropDownNavigationDirective } from './drop-down.common';
import { IgxDropDownBase } from './drop-down.base';

/** Key actions that have designated handlers in IgxDropDownComponent */
export enum DropDownActionKey {
    ESCAPE = 'escape',
    ENTER = 'enter',
    SPACE = 'space'
}
/**
 * Navigation Directive that handles keyboard events on its host and controls a targeted IgxDropDownBase component
 */
@Directive({
    selector: '[igxDropDownItemNavigation]'
})
export class IgxDropDownItemNavigationDirective implements IDropDownNavigationDirective {

    protected _target: IgxDropDownBase = null;

    constructor(@Self() @Optional() @Inject(IGX_DROPDOWN_BASE) public dropdown: IgxDropDownBase) { }

    /**
     * @hidden
     */
    get target(): IgxDropDownBase {
        return this._target;
    }

    /**
     * @hidden
     */
    @Input('igxDropDownItemNavigation')
    set target(target: IgxDropDownBase) {
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
                    this.target.onItemActionKey(DropDownActionKey.ESCAPE, event);
                    break;
                case 'enter':
                    this.target.onItemActionKey(DropDownActionKey.ENTER, event);
                    break;
                case 'space':
                case 'spacebar':
                case ' ':
                    this.target.onItemActionKey(DropDownActionKey.SPACE, event);
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
     * Navigates to previous item
     */
    onArrowDownKeyDown() {
        this.target.navigateNext();
    }

    /**
     * Navigates to previous item
     */
    onArrowUpKeyDown() {
        this.target.navigatePrev();
    }

    /**
     * Navigates to target's last item
     */
    onEndKeyDown() {
        this.target.navigateLast();
    }

    /**
     * Navigates to target's first item
     */
    onHomeKeyDown() {
        this.target.navigateFirst();
    }
}
