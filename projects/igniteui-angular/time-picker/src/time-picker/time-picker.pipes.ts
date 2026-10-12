import { Pipe, PipeTransform, inject } from '@angular/core';
import { IGX_TIME_PICKER_COMPONENT, IgxTimePickerBase } from './time-picker.common';
import { DatePart, DateTimeUtil, I18N_FORMATTER } from 'igniteui-angular/core';

const ITEMS_COUNT = 7;

type ListItem = number | string | null;

@Pipe({
    name: 'timeFormatPipe',
    standalone: true
})
export class TimeFormatPipe implements PipeTransform {
    private timePicker = inject<IgxTimePickerBase>(IGX_TIME_PICKER_COMPONENT);
    private i18nFormatter = inject(I18N_FORMATTER);


    public transform(value: Date): string {
        const format = this.timePicker.appliedFormat.replace('tt', 'aa');
        return this.i18nFormatter.formatDate(value, format, this.timePicker.locale);
    }
}

@Pipe({
    name: 'timeItemPipe',
    standalone: true
})
export class TimeItemPipe implements PipeTransform {
    private timePicker = inject<IgxTimePickerBase>(IGX_TIME_PICKER_COMPONENT);


    public transform(selectedDate: Date, timePart: 'hour' | 'minutes' | 'seconds' | 'ampm', min: Date, max: Date): string[] {
        switch (timePart) {
            case 'hour': {
                const hours = this.timePicker.isTwelveHourFormat
                    ? this.toTwelveHourFormat(selectedDate.getHours())
                    : selectedDate.getHours();
                return this.getListView(this.scrollListItem(hours, this.generateHours(min, max)), DatePart.Hours);
            }
            case 'minutes': {
                const minutes = this.generateItems(selectedDate, min, max, DatePart.Minutes);
                return this.getListView(this.scrollListItem(selectedDate.getMinutes(), minutes), DatePart.Minutes);
            }
            case 'seconds': {
                const seconds = this.generateItems(selectedDate, min, max, DatePart.Seconds);
                return this.getListView(this.scrollListItem(selectedDate.getSeconds(), seconds), DatePart.Seconds);
            }
            case 'ampm': {
                const selectedAmPm = this.timePicker.getPartValue(selectedDate, DatePart.AmPm);
                const ampm = this.generateAmPm(min, max, selectedAmPm);
                return this.getListView(this.scrollListItem(selectedAmPm, ampm), DatePart.AmPm);
            }
        }
    }

    private getListView(view: ListItem[], dateType: DatePart): string[] {
        return view.map(item => this.getItemView(item, dateType));
    }

    private getItemView(item: ListItem, dateType: DatePart): string {
        if (item === null) {
            return '';
        }
        if (typeof item === 'string') {
            return item;
        }

        const format = this.timePicker.appliedFormat;
        const leadZeroFormats: Partial<Record<DatePart, string[]>> = {
            [DatePart.Hours]: ['hh', 'HH'],
            [DatePart.Minutes]: ['mm'],
            [DatePart.Seconds]: ['ss']
        };
        const leadZero = item < 10 && !!leadZeroFormats[dateType]?.some(f => format?.indexOf(f) !== -1);
        return leadZero ? `0${item}` : `${item}`;
    }

    /** Returns the visible part of the list, centered around the selected item */
    private scrollListItem(item: number | string, items: ListItem[]): ListItem[] {
        const itemsCount = items.length;
        const index = items.indexOf(item);
        if (index < 3) {
            return items.slice(itemsCount - (3 - index), itemsCount).concat(items.slice(0, index + 4));
        }
        if (index + 4 > itemsCount) {
            return items.slice(index - 3, itemsCount).concat(items.slice(0, index + 4 - itemsCount));
        }
        return items.slice(index - 3, index + 4);
    }

    private generateHours(min: Date, max: Date): ListItem[] {
        const hourItems: ListItem[] = [];
        const hoursDelta = this.timePicker.itemsDelta.hours!;
        const hoursCount = (this.timePicker.isTwelveHourFormat ? 13 : 24) / hoursDelta;
        const minHours = min.getHours();
        const maxHours = max.getHours();

        for (let hourIndex = 0; hourIndex < 24; hourIndex++) {
            let hours = hourIndex * hoursDelta;
            if (hours >= minHours && hours <= maxHours) {
                hours = this.timePicker.isTwelveHourFormat ? this.toTwelveHourFormat(hours) : hours;
                if (!hourItems.includes(hours)) {
                    hourItems.push(hours);
                }
            }
        }

        return this.padItems(hourItems, hoursCount);
    }

    private generateItems(time: Date, min: Date, max: Date, datePart: DatePart.Minutes | DatePart.Seconds): ListItem[] {
        const items: ListItem[] = [];
        const delta = datePart === DatePart.Minutes ? this.timePicker.itemsDelta.minutes! : this.timePicker.itemsDelta.seconds!;
        const itemsCount = 60 / delta;
        const date = new Date(time);

        for (let i = 0; i < itemsCount; i++) {
            const value = i * delta;
            if (datePart === DatePart.Minutes) {
                date.setMinutes(value);
            } else {
                date.setSeconds(value);
            }
            if (date >= min && date <= max) {
                items.push(value);
            }
        }

        return this.padItems(items, itemsCount);
    }

    /** Appends empty items to short lists (or when looping is disabled), so the edge items can be scrolled to the center */
    private padItems(items: ListItem[], itemsCount: number): ListItem[] {
        const spinLoop = this.timePicker.spinLoop;
        if (items.length < ITEMS_COUNT || itemsCount < ITEMS_COUNT || !spinLoop) {
            const padding = !spinLoop || (items.length < ITEMS_COUNT && itemsCount < ITEMS_COUNT) ? 6 : 3;
            items.push(...new Array<null>(padding).fill(null));
        }
        return items;
    }

    private generateAmPm(min: Date, max: Date, selectedAmPm: string): ListItem[] {
        const ampmItems: ListItem[] = [];
        const minHour = min.getHours();
        const maxHour = max.getHours();

        if (minHour < 12) {
            ampmItems.push(DateTimeUtil.getAmPmValue(selectedAmPm.length, true));
        }

        if (minHour >= 12 || maxHour >= 12) {
            ampmItems.push(DateTimeUtil.getAmPmValue(selectedAmPm.length, false));
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
