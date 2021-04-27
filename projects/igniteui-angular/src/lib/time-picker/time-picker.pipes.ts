import { Pipe, PipeTransform, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IGX_TIME_PICKER_COMPONENT, IgxTimePickerBase } from './time-picker.common';
import { DatePart } from '../directives/date-time-editor/public_api';

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

    public transform(_collection: any[], timePart: string, selectedDate: Date, min: Date, max: Date) {
        let list;
        let part;
        switch (timePart) {
            case 'hour':
                list = this.generateHours(min, max);
                const hours = this.timePicker.isTwelveHourFormat ? this.toTwelveHourFormat(selectedDate.getHours())
                    : selectedDate.getHours();
                list = this.scrollListItem(hours, list);
                part = DatePart.Hours;
                break;
            case 'minutes':
                list = this.generateMinutes(selectedDate, min, max);
                list = this.scrollListItem(selectedDate.getMinutes(), list);
                part = DatePart.Minutes;
                break;
            case 'seconds':
                list = this.generateSeconds(selectedDate, min, max);
                list = this.scrollListItem(selectedDate.getSeconds(), list);
                part = DatePart.Seconds;
                break;
            case 'ampm':
                list = this.generateAmPm(min, max);
                const selectedAmPm = this.timePicker.getPartValue(selectedDate, 'ampm');
                list = this.scrollListItem(selectedAmPm, list);
                part = DatePart.AmPm;
                break;
        }
        return this.getListView(list, part);
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
            const leadZeroHour = (item < 10 && (this.timePicker.inputFormat.indexOf('hh') !== -1
                || this.timePicker.inputFormat.indexOf('HH') !== -1));
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

    private generateHours(min: Date, max: Date): any[] {
        const hourItems = [];
        let hoursCount = this.timePicker.isTwelveHourFormat ? 13 : 24;
        hoursCount /= this.timePicker.itemsDelta.hours;
        const minHours = min.getHours();
        const maxHours = max.getHours();

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

    private generateMinutes(time: Date, min: Date, max: Date): any[] {
        const minuteItems = [];
        const minuteItemsCount = 60 / this.timePicker.itemsDelta.minutes;
        time = new Date(time);

        for (let i = 0; i < minuteItemsCount; i++) {
            const minutes = i * this.timePicker.itemsDelta.minutes;
            time.setMinutes(minutes);
            if (time >= min && time <= max) {
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

    private generateSeconds(time: Date, min: Date, max: Date): any[] {
        const secondsItems = [];
        const secondsItemsCount = 60 / this.timePicker.itemsDelta.seconds;
        time = new Date(time);

        for (let i = 0; i < secondsItemsCount; i++) {
            const seconds = i * this.timePicker.itemsDelta.seconds;
            time.setSeconds(seconds);
            if (time.getTime() >= min.getTime()
                && time.getTime() <= max.getTime()) {
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

    private generateAmPm(min: Date, max: Date): any[] {
        const ampmItems = [];
        const minHour = min.getHours();
        const maxHour = max.getHours();

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
