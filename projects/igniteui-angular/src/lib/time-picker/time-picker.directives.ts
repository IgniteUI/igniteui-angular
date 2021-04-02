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
import { IGX_TIME_PICKER_COMPONENT } from './time-picker.common';
import { IgxTimePickerComponent } from './time-picker.component';
import { DatePickerUtil } from '../date-picker/date-picker.utils';

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
        @Inject(IGX_TIME_PICKER_COMPONENT) public timePicker: IgxTimePickerComponent,
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

        this.nextItem(1);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();

        this.nextItem(-1);
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
        this.timePicker.close();
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

        const delta = event.deltaY;
        switch (this.type) {
            case 'hourList': {
                this.timePicker.nextHour(delta);
                break;
            }
            case 'minuteList': {
                this.timePicker.nextMinute(delta);
                break;
            }
            case 'secondsList': {
                this.timePicker.nextSeconds(delta);
                break;
            }
            case 'ampmList': {
                this.timePicker.nextAmPm(delta);
                break;
            }
        }

        // if (event.deltaY > 0) {
        //     this.nextItem();
        // } else if (event.deltaY < 0) {
        //     this.prevItem();
        // }
    }

    /**
     * @hidden
     */
    @HostListener('panmove', ['$event'])
    public onPanMove(event) {
        const delta = event.deltaY;
        switch (this.type) {
            case 'hourList': {
                this.timePicker.nextHour(delta);
                break;
            }
            case 'minuteList': {
                this.timePicker.nextMinute(delta);
                break;
            }
            case 'secondsList': {
                this.timePicker.nextSeconds(delta);
                break;
            }
            case 'ampmList': {
                this.timePicker.nextAmPm(delta);
                break;
            }
        }
        // if (event.deltaY < 0) {
        //     this.nextItem();
        // } else if (event.deltaY > 0) {
        //     this.prevItem();
        // }
    }

    private nextItem(delta : number): void {
        switch (this.type) {
            case 'hourList': {
                this.timePicker.nextHour(delta);
                break;
            }
            case 'minuteList': {
                this.timePicker.nextMinute(delta);
                break;
            }
            case 'secondsList': {
                this.timePicker.nextSeconds(delta);
                break;
            }
            case 'ampmList': {
                this.timePicker.nextAmPm(delta);
                break;
            }
        }
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxTimeItem]'
})
export class IgxTimeItemDirective {

    @Input('igxTimeItem')
    public value: string;

    @HostBinding('class.igx-time-picker__item')
    public get defaultCSS(): boolean {
        return true;
    }

    @HostBinding('class.igx-time-picker__item--selected')
    public get selectedCSS(): boolean {
        return this.isSelectedTime;
    }

    @HostBinding('class.igx-time-picker__item--active')
    public get activeCSS(): boolean {
        return this.isSelectedTime && this.itemList.isActive;
    }

    public get isSelectedTime(): boolean {
        const dateType = this.itemList.type;
        const inputDateParts = DatePickerUtil.parseDateTimeFormat(this.timePicker.inputFormat);
        switch (dateType) {
            case 'hourList':
                const hourPart = inputDateParts.find(element => element.type === 'hour');
                return DatePickerUtil.getPartValue(this.timePicker.selectedDate, hourPart, hourPart.format.length) === this.value;
            case 'minuteList': {
                const minutePart = inputDateParts.find(element => element.type === 'minute');
                return DatePickerUtil.getPartValue(this.timePicker.selectedDate, minutePart, minutePart.format.length) === this.value;
            }
            case 'secondsList': {
                const hourPart = inputDateParts.find(element => element.type === 'second');
                return DatePickerUtil.getPartValue(this.timePicker.selectedDate, hourPart, hourPart.format.length) === this.value;
            }
            case 'ampmList': {
                const ampmPart = inputDateParts.find(element => element.format === 'tt');
                return DatePickerUtil.getPartValue(this.timePicker.selectedDate, ampmPart, ampmPart.format.length) === this.value;
            }
        }
    }

    constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
    public timePicker: IgxTimePickerComponent,
        private itemList: IgxItemListDirective) { }

    @HostListener('click', ['value'])
    public onClick(item) {
        if (item !== '') {
            const dateType = this.itemList.type;
            this.timePicker.scrollItem(item, dateType);
        }
    }
}

// /**
//  * @hidden
//  */
// @Directive({
//     selector: '[igxHourItem]'
// })
// export class IgxHourItemDirective {

