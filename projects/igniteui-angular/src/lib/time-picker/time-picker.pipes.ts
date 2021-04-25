import { Pipe, PipeTransform, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IGX_TIME_PICKER_COMPONENT, IgxTimePickerBase } from './time-picker.common';
import { DatePart } from '../directives/date-time-editor/public_api';
import { DateTimeUtil } from '../date-common/util/date-time.util';

const ITEMS_COUNT = 7;

@Pipe({
    name: 'timeFormatPipe'
})
export class TimeFormatPipe implements PipeTransform {
    constructor(@Inject(IGX_TIME_PICKER_COMPONENT) private timePicker: IgxTimePickerBase) { }

    public transform(value: Date): string {
        const format = this.timePicker.inputFormat.replace('tt', 'aa');
        const datePipe = new DatePipe(this.timePicker.locale);
        return datePipe.transform(value, format);
    }
}

@Pipe({
    name: 'timeItemPipe'
})
export class TimeItemPipe implements PipeTransform {
    constructor(@Inject(IGX_TIME_PICKER_COMPONENT) private timePicker: IgxTimePickerBase) { }

    public transform(collection: any[], timePart: string, selectedDate: Date, min: Date | string, max: Date | string) {
        this.timePicker.minDropdownValue = this.setMinMaxDropdownValue('min');
        this.timePicker.maxDropdownValue = this.setMinMaxDropdownValue('max');
        this.timePicker.setSelectedValue();
        let list;
        let part;
        switch (timePart) {
            case 'hour':
                list = this.generateHours();
                const hours = this.timePicker.isTwelveHourFormat ? this.toTwelveHourFormat(this.timePicker.selectedDate.getHours())
                    : this.timePicker.selectedDate.getHours();
                list = this.scrollListItem(hours, list);
                part = DatePart.Hours;
                break;
            case 'minutes':
                list = this.generateMinutes();
                list = this.scrollListItem(this.timePicker.selectedDate.getMinutes(), list);
                part = DatePart.Minutes;
                break;
            case 'seconds':
                list = this.generateSeconds();
                list = this.scrollListItem(this.timePicker.selectedDate.getSeconds(), list);
                part = DatePart.Seconds;
                break;
            case 'ampm':
                list = this.generateAmPm();
                const selectedAmPm = this.timePicker.getPartValue(this.timePicker.selectedDate, 'ampm');
                list = this.scrollListItem(selectedAmPm, list);
                part = DatePart.AmPm;
                break;
        }
        return this.getListView(list, part);
    }

    private setMinMaxDropdownValue(value: string): Date {
        let delta: number;

        const sign = value === 'min' ? 1 : -1;
        const time = value === 'min' ? new Date(this.timePicker.minDateValue) : new Date(this.timePicker.maxDateValue);

        const hours = time.getHours();
        let minutes = time.getMinutes();
        let seconds = time.getSeconds();

        if (this.timePicker.showHoursList && hours % this.timePicker.itemsDelta.hours > 0) {
            delta = value === 'min' ? this.timePicker.itemsDelta.hours - hours % this.timePicker.itemsDelta.hours
                : hours % this.timePicker.itemsDelta.hours;
            minutes = value === 'min' ? 0
                : 60 % this.timePicker.itemsDelta.minutes > 0 ? 60 - 60 % this.timePicker.itemsDelta.minutes
                    : 60 - this.timePicker.itemsDelta.minutes;
            seconds = value === 'min' ? 0
                : 60 % this.timePicker.itemsDelta.seconds > 0 ? 60 - 60 % this.timePicker.itemsDelta.seconds
                    : 60 - this.timePicker.itemsDelta.seconds;
            time.setHours(hours + sign * delta, minutes, seconds);
        } else if (this.timePicker.showMinutesList && minutes % this.timePicker.itemsDelta.minutes > 0) {
            delta = value === 'min' ? this.timePicker.itemsDelta.minutes - minutes % this.timePicker.itemsDelta.minutes
                : minutes % this.timePicker.itemsDelta.minutes;
            seconds = value === 'min' ? 0
                : 60 % this.timePicker.itemsDelta.seconds > 0 ? 60 - 60 % this.timePicker.itemsDelta.seconds
                    : 60 - this.timePicker.itemsDelta.seconds;
            time.setHours(hours, minutes + sign * delta, seconds);
        } else if (this.timePicker.showSecondsList && seconds % this.timePicker.itemsDelta.seconds > 0) {
            delta = value === 'min' ? this.timePicker.itemsDelta.seconds - seconds % this.timePicker.itemsDelta.seconds
                : seconds % this.timePicker.itemsDelta.seconds;
            time.setHours(hours, minutes, seconds + sign * delta);
        }

        return time;
    }

    private getListView(view: any, dateType: DatePart): any {
        for (let i = 0; i < view.length; i++) {
            view[i] = this.getItemView(view[i], dateType);
        }
        return view;
    }

