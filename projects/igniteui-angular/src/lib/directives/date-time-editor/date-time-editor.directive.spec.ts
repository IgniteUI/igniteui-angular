import { IgxDateTimeEditorDirective } from './date-time-editor.directive';
import { DOCUMENT } from '@angular/common';
import { DatePart } from '../date-time-editor/date-time-editor.common';

let dateTimeEditor: IgxDateTimeEditorDirective;

describe('IgxDateTimeEditor', () => {
    describe('Unit tests', () => {
        const maskParsingService = jasmine.createSpyObj('MaskParsingService', ['parseMask', 'restoreValueFromMask', 'parseMaskValue']);
        const renderer2 = jasmine.createSpyObj('Renderer2', ['setAttribute']);
        let elementRef = { nativeElement: null };

        it('Should correctly display input format during user input.', () => {
            dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
            dateTimeEditor.ngOnInit();
            // TODO
        });

        it('Should spin/evaluate date input if an invalid date is pasted.', () => {
            // new Date(3333, 33, 33)
            // Wed Nov 02 3335 00:00:00 GMT+0200 (Eastern European Standard Time)
        });

        it('Should correctly show year based on century threshold.', () => {
            // TODO
        });

        it('Should not allow invalid dates to be entered.', () => {
            // valid for date and month segments
        });

        it('Should autofill missing date/time segments on blur.', () => {
            // TODO
            // _1/__/___ => 14/01/2000 -> de default date (1) and default year (2000)
        });

        it('Should support different display and input formats.', () => { // ?
            // TODO
            // have century threshold by default?
            // paste/input -"1/1/220 1:1:1:1" - input format/mask "_1/_1/_220 _1:_1:_1:__1" - display format "1/1/220 1:1:1:100"
            // input - 10/10/2020 10:10:10:111 - input format/mask - "10/10/2020 10:10:10:111" - display format "10/10/2020 10:10:10:111"
        });

        it('Should apply the display format defined.', () => {
            // TODO
            // default format
            // custom format
        });

        it('Should support long and short date formats', () => {
            // TODO
        });

        it('Should correctly display input and display formats, when different ones are defined for the component.', () => {
            // TODO
        });

        it('Should disable the input when disabled property is set.', () => {
            // TODO
        });

        it('Should set the input as readonly when readonly property is set.', () => {
            // TODO
        });

        it('Editor should not be editable when readonly or disabled.', () => {
            // TODO
        });

        it('Should move the caret to the start of the same portion if the caret is positioned at the end.', () => {
            // TODO
            // Ctrl/Cmd + Arrow Left
        });

        it('Should move the caret to the end of the same portion if it is positioned at the beginning.', () => {
            // TODO
            // Ctrl/Cmd + Arrow Right
        });

        it('Should move the caret to the same position on the next portion.', () => {
            // TODO
            // beginning of portion
            // end of portion
        });

        describe('Should be able to spin the date portions.', () => {
            it('Should correctly increment / decrement date portions with passed in DatePart', () => {
                elementRef = { nativeElement: { value: '12/10/2015' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.inputFormat = 'dd/M/yy';
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date('12/10/2015');
                const date = dateTimeEditor.value.getDate();
                const month = dateTimeEditor.value.getMonth();

                dateTimeEditor.increment(DatePart.Date);
                expect(dateTimeEditor.value.getDate()).toBeGreaterThan(date);

                dateTimeEditor.decrement(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toBeLessThan(month);
            });

            it('Should correctly increment / decrement date portions without passed in DatePart', () => {
                elementRef = { nativeElement: { value: '12/10/2015' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date('12/10/2015');
                const date = dateTimeEditor.value.getDate();

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getDate()).toBeGreaterThan(date);

                dateTimeEditor.decrement();
                expect(dateTimeEditor.value.getDate()).toEqual(date);
            });

            it('Should not loop over to next month when incrementing date', () => {
                elementRef = { nativeElement: { value: '29/02/2020' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 1, 29);

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getDate()).toEqual(1);
                expect(dateTimeEditor.value.getMonth()).toEqual(1);
            });

            it('Should not loop over to next year when incrementing month', () => {
                elementRef = { nativeElement: { value: '29/12/2020' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 11, 29);

                dateTimeEditor.increment(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toEqual(0);
                expect(dateTimeEditor.value.getFullYear()).toEqual(2020);
            });

            it('Should update date part if next/previous month\'s max date is less than the current one\'s', () => {
                elementRef = { nativeElement: { value: '31/01/2020' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 0, 31);

                dateTimeEditor.increment(DatePart.Month);
                expect(dateTimeEditor.value.getDate()).toEqual(29);
                expect(dateTimeEditor.value.getMonth()).toEqual(1);
            });

            it('Should prioritize Date for spinning, if it is set in format', () => {
                elementRef = { nativeElement: { value: '11/03/2020 00:00:00 AM' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.inputFormat = 'dd/M/yy HH:mm:ss tt';
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 2, 11);

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getDate()).toEqual(12);

                dateTimeEditor.decrement();
                expect(dateTimeEditor.value.getDate()).toEqual(11);
            });

            it('Should not loop over when isSpinLoop is false', () => {
                elementRef = { nativeElement: { value: '31/03/2020' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.isSpinLoop = false;
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 2, 31);

                dateTimeEditor.increment(DatePart.Date);
                expect(dateTimeEditor.value.getDate()).toEqual(31);

                dateTimeEditor.value = new Date(2020, 1, 31);
                dateTimeEditor.decrement(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toEqual(1);
            });

            it('Should loop over when isSpinLoop is true (default)', () => {
                elementRef = { nativeElement: { value: '31/03/2019' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 2, 31);

                dateTimeEditor.increment(DatePart.Date);
                expect(dateTimeEditor.value.getDate()).toEqual(1);

                dateTimeEditor.value = new Date(2020, 0, 31);
                dateTimeEditor.decrement(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toEqual(11);
            });
        });

        describe('Should be able to spin the time portions.', () => {
            it('Should correctly increment / decrement time portions with passed in DatePart', () => {
                elementRef = { nativeElement: { value: '10/10/2010 12:10:34' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2010, 11, 10, 12, 10, 34);
                const minutes = dateTimeEditor.value.getMinutes();
                const seconds = dateTimeEditor.value.getSeconds();

                dateTimeEditor.increment(DatePart.Minutes);
                expect(dateTimeEditor.value.getMinutes()).toBeGreaterThan(minutes);

                dateTimeEditor.decrement(DatePart.Seconds);
                expect(dateTimeEditor.value.getSeconds()).toBeLessThan(seconds);
            });

            it('Should correctly increment / decrement time portions without passed in DatePart', () => {
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                /*
                 * format must be set because the editor will prioritize Date if Hours is not set
                 * and no DatePart is provided to increment / decrement
                 */
                dateTimeEditor.inputFormat = 'HH:mm:ss tt';
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date();
                const hours = dateTimeEditor.value.getHours();

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getHours()).toBeGreaterThan(hours);

                dateTimeEditor.decrement();
                expect(dateTimeEditor.value.getHours()).toEqual(hours);
            });

            it('Should not loop over to next minute when incrementing seconds', () => {
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 20, 5, 59);

                dateTimeEditor.increment(DatePart.Seconds);
                expect(dateTimeEditor.value.getMinutes()).toEqual(5);
                expect(dateTimeEditor.value.getSeconds()).toEqual(0);
            });

            it('Should not loop over to next hour when incrementing minutes', () => {
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 20, 59, 12);

                dateTimeEditor.increment(DatePart.Minutes);
                expect(dateTimeEditor.value.getHours()).toEqual(20);
                expect(dateTimeEditor.value.getMinutes()).toEqual(0);
            });

            it('Should not loop over to next day when incrementing hours', () => {
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 23, 13, 12);

                dateTimeEditor.increment(DatePart.Hours);
                expect(dateTimeEditor.value.getDate()).toEqual(20);
                expect(dateTimeEditor.value.getHours()).toEqual(0);
            });

            it('Should not loop over when isSpinLoop is false', () => {
                elementRef = { nativeElement: { value: '20/02/2019 23:00:12' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.isSpinLoop = false;
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 23, 0, 12);

                dateTimeEditor.increment(DatePart.Hours);
                expect(dateTimeEditor.value.getHours()).toEqual(23);

                dateTimeEditor.decrement(DatePart.Minutes);
                expect(dateTimeEditor.value.getMinutes()).toEqual(0);
            });

            it('Should loop over when isSpinLoop is true (default)', () => {
                elementRef = { nativeElement: { value: '20/02/2019 23:15:12' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(elementRef, maskParsingService, renderer2, DOCUMENT);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 23, 15, 0);

                dateTimeEditor.increment(DatePart.Hours);
                expect(dateTimeEditor.value.getHours()).toEqual(0);

                dateTimeEditor.decrement(DatePart.Seconds);
                expect(dateTimeEditor.value.getSeconds()).toEqual(59);
            });
        });

        it('Should revert to empty mask on clear()', () => {
            // TODO
            // should clear inner value and emit valueChanged
        });

        it('Should not block the user from typing/pasting/dragging dates outside of min/max range', () => {
            // TODO
        });

        it('Should enter an invalid state if the input does not satisfy min/max props.', () => {
            // TODO
            // should throw an event containing the arguments
            // apply styles?
        });

        // it('Should prevent user input if the input is outside min/max values defined.', () => {
        //     //  TODO
        //     // clear the date / reset the the date to min/max? -> https://github.com/IgniteUI/igniteui-angular/issues/6286
        // });

        it('Should display Default "/" separator if none is set.', () => {
            // TODO
        });

        it('Should display the Custom separator if such is defined.', () => {
            // TODO
        });

        it('Should preserve the separator on paste/drag with other separator', () => {
            // TODO
        });

        it('Should preserve the date when pasting with different separator', () => {
            // TODO
            // 01/01/0220 --> 01/01/0220
            // 01\01\0220 --> 01/01/0220
            // 01%01%0220 --> 01/01/0220
            // 01-01-0220 --> 01/01/0220
            // 01-01-2020 --> 01/01/2020
        });
    });

    describe('Integration tests', () => {
        // TODO
    });
});