//     @Input('igxHourItem')
//     public value: string;

//     @HostBinding('class.igx-time-picker__item')
//     public get defaultCSS(): boolean {
//         return true;
//     }

//     @HostBinding('class.igx-time-picker__item--selected')
//     public get selectedCSS(): boolean {
//         return this.isSelectedHour;
//     }

//     @HostBinding('class.igx-time-picker__item--active')
//     public get activeCSS(): boolean {
//         return this.isSelectedHour && this.itemList.isActive;
//     }

//     public get isSelectedHour(): boolean {
//         return this.timePicker.selectedHour === this.value;
//     }

//     constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
//     public timePicker: IgxTimePickerComponent,
//         private itemList: IgxItemListDirective) { }

//     @HostListener('click', ['value'])
//     public onClick(item) {
//         if (item !== '') {
//             this.timePicker.scrollHourIntoView(item);
//         }
//     }
// }

// /**
//  * @hidden
//  */
// @Directive({
//     selector: '[igxMinuteItem]'
// })
// export class IgxMinuteItemDirective {

//     @Input('igxMinuteItem')
//     public value: string;

//     @HostBinding('class.igx-time-picker__item')
//     public get defaultCSS(): boolean {
//         return true;
//     }

//     @HostBinding('class.igx-time-picker__item--selected')
//     public get selectedCSS(): boolean {
//         return this.isSelectedMinute;
//     }

//     @HostBinding('class.igx-time-picker__item--active')
//     public get activeCSS(): boolean {
//         return this.isSelectedMinute && this.itemList.isActive;
//     }

//     public get isSelectedMinute(): boolean {
//         return this.timePicker.selectedMinute === this.value;
//     }

//     constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
//     public timePicker: IgxTimePickerComponent,
//         private itemList: IgxItemListDirective) { }

//     @HostListener('click', ['value'])
//     public onClick(item) {
//         if (item !== '') {
//             this.timePicker.scrollMinuteIntoView(item);
//         }
//     }
// }

// /**
//  * @hidden
//  */
// @Directive({
//     selector: '[igxSecondsItem]'
// })
// export class IgxSecondsItemDirective {

//     @Input('igxSecondsItem')
//     public value: string;

//     @HostBinding('class.igx-time-picker__item')
//     public get defaultCSS(): boolean {
//         return true;
//     }

//     @HostBinding('class.igx-time-picker__item--selected')
//     public get selectedCSS(): boolean {
//         return this.isSelectedSeconds;
//     }

//     @HostBinding('class.igx-time-picker__item--active')
//     public get activeCSS(): boolean {
//         return this.isSelectedSeconds && this.itemList.isActive;
//     }

//     public get isSelectedSeconds(): boolean {
//         return this.timePicker.selectedSeconds === this.value;
//     }

//     constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
//     public timePicker: IgxTimePickerComponent,
//         private itemList: IgxItemListDirective) { }

//     @HostListener('click', ['value'])
//     public onClick(item) {
//         if (item !== '') {
//             this.timePicker.scrollSecondsIntoView(item);
//         }
//     }
// }

// /**
//  * @hidden
//  */
// @Directive({
//     selector: '[igxAmPmItem]'
// })
// export class IgxAmPmItemDirective {

//     @Input('igxAmPmItem')
//     public value: string;

//     @HostBinding('class.igx-time-picker__item')
//     public get defaultCSS(): boolean {
//         return true;
//     }

//     @HostBinding('class.igx-time-picker__item--selected')
//     public get selectedCSS(): boolean {
//         return this.isSelectedAmPm;
//     }

//     @HostBinding('class.igx-time-picker__item--active')
//     public get activeCSS(): boolean {
//         return this.isSelectedAmPm && this.itemList.isActive;
//     }

//     public get isSelectedAmPm(): boolean {
//         return this.timePicker.selectedAmPm === this.value;
//     }

//     constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
//     public timePicker: IgxTimePickerComponent,
//         private itemList: IgxItemListDirective) { }

//     @HostListener('click', ['value'])
//     public onClick(item) {
//         if (item !== '') {
//             this.timePicker.scrollAmPmIntoView(item);
//         }
//     }
// }

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
 * This directive can be used to add custom action buttons to the dropdown/dialog.
 */
@Directive({
    selector: '[igxTimePickerActions]'
})
export class IgxTimePickerActionsDirective {
    constructor(public template: TemplateRef<any>) { }
}
