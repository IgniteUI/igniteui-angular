import { IgxDateTimeEditorDirective, IgxDateTimeEditorModule } from './date-time-editor.directive';
import { DatePart, IgxDateTimeEditorEventArgs } from './date-time-editor.common';
import { DOCUMENT, registerLocaleData } from '@angular/common';
import { IgxMaskDirective } from '../mask/mask.directive';
import { Component, ViewChild, OnInit, DebugElement, LOCALE_ID, EventEmitter, Output } from '@angular/core';
import { async, fakeAsync, TestBed, tick, flush, ComponentFixture } from '@angular/core/testing';
import { FormsModule, FormGroup, FormBuilder, FormControl, ReactiveFormsModule, NgModel, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputGroupModule, IgxInputGroupComponent, IgxInputDirective } from '../../input-group';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

let dateTimeEditor: IgxDateTimeEditorDirective;

describe('IgxDateTimeEditor', () => {
    describe('Unit tests', () => {
        const maskParsingService = jasmine.createSpyObj('MaskParsingService',
            ['parseMask', 'restoreValueFromMask', 'parseMaskValue', 'applyMask']);
        const renderer2 = jasmine.createSpyObj('Renderer2', ['setAttribute']);
        let elementRef = { nativeElement: null };
        describe('Date portions spinning', () => {
            it('should correctly increment / decrement date portions with passed in DatePart', () => {
                elementRef = { nativeElement: { value: '12/10/2015' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.inputFormat = 'dd/M/yy';
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date('12/10/2015');
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('12/10/2015');
                const date = dateTimeEditor.value.getDate();
                const month = dateTimeEditor.value.getMonth();

                dateTimeEditor.increment(DatePart.Date);
                expect(dateTimeEditor.value.getDate()).toBeGreaterThan(date);

                dateTimeEditor.decrement(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toBeLessThan(month);
            });

            it('should correctly increment / decrement date portions without passed in DatePart', () => {
                elementRef = { nativeElement: { value: '12/10/2015' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date('12/10/2015');
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('12/10/2015');
                const date = dateTimeEditor.value.getDate();

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getDate()).toBeGreaterThan(date);

                dateTimeEditor.decrement();
                expect(dateTimeEditor.value.getDate()).toEqual(date);
            });

            it('should not loop over to next month when incrementing date', () => {
                elementRef = { nativeElement: { value: '29/02/2020' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 1, 29);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('29/01/2020');

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getDate()).toEqual(1);
                expect(dateTimeEditor.value.getMonth()).toEqual(1);
            });

            it('should not loop over to next year when incrementing month', () => {
                elementRef = { nativeElement: { value: '29/12/2020' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 11, 29);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('29/11/2020');

                dateTimeEditor.increment(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toEqual(0);
                expect(dateTimeEditor.value.getFullYear()).toEqual(2020);
            });

            it('should update date part if next/previous month\'s max date is less than the current one\'s', () => {
                elementRef = { nativeElement: { value: '31/01/2020' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 0, 31);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('31/01/2020');

                dateTimeEditor.increment(DatePart.Month);
                expect(dateTimeEditor.value.getDate()).toEqual(29);
                expect(dateTimeEditor.value.getMonth()).toEqual(1);
            });

            it('should prioritize Date for spinning, if it is set in format', () => {
                elementRef = { nativeElement: { value: '11/03/2020 00:00:00 AM' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.inputFormat = 'dd/M/yy HH:mm:ss tt';
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 2, 11);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('11/02/2020');

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getDate()).toEqual(12);

                dateTimeEditor.decrement();
                expect(dateTimeEditor.value.getDate()).toEqual(11);
            });

            it('should not loop over when isSpinLoop is false', () => {
                elementRef = { nativeElement: { value: '31/03/2020' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.isSpinLoop = false;
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 2, 31);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('31/03/2020');

                dateTimeEditor.increment(DatePart.Date);
                expect(dateTimeEditor.value.getDate()).toEqual(31);

                dateTimeEditor.value = new Date(2020, 1, 31);
                dateTimeEditor.decrement(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toEqual(1);
            });

            it('should loop over when isSpinLoop is true (default)', () => {
                elementRef = { nativeElement: { value: '31/03/2019' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2020, 2, 31);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('31/02/2019');

                dateTimeEditor.increment(DatePart.Date);
                expect(dateTimeEditor.value.getDate()).toEqual(1);

                dateTimeEditor.value = new Date(2020, 0, 31);
                dateTimeEditor.decrement(DatePart.Month);
                expect(dateTimeEditor.value.getMonth()).toEqual(11);
            });
        });

        describe('Time portions spinning', () => {
            it('should correctly increment / decrement time portions with passed in DatePart', () => {
                elementRef = { nativeElement: { value: '10/10/2010 12:10:34' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2010, 11, 10, 12, 10, 34);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('10/11/2010 12:10:59');
                const minutes = dateTimeEditor.value.getMinutes();
                const seconds = dateTimeEditor.value.getSeconds();

                dateTimeEditor.increment(DatePart.Minutes);
                expect(dateTimeEditor.value.getMinutes()).toBeGreaterThan(minutes);

                dateTimeEditor.decrement(DatePart.Seconds);
                expect(dateTimeEditor.value.getSeconds()).toBeLessThan(seconds);
            });

            it('should correctly increment / decrement time portions without passed in DatePart', () => {
                elementRef = { nativeElement: { value: '' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                /*
                 * format must be set because the editor will prioritize Date if Hours is not set
                 * and no DatePart is provided to increment / decrement
                 */
                dateTimeEditor.inputFormat = 'HH:mm:ss tt';
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date();
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('');
                const hours = dateTimeEditor.value.getHours();

                dateTimeEditor.increment();
                expect(dateTimeEditor.value.getHours()).toBeGreaterThan(hours);

                dateTimeEditor.decrement();
                expect(dateTimeEditor.value.getHours()).toEqual(hours);
            });

            it('should not loop over to next minute when incrementing seconds', () => {
                elementRef = { nativeElement: { value: '20/01/2019 20:05:59' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 20, 5, 59);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('20/01/2019 20:05:59');

                dateTimeEditor.increment(DatePart.Seconds);
                expect(dateTimeEditor.value.getMinutes()).toEqual(5);
                expect(dateTimeEditor.value.getSeconds()).toEqual(0);
            });

            it('should not loop over to next hour when incrementing minutes', () => {
                elementRef = { nativeElement: { value: '20/01/2019 20:59:12' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 20, 59, 12);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('20/1/2019 20:59:12');

                dateTimeEditor.increment(DatePart.Minutes);
                expect(dateTimeEditor.value.getHours()).toEqual(20);
                expect(dateTimeEditor.value.getMinutes()).toEqual(0);
            });

            it('should not loop over to next day when incrementing hours', () => {
                elementRef = { nativeElement: { value: '20/01/2019 23:13:12' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 23, 13, 12);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('20/1/2019 23:13:12');

                dateTimeEditor.increment(DatePart.Hours);
                expect(dateTimeEditor.value.getDate()).toEqual(20);
                expect(dateTimeEditor.value.getHours()).toEqual(0);
            });

            it('should not loop over when isSpinLoop is false', () => {
                elementRef = { nativeElement: { value: '20/02/2019 23:00:12' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.isSpinLoop = false;
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 23, 0, 12);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('20/1/2019 23:00:12');

                dateTimeEditor.increment(DatePart.Hours);
                expect(dateTimeEditor.value.getHours()).toEqual(23);

                dateTimeEditor.decrement(DatePart.Minutes);
                expect(dateTimeEditor.value.getMinutes()).toEqual(0);
            });

            it('should loop over when isSpinLoop is true (default)', () => {
                elementRef = { nativeElement: { value: '20/02/2019 23:15:12' } };
                dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
                dateTimeEditor.ngOnInit();
                dateTimeEditor.value = new Date(2019, 1, 20, 23, 15, 0);
                spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('20/1/2019 23:15:00');

                dateTimeEditor.increment(DatePart.Hours);
                expect(dateTimeEditor.value.getHours()).toEqual(0);

                dateTimeEditor.decrement(DatePart.Seconds);
                expect(dateTimeEditor.value.getSeconds()).toEqual(59);
            });
        });

        it('should emit valueChange event on clear()', () => {
            elementRef = { nativeElement: { value: '' } };
            dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
            dateTimeEditor.ngOnInit();
            spyOn(dateTimeEditor.valueChange, 'emit');
            const date = new Date(2000, 5, 6);
            dateTimeEditor.value = date;
            spyOnProperty((dateTimeEditor as any), 'inputValue', 'get').and.returnValue('6/5/2000');

            dateTimeEditor.clear();
            expect(dateTimeEditor.value).toBeNull();
            expect(dateTimeEditor.valueChange.emit).toHaveBeenCalledTimes(1);
            expect(dateTimeEditor.valueChange.emit).toHaveBeenCalledWith({ oldValue: date, newValue: null });
        });

        it('should update mask according to the input format', () => {
            elementRef = { nativeElement: { value: '' } };
            dateTimeEditor = new IgxDateTimeEditorDirective(renderer2, elementRef, maskParsingService, DOCUMENT, LOCALE_ID);
            dateTimeEditor.inputFormat = 'd/M/yy';
            dateTimeEditor.ngOnInit();

            expect(dateTimeEditor.mask).toEqual('00/00/00');

            dateTimeEditor.inputFormat = 'dd-MM-yyyy HH:mm:ss';
            expect(dateTimeEditor.mask).toEqual('00-00-0000 00:00:00');

            dateTimeEditor.inputFormat = 'H:m:s';
            expect(dateTimeEditor.mask).toEqual('00:00:00');
        });
    });

    describe('Integration tests', () => {
        let fixture;
        let inputElement: DebugElement;
        let dateTimeEditorDirective: IgxDateTimeEditorDirective;
        describe('Key interaction tests', () => {
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDateTimeEditorSampleComponent
                    ],
                    imports: [IgxInputGroupModule, IgxDateTimeEditorModule, FormsModule, NoopAnimationsModule]
                })
                    .compileComponents();
            }));
            beforeEach(async () => {
                fixture = TestBed.createComponent(IgxDateTimeEditorSampleComponent);
                fixture.detectChanges();
                inputElement = fixture.debugElement.query(By.css('input'));
                dateTimeEditorDirective = inputElement.injector.get(IgxDateTimeEditorDirective);
            });

            it('should correctly display input format during user input', () => {
                fixture.componentInstance.dateTimeFormat = 'dd/MM/yy';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('1', inputElement);
                expect(inputElement.nativeElement.value).toEqual('1_/__/__');
                UIInteractions.simulateTyping('9', inputElement, 1, 1);
                expect(inputElement.nativeElement.value).toEqual('19/__/__');
                UIInteractions.simulateTyping('1', inputElement, 2, 2);
                expect(inputElement.nativeElement.value).toEqual('19/1_/__');
                UIInteractions.simulateTyping('2', inputElement, 4, 4);
                expect(inputElement.nativeElement.value).toEqual('19/12/__');
                UIInteractions.simulateTyping('0', inputElement, 5, 5);
                expect(inputElement.nativeElement.value).toEqual('19/12/0_');
                UIInteractions.simulateTyping('8', inputElement, 7, 7);
                expect(inputElement.nativeElement.value).toEqual('19/12/08');
            });
            it('should not accept invalid date.', () => {
                fixture.componentInstance.dateTimeFormat = 'dd/MM/yy';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('333333', inputElement);
                expect(inputElement.nativeElement.value).toEqual('33/33/33');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('__/__/__');
            });
            it('should autofill missing date/time segments on blur.', () => {
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('8', inputElement);
                expect(inputElement.nativeElement.value).toEqual('8_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('08/01/2000 00:00:00');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('5', inputElement, 7, 7);
                expect(inputElement.nativeElement.value).toEqual('__/__/_5__ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('01/01/2005 00:00:00');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('3', inputElement, 11, 11);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ 3_:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('01/01/2000 03:00:00');
            });
            it('should convert to empty mask on invalid dates input.', () => {
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('63', inputElement);
                expect(inputElement.nativeElement.value).toEqual('63/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:__:__');

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('63', inputElement, 3, 3);
                expect(inputElement.nativeElement.value).toEqual('__/63/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:__:__');

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('25', inputElement, 11, 11);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ 25:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:__:__');

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('78', inputElement, 14, 14);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:78:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:__:__');

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('78', inputElement, 17, 17);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:__:78');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:__:__');
            });
            it('should correctly show year based on century threshold.', () => {
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('0000', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/0000 __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('01/01/2000 00:00:00');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('5', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/5___ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('01/01/2005 00:00:00');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('16', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/16__ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('01/01/2016 00:00:00');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('169', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/169_ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('01/01/0169 00:00:00');
            });
            it('should support different display and input formats.', () => {
                fixture.componentInstance.displayFormat = 'longDate';
                fixture.detectChanges();
                UIInteractions.simulateTyping('9', inputElement);
                expect(inputElement.nativeElement.value).toEqual('9_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('January 9, 2000');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'dd/MM/yyy';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('169', inputElement, 6, 6);
                expect(inputElement.nativeElement.value).toEqual('__/__/169_ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('01/01/169');
            });
            it('should support long and short date formats', () => {
                fixture.componentInstance.displayFormat = 'longDate';
                fixture.detectChanges();
                UIInteractions.simulateTyping('9', inputElement);
                expect(inputElement.nativeElement.value).toEqual('9_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('January 9, 2000');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'shortDate';
                fixture.detectChanges();
                UIInteractions.simulateTyping('9', inputElement);
                expect(inputElement.nativeElement.value).toEqual('9_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('1/9/00');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'fullDate';
                fixture.detectChanges();
                UIInteractions.simulateTyping('9', inputElement);
                expect(inputElement.nativeElement.value).toEqual('9_/__/____ __:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('Sunday, January 9, 2000');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'shortTime';
                fixture.detectChanges();
                UIInteractions.simulateTyping('1', inputElement, 11, 11);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ 1_:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('1:00 AM');

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                fixture.componentInstance.displayFormat = 'longTime';
                fixture.detectChanges();
                UIInteractions.simulateTyping('2', inputElement, 11, 11);
                expect(inputElement.nativeElement.value).toEqual('__/__/____ 2_:__:__');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                const date = new Date(0, 0, 0, 2, 0, 0);
                const result = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
                const offset = date.getTimezoneOffset();
                const tz = (offset < 0 ? '+' : '-') + (Math.abs(offset) / 60);
                expect(inputElement.nativeElement.value).toEqual(`${result} GMT${tz}`);
            });
            it('should be able to apply custom display format.', fakeAsync(() => {
                // default format
                const date = new Date(2003, 3, 5);
                fixture.componentInstance.date = date;
                fixture.detectChanges();
                tick();
                expect(inputElement.nativeElement.value).toEqual('05/04/2003 00:00:00');

                // custom format
                fixture.componentInstance.displayFormat = 'EEEE d MMMM y h:mm a';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('1', inputElement);
                expect(inputElement.nativeElement.value).toEqual('15/04/2003 00:00:00');
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('Tuesday 15 April 2003 12:00 AM');
            }));
            it('should convert dates correctly on paste when different display and input formats are set.', () => {
                // display format = input format
                let inputDate = '10/10/2020 10:10:10';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);

                // display format != input format
                fixture.componentInstance.displayFormat = 'd/M/yy';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('10/10/20');

                inputDate = '6/7/28';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:__:__');

                fixture.componentInstance.dateTimeFormat = 'd/M/yy';
                fixture.detectChanges();
                fixture.componentInstance.displayFormat = 'dd/MM/yyyy';
                fixture.detectChanges();

                // inputElement.triggerEventHandler('focus', {});
                // fixture.detectChanges();
                // UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                // fixture.detectChanges();
                // inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                // fixture.detectChanges();
                // expect(inputElement.nativeElement.value).toEqual('__/__/__');

                inputDate = '16/07/28';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('16/07/2028');
            });
            it('should revert to empty mask on clear()', fakeAsync(() => {
                fixture.componentInstance.date = new Date(2003, 3, 5);
                fixture.detectChanges();
                tick();
                expect(inputElement.nativeElement.value).toEqual('05/04/2003 00:00:00');

                dateTimeEditorDirective.clear();
                expect(inputElement.nativeElement.value).toEqual('__/__/____ __:__:__');
            }));
            it('should move the caret to the start/end of the portion with CTRL + arrow left/right keys.', fakeAsync(() => {
                fixture.componentInstance.date = new Date(2003, 10, 15);
                fixture.detectChanges();
                tick();
                expect(inputElement.nativeElement.value).toEqual('15/11/2003 00:00:00');

                const inputHTMLElement = inputElement.nativeElement as HTMLInputElement;
                inputHTMLElement.setSelectionRange(0, 0);
                fixture.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(2);
                expect(inputHTMLElement.selectionEnd).toEqual(2);

                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(0);
                expect(inputHTMLElement.selectionEnd).toEqual(0);

                inputHTMLElement.setSelectionRange(8, 8);
                fixture.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(6);
                expect(inputHTMLElement.selectionEnd).toEqual(6);

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(10);
                expect(inputHTMLElement.selectionEnd).toEqual(10);

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(13);
                expect(inputHTMLElement.selectionEnd).toEqual(13);

                inputHTMLElement.setSelectionRange(15, 15);
                fixture.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(16);
                expect(inputHTMLElement.selectionEnd).toEqual(16);

                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(14);
                expect(inputHTMLElement.selectionEnd).toEqual(14);

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(16);
                expect(inputHTMLElement.selectionEnd).toEqual(16);

                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(19);
                expect(inputHTMLElement.selectionEnd).toEqual(19);

                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', inputElement, false, false, true);
                fixture.detectChanges();
                expect(inputHTMLElement.selectionStart).toEqual(17);
                expect(inputHTMLElement.selectionEnd).toEqual(17);
            }));
            it('should not block the user from typing/pasting dates outside of min/max range', () => {
                fixture.componentInstance.minValue = '01/01/2000';
                fixture.componentInstance.maxValue = '31/12/2000';
                fixture.detectChanges();

                const inputDate = '10/10/2009 10:10:10';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);

                dateTimeEditorDirective.clear();
                fixture.detectChanges();

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('27', inputElement, 8, 8);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('01/01/2027 00:00:00');
            });
            it('should be able to customize prompt char.', () => {
                fixture.componentInstance.promptChar = '.';
                fixture.detectChanges();
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('../../.... ..:..:..');
            });
            it('should be en/disabled when the input is en/disabled.', fakeAsync(() => {
                spyOn(dateTimeEditorDirective, 'setDisabledState');
                fixture.componentInstance.disabled = true;
                fixture.detectChanges();
                tick();
                expect(dateTimeEditorDirective.setDisabledState).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.setDisabledState).toHaveBeenCalledWith(true);

                fixture.componentInstance.disabled = false;
                fixture.detectChanges();
                tick();
                expect(dateTimeEditorDirective.setDisabledState).toHaveBeenCalledTimes(2);
                expect(dateTimeEditorDirective.setDisabledState).toHaveBeenCalledWith(false);
            }));
            it('should emit valueChange event on blur', () => {
                const newDate = new Date(2004, 11, 18);
                fixture.componentInstance.dateTimeFormat = 'dd/MM/yy';
                fixture.detectChanges();
                spyOn(dateTimeEditorDirective.valueChange, 'emit');
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulateTyping('18124', inputElement);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('18/12/04');
                expect(dateTimeEditorDirective.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.valueChange.emit).toHaveBeenCalledWith({ oldValue: undefined, newValue: newDate });
            });
            it('should fire validationFailed when input date is outside date range.', () => {
                fixture.componentInstance.dateTimeFormat = 'dd-MM-yyyy';
                fixture.componentInstance.minDate = new Date(2020, 1, 20);
                fixture.componentInstance.maxDate = new Date(2020, 1, 25);
                fixture.detectChanges();
                spyOn(dateTimeEditorDirective.validationFailed, 'emit');

                // date within the range
                let inputDate = '22-02-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(dateTimeEditorDirective.validationFailed.emit).not.toHaveBeenCalled();

                // date > maxValue
                let oldDate = new Date(2020, 1, 22);
                let newDate = new Date(2020, 1, 26);
                let args = { oldValue: oldDate, newValue: newDate };
                inputDate = '26-02-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);

                // date < minValue
                oldDate = newDate;
                newDate = new Date(2020, 1, 12);
                args = { oldValue: oldDate, newValue: newDate };
                inputDate = '12-02-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 19);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(2);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);
            });
            it('should fire validationFailed when input date is invalid.', () => {
                fixture.componentInstance.dateTimeFormat = 'dd-MM-yyyy';
                fixture.detectChanges();
                spyOn(dateTimeEditorDirective.validationFailed, 'emit').and.callThrough();

                // valid date
                let inputDate = '22-02-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(dateTimeEditorDirective.validationFailed.emit).not.toHaveBeenCalled();

                // invalid date
                const oldDate = new Date(2020, 1, 22);
                const newDate = (dateTimeEditorDirective as any).parseDate('99-99-2020').value;
                const args = { oldValue: oldDate, newValue: newDate };
                inputDate = '99-99-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual('__-__-____');
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(1);
                // expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);
            });
        });

        describe('Form control tests: ', () => {
            let form: FormGroup;
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDateTimeEditorFormComponent
                    ],
                    imports: [
                        IgxInputGroupModule,
                        IgxDateTimeEditorModule,
                        NoopAnimationsModule,
                        ReactiveFormsModule,
                        FormsModule
                    ]
                }).compileComponents();
            }));
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxDateTimeEditorFormComponent);
                fixture.detectChanges();
                form = fixture.componentInstance.reactiveForm;
                inputElement = fixture.debugElement.query(By.css('input'));
                dateTimeEditorDirective = inputElement.injector.get(IgxDateTimeEditorDirective);
            });
            it('should validate properly when used as form control.', () => {
                spyOn(dateTimeEditorDirective.validationFailed, 'emit').and.callThrough();
                const dateEditor = form.controls['dateEditor'];
                const newDate = (dateTimeEditorDirective as any).parseDate('99-99-9999').value;
                const args = { oldValue: '', newValue: newDate };
                const inputDate = '99-99-9999';

                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                fixture.detectChanges();
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();

                expect(inputElement.nativeElement.value).toEqual('__-__-____');
                expect(form.valid).toBeFalsy();
                expect(dateEditor.valid).toBeFalsy();
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(1);
                // expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);
            });
            it('should validate properly min/max value when used as form control.', () => {
                fixture.componentInstance.minDate = new Date(2020, 2, 20);
                fixture.componentInstance.maxDate = new Date(2020, 2, 25);
                spyOn(dateTimeEditorDirective.validationFailed, 'emit');
                const dateEditor = form.controls['dateEditor'];

                let inputDate = '21-03-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                fixture.detectChanges();
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(form.valid).toBeTruthy();
                expect(dateEditor.valid).toBeTruthy();
                expect(dateTimeEditorDirective.validationFailed.emit).not.toHaveBeenCalled();

                const args = { oldValue: new Date(2020, 2, 21), newValue: new Date(2020, 1, 21) };
                inputDate = '21-02-2020';
                inputElement.triggerEventHandler('focus', {});
                fixture.detectChanges();
                UIInteractions.simulatePaste(inputDate, inputElement, 0, 10);
                fixture.detectChanges();
                inputElement.triggerEventHandler('blur', { target: inputElement.nativeElement });
                fixture.detectChanges();
                expect(inputElement.nativeElement.value).toEqual(inputDate);
                expect(form.valid).toBeFalsy();
                expect(dateEditor.valid).toBeFalsy();
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledTimes(1);
                expect(dateTimeEditorDirective.validationFailed.emit).toHaveBeenCalledWith(args);
            });
            it('should properly submit values when used as a form control', () => {
                const inputDate = '09-04-2020';
                expect(form.valid).toBeFalsy();
                form.controls['dateEditor'].setValue(inputDate);
                expect(form.valid).toBeTruthy();

                let result: string;
                fixture.componentInstance.submitted.subscribe((value) => result = value);
                fixture.componentInstance.submit();
                expect(result).toBe(inputDate);
            });
        });
    });
});


@Component({
    template: `
<igx-input-group #igxInputGroup>
        <input type="text" igxInput [disabled]="disabled" [readonly]="readonly"
            [igxDateTimeEditor]="dateTimeFormat" [displayFormat]="displayFormat"
            [(ngModel)]="date" [minValue]="minDate" [maxValue]="maxDate" [promptChar]="promptChar"/>
    </igx-input-group>
`
})
export class IgxDateTimeEditorSampleComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    public date: Date;
    public dateTimeFormat = 'dd/MM/yyyy HH:mm:ss';
    public displayFormat: string;
    public minDate: string;
    public maxDate: string;
    public promptChar = '_';
    public disabled = false;
    public readonly = false;
}

@Component({
    template: `
    <form (ngSubmit)="submit()" [formGroup]="reactiveForm">
    <igx-input-group>
        <input formControlName="dateEditor" type="text"
        igxInput [igxDateTimeEditor]="dateTimeFormat" [minValue]="minDate" [maxValue]="maxDate"/>
    </igx-input-group>
</form>
`
})

class IgxDateTimeEditorFormComponent {
    @ViewChild('dateEditor', { read: IgxInputDirective, static: true }) formInput: IgxInputDirective;
    @Output() submitted = new EventEmitter<any>();
    reactiveForm: FormGroup;
    public dateTimeFormat = 'dd-MM-yyyy';
    public minDate: Date;
    public maxDate: Date;

    constructor(fb: FormBuilder) {
        this.reactiveForm = fb.group({
            'dateEditor': ['', Validators.required]
        });
    }

    submit() {
        if (this.reactiveForm.valid) {
            this.submitted.emit(this.reactiveForm.value.dateEditor);
        }
    }
}
