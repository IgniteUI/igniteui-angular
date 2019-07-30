import { Component, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick, flush, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxDatePickerComponent, IgxDatePickerModule, IDatePickerValueChangedEventArgs } from './date-picker.component';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxInputDirective } from '../directives/input/input.directive';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxInputGroupModule } from '../input-group';

import { configureTestSuite } from '../test-utils/configure-suite';
import { DateRangeType } from 'igniteui-angular';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxCalendarModule } from '../calendar';
import { InteractionMode } from '../core/enums';

describe('IgxDatePicker', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDatePickerTestComponent,
                IgxDatePickerWithWeekStartComponent,
                IgxDatePickerWithCustomFormatterComponent,
                IgxDatePickerWithPassedDateComponent,
                IgxDatePickerWIthLocaleComponent,
                IgxDatePickerNgModelComponent,
                IgxDatePickerRetemplatedComponent,
                IgxDatePickerEditableComponent,
                IgxDatePickerCustomizedComponent,
                IgxDropDownDatePickerRetemplatedComponent,
                IgxDatePickerOpeningComponent
            ],
            imports: [IgxDatePickerModule, FormsModule, NoopAnimationsModule, IgxInputGroupModule, IgxCalendarModule, IgxButtonModule]
        })
            .compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe('Base Tests', () => {
        // configureTestSuite();
        let fixture: ComponentFixture<IgxDatePickerTestComponent>;
        let datePicker: IgxDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerTestComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
        });

        it('Initialize a datepicker component', () => {
            expect(fixture.componentInstance).toBeDefined();
            expect(datePicker.displayData).toBe('');
        });

        it('Initialize a datepicker component with id', () => {
            const domDatePicker = fixture.debugElement.query(By.css('igx-date-picker')).nativeElement;

            expect(datePicker.id).toContain('igx-date-picker-');
            expect(domDatePicker.id).toContain('igx-date-picker-');

            datePicker.id = 'customDatePicker';
            fixture.detectChanges();

            expect(datePicker.id).toBe('customDatePicker');
            expect(domDatePicker.id).toBe('customDatePicker');
        });

        it('Datepicker open/close event', async () => {
            const dom = fixture.debugElement;
            const target = dom.query(By.css('.igx-date-picker__input-date'));

            spyOn(datePicker.onOpened, 'emit');
            spyOn(datePicker.onClosed, 'emit');

            UIInteractions.clickElement(target);
            fixture.detectChanges();
            await wait();

            expect(datePicker.onOpened.emit).toHaveBeenCalled();
            expect(datePicker.onOpened.emit).toHaveBeenCalledWith(datePicker);

            const overlayDiv = document.getElementsByClassName('igx-overlay__wrapper--modal')[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.classList.contains('igx-overlay__wrapper--modal')).toBeTruthy();
            overlayDiv.dispatchEvent(new Event('click'));

            fixture.detectChanges();
            await wait();

            expect(datePicker.onClosed.emit).toHaveBeenCalled();
            expect(datePicker.onClosed.emit).toHaveBeenCalledWith(datePicker);
        });

        it('Datepicker onSelection and valueChange events and selectDate method propagation', () => {
            spyOn(datePicker.onSelection, 'emit');
            spyOn(datePicker.valueChange, 'emit');
            const newDate: Date = new Date(2016, 4, 6);
            const valueChangedArgs: IDatePickerValueChangedEventArgs = {
                oldValue: datePicker.value,
                newValue: newDate
            };
            datePicker.selectDate(newDate);
            fixture.detectChanges();

            expect(datePicker.onSelection.emit).toHaveBeenCalled();
            expect(datePicker.valueChange.emit).toHaveBeenCalled();
            expect(datePicker.valueChange.emit).toHaveBeenCalledWith(valueChangedArgs);
            expect(datePicker.value).toBe(newDate);
        });

        it('check disabled state', () => {
            const dom = fixture.debugElement;
            const inputGroup = dom.query(By.css('.igx-input-group'));
            const disabled = dom.query(By.css('.igx-input-group--disabled'));
            expect(disabled).toBeNull();
            expect(inputGroup.nativeElement.classList.contains('igx-input-group--disabled')).toBeFalsy();

            datePicker.disabled = true;
            fixture.detectChanges();

            const disabledGroup = dom.query(By.css('.igx-input-group--disabled'));
            expect(disabledGroup).toBeDefined();
            expect(inputGroup.nativeElement.classList.contains('igx-input-group--disabled')).toBeTruthy();
        });

        it('When labelVisability is set to false the label should not be visible', () => {
            let label = fixture.debugElement.query(By.directive(IgxLabelDirective));

            expect(label.nativeElement.innerText).toBe(datePicker.label);

            fixture.componentInstance.labelVisibility = false;
            fixture.detectChanges();

            label = fixture.debugElement.query(By.directive(IgxLabelDirective));
            expect(label).toBeNull();
        });

        it('When update label property it should reflect on the label text of the datepicker', () => {
            let label = fixture.debugElement.query(By.directive(IgxLabelDirective));
            expect(label.nativeElement.innerText).toEqual(datePicker.label);

            const expectedResult = 'new label';
            datePicker.label = expectedResult;
            fixture.detectChanges();

            label = fixture.debugElement.query(By.directive(IgxLabelDirective));
            expect(label.nativeElement.innerText).toEqual(expectedResult);
        });

        it('Visualize the label of the datepicker when initially is hidden', () => {
            fixture.componentInstance.labelVisibility = false;
            fixture.detectChanges();

            let label = fixture.debugElement.query(By.directive(IgxLabelDirective));
            expect(label).toBeNull();

            fixture.componentInstance.labelVisibility = true;
            fixture.detectChanges();

            label = fixture.debugElement.query(By.directive(IgxLabelDirective));
            expect(label).not.toBeNull();
        });

        it('Handling keyboard navigation with `space`(open) and `esc`(close) buttons', fakeAsync(() => {
            const datePickerDom = fixture.debugElement.query(By.css('igx-date-picker'));
            UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
            fixture.detectChanges();

            const overlayDiv = document.getElementsByClassName('igx-overlay__wrapper--modal')[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.classList.contains('igx-overlay__wrapper--modal')).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('Escape', overlayDiv, true);
            flush();
            fixture.detectChanges();

            const overlays = document.getElementsByClassName('igx-overlay__wrapper--modal');
            expect(overlays.length).toEqual(0);
        }));

        it('When datepicker is closed and the dialog disappear, the focus should remain on the input',
            fakeAsync(() => {
                const datePickerDom = fixture.debugElement.query(By.css('igx-date-picker'));
                let overlayToggle = document.getElementsByClassName('igx-overlay__wrapper--modal');
                expect(overlayToggle.length).toEqual(0);

                UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
                flush();
                fixture.detectChanges();

                overlayToggle = document.getElementsByClassName('igx-overlay__wrapper--modal');
                expect(overlayToggle[0]).not.toBeNull();
                expect(overlayToggle[0]).not.toBeUndefined();

                UIInteractions.triggerKeyDownEvtUponElem('Escape', overlayToggle[0], true);
                flush();
                fixture.detectChanges();

                const input = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
                overlayToggle = document.getElementsByClassName('igx-overlay__wrapper--modal');
                expect(overlayToggle[0]).toEqual(undefined);
                expect(input).toEqual(document.activeElement);
            }));

    });

    describe('DatePicker with passed date', () => {
        // configureTestSuite();
        let fixture: ComponentFixture<IgxDatePickerWithPassedDateComponent>;
        let datePicker: IgxDatePickerComponent;
        let inputTarget;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerWithPassedDateComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
            inputTarget = fixture.debugElement.query(By.css('.igx-date-picker__input-date')).nativeElement;

        });

        it('@Input properties', () => {
            expect(datePicker.value).toEqual(new Date(2017, 7, 7));
        });

        it('Datepicker DOM input value', () => {
            const today = new Date(2017, 7, 7);
            const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

            expect(inputTarget.value).toEqual(formattedDate);
        });

        it('Datepicker custom locale(EN) date format', () => {
            const todayToEnLocale = new Date(2017, 7, 7).toLocaleDateString('en');
            expect(inputTarget.value).toEqual(todayToEnLocale);
        });

        it('Set formatOptions for month to be numeric', () => {
            const getMonthFromPickerDate = fixture.componentInstance.date.getMonth() + 1;
            inputTarget.dispatchEvent(new Event('click', { bubbles: true }));
            fixture.detectChanges();

            const headerDate = document.getElementsByClassName('igx-calendar__header-date')[0];
            const getMonthFromCalendarHeader = (headerDate.children[1] as HTMLElement).innerText.substring(0, 1);

            expect(parseInt(getMonthFromCalendarHeader, 10)).toBe(getMonthFromPickerDate);
        });
    });

    it('Datepicker week start day (Monday)', () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithWeekStartComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const datePickerTarget = dom.query(By.css('.igx-date-picker__input-date'));

        UIInteractions.clickElement(datePickerTarget);
        fixture.detectChanges();

        const firstDayValue = (document.getElementsByClassName('igx-calendar__label')[0] as HTMLElement).innerText.trim();
        const expectedResult = 'Mon';

        expect(firstDayValue).toBe(expectedResult);
    });

    it('Retemplated calendar in date picker', () => {
        const fixture = TestBed.createComponent(IgxDatePickerCustomizedComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const datePickerTarget = dom.query(By.css('.igx-date-picker__input-date'));

        UIInteractions.clickElement(datePickerTarget);
        fixture.detectChanges();

        const formattedHeaderDate = document.getElementsByClassName('igx-calendar__header-date')[0];
        const formattedHeaderText = (formattedHeaderDate as HTMLElement).innerText;
        expect(formattedHeaderText).toBe('10/20/19');

        const picker = document.getElementsByClassName('igx-calendar-picker');
        const formattedSubHeaderText = (picker[0].children[1] as HTMLElement).innerText;
        expect(formattedSubHeaderText).toBe('2019/Oct');

        const buttons = document.getElementsByClassName('igx-button--flat');
        expect(buttons.length).toEqual(1);
        expect((buttons[0] as HTMLElement).innerText).toBe('TEST');
    });

    it('Retemplated calendar in date picker - dropdown mode', () => {
        const fixture = TestBed.createComponent(IgxDatePickerCustomizedComponent);
        const datePicker = fixture.componentInstance.customizedDatePicker;
        datePicker.mode = InteractionMode.DropDown;
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const iconDate = dom.query(By.css('.igx-icon'));
        expect(iconDate).toBeDefined();

        UIInteractions.clickElement(iconDate);
        fixture.detectChanges();

        const picker = document.getElementsByClassName('igx-calendar-picker');
        const formattedSubHeaderText = (picker[0].children[1] as HTMLElement).innerText;
        expect(formattedSubHeaderText).toBe('2019/Oct');

        const buttons = document.getElementsByClassName('igx-button--flat');
        expect(buttons.length).toEqual(1);
        expect((buttons[0] as HTMLElement).innerText).toBe('TEST');
    });

    it('locale propagate calendar value (de-DE)', () => {
        const fixture = TestBed.createComponent(IgxDatePickerWIthLocaleComponent);
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;
        const dateConvertedToDeLocale = fixture.componentInstance.date.toLocaleDateString('de-DE');

        expect(datePicker.displayData).toBe(dateConvertedToDeLocale);
    });

    it('Datepicker custom formatter', () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithCustomFormatterComponent);
        fixture.detectChanges();

        const compInstance = fixture.componentInstance;
        const datePicker = compInstance.datePicker;
        const dom = fixture.debugElement;
        const inputTarget = dom.query(By.css('.igx-date-picker__input-date')).nativeElement;
        const date = new Date(2017, 7, 7);
        const formattedDate = compInstance.customFormatter(date);

        expect(inputTarget.value).toEqual(formattedDate);
    });

    it('Value should respond when is bound through ngModel and selection through selectDate method is made.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxDatePickerNgModelComponent);
        const datePicker = fix.componentInstance.datePicker;
        let expectedRes = new Date(2011, 11, 11);
        fix.detectChanges();
        flush();

        expect(datePicker.value).toEqual(expectedRes);
        expectedRes = new Date(Date.now());
        datePicker.selectDate(expectedRes);

        tick();
        expect(datePicker.value).toEqual(expectedRes);

        const boundValue = fix.componentInstance.val;
        expect(boundValue).toEqual(expectedRes);
    }));

    it('Retemplate a DatePicker input group', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxDatePickerRetemplatedComponent);
        tick();
        fix.detectChanges();

        const dom = fix.debugElement;
        const inputGroup = dom.query(By.css('.igx-input-group'));
        expect(inputGroup).not.toBeNull();
        expect(dom.query(By.css('.igx-icon'))).toBeNull();
        expect(inputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);
    }));

    it('Should be able to deselect using the API.', () => {
        const fix = TestBed.createComponent(IgxDatePickerTestComponent);
        const datePicker = fix.componentInstance.datePicker;
        fix.detectChanges();

        const date = new Date(Date.now());
        datePicker.selectDate(date);
        fix.detectChanges();

        expect(datePicker.value).toBe(date);

        datePicker.deselectDate();
        fix.detectChanges();

        expect(datePicker.value).toBe(null);
    });

    it('Should not alter hours, minutes, seconds and milliseconds when changing date.', () => {
        const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        const debugElement = fixture.debugElement;
        const datePicker = fixture.componentInstance.datePicker;
        const date = new Date(2030, 1, 1, 15, 16, 17, 18);
        datePicker.value = date;
        fixture.detectChanges();

        const datePickerTarget = debugElement.query(By.css('.igx-date-picker__input-date'));
        datePickerTarget.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        fixture.detectChanges();

        const targetDate = 15;
        const fromDate = datePicker.calendar.daysView.dates.filter(
            d => d.date.date.getDate() === targetDate)[0];
        fromDate.nativeElement.click();
        fixture.detectChanges();

        expect(datePicker.value.getFullYear()).toBe(date.getFullYear());
        expect(datePicker.value.getMonth()).toBe(date.getMonth());
        expect(datePicker.value.getDate()).toBe(targetDate);
        expect(datePicker.value.getHours()).toBe(date.getHours());
        expect(datePicker.value.getMinutes()).toBe(date.getMinutes());
        expect(datePicker.value.getSeconds()).toBe(date.getSeconds());
        expect(datePicker.value.getMilliseconds()).toBe(date.getMilliseconds());
    });

    it('Should focus the today date', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        const datePicker = fixture.componentInstance.datePicker;
        fixture.detectChanges();
        const dom = fixture.debugElement;

        const target = dom.query(By.css('.igx-date-picker__input-date'));
        UIInteractions.clickElement(target);
        fixture.detectChanges();
        tick(200);

        const todayDate = datePicker.calendar.daysView.dates.find(d => d.isToday);

        expect(document.activeElement).toEqual(todayDate.nativeElement);
    }));

    it('#3595 - Should be able to change year', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const target = dom.query(By.css('.igx-date-picker__input-date'));

        UIInteractions.clickElement(target);
        fixture.detectChanges();

        let year = document.getElementsByClassName('igx-calendar-picker__date')[1];
        year.dispatchEvent(new Event('click'));
        tick();
        fixture.detectChanges();

        const firstYear = document.getElementsByClassName('igx-calendar__year')[1];
        const expectedResult = (firstYear as HTMLElement).innerText.trim();
        firstYear.dispatchEvent(new Event('click'));
        tick();
        fixture.detectChanges();

        year = document.getElementsByClassName('igx-calendar-picker__date')[1];
        expect((year as HTMLElement).innerText).toBe(expectedResult);
    }));

    it('#3595 - Should be able to change month', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        fixture.componentInstance.datePicker.value = new Date(2019, 2, 10);
        tick(300);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const target = dom.query(By.css('.igx-date-picker__input-date'));
        UIInteractions.clickElement(target);
        tick(200);
        fixture.detectChanges();

        let month = document.getElementsByClassName('igx-calendar-picker__date')[0];
        month.dispatchEvent(new Event('click'));
        tick(200);
        fixture.detectChanges();

        const firstMonth = document.getElementsByClassName('igx-calendar__month')[0];
        const expectedResult = (firstMonth as HTMLElement).innerText;

        firstMonth.dispatchEvent(new Event('click'));
        tick(200);
        fixture.detectChanges();

        month = document.getElementsByClassName('igx-calendar-picker__date')[0];
        expect((month as HTMLElement).innerText.trim()).toBe(expectedResult.trim());
    }));

    describe('Drop-down opening', () => {
        // configureTestSuite();
        let fixture: ComponentFixture<IgxDatePickerOpeningComponent>;
        let datePicker: IgxDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerOpeningComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
        });

        it('Drop-down should open below the input by default if there is enough space - dropdown mode', fakeAsync(() => {
            const dom = fixture.debugElement;

            const inputGroup = document.getElementsByTagName('igx-input-group');
            const inputGroupRect = inputGroup[0].getBoundingClientRect() as DOMRect;
            const inputGroupTop = inputGroupRect.top;

            const iconDate = dom.query(By.css('.igx-icon'));
            UIInteractions.clickElement(iconDate);
            fixture.detectChanges();
            tick();

            const calendar = document.getElementsByTagName('igx-calendar-container');
            const calendarRect = calendar[0].getBoundingClientRect() as DOMRect;
            const calendarTop = calendarRect.top;

            expect(inputGroupTop).toBeLessThan(calendarTop);
        }));

        it('Drop-down should open above the input when there is no enough space below - dropdown mode', fakeAsync(() => {
            const dom = fixture.debugElement;

            // check if drop down is opened above the input if there is no space below
            datePicker.element.nativeElement.style = 'position: fixed; bottom: 150px';
            fixture.detectChanges();
            tick();

            const inputGroup = document.getElementsByTagName('igx-input-group');
            const inputGroupRect = inputGroup[0].getBoundingClientRect() as DOMRect;
            const inputGroupTop = inputGroupRect.top;

            const iconDate = dom.query(By.css('.igx-icon'));
            UIInteractions.clickElement(iconDate);
            fixture.detectChanges();
            tick();

            const calendar = document.getElementsByTagName('igx-calendar-container');
            const calendarRect = calendar[0].getBoundingClientRect() as DOMRect;
            const calendarTop = calendarRect.top;

            expect(inputGroupTop).toBeGreaterThan(calendarTop);
        }));
    });

    describe('Drop-down Retemplated Date Picker', () => {
        // configureTestSuite();
        let fixture: ComponentFixture<IgxDropDownDatePickerRetemplatedComponent>;
        let datePicker: IgxDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDropDownDatePickerRetemplatedComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
        });

        it('Retemplate dropdown date picker - dropdown mode', () => {
            const dom = fixture.debugElement;

            const input = dom.query(By.css('.igx-input-group__input'));
            expect(input).not.toBeNull();
            expect(input.nativeElement.value).toBe('10/20/2020');

            const button = dom.query(By.css('.igx-button--flat'));
            UIInteractions.clickElement(button);
            fixture.detectChanges();

            const dropdown = document.getElementsByClassName('igx-date-picker--dropdown');
            expect(dropdown.length).toBe(1);
            expect(dropdown[0]).not.toBeNull();
        });

        it('Drop-down should open below the input by default if there is enough space - retemplated dropdown mode', () => {
            const dom = fixture.debugElement;

            const input = dom.query(By.css('.igx-input-group__input'));
            const inputRect = input.nativeElement.getBoundingClientRect() as DOMRect;
            const inputTop = inputRect.top;

            const button = dom.query(By.css('.igx-button--flat'));
            UIInteractions.clickElement(button);
            fixture.detectChanges();

            const calendar = document.getElementsByTagName('igx-calendar-container');
            const calendarRect = calendar[0].getBoundingClientRect() as DOMRect;
            const calendarTop = calendarRect.top;

            expect(inputTop).toBeLessThan(calendarTop);
        });

        it('Drop-down should open above the input when there is no enough space below - retemplated dropdown mode', () => {
            const dom = fixture.debugElement;

            // check if drop down is opened above the input if there is no space below
            datePicker.element.nativeElement.style = 'position: fixed; bottom: 150px';
            fixture.detectChanges();

            const input = dom.query(By.css('.igx-input-group__input'));
            const inputRect = input.nativeElement.getBoundingClientRect() as DOMRect;
            const inputTop = inputRect.top;

            const button = dom.query(By.css('.igx-button--flat'));
            UIInteractions.clickElement(button);
            fixture.detectChanges();

            const calendar = document.getElementsByTagName('igx-calendar-container');
            const calendarRect = calendar[0].getBoundingClientRect() as DOMRect;
            const calendarTop = calendarRect.top;

            expect(inputTop).toBeGreaterThan(calendarTop);
        });
    });

    describe('Drop-down mode', () => {
        // configureTestSuite();
        let fixture: ComponentFixture<IgxDatePickerEditableComponent>;
        let datePicker: IgxDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerEditableComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
        });

        it('Editable Datepicker open/close event - dropdown mode', async () => {
            const dom = fixture.debugElement;
            const iconDate = dom.query(By.css('.igx-icon'));
            expect(iconDate).not.toBeNull();

            spyOn(datePicker.onOpened, 'emit');
            spyOn(datePicker.onClosed, 'emit');

            UIInteractions.clickElement(iconDate);
            fixture.detectChanges();
            await wait();

            expect(datePicker.onOpened.emit).toHaveBeenCalled();
            expect(datePicker.onOpened.emit).toHaveBeenCalledWith(datePicker);

            const dropDown = document.getElementsByClassName('igx-date-picker--dropdown');
            expect(dropDown.length).toBe(1);
            expect(dropDown[0]).not.toBeNull();

            dom.nativeElement.dispatchEvent(new Event('click'));

            fixture.detectChanges();
            await wait();

            expect(datePicker.onClosed.emit).toHaveBeenCalled();
            expect(datePicker.onClosed.emit).toHaveBeenCalledWith(datePicker);
        });

        it('Handling keyboard navigation with `space`(open) and `esc`(close) buttons - dropdown mode', fakeAsync(() => {
            const datePickerDom = fixture.debugElement.query(By.css('igx-date-picker'));
            UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
            fixture.detectChanges();

            const overlayDiv = document.getElementsByClassName('igx-overlay__content')[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.classList.contains('igx-overlay__content')).toBeTruthy();

            const dropDown = document.getElementsByClassName('igx-date-picker--dropdown');
            expect(dropDown.length).toBe(1);
            expect(dropDown[0]).not.toBeNull();

            UIInteractions.triggerKeyDownEvtUponElem('Escape', dropDown[0], false);
            flush();
            fixture.detectChanges();

            const overlays = document.getElementsByClassName('igx-overlay__content');
            expect(overlays.length).toEqual(0);
        }));

        it('Open/close drop-down with `alt + down`(open) and `alt + up`(close) - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            input.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true }));
            tick();
            fixture.detectChanges();

            const overlayDiv = document.getElementsByClassName('igx-overlay__content')[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.classList.contains('igx-overlay__content')).toBeTruthy();

            const dropDown = document.getElementsByClassName('igx-date-picker--dropdown');
            expect(dropDown.length).toBe(1);
            expect(dropDown[0]).not.toBeNull();

            dropDown[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true }));
            flush();
            fixture.detectChanges();

            const overlays = document.getElementsByClassName('igx-overlay__content');
            expect(overlays.length).toEqual(0);
        }));

        it('Datepicker onSelection  and valueChange events and selectDate method propagation - dropdown mode', () => {
            spyOn(datePicker.onSelection, 'emit');
            spyOn(datePicker.valueChange, 'emit');
            const newDate: Date = new Date(2016, 4, 6);
            const valueChangedArgs: IDatePickerValueChangedEventArgs = {
                oldValue: datePicker.value,
                newValue: newDate
            };
            datePicker.selectDate(newDate);
            fixture.detectChanges();

            expect(datePicker.onSelection.emit).toHaveBeenCalled();
            expect(datePicker.valueChange.emit).toHaveBeenCalled();
            expect(datePicker.valueChange.emit).toHaveBeenCalledWith(valueChangedArgs);
            expect(datePicker.value).toBe(newDate);

            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();
            expect(input.nativeElement.value).toBe('06.05.2016');
        });

        it('should open the dropdown when click on the date icon - dropdown mode', (() => {
            const dom = fixture.debugElement;
            fixture.detectChanges();

            const iconDate = dom.query(By.css('.igx-icon'));
            expect(iconDate).toBeDefined();

            UIInteractions.clickElement(iconDate);
            fixture.detectChanges();

            const dropDown = dom.query(By.css('.igx-date-picker--dropdown'));
            expect(dropDown).toBeDefined();
        }));

        it('should have correctly selected date - dropdown mode', (() => {
            const dom = fixture.debugElement;
            fixture.detectChanges();

            const iconDate = dom.query(By.css('.igx-icon'));
            expect(iconDate).toBeDefined();

            UIInteractions.clickElement(iconDate);
            fixture.detectChanges();

            const dropDown = dom.query(By.css('.igx-date-picker--dropdown'));
            expect(dropDown).toBeDefined();

            const selectedSpans = document.getElementsByClassName('igx-calendar__date--selected');
            expect(selectedSpans.length).toBe(1);
            expect((selectedSpans[0] as HTMLElement).innerText.trim()).toBe('20');

            const dateHeader = document.getElementsByClassName('igx-calendar-picker__date');
            expect(dateHeader.length).toBe(2);
            const month = dateHeader[0].innerHTML.trim();
            const year = dateHeader[1].innerHTML.trim();
            expect(month).toBe('Oct');
            expect(year).toBe('2011');
        }));

        it('should be able to apply display format - dropdown mode', async () => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();

            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            await wait();

            expect(input.nativeElement.value).toBe('20.10.2011');
        });

        it('should be able to apply editor mask - dropdown mode', (() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('20-10-11');

            // Check for formatted empty value on blur - placeholder is displayed
            datePicker.deselectDate();
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(input.nativeNode.placeholder).toBe('dd-MM-yy');
        }));

        it('Should be able to deselect using the API - dropdown mode', () => {
            const date = new Date(Date.now());
            datePicker.selectDate(date);
            fixture.detectChanges();

            expect(datePicker.value).toBe(date);

            datePicker.deselectDate();
            fixture.detectChanges();

            expect(datePicker.value).toBe(null);
        });

        it('should increase date parts using arrows - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();
            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            // initial input value is 20-10-11 / dd-MM-yy
            // focus the day part, position the caret at the beginning
            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);

            // press arrow up
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-10-11', 'ArrowUp on day failed');

            // test month part
            // position caret at the month part
            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-11-11', 'ArrowUp on month failed');

            // test year part
            // position caret at the year part
            input.nativeElement.setSelectionRange(7, 7);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-11-12', 'ArrowUp on year failed');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            tick(100);

            // format dd.MM.y
            expect(input.nativeElement.value).toBe('21.11.2012');
        }));

        it('should decrease date parts using arrows - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();
            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            // initial input value is 20-10-11 / dd-MM-yy
            // focus the day part, position the caret at the beginning
            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);

            // press arrow down
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('19-10-11', 'ArrowDown on day failed');

            // press arrow down
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('18-10-11', 'ArrowDown on day failed on the second try');

            // test month part
            // position caret at the month part
            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('18-09-11', 'ArrowDown on month failed');

            // test year part
            // position caret at the year part
            input.nativeElement.setSelectionRange(7, 7);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('18-09-10', 'ArrowDown on year failed');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            tick(100);

            // format dd.MM.y
            expect(input.nativeElement.value).toBe('18.09.2010');
        }));

        it('should increase/decrease date parts using mouse wheel - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();
            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            // initial input value is 20-10-11 / dd-MM-yy
            // focus the day part, position the caret at the beginning
            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);

            // up
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-10-11', 'MouseWheel Up on day failed.');

            input.nativeElement.setSelectionRange(3, 3);
            // down
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, 100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-09-11', 'MouseWheel down on month part failed.');

            // test year part
            // position caret at the year part
            input.nativeElement.setSelectionRange(7, 7);
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-09-13', 'MouseWheel Up on year failed');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            tick(100);

            // format dd.MM.y
            expect(input.nativeElement.value).toBe('21.09.2013');
        }));

        it('should reset value on clear button click - dropdown mode', () => {
            spyOn(datePicker.valueChange, 'emit');
            const valueChangedArgs: IDatePickerValueChangedEventArgs = {
                oldValue: datePicker.value,
                newValue: null
            };
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            const dom = fixture.debugElement;
            const clear = dom.queryAll(By.css('.igx-icon'))[1];
            UIInteractions.clickElement(clear);
            fixture.detectChanges();

            expect(datePicker.valueChange.emit).toHaveBeenCalled();
            expect(datePicker.valueChange.emit).toHaveBeenCalledWith(valueChangedArgs);
            expect(datePicker.value).toEqual(null);
            expect(input.nativeElement.innerText).toEqual('');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(input.nativeElement.placeholder).toBe('dd-MM-yy');
        });

        it('should emit onValidationFailed event when entered invalid date - dropdown mode', () => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            spyOn(datePicker.onValidationFailed, 'emit');

            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            UIInteractions.sendInput(input, '28-02-19');
            fixture.detectChanges();

            UIInteractions.sendInput(input, '29-02-19');
            fixture.detectChanges();

            // invalid date
            expect(input.nativeElement.value).toBe('29-02-19');
            expect(datePicker.onValidationFailed.emit).toHaveBeenCalledTimes(1);
        });

        it('should emit onDisabledDate event when entered disabled date - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            spyOn(datePicker.onDisabledDate, 'emit');

            datePicker.disabledDates = [{
                type: DateRangeType.Between, dateRange: [
                    new Date(2018, 8, 2),
                    new Date(2018, 8, 8)
                ]
            }];

            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            UIInteractions.sendInput(input, '03-05-19');
            fixture.detectChanges();

            // disabled date
            UIInteractions.sendInput(input, '03-09-18');
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('03-09-18');

            UIInteractions.sendInput(input, '07-09-18');
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('07-09-18');

            expect(datePicker.onDisabledDate.emit).toHaveBeenCalledTimes(2);
        }));


        it('should stop spinning on max/min when isSpinLoop is set to false - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();
            datePicker.isSpinLoop = false;

            input.nativeElement.focus();
            UIInteractions.sendInput(input, '31-03-19');
            expect(input.nativeElement.value).toBe('31-03-19');

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);

            // check max day
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('31-03-19');

            input.nativeElement.focus();
            UIInteractions.sendInput(input, '01-03-19');
            expect(input.nativeElement.value).toBe('01-03-19');

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);

            // check min day
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, 100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('01-03-19');

            // check min month
            input.nativeElement.focus();
            UIInteractions.sendInput(input, '15-01-19');
            expect(input.nativeElement.value).toBe('15-01-19');

            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, 100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('15-01-19');

            // check max month
            input.nativeElement.focus();
            UIInteractions.sendInput(input, '31-12-19');
            expect(input.nativeElement.value).toBe('31-12-19');

            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('31-12-19');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            tick(100);

            // format dd.MM.y
            expect(input.nativeElement.value).toBe('31.12.2019');
        }));

        it('check disabled state - dropdown mode', () => {
            const dom = fixture.debugElement;
            const inputGroup = dom.query(By.css('.igx-input-group'));
            const disabled = dom.query(By.css('.igx-input-group--disabled'));
            expect(disabled).toBeNull();
            expect(inputGroup.nativeElement.classList.contains('igx-input-group--disabled')).toBeFalsy();

            datePicker.disabled = true;
            fixture.detectChanges();

            const disabledGroup = dom.query(By.css('.igx-input-group--disabled'));
            expect(disabledGroup).toBeDefined();
            expect(inputGroup.nativeElement.classList.contains('igx-input-group--disabled')).toBeTruthy();
        });
    });

    describe('EditorProvider', () => {
        it('Should return correct edit element', () => {
            const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
            fixture.detectChanges();

            const instance = fixture.componentInstance.datePicker;
            const editElement = fixture.debugElement.query(By.css('.igx-date-picker__input-date')).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });
    });
});

