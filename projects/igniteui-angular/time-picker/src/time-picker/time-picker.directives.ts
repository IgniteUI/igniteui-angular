/**
 * This file contains all the directives used by the @link time picker.
 * You should generally not use them directly.
 *
 * @preferred
 */
import {
    Directive,
    ElementRef,
    HostBinding,
    HostListener,
    inject,
    Input,
    OnDestroy,
    OnInit
} from '@angular/core';
import { DatePart, IgxTouchManager } from 'igniteui-angular/core';
import {
    IgxTimePickerBase,
    IGX_TIME_PICKER_COMPONENT,
    IgxTimePickerListType,
    getLastListValue
} from './time-picker.common';

const LIST_DATE_PARTS: Record<IgxTimePickerListType, DatePart> = {
    hourList: DatePart.Hours,
    minuteList: DatePart.Minutes,
    secondsList: DatePart.Seconds,
    ampmList: DatePart.AmPm
};

/** @hidden */
@Directive({
    selector: '[igxItemList]',
    standalone: true
})
export class IgxItemListDirective implements OnInit, OnDestroy {
    public timePicker = inject<IgxTimePickerBase>(IGX_TIME_PICKER_COMPONENT);
    private elementRef = inject(ElementRef);

    private _gestures: IgxTouchManager | null = null;

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @Input('igxItemList')
    public type!: IgxTimePickerListType;

    public isActive!: boolean;

    private readonly SCROLL_THRESHOLD = 50;
    private readonly PAN_THRESHOLD = 25;

    /**
     * accumulates wheel scrolls and triggers a change action above SCROLL_THRESHOLD
     */
    private scrollAccumulator = 0;

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
        this.focusSiblingList(1);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();
        this.focusSiblingList(-1);
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
    public onScroll(event: WheelEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.scrollAccumulator += event.deltaY;
        if (Math.abs(this.scrollAccumulator) > this.SCROLL_THRESHOLD) {
            this.nextItem(this.scrollAccumulator);
            this.scrollAccumulator = 0;
        }
    }

    /**
     * @hidden @internal
     */
    public ngOnInit() {
        const threshold = this.PAN_THRESHOLD;

        this._gestures = new IgxTouchManager(this.elementRef.nativeElement, {
            panMove: (event) => {
                if (Math.abs(event.deltaY) >= threshold) {
                    this.nextItem(event.deltaY < 0 ? -1 : 1);
                    event.resetOrigin();
                }
            }
        });
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy() {
        this._gestures?.destroy();
    }

    /** Focuses the closest rendered list in the given direction, if any */
    private focusSiblingList(direction: 1 | -1): void {
        const lists = [
            this.timePicker.hourList,
            this.timePicker.minuteList,
            this.timePicker.secondsList,
            this.timePicker.ampmList
        ];
        const order: IgxTimePickerListType[] = ['hourList', 'minuteList', 'secondsList', 'ampmList'];
        for (let i = order.indexOf(this.type) + direction; i >= 0 && i < lists.length; i += direction) {
            if (lists[i]) {
                lists[i].nativeElement.focus();
                return;
            }
        }
    }

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
    public timePicker = inject<IgxTimePickerBase>(IGX_TIME_PICKER_COMPONENT);
    private itemList = inject(IgxItemListDirective);

    @Input('igxTimeItem')
    public value!: string;

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
        if (!this.value) {
            // empty items pad the list and are never selected
            return false;
        }
        const datePart = LIST_DATE_PARTS[this.itemList.type];
        const selectedValue = this.timePicker.getPartValue(this.timePicker.selectedDate, datePart);
        if (datePart === DatePart.AmPm) {
            return selectedValue === this.value;
        }
        return selectedValue === this.value.padStart(2, '0');
    }

    public get minValue(): string {
        const { selectedDate, minDropdownValue } = this.timePicker;
        switch (this.itemList.type) {
            case 'hourList':
                return this.getHourPart(minDropdownValue);
            case 'minuteList':
                if (selectedDate.getHours() === minDropdownValue.getHours()) {
                    return this.timePicker.getPartValue(minDropdownValue, DatePart.Minutes);
                }
                return '00';
            case 'secondsList':
                if (this.isSameMinute(selectedDate, minDropdownValue)) {
                    return this.timePicker.getPartValue(minDropdownValue, DatePart.Seconds);
                }
                return '00';
            case 'ampmList':
                return this.timePicker.getPartValue(minDropdownValue, DatePart.AmPm);
        }
    }

    public get maxValue(): string {
        const { selectedDate, maxDropdownValue, itemsDelta } = this.timePicker;
        switch (this.itemList.type) {
            case 'hourList':
                return this.getHourPart(maxDropdownValue);
            case 'minuteList': {
                if (selectedDate.getHours() === maxDropdownValue.getHours()) {
                    return this.timePicker.getPartValue(maxDropdownValue, DatePart.Minutes);
                }
                const lastMinute = new Date(selectedDate);
                lastMinute.setMinutes(getLastListValue(itemsDelta.minutes!));
                return this.timePicker.getPartValue(lastMinute, DatePart.Minutes);
            }
            case 'secondsList': {
                if (this.isSameMinute(selectedDate, maxDropdownValue)) {
                    return this.timePicker.getPartValue(maxDropdownValue, DatePart.Seconds);
                }
                const lastSecond = new Date(selectedDate);
                lastSecond.setSeconds(getLastListValue(itemsDelta.seconds!));
                return this.timePicker.getPartValue(lastSecond, DatePart.Seconds);
            }
            case 'ampmList':
                return this.timePicker.getPartValue(maxDropdownValue, DatePart.AmPm);
        }
    }

    public get hourValue(): string {
        return this.getHourPart(this.timePicker.selectedDate);
    }

    @HostListener('click', ['value'])
    public onClick(item: string) {
        if (item !== '') {
            const dateType = this.itemList.type;
            this.timePicker.onItemClick(item, dateType);
        }
    }

    private getHourPart(date: Date): string {
        const hour = this.timePicker.getPartValue(date, DatePart.Hours);
        if (this.timePicker.showAmPmList) {
            return `${hour} ${this.timePicker.getPartValue(date, DatePart.AmPm)}`;
        }
        return hour;
    }

    private isSameMinute(date: Date, other: Date): boolean {
        return date.getHours() === other.getHours() && date.getMinutes() === other.getMinutes();
    }
}
