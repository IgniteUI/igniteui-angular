import { Directive, Optional, Self, Input, HostListener, Inject } from '@angular/core';
import { DropDownNavigationDirective, IDropDownBase, IGX_DROPDOWN_BASE } from './drop-down-utils';
import { IgxDropDownBase } from './drop-down.base';

export enum DropDownActionKeys {
    ESCAPE = 'escape',
    ENTER = 'enter',
    SPACE = 'space',
    TAB = 'tab'
}
@Directive({
    selector: '[igxDropDownItemNavigation]'
})
export class IgxDropDownItemNavigationDirective implements DropDownNavigationDirective {

    protected _target;

    constructor(@Self() @Optional() @Inject(IGX_DROPDOWN_BASE) public dropdown: IgxDropDownBase) { }

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
                    this.target.handleKeyDown(DropDownActionKeys.ESCAPE);
                    break;
                case 'enter':
                    this.target.handleKeyDown(DropDownActionKeys.ENTER);
                    break;
                case 'space':
                case 'spacebar':
                case ' ':
                    this.target.handleKeyDown(DropDownActionKeys.SPACE);
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