@Component({
    template: `
        <igx-date-picker [formatter]="customFormatter" [value]=date></igx-date-picker>
    `
})
export class IgxDatePickerWithCustomFormatterComponent {
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;

    public date = new Date(2017, 7, 7);
    public customFormatter = (_: Date) => (
        `${_.getFullYear()}/${_.getMonth()}/${_.getDate()}`
    )
}

@Component({
    template: `
        <igx-date-picker [value]="date" [weekStart]="1"></igx-date-picker>
    `
})
export class IgxDatePickerWithWeekStartComponent {
    public date: Date = new Date(2017, 6, 8);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-date-picker [labelVisibility]="labelVisibility"></igx-date-picker>
    `
})
export class IgxDatePickerTestComponent {
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;

    public labelVisibility = true;
}

@Component({
    template: `
        <igx-date-picker [value]="date" [formatOptions]="formatOptions"></igx-date-picker>
    `
})
export class IgxDatePickerWithPassedDateComponent {
    public date: Date = new Date(2017, 7, 7);
    public formatOptions = {
        day: 'numeric',
        month: 'numeric',
        weekday: 'short',
        year: 'numeric'
    };
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-date-picker [value]="date" [locale]="'de-DE'"></igx-date-picker>
    `
})
export class IgxDatePickerWIthLocaleComponent {
    public date: Date = new Date(2017, 7, 7);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-date-picker [(ngModel)]="val"></igx-date-picker>
    `
})
export class IgxDatePickerNgModelComponent {
    public val: Date = new Date(2011, 11, 11);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
<igx-date-picker>
    <ng-template igxDatePickerTemplate let-displayData="displayData">
        <igx-input-group>
            <label igxLabel>Date</label>
            <input igxInput [value]="displayData" required />
        </igx-input-group>
    </ng-template>
</igx-date-picker>
    `
})
export class IgxDatePickerRetemplatedComponent { }

