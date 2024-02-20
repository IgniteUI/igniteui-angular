import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	DateRangeType,
	IFormattingOptions,
	IgxButtonDirective,
	IgxButtonGroupComponent,
	IgxCalendarComponent,
	IgxCardComponent,
	IgxDialogComponent,
	IgxHintDirective,
	IgxIconComponent,
	IgxInputDirective,
	IgxInputGroupComponent,
	IgxLabelDirective,
	IgxRippleDirective,
	IgxSwitchComponent,
	IViewDateChangeEventArgs,
} from 'igniteui-angular';

import { defineComponents, IgcCalendarComponent } from 'igniteui-webcomponents';

defineComponents(IgcCalendarComponent);

@Component({
	selector: 'app-calendar-sample',
	templateUrl: 'calendar.sample.html',
	styleUrls: ['calendar.sample.scss'],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	standalone: true,
	imports: [
		IgxButtonDirective,
		IgxRippleDirective,
		IgxCardComponent,
		IgxCalendarComponent,
		IgxButtonGroupComponent,
		IgxInputGroupComponent,
		IgxLabelDirective,
		IgxInputDirective,
		IgxHintDirective,
		FormsModule,
		IgxSwitchComponent,
		IgxIconComponent,
	],
})
export class CalendarSampleComponent implements OnInit {
	@ViewChild('calendar', { static: true })
	private calendar: IgxCalendarComponent;
	@ViewChild('alert', { static: true })
	private dialog: IgxDialogComponent;
	protected weekStart: string = 'sunday';
	protected setLocale = 'en';
	protected weekDayFormat: IFormattingOptions['weekday'] = 'narrow'
	protected weekNumber: boolean;
	protected calendarHeader: boolean;
	protected outsideDays: boolean;
	protected webComponentSelection = 'single';
	protected visibleMonths: number;
	protected headerOrientation: string;
	protected orientation: string;

	public range = [];
	public today = new Date();
	public ppNovember = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 10);
	public rangeDisabled = [
		new Date(this.today.getFullYear(), this.today.getMonth() - 1, 31),
		new Date(this.today.getFullYear(), this.today.getMonth(), 20),
		new Date(this.today.getFullYear(), this.today.getMonth(), 21),
	];
	public specialDates = [
		new Date(this.today.getFullYear(), this.today.getMonth(), 2),
		new Date(this.today.getFullYear(), this.today.getMonth(), 10),
	];
	public selectionType = 'single';

	public ngOnInit() {
		this.calendar.disabledDates = [{ type: DateRangeType.Specific, dateRange: this.rangeDisabled }];
		this.calendar.specialDates = [{ type: DateRangeType.Specific, dateRange: this.specialDates }];
		this.calendar.selectDate([new Date(this.today.getFullYear(), this.today.getMonth(), 10),
			new Date(this.today.getFullYear(), this.today.getMonth(), 17),
			new Date(this.today.getFullYear(), this.today.getMonth(), 27)]);
        this.setOrientation('horizontal');
	}

	public selectPTOdays(dates: Date | Date[]) {
		this.range = dates as Date [];
		console.log(this.range);
	}

	public submitPTOdays() {
		this.calendar.specialDates =
			[{ type: DateRangeType.Specific, dateRange: this.range }];

		this.range.forEach((item) => {
			this.calendar.selectDate(item);
		});

		if (this.range.length===0) {
			this.dialog.message = 'Select dates from the Calendar first.';
		} else {
			this.dialog.message = 'PTO days submitted.';
		}
		this.dialog.open();
	}

	public showHide() {
		this.calendar.hideOutsideDays = !this.calendar.hideOutsideDays;
		this.outsideDays = !this.outsideDays;
	}

	public onSelection(event: Date | Date []) {
		console.log(`Selected dates: ${ event }`);
	}

	public viewDateChanged(event: IViewDateChangeEventArgs) {
		console.log(event);
	}

	public activeViewChanged(event) {
		const calendarView = event;
		console.log(`Selected date:${ calendarView }`);
	}

	public setSelection(args: string) {
		if (args === 'multi') {
			this.webComponentSelection = 'multiple';
		} else {
			this.webComponentSelection = this.calendar.selection = args;
		}
		return this.selectionType = this.calendar.selection = args;
	}

	public setMonthsViewNumber(args: HTMLInputElement) {
		this.calendar.monthsViewNumber = parseInt(args.value, 10);
		this.visibleMonths = parseInt(args.value, 10);
	}

	public select() {
		if (this.calendar.selection==='single') {
			this.calendar.selectDate(new Date(this.today.getFullYear(), this.today.getMonth(), 7));
		} else {
			this.calendar.selectDate([new Date(this.today.getFullYear(), this.today.getMonth(), 1),
				new Date(this.today.getFullYear(), this.today.getMonth(), 14)]);
		}
	}

	public deselect() {
		this.calendar.deselectDate();
	}

	public changeLocale(locale: string) {
		this.setLocale = locale;
		this.calendar.locale = locale;
	}

	public hideHeader() {
		this.calendar.hasHeader = !this.calendar.hasHeader;
		this.calendarHeader = !this.calendarHeader;

	}

	public setHeaderOrientation(args: string) {
		if (this.calendar.hasHeader) {
			if (args === 'vertical') {
                this.calendar.headerOrientation = 'vertical';
				this.headerOrientation = 'vertical';
			} else {
                this.calendar.headerOrientation = 'horizontal';
				this.headerOrientation = 'horizontal';
			}
		}
	}

	public setOrientation(args: string) {
		if (args === 'vertical') {
			this.orientation = 'vertical';
            this.calendar.orientation = 'vertical';
		} else {
			this.orientation = 'horizontal';
            this.calendar.orientation = 'horizontal';
		}
	}

	public hideWeekNumber() {
		this.calendar.showWeekNumbers = !this.calendar.showWeekNumbers;
		this.weekNumber = !this.weekNumber;
	}

	public changeWeekStart(numVal: number, stringVal: string) {
		this.calendar.weekStart = numVal;
		this.weekStart = stringVal;
	}

	public setWeekDayFormat(format: IFormattingOptions['weekday']) {
		this.weekDayFormat = format;

		this.calendar.formatOptions = {
			...this.calendar.formatOptions, weekday: this.weekDayFormat
		};

		console.log(format);
	}
}
