import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export class HelperTestFunctions {
    public static DAYS_VIEW = 'igx-days-view';
    public static CALENDAR = 'igx-calendar';
    public static SELECTED_DATE = 'igx-days-view__date--selected';
    public static ICON_CSSCLASS = '.igx-icon';
    public static OVERLAY_CSSCLASS = '.igx-overlay';
    public static MODAL_OVERLAY_CSSCLASS = 'igx-overlay__wrapper--modal';

    public static CALENDAR_CSSCLASS = '.igx-calendar';
    public static CALENDAR_WRAPPER_CLASS = '.igx-calendar__wrapper';
    public static CALENDAR_WEEK_NUMBER_CLASS = '.igx-days-view__date--week-number';
    public static CALENDAR_WEEK_NUMBER_ITEM_CLASS = '.igx-days-view__date-inner--week-number';
    public static CALENDAR_WEEK_NUMBER_LABEL_CLASS = '.igx-days-view__label--week-number';
    public static CALENDAR_HEADER_CSSCLASS = '.igx-calendar__header';
    public static CALENDAR_HEADER_YEAR_CSSCLASS = '.igx-calendar__header-year';
    public static CALENDAR_HEADER_DATE_CSSCLASS = '.igx-calendar__header-date';
    public static WEEKSTART_LABEL_CSSCLASS = '.igx-days-view__label';
    public static VERTICAL_CALENDAR_CSSCLASS = '.igx-calendar__wrapper--vertical';
    public static DAY_CSSCLASS = '.igx-days-view__date';
    public static CURRENT_MONTH_DATES = '.igx-days-view__date:not(.igx-days-view__date--inactive)';
    public static CURRENT_DATE_CSSCLASS = '.igx-days-view__date--current';
    public static INACTIVE_DAYS_CSSCLASS = '.igx-days-view__date--inactive';
    public static HIDDEN_DAYS_CSSCLASS = '.igx-days-view__date--hidden';
    public static SELECTED_DATE_CSSCLASS = '.igx-days-view__date--selected';
    public static RANGE_CSSCLASS = 'igx-days-view__date--range';
    public static CALENDAR_ROW_CSSCLASS = '.igx-days-view__row';
    public static CALENDAR_ROW_WRAP_CSSCLASS = '.igx-days-view__row--wrap';
    public static MONTH_CSSCLASS = '.igx-calendar-view__item';
    public static CURRENT_MONTH_CSSCLASS = '.igx-calendar-view__item--selected';
    public static YEAR_CSSCLASS = '.igx-calendar-view__item';
    public static CURRENT_YEAR_CSSCLASS = '.igx-calendar-view__item--selected';

    public static CALENDAR_PREV_BUTTON_CSSCLASS = '.igx-calendar-picker__prev';
    public static CALENDAR_NEXT_BUTTON_CSSCLASS = '.igx-calendar-picker__next';
    public static CALENDAR_DATE_CSSCLASS = '.igx-calendar-picker__date';

    public static CALENDAR_SUBHEADERS_SELECTOR =
        'div:not(' + HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS + '):not(' + HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS + ')';

    public static verifyMonthsViewNumber(fixture, monthsView: number, checkCurrentDate = false) {
        const el = fixture.nativeElement ? fixture.nativeElement : fixture;
        const daysView = el.querySelectorAll(HelperTestFunctions.DAYS_VIEW);
        expect(daysView).toBeDefined();
        expect(daysView.length).toBe(monthsView);
        const monthPickers = HelperTestFunctions.getCalendarSubHeader(el).querySelectorAll('.igx-calendar-picker__dates');
        expect(monthPickers.length).toBe(monthsView);
        if (checkCurrentDate) {
            const currentDate = el.querySelector(HelperTestFunctions.CURRENT_DATE_CSSCLASS);
            expect(currentDate).not.toBeNull();
        }
    }

    public static verifyCalendarHeader(fixture: ComponentFixture<any>, selectedDate: Date) {
        const daysView = fixture.nativeElement.querySelector(HelperTestFunctions.CALENDAR_HEADER_CSSCLASS);
        expect(daysView).not.toBeNull();

        const year = fixture.nativeElement.querySelector(HelperTestFunctions.CALENDAR_HEADER_YEAR_CSSCLASS);
        expect(year).not.toBeNull();
        expect(year.innerText).toEqual("Select Date");

        const date = fixture.nativeElement.querySelector(HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS);
        expect(date).not.toBeNull();

        const dateParts = selectedDate.toUTCString().split(' '); // (weekday, date month year)
        expect(date.children[0].innerText.trim()).toEqual(dateParts[0]);
        expect(date.children[1].innerText.trim()).toEqual(dateParts[2] + ' ' + Number(dateParts[1]));
    }

    public static verifyNoRangeSelectionCreated(fixture, monthNumber: number) {
        expect(HelperTestFunctions.getMonthView(fixture, monthNumber).querySelector('.igx-days-view__date--range')).toBeNull();
        expect(HelperTestFunctions.getMonthView(fixture, monthNumber).querySelector('.igx-days-view__date--first')).toBeNull();
        expect(HelperTestFunctions.getMonthView(fixture, monthNumber).querySelector('.igx-days-view__date--last')).toBeNull();
    }

    public static verifyCalendarSubHeader(fixture, monthNumber: number, viewDate: Date) {
        const monthPickers = HelperTestFunctions.getCalendarSubHeader(fixture).querySelectorAll('div');
        const dateParts = viewDate.toString().split(' '); // weekday month day year
        expect(monthPickers[monthNumber].children[0].innerHTML.trim()).toEqual(dateParts[1]);
        expect(monthPickers[monthNumber].children[1].innerHTML.trim()).toEqual(dateParts[3]);
    }

    public static verifyCalendarSubHeaders(fixture, viewDates: Date[]) {
        const dom = fixture.nativeElement ? fixture.nativeElement : fixture;
        const monthPickers = HelperTestFunctions.getCalendarSubHeader(dom).querySelectorAll('.igx-calendar-picker__dates');

        expect(monthPickers.length).toEqual(viewDates.length);

        for (let index = 0; index < viewDates.length; index++) {
            const dateParts = viewDates[index].toString().split(' '); // weekday month day year
            const monthPickerDates = monthPickers[index].querySelectorAll('.igx-calendar-picker__date');
            expect(monthPickerDates[0].innerHTML.trim()).toContain(dateParts[1]);
            expect(monthPickerDates[1].innerHTML.trim()).toContain(dateParts[3]);
        }
    }

    public static getHiddenDays(fixture, monthNumber: number) {
        const monthView = HelperTestFunctions.getMonthView(fixture, monthNumber);
        return monthView.querySelectorAll(HelperTestFunctions.HIDDEN_DAYS_CSSCLASS);
    }

    public static getInactiveDays(fixture, monthNumber: number) {
        const monthView = HelperTestFunctions.getMonthView(fixture, monthNumber);
        return monthView.querySelectorAll(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS);
    }

    public static getCalendarSubHeader(fixture): HTMLElement {
        const element = fixture.nativeElement ? fixture.nativeElement : fixture;
        return element.querySelector('.igx-calendar__pickers');
    }

    public static getMonthView(fixture, monthsViewNumber: number) {
        const domEL = fixture.nativeElement ? fixture.nativeElement : fixture;
        return domEL.querySelectorAll('igx-days-view')[monthsViewNumber];
    }

    public static getMonthViewDates(fixture, monthsViewNumber: number) {
        const month = HelperTestFunctions.getMonthView(fixture, monthsViewNumber);
        return month.querySelectorAll(HelperTestFunctions.CURRENT_MONTH_DATES);
    }

    public static getMonthViewInactiveDates(fixture, monthsViewNumber: number) {
        const month = HelperTestFunctions.getMonthView(fixture, monthsViewNumber);
        return month.querySelectorAll(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS);
    }

    public static getMonthViewSelectedDates(fixture, monthsViewNumber: number) {
        const month = HelperTestFunctions.getMonthView(fixture, monthsViewNumber);
        return month.querySelectorAll(HelperTestFunctions.SELECTED_DATE_CSSCLASS +
            `:not(${HelperTestFunctions.HIDDEN_DAYS_CSSCLASS})`);
    }

    public static getMonthsFromMonthView(fixture) {
        return fixture.nativeElement.querySelector('igx-months-view')
            .querySelectorAll('.igx-calendar-view__item, .igx-calendar-view__item--current');
    }

    public static getYearsFromYearView(fixture) {
        return fixture.nativeElement.querySelector('igx-years-view')
            .querySelectorAll('.igx-calendar-view__item, .igx-calendar-view__item--selected');
    }

    public static getCurrentYearsFromYearView(fixture) {
        return fixture.nativeElement.querySelector('igx-years-view')
            .querySelector('.igx-calendar-view__item--current');
    }

    public static getNexArrowElement(fixture) {
        return fixture.debugElement.query(By.css(HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS)).nativeElement;
    }

    public static getPreviousArrowElement(fixture) {
        return fixture.debugElement.query(By.css(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS)).nativeElement;
    }

    public static verifyDateSelected(el) {
        expect(
            el.nativeElement.classList.contains(
                HelperTestFunctions.SELECTED_DATE
            )
        ).toBe(true);
    }

    public static verifyDateNotSelected(el) {
        expect(
            el.nativeElement.classList.contains(
                HelperTestFunctions.SELECTED_DATE
            )
        ).toBe(false);
    }
}
