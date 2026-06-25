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
    NgZone,
    OnDestroy,
    OnInit
} from '@angular/core';
import { DateTimeUtil, I18N_FORMATTER } from 'igniteui-angular/core';
import { IgxTimePickerBase, IGX_TIME_PICKER_COMPONENT } from './time-picker.common';

/** @hidden */
@Directive({
    selector: '[igxItemList]',
    standalone: true
})
export class IgxItemListDirective implements OnInit, OnDestroy {
    public timePicker = inject<IgxTimePickerBase>(IGX_TIME_PICKER_COMPONENT);
    private elementRef = inject(ElementRef);
    private zone = inject(NgZone);

    private _pointerStartY = 0;
    private _lastDelta = 0;
    private _pointerTracking = false;
    private _removePointerListeners: (() => void) | null = null;

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @Input('igxItemList')
    public type: string;

    public isActive: boolean;

    private readonly SCROLL_THRESHOLD = 50;
    private readonly PAN_THRESHOLD = 10;

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
        const el = this.elementRef.nativeElement;
        const threshold = this.PAN_THRESHOLD;

        this.zone.runOutsideAngular(() => {
            const onPointerDown = (e: PointerEvent) => {
                if (e.pointerType === 'mouse') return;
                this._pointerStartY = e.clientY;
                this._lastDelta = 0;
                this._pointerTracking = true;
                el.setPointerCapture(e.pointerId);
            };

            const onPointerMove = (e: PointerEvent) => {
                if (!this._pointerTracking) return;
                const deltaY = e.clientY - this._pointerStartY;
                if (Math.abs(deltaY) < threshold) return;

                const newDelta = deltaY < 0 ? -1 : deltaY > 0 ? 1 : 0;
                if (newDelta !== 0 && newDelta !== this._lastDelta) {
                    this._lastDelta = newDelta;
                    this.zone.run(() => this.nextItem(newDelta));
                    this._pointerStartY = e.clientY;
                }
            };

            const onPointerUp = () => {
                this._pointerTracking = false;
                this._lastDelta = 0;
            };

            const onPointerCancel = () => {
                this._pointerTracking = false;
                this._lastDelta = 0;
            };

            el.addEventListener('pointerdown', onPointerDown);
            el.addEventListener('pointermove', onPointerMove);
            el.addEventListener('pointerup', onPointerUp);
            el.addEventListener('pointercancel', onPointerCancel);

            this._removePointerListeners = () => {
                el.removeEventListener('pointerdown', onPointerDown);
                el.removeEventListener('pointermove', onPointerMove);
                el.removeEventListener('pointerup', onPointerUp);
                el.removeEventListener('pointercancel', onPointerCancel);
            };
        });
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy() {
        this._removePointerListeners?.();
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
    private _i18nFormatter = inject(I18N_FORMATTER);

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
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.timePicker.appliedFormat, this._i18nFormatter);
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
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.timePicker.appliedFormat, this._i18nFormatter);
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
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.timePicker.appliedFormat, this._i18nFormatter);
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

    @HostListener('click', ['value'])
    public onClick(item) {
        if (item !== '') {
            const dateType = this.itemList.type;
            this.timePicker.onItemClick(item, dateType);
        }
    }

    private getHourPart(date: Date): string {
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.timePicker.appliedFormat, this._i18nFormatter);
        const hourPart = inputDateParts.find(element => element.type === 'hours');
        const ampmPart = inputDateParts.find(element => element.format.indexOf('a') !== -1 || element.format === 'tt');
        const hour = DateTimeUtil.getPartValue(date, hourPart, hourPart.format.length);
        if (ampmPart) {
            const ampm = DateTimeUtil.getPartValue(date, ampmPart, ampmPart.format.length);
            return `${hour} ${ampm}`;
        }
        return hour;
    }
}
