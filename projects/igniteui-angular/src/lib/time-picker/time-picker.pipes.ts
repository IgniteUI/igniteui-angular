import { Pipe, PipeTransform, Inject} from '@angular/core';
import { IGX_TIME_PICKER_COMPONENT, IgxTimePickerBase } from './time-picker.common';

@Pipe({ name: "displayFormat" })
export class TimeDisplayFormatPipe implements PipeTransform {

     constructor(@Inject(IGX_TIME_PICKER_COMPONENT) public timePicker: IgxTimePickerBase) { }

     transform(value: any): string {

        const maskAmPM = this.timePicker.parseMask();
        const mask = this.timePicker.parseMask(false);
        if (!value || value === mask || value === maskAmPM) {
            return '';
        }

        const sections = value.split(/[\s:]+/);

        let hour = sections[0];
        let minutes = sections[1];
        let amPM = sections[2];

        const format = this.timePicker.format;
        const prompt = this.timePicker.promptChar;
        const regExp = new RegExp(this.timePicker.promptChar,"g");

        if (format.indexOf('hh') !== -1 || format.indexOf('HH') !== -1 && hour.indexOf(prompt) !== -1) {
           hour = hour === prompt + prompt ? '00' : hour.replace(regExp, '0');
        }

        if (format.indexOf('mm') !== -1 && minutes.indexOf(prompt) !== -1) {
           minutes = minutes === prompt + prompt ? '00' : minutes.replace(regExp, '0');
        }

        if (format.indexOf('hh') === -1 && format.indexOf('HH') === -1) {
            hour = hour.indexOf(prompt) !== -1 ? hour.replace(regExp, '') : hour;
            let hourVal = parseInt(hour, 10);
            hour = !hourVal ? '0' : hourVal < 10 && hourVal !== 0 ? hour.replace('0', '') : hour;
        }

        if (format.indexOf('mm') === -1) {
            minutes = minutes.indexOf(prompt) !== -1 ? minutes.replace(regExp, '') : minutes;
            let minutesVal = parseInt(minutes, 10);
            minutes = !minutesVal ? '0' : minutesVal < 10 && minutesVal !== 0 ? minutes.replace('0', '') : minutes;
        }

        if (format.indexOf('tt') !== -1 && (amPM !== 'AM' ||amPM !== 'PM')) {
           amPM = amPM.indexOf('p') !== -1 || amPM.indexOf('P') !== -1 ? 'PM' : 'AM';
        }

        return amPM ? `${hour}:${minutes} ${amPM}` : `${hour}:${minutes}`;
    }
}


@Pipe({ name: "inputFormat" })
export class TimeInputFormatPipe implements PipeTransform {

    constructor(@Inject(IGX_TIME_PICKER_COMPONENT) public timePicker: IgxTimePickerBase) { }

    transform(value: any): string {
        const prompt = this.timePicker.promptChar;
        const regExp = new RegExp(prompt,"g");

        let mask: string;
        if (this.timePicker.cleared) {
            this.timePicker.cleared = false;
            mask = this.timePicker.parseMask(false);
        } else {
            mask = this.timePicker.parseMask();
        }

        if (!value || value === mask) {
            return mask;
        }

        const sections = value.split(/[\s:]+/);

        let hour = sections[0].replace(regExp, '');
        let minutes = sections[1].replace(regExp, '');
        let amPM = sections[2];

        const leadZeroHour = (parseInt(hour, 10) < 10 && !hour.startsWith('0')) || hour === '0';
        const leadZeroMinutes = (parseInt(minutes, 10) < 10 && !minutes.startsWith('0')) || minutes === '0';

        hour = leadZeroHour ? '0' + hour : hour;
        minutes = leadZeroMinutes ? '0' + minutes : minutes;

        return amPM ? `${hour}:${minutes} ${amPM}` : `${hour}:${minutes}`;
    }
}
