import { Pipe, PipeTransform, Inject} from '@angular/core';
import { IGX_TIME_PICKER_COMPONENT, IgxTimePickerBase } from './time-picker.common';


/**
 * Formats `IgxTimePickerComponent` display value according to the `format` property,
 * when the input element loses focus.
 **/
@Pipe({ name: 'displayFormat'})
export class TimeDisplayFormatPipe implements PipeTransform {

     constructor(@Inject(IGX_TIME_PICKER_COMPONENT) private timePicker: IgxTimePickerBase) { }

     transform(value: any): string {
        let hour, minutes, seconds, amPM;

        const maskAmPM = this.timePicker.parseMask();
        const mask = this.timePicker.parseMask(false);
        if (!value || value === mask || value === maskAmPM) {
            return '';
        }

        const sections = value.split(/[\s:]+/);

        if (this.timePicker.showHoursList) {
            hour = sections[0];
        }

        if (this.timePicker.showMinutesList) {
            minutes = this.timePicker.showHoursList ? sections[1] : sections[0];
        }

        if (this.timePicker.showSecondsList) {
            seconds = sections[sections.length - (this.timePicker.showAmPmList ? 2 : 1)];
        }

        if (this.timePicker.showAmPmList) {
            amPM = sections[sections.length - 1];
        }

        const format = this.timePicker.format;
        const prompt = this.timePicker.promptChar;
        const regExp = new RegExp(this.timePicker.promptChar, 'g');

        if (format.indexOf('hh') !== -1 || format.indexOf('HH') !== -1 && hour.indexOf(prompt) !== -1) {
           hour = hour === prompt + prompt ? '00' : hour.replace(regExp, '0');
        }

        if (format.indexOf('mm') !== -1 && minutes.indexOf(prompt) !== -1) {
           minutes = minutes === prompt + prompt ? '00' : minutes.replace(regExp, '0');
        }

        if (format.indexOf('ss') !== -1 && seconds.indexOf(prompt) !== -1) {
            seconds = seconds === prompt + prompt ? '00' : seconds.replace(regExp, '0');
        }

        if (format.indexOf('hh') === -1 && format.indexOf('HH') === -1 && hour !== undefined) {
            hour = hour.indexOf(prompt) !== -1 ? hour.replace(regExp, '') : hour;
            const hourVal = parseInt(hour, 10);
            hour = !hourVal ? '0' : hourVal < 10 && hourVal !== 0 ? hour.replace('0', '') : hour;
        }

        if (format.indexOf('mm') === -1 && minutes !== undefined) {
            minutes = minutes.indexOf(prompt) !== -1 ? minutes.replace(regExp, '') : minutes;
            const minutesVal = parseInt(minutes, 10);
            minutes = !minutesVal ? '0' : minutesVal < 10 && minutesVal !== 0 ? minutes.replace('0', '') : minutes;
        }

        if (format.indexOf('ss') === -1 && seconds !== undefined) {
            seconds = seconds.indexOf(prompt) !== -1 ? seconds.replace(regExp, '') : seconds;
            const secondsVal = parseInt(seconds, 10);
            seconds = !secondsVal ? '0' : secondsVal < 10 && secondsVal !== 0 ? seconds.replace('0', '') : seconds;
        }

        if (format.indexOf('tt') !== -1 && (amPM !== 'AM' || amPM !== 'PM')) {
           amPM = amPM.indexOf('p') !== -1 || amPM.indexOf('P') !== -1 ? 'PM' : 'AM';
        }

        let result = amPM ? `${hour}:${minutes}:${seconds} ${amPM}` : `${hour}:${minutes}:${seconds}`;

        if (!hour) {
            result = result.slice(result.indexOf(':') + 1, result.length);
        }

        if (!minutes) {
            result = result.slice(0, result.indexOf(':'));

            if (seconds) {
                result = result + ':' + seconds;
            }
        }

        if (!seconds) {
            result = result.slice(0, result.lastIndexOf(':'));

            if (amPM) { result = result + ' ' + amPM; }
        }

        return result;
    }
}

/**
 * Formats `IgxTimePickerComponent` display value according to the `format` property,
 * when the input element gets focus.
 **/
@Pipe({ name: 'inputFormat' })
export class TimeInputFormatPipe implements PipeTransform {

    constructor(@Inject(IGX_TIME_PICKER_COMPONENT) private timePicker: IgxTimePickerBase) { }

    transform(value: any): string {
        const prompt = this.timePicker.promptChar;
        const regExp = new RegExp(prompt, 'g');

        let mask, hour, minutes, seconds, amPM;

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

        if (this.timePicker.showHoursList) {
            hour = sections[0];
            hour = hour.replace(regExp, '');

            const leadZeroHour = (parseInt(hour, 10) < 10 && !hour.startsWith('0')) || hour === '0';
            hour = leadZeroHour ? '0' + hour : hour;
        }

        if (this.timePicker.showMinutesList) {
            minutes = this.timePicker.showHoursList ? sections[1] : sections[0];
            minutes = minutes.replace(regExp, '');

            const leadZeroMinutes = (parseInt(minutes, 10) < 10 && !minutes.startsWith('0')) || minutes === '0';
            minutes = leadZeroMinutes ? '0' + minutes : minutes;
        }

        if (this.timePicker.showSecondsList) {
            seconds = sections[sections.length - (this.timePicker.showAmPmList ? 2 : 1)];
            seconds = seconds.replace(regExp, '');

            const leadZeroSeconds = (parseInt(seconds, 10) < 10 && !seconds.startsWith('0')) || seconds === '0';
            seconds = leadZeroSeconds ? '0' + seconds : seconds;
        }

        if (this.timePicker.showAmPmList) {
            amPM = sections[sections.length - 1];
        }

        let result = amPM ? `${hour}:${minutes}:${seconds} ${amPM}` : `${hour}:${minutes}:${seconds}`;

        if (!hour) {
            result = result.slice(result.indexOf(':') + 1, result.length);
        }

        if (!minutes) {
            result = result.slice(0, result.indexOf(':'));

            if (seconds) {
                result = result + ':' + seconds;
            }
        }

        if (!seconds) {
            result = result.slice(0, result.lastIndexOf(':'));

            if (amPM) { result = result + ' ' + amPM; }
        }

        return result;
    }
}
