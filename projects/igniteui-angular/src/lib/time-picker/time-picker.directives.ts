/**
 * This file contains all the directives used by the @link IgxTimePickerComponent.
 * You should generally not use them directly.
 *
 * @preferred
 */
import {
    Directive,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    TemplateRef
} from '@angular/core';
import { IGX_TIME_PICKER_COMPONENT, IgxTimePickerBase } from './time-picker.common';
import { PickerInteractionMode } from '../date-common/types';

/** @hidden */
@Directive({
    selector: '[igxItemList]'
})
export class IgxItemListDirective {
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @Input('igxItemList')
    public type: string;

    public isActive: boolean;

    constructor(
        @Inject(IGX_TIME_PICKER_COMPONENT) public timePicker: IgxTimePickerBase,
        private elementRef: ElementRef
    ) { }

    @HostBinding('class.igx-time-picker__column')
    public get defaultCSS(): boolean {
        return true;
    }

    @HostBinding('class.igx-time-picker__hourList')
    public get hourCSS(): boolean {
        return this.type === 'hourList';
    }

    @HostBinding('class.igx-time-picker__minuteList')
    public get minuteCSS(): boolean {
        return this.type === 'minuteList';
    }

    @HostBinding('class.igx-time-picker__secondsList')
    public get secondsCSS(): boolean {
        return this.type === 'secondsList';
    }

    @HostBinding('class.igx-time-picker__ampmList')
    public get ampmCSS(): boolean {
        return this.type === 'ampmList';
    }

    @HostListener('focus')
    public onFocus() {
        this.isActive = true;
    }

    @HostListener('blur')
    public onBlur() {
        this.isActive = false;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();

        this.nextItem();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();

        this.prevItem();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();

        const listName = (event.target as HTMLElement).className;

        if (listName.indexOf('hourList') !== -1 && this.timePicker.minuteList) {
            this.timePicker.minuteList.nativeElement.focus();
        } else if ((listName.indexOf('hourList') !== -1 || listName.indexOf('minuteList') !== -1) && this.timePicker.secondsList) {
            this.timePicker.secondsList.nativeElement.focus();
        } else if ((listName.indexOf('hourList') !== -1 || listName.indexOf('minuteList') !== -1 ||
            listName.indexOf('secondsList') !== -1) && this.timePicker.ampmList) {
            this.timePicker.ampmList.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();
        const listName = (event.target as HTMLElement).className;

        if (listName.indexOf('ampmList') !== -1 && this.timePicker.secondsList) {
            this.timePicker.secondsList.nativeElement.focus();
        } else if (listName.indexOf('secondsList') !== -1 && this.timePicker.secondsList
            && listName.indexOf('minutesList') && this.timePicker.minuteList) {
            this.timePicker.minuteList.nativeElement.focus();
        } else if (listName.indexOf('ampmList') !== -1 && this.timePicker.minuteList) {
            this.timePicker.minuteList.nativeElement.focus();
        } else if ((listName.indexOf('ampmList') !== -1 || listName.indexOf('secondsList') !== -1 ||
            listName.indexOf('minuteList') !== -1) && this.timePicker.hourList) {
            this.timePicker.hourList.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.enter', ['$event'])
    public onKeydownEnter(event: KeyboardEvent) {
        event.preventDefault();

        if (this.timePicker.mode === PickerInteractionMode.DropDown) {
            this.timePicker.close();
            return;
        }
        this.timePicker.okButtonClick();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.escape', ['$event'])
    public onKeydownEscape(event: KeyboardEvent) {
        event.preventDefault();

        this.timePicker.cancelButtonClick();
    }

    /**
     * @hidden
     */
    @HostListener('mouseover')
    public onHover() {
        this.elementRef.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener('wheel', ['$event'])
    public onScroll(event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.deltaY > 0) {
            this.nextItem();
        } else if (event.deltaY < 0) {
            this.prevItem();
        }
    }

    /**
     * @hidden
     */
    @HostListener('panmove', ['$event'])
    public onPanMove(event) {
        if (event.deltaY < 0) {
            this.nextItem();
        } else if (event.deltaY > 0) {
            this.prevItem();
        }
    }

    private nextItem(): void {
        switch (this.type) {
            case 'hourList': {
                this.timePicker.nextHour();
                break;
            }
            case 'minuteList': {
                this.timePicker.nextMinute();
                break;
            }
            case 'secondsList': {
                this.timePicker.nextSeconds();
                break;
            }
            case 'ampmList': {
                this.timePicker.nextAmPm();
                break;
            }
        }
    }

    private prevItem(): void {
        switch (this.type) {
            case 'hourList': {
                this.timePicker.prevHour();
                break;
            }
            case 'minuteList': {
                this.timePicker.prevMinute();
                break;
            }
            case 'secondsList': {
                this.timePicker.prevSeconds();
                break;
            }
            case 'ampmList': {
                this.timePicker.prevAmPm();
                break;
            }
        }
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxHourItem]'
})
export class IgxHourItemDirective {

    @Input('igxHourItem')
    public value: string;

    @HostBinding('class.igx-time-picker__item')
    public get defaultCSS(): boolean {
        return true;
    }

    @HostBinding('class.igx-time-picker__item--selected')
    public get selectedCSS(): boolean {
        return this.isSelectedHour;
    }

    @HostBinding('class.igx-time-picker__item--active')
    public get activeCSS(): boolean {
        return this.isSelectedHour && this.itemList.isActive;
    }

    public get isSelectedHour(): boolean {
        return this.timePicker.selectedHour === this.value;
    }

    constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
    public timePicker: IgxTimePickerBase,
        private itemList: IgxItemListDirective) { }

    @HostListener('click', ['value'])
    public onClick(item) {
        if (item !== '') {
            this.timePicker.scrollHourIntoView(item);
        }
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxMinuteItem]'
})
export class IgxMinuteItemDirective {