@Component({
    template: `
    <igx-date-picker [value]="date" mode="dropdown">
        <ng-template igxDatePickerTemplate let-openDialog="openDialog" let-value="value"
            let-displayData="displayData">
            <igx-input-group>
            <input #dropDownTarget class="igx-date-picker__input-date" igxInput [value]="displayData"/>
            </igx-input-group>
            <button igxButton="flat" (click)="openDialog(dropDownTarget)">Select Date</button>
        </ng-template>
    </igx-date-picker>
    `
})
export class IgxDropDownDatePickerRetemplatedComponent {
    public date: Date = new Date(2020, 9, 20);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-date-picker [value]="date" mode="dropdown" format="dd.MM.y" mask="dd-MM-yy"></igx-date-picker>
    `
})
export class IgxDatePickerEditableComponent {
    public date: Date = new Date(2011, 9, 20);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
    <igx-date-picker [value]="date">
        <ng-template igxCalendarHeader let-format>
            {{ format.date | date:'shortDate'}}
        </ng-template>
        <ng-template igxCalendarSubheader let-format>
            <span class="date__el" (click)="format.yearView()">{{ format.year.combined }}/</span>
            <span class="date__el" (click)="format.monthView()">{{ format.month.combined | titlecase }}</span>
        </ng-template>
        <ng-template igxDatePickerActions>
            <button igxButton="flat">TEST</button>
        </ng-template>
    </igx-date-picker>
    `
})
export class IgxDatePickerCustomizedComponent {
    public date: Date = new Date(2019, 9, 20);
    @ViewChild(IgxDatePickerComponent, { static: true }) public customizedDatePicker: IgxDatePickerComponent;
}

@Component({
    template:
        `
        <igx-date-picker mode="dropdown"></igx-date-picker>
        `
})
export class IgxDatePickerOpeningComponent {
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}