    private getItemView(item: any, dateType: DatePart): string {
        if (item === null) {
            item = '';
        } else if (dateType && typeof (item) !== 'string') {
            const leadZeroHour = (item < 10 && (this.timePicker.inputFormat.indexOf('hh') !== -1 || this.timePicker.inputFormat.indexOf('HH') !== -1));
            const leadZeroMinute = (item < 10 && this.timePicker.inputFormat.indexOf('mm') !== -1);
            const leadZeroSeconds = (item < 10 && this.timePicker.inputFormat.indexOf('ss') !== -1);

            const leadZero = {
                hours: leadZeroHour,
                minutes: leadZeroMinute,
                seconds: leadZeroSeconds
            }[dateType];

            item = (leadZero) ? '0' + item : `${item}`;
        }
        return item;
    }

    private scrollListItem(item: number | string, items: any[]): any[] {
        const itemsCount = items.length;
        let view;
        if (items) {
            const index = items.indexOf(item);
            if (index < 3) {
                view = items.slice(itemsCount - (3 - index), itemsCount);
                view = view.concat(items.slice(0, index + 4));
            } else if (index + 4 > itemsCount) {
                view = items.slice(index - 3, itemsCount);
                view = view.concat(items.slice(0, index + 4 - itemsCount));
            } else {
                view = items.slice(index - 3, index + 4);
            }
        }
        return view;
    }

    private generateHours(): any[] {
        const hourItems = [];
        let hoursCount = this.timePicker.isTwelveHourFormat ? 13 : 24;
        hoursCount /= this.timePicker.itemsDelta.hours;
        const minHours = this.timePicker.minDropdownValue.getHours();
        const maxHours = this.timePicker.maxDropdownValue.getHours();

        if (hoursCount > 1) {
            for (let hourIndex = 0; hourIndex < 24; hourIndex++) {
                let hours = hourIndex * this.timePicker.itemsDelta.hours;
                if (hours >= minHours && hours <= maxHours) {
                    hours = this.timePicker.isTwelveHourFormat ? this.toTwelveHourFormat(hours) : hours;
                    if (!hourItems.find((element => element === hours))) {
                        hourItems.push(hours);
                    }
                }
            }
        } else {
            hourItems.push(0);
        }

        if (hourItems.length < ITEMS_COUNT || hoursCount < ITEMS_COUNT || !this.timePicker.spinLoop) {
            const index = !this.timePicker.spinLoop || (hourItems.length < ITEMS_COUNT && hoursCount < ITEMS_COUNT) ? 6 : 3;
            for (let i = 0; i < index; i++) {
                hourItems.push(null);
            }
        }

        return hourItems;
    }

    private generateMinutes(): any[] {
        const minuteItems = [];
        const minuteItemsCount = 60 / this.timePicker.itemsDelta.minutes;
        const time = new Date(this.timePicker.selectedDate);

        for (let i = 0; i < minuteItemsCount; i++) {
            const minutes = i * this.timePicker.itemsDelta.minutes;
            time.setMinutes(minutes);
            if (time.getTime() >= this.timePicker.minDropdownValue.getTime() && time.getTime() <= this.timePicker.maxDropdownValue.getTime()) {
                minuteItems.push(i * this.timePicker.itemsDelta.minutes);
            }
        }

        if (minuteItems.length < ITEMS_COUNT || minuteItemsCount < ITEMS_COUNT || !this.timePicker.spinLoop) {
            const index = !this.timePicker.spinLoop || (minuteItems.length < ITEMS_COUNT && minuteItemsCount < ITEMS_COUNT) ? 6 : 3;
            for (let i = 0; i < index; i++) {
                minuteItems.push(null);
            }
        }

        return minuteItems;
    }

    private generateSeconds(): any[] {
        const secondsItems = [];
        const secondsItemsCount = 60 / this.timePicker.itemsDelta.seconds;
        const time = new Date(this.timePicker.selectedDate);

        for (let i = 0; i < secondsItemsCount; i++) {
            const seconds = i * this.timePicker.itemsDelta.seconds;
            time.setSeconds(seconds);
            if (time.getTime() >= this.timePicker.minDropdownValue.getTime() && time.getTime() <= this.timePicker.maxDropdownValue.getTime()) {
                secondsItems.push(i * this.timePicker.itemsDelta.seconds);
            }
        }

        if (secondsItems.length < ITEMS_COUNT || secondsItemsCount < ITEMS_COUNT || !this.timePicker.spinLoop) {
            const index = !this.timePicker.spinLoop || (secondsItems.length < ITEMS_COUNT && secondsItemsCount < ITEMS_COUNT) ? 6 : 3;
            for (let i = 0; i < index; i++) {
                secondsItems.push(null);
            }
        }

        return secondsItems;
    }

    private generateAmPm(): any[] {
        const ampmItems = [];
        const minHour = this.timePicker.minDropdownValue?.getHours();
        const maxHour = this.timePicker.maxDropdownValue?.getHours();

        if (minHour < 12) {
            ampmItems.push('AM');
        }

        if (minHour >= 12 || maxHour >= 12) {
            ampmItems.push('PM');
        }

        for (let i = 0; i < 5; i++) {
            ampmItems.push(null);
        }

        return ampmItems;
    }

    private toTwelveHourFormat(hour: number): number {
        if (hour > 12) {
            hour -= 12;
        } else if (hour === 0) {
            hour = 12;
        }

        return hour;
    }
}
