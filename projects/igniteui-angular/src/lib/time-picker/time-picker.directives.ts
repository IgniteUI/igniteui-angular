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
    OnDestroy,
    OnInit
} from '@angular/core';
import { HammerGesturesManager } from '../core/touch';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { IgxTimePickerBase, IGX_TIME_PICKER_COMPONENT } from './time-picker.common';
import { HammerInput, HammerOptions } from '../core/touch-annotations';

/** @hidden */
@Directive({
    selector: '[igxItemList]',
    providers: [HammerGesturesManager],
    standalone: true
})
export class IgxItemListDirective implements OnInit, OnDestroy {
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @Input('igxItemList')
    public type: string;

    public isActive: boolean;

    constructor(
        @Inject(IGX_TIME_PICKER_COMPONENT) public timePicker: IgxTimePickerBase,
        private elementRef: ElementRef,
        private touchManager: HammerGesturesManager
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

        const delta = event.deltaY;
        if (delta !== 0) {
            this.nextItem(delta);
        }
    }

    /**
     * @hidden @internal
     */
    public ngOnInit() {
        const hammerOptions: HammerOptions = { recognizers: [[HammerGesturesManager.Hammer?.Pan, { direction: HammerGesturesManager.Hammer?.DIRECTION_VERTICAL, threshold: 10 }]] };
        this.touchManager.addEventListener(this.elementRef.nativeElement, 'pan', this.onPanMove, hammerOptions);
    }

    /**
     * @hidden @internal
     */
     public ngOnDestroy() {
        this.touchManager.destroy();
    }

    private onPanMove = (event: HammerInput) => {
        const delta = event.deltaY < 0 ? -1 : event.deltaY > 0 ? 1 : 0;
        if (delta !== 0) {
            this.nextItem(delta);
        }
    };

    private nextItem(delta: number): void {
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
    selector: '[igxTimeItem]',
    exportAs: 'timeItem',
    standalone: true
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
        const currentValue = this.value.length < 2 ? `0${this.value}` : this.value;
        const dateType = this.itemList.type;
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.timePicker.appliedFormat);
        switch (dateType) {
            case 'hourList':
                const hourPart = inputDateParts.find(element => element.type === 'hours');
                return DateTimeUtil.getPartValue(this.timePicker.selectedDate, hourPart, hourPart.format.length) === currentValue;
            case 'minuteList':
                const minutePart = inputDateParts.find(element => element.type === 'minutes');
                return DateTimeUtil.getPartValue(this.timePicker.selectedDate, minutePart, minutePart.format.length) === currentValue;
            case 'secondsList':
                const secondsPart = inputDateParts.find(element => element.type === 'seconds');
                return DateTimeUtil.getPartValue(this.timePicker.selectedDate, secondsPart, secondsPart.format.length) === currentValue;
            case 'ampmList':
                const ampmPart = inputDateParts.find(element => element.format.indexOf('a') !== -1 || element.format === 'tt');
                return DateTimeUtil.getPartValue(this.timePicker.selectedDate, ampmPart, ampmPart.format.length) === this.value;
        }
    }

    public get minValue(): string {
        const dateType = this.itemList.type;
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.timePicker.appliedFormat);
        switch (dateType) {
            case 'hourList':
                return this.getHourPart(this.timePicker.minDropdownValue);
            case 'minuteList':
                if (this.timePicker.selectedDate.getHours() === this.timePicker.minDropdownValue.getHours()) {
                    const minutePart = inputDateParts.find(element => element.type === 'minutes');
                    return DateTimeUtil.getPartValue(this.timePicker.minDropdownValue, minutePart, minutePart.format.length);
                }
                return '00';
            case 'secondsList':
                const date = new Date(this.timePicker.selectedDate);
                const min = new Date(this.timePicker.minDropdownValue);
                date.setSeconds(0);
                min.setSeconds(0);
                if (date.getTime() === min.getTime()) {
                    const secondsPart = inputDateParts.find(element => element.type === 'seconds');
                    return DateTimeUtil.getPartValue(this.timePicker.minDropdownValue, secondsPart, secondsPart.format.length);
                }
                return '00';
            case 'ampmList':
                const ampmPart = inputDateParts.find(element => element.format.indexOf('a') !== -1 || element.format === 'tt');
                return DateTimeUtil.getPartValue(this.timePicker.minDropdownValue, ampmPart, ampmPart.format.length);
        }
    }

    public get maxValue(): string {
        const dateType = this.itemList.type;
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.timePicker.appliedFormat);
        switch (dateType) {
            case 'hourList':
                return this.getHourPart(this.timePicker.maxDropdownValue);
            case 'minuteList':
                if (this.timePicker.selectedDate.getHours() === this.timePicker.maxDropdownValue.getHours()) {
                    const minutePart = inputDateParts.find(element => element.type === 'minutes');
                    return DateTimeUtil.getPartValue(this.timePicker.maxDropdownValue, minutePart, minutePart.format.length);
                } else {
                    const currentTime = new Date(this.timePicker.selectedDate);
                    const minDelta = this.timePicker.itemsDelta.minutes;
                    const remainder = 60 % minDelta;
                    const delta = remainder === 0 ? 60 - minDelta : 60 - remainder;
                    currentTime.setMinutes(delta);
                    const minutePart = inputDateParts.find(element => element.type === 'minutes');
                    return DateTimeUtil.getPartValue(currentTime, minutePart, minutePart.format.length);
                }
            case 'secondsList':
                const date = new Date(this.timePicker.selectedDate);
                const max = new Date(this.timePicker.maxDropdownValue);
                date.setSeconds(0);
                max.setSeconds(0);
                if (date.getTime() === max.getTime()) {
                    const secondsPart = inputDateParts.find(element => element.type === 'seconds');
                    return DateTimeUtil.getPartValue(this.timePicker.maxDropdownValue, secondsPart, secondsPart.format.length);
                } else {
                    const secDelta = this.timePicker.itemsDelta.seconds;
                    const remainder = 60 % secDelta;
                    const delta = remainder === 0 ? 60 - secDelta : 60 - remainder;
                    date.setSeconds(delta);
                    const secondsPart = inputDateParts.find(element => element.type === 'seconds');
                    return DateTimeUtil.getPartValue(date, secondsPart, secondsPart.format.length);
                }
            case 'ampmList':
                const ampmPart = inputDateParts.find(element => element.format.indexOf('a') !== -1 || element.format === 'tt');
                return DateTimeUtil.getPartValue(this.timePicker.maxDropdownValue, ampmPart, ampmPart.format.length);
        }
    }

    public get hourValue(): string {
        return this.getHourPart(this.timePicker.selectedDate);
    }

    constructor(@Inject(IGX_TIME_PICKER_COMPONENT)
    public timePicker: IgxTimePickerBase,
        private itemList: IgxItemListDirective) { }

    @HostListener('click', ['value'])
    public onClick(item) {
        if (item !== '') {
            const dateType = this.itemList.type;
            this.timePicker.onItemClick(item, dateType);
        }
    }

    private getHourPart(date: Date): string {
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.timePicker.appliedFormat);
        const hourPart = inputDateParts.find(element => element.type === 'hours');
        const ampmPart = inputDateParts.find(element =>element.format.indexOf('a') !== -1 || element.format === 'tt');
        const hour = DateTimeUtil.getPartValue(date, hourPart, hourPart.format.length);
        if (ampmPart) {
            const ampm = DateTimeUtil.getPartValue(date, ampmPart, ampmPart.format.length);
            return `${hour} ${ampm}`;
        }
        return hour;
    }
}