    @Input('igxMinuteItem')
    public value: string;

    @HostBinding('class.igx-time-picker__item')
    public get defaultCSS(): boolean {
        return true;
    }

    @HostBinding('class.igx-time-picker__item--selected')
    public get selectedCSS(): boolean {
        return this.isSelectedMinute;
    }

    @HostBinding('class.igx-time-picker__item--active')
    public get activeCSS(): boolean {
        return this.isSelectedMinute && this.itemList.isActive;
    }

    public get isSelectedMinute(): boolean {
        return this.timePicker.selectedMinute === this.value;
    }

    constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
    public timePicker: IgxTimePickerBase,
        private itemList: IgxItemListDirective) { }

    @HostListener('click', ['value'])
    public onClick(item) {
        if (item !== '') {
            this.timePicker.scrollMinuteIntoView(item);
        }
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxSecondsItem]'
})
export class IgxSecondsItemDirective {

    @Input('igxSecondsItem')
    public value: string;

    @HostBinding('class.igx-time-picker__item')
    public get defaultCSS(): boolean {
        return true;
    }

    @HostBinding('class.igx-time-picker__item--selected')
    public get selectedCSS(): boolean {
        return this.isSelectedSeconds;
    }

    @HostBinding('class.igx-time-picker__item--active')
    public get activeCSS(): boolean {
        return this.isSelectedSeconds && this.itemList.isActive;
    }

    public get isSelectedSeconds(): boolean {
        return this.timePicker.selectedSeconds === this.value;
    }

    constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
    public timePicker: IgxTimePickerBase,
        private itemList: IgxItemListDirective) { }

    @HostListener('click', ['value'])
    public onClick(item) {
        if (item !== '') {
            this.timePicker.scrollSecondsIntoView(item);
        }
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxAmPmItem]'
})
export class IgxAmPmItemDirective {

    @Input('igxAmPmItem')
    public value: string;

    @HostBinding('class.igx-time-picker__item')
    public get defaultCSS(): boolean {
        return true;
    }

    @HostBinding('class.igx-time-picker__item--selected')
    public get selectedCSS(): boolean {
        return this.isSelectedAmPm;
    }

    @HostBinding('class.igx-time-picker__item--active')
    public get activeCSS(): boolean {
        return this.isSelectedAmPm && this.itemList.isActive;
    }

    public get isSelectedAmPm(): boolean {
        return this.timePicker.selectedAmPm === this.value;
    }

    constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
    public timePicker: IgxTimePickerBase,
        private itemList: IgxItemListDirective) { }

    @HostListener('click', ['value'])
    public onClick(item) {
        if (item !== '') {
            this.timePicker.scrollAmPmIntoView(item);
        }
    }
}

/**
 * This directive should be used to mark which ng-template will be used from IgxTimePicker when re-templating its input group.
 */
@Directive({
    selector: '[igxTimePickerTemplate]'
})
export class IgxTimePickerTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

/**
 * This directive can be used to add custom action buttons to the dropdownb/dialog.
 */
@Directive({
    selector: '[igxTimePickerActions]'
})
export class IgxTimePickerActionsDirective {
    constructor(public template: TemplateRef<any>) { }
}
