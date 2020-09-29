import { DatePickerUtil } from '../../date-picker/date-picker.utils';
import { DatePart, DatePartInfo } from './date-time-editor.common';

function reduceToDictionary(parts: DatePartInfo[]) {
    return parts.reduce((obj, x) => {
        obj[x.type] = x;
        return obj;
    }, {});
}

describe('Date Time Parsing', () => {
    it('should correctly parse all date time parts (base)', () => {
        const result = DatePickerUtil.parseDateTimeFormat('dd/MM/yyyy HH:mm:ss tt');
        const expected = [
            { start: 0, end: 2, type: DatePart.Date, format: 'dd' },
            { start: 2, end: 3, type: DatePart.Literal, format: '/' },
            { start: 3, end: 5, type: DatePart.Month, format: 'MM' },
            { start: 5, end: 6, type: DatePart.Literal, format: '/' },
            { start: 6, end: 10, type: DatePart.Year, format: 'yyyy' },
            { start: 10, end: 11, type: DatePart.Literal, format: ' ' },
            { start: 11, end: 13, type: DatePart.Hours, format: 'HH' },
            { start: 13, end: 14, type: DatePart.Literal, format: ':' },
            { start: 14, end: 16, type: DatePart.Minutes, format: 'mm' },
            { start: 16, end: 17, type: DatePart.Literal, format: ':' },
            { start: 17, end: 19, type: DatePart.Seconds, format: 'ss' },
            { start: 19, end: 20, type: DatePart.Literal, format: ' ' },
            { start: 20, end: 22, type: DatePart.AmPm, format: 'tt' }
        ];
        expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });

    it('should correctly parse date parts of with short formats', () => {
        let result = DatePickerUtil.parseDateTimeFormat('MM/dd/yyyy');
        let resDict = reduceToDictionary(result);
        expect(result.length).toEqual(5);
        expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 0, end: 2 }));
        expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 3, end: 5 }));
        expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 6, end: 10 }));

        result = DatePickerUtil.parseDateTimeFormat('M/d/yy');
        resDict = reduceToDictionary(result);
        expect(result.length).toEqual(5);
        expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 0, end: 2 }));
        expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 3, end: 5 }));
        expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 6, end: 8 }));

        result = DatePickerUtil.parseDateTimeFormat('dd.MM.yyyy г.');
        resDict = reduceToDictionary(result);
        expect(result.length).toEqual(6);
        expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 0, end: 2 }));
        expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 3, end: 5 }));
        expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 6, end: 10 }));

        return; // TODO
        result = DatePickerUtil.parseDateTimeFormat('dd.MM.yyyyг');
        resDict = reduceToDictionary(result);
        expect(result.length).toEqual(6);
        expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 0, end: 2 }));
        expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 3, end: 5 }));
        expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 6, end: 10 }));
        expect(result[5]?.format).toEqual('г');

        result = DatePickerUtil.parseDateTimeFormat('yyyy/MM/d');
        resDict = reduceToDictionary(result);
        expect(result.length).toEqual(5);
        expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 0, end: 4 }));
        expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 5, end: 7 }));
        expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 8, end: 10 }));
    });

    it('should correctly parse boundary dates', () => {
        const parts = DatePickerUtil.parseDateTimeFormat('MM/dd/yyyy');
        let result = DatePickerUtil.parseValueFromMask('08/31/2020', parts);
        expect(result).toEqual(new Date(2020, 7, 31));
        result = DatePickerUtil.parseValueFromMask('09/30/2020', parts);
        expect(result).toEqual(new Date(2020, 8, 30));
        result = DatePickerUtil.parseValueFromMask('10/31/2020', parts);
        expect(result).toEqual(new Date(2020, 9, 31));
    });
});
