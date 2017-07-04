import { CommonModule } from "@angular/common";
import {
    Component,
    DoCheck,
    EventEmitter,
    forwardRef,
    Input,
    NgModule,
    NgZone,
    OnInit,
    Output,
    Renderer2
} from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { HammerGesturesManager } from "../core/touch";
import { Calendar, ICalendarDate, WEEKDAYS } from "./calendar";

export enum CalendarView {
    DEFAULT,
    YEAR,
    DECADE
}

@Component({
    moduleId: module.id,
    providers: [HammerGesturesManager, { provide: NG_VALUE_ACCESSOR, useExisting: IgxCalendarComponent, multi: true }],
    selector: "igx-calendar",
    templateUrl: "calendar.component.html"
})
export class IgxCalendarComponent implements OnInit, DoCheck, ControlValueAccessor {

    @Input() public get weekStart(): WEEKDAYS | number {
        return this.calendarModel.firstWeekDay;
    }
    public set weekStart(value: WEEKDAYS | number) {
        this.calendarModel.firstWeekDay = value;
    }
    @Input() public currentYear: number;
    @Input() public currentMonth: number;
    @Input() public currentDate: number;
    @Input() public locale: string = "en";
    @Input() public get selection(): string {
        return this._selection;
    }
    public set selection(value) {
        switch (value) {
            case "single":
                this.selectedDates = null;
                break;
            case "multi":
            case "range":
                this.selectedDates = [];
                break;
            default:
                throw new Error("Invalid selection value");
        }
        this._onChangeCallback(this.selectedDates);
        this._rangeStarted = false;
        this._selection = value;
    }

    @Input() public get viewDate(): Date {
        return this._viewDate;
    }

    public set viewDate(value: Date) {
        this._viewDate = new Date(value);
    }
    @Output() public onSelection = new EventEmitter<Date | Date[]>();

    public get value(): Date | Date[] {
        return this.selectedDates;
    }

    public set value(val: Date | Date[]) {
        this.selectDate(val);
    }

    private calendarModel: Calendar;
    private _viewDate: Date;
    private activeView = CalendarView.DEFAULT;
    private selectedDates;
    private _selection: "single" | "multi" | "range" = "single";
    private _rangeStarted: boolean = false;

    constructor(private renderer: Renderer2) {
        this.calendarModel = new Calendar();
    }

    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    public writeValue(value: Date | Date[]) {
        this.selectedDates = value;
    }

    public ngOnInit(): void {
        this.calendarModel.firstWeekDay = this.weekStart;

        if (!this._viewDate) {
            this._viewDate = new Date(Date.now());
        }
    }

    public ngDoCheck(): void {
        this.currentYear = this._viewDate.getFullYear();
        this.currentMonth = this._viewDate.getMonth();
        this.currentDate = this._viewDate.getDate();
    }

    public generateWeekHeader(): string[] {
        const dayNames: string[] = [];
        const rv = this.calendarModel.monthdatescalendar(this.currentYear, this.currentMonth)[0];

        for (const day of rv) {
            dayNames.push(day.date.toLocaleString(this.locale, { weekday: "short" }));
        }

        return dayNames;
    }

    public get getMonth(): ICalendarDate[][] {
        return this.calendarModel.monthdatescalendar(this.currentYear, this.currentMonth, true);
    }

    public onDateClick(event: MouseEvent): void {
        const target: any = event.target;

        if (target.nodeName.toLowerCase() !== "span") {
            return;
        }

        if (target.dataset.prevmonth) {
            this.prevMonth();
        }

        if (target.dataset.nextmonth) {
            this.nextMonth();
        }

        const value = new Date(this._viewDate.getFullYear(),
            this._viewDate.getMonth(), parseInt(target.textContent, 10));

        this.selectDate(value);
    }

    public selectDate(date: Date | Date[]): void {

        switch (this.selection) {
            case "single":
                this.selectSingle(date as Date);
                break;
            case "multi":
                this.selectMulti(date);
                break;
            case "range":
                this.selectRange(date);
                break;
            default:
                this.selectSingle(date as Date);
        }

        this.onSelection.emit(this.selectedDates);
    }

    protected selectSingle(newVal: Date): void {
        this.selectedDates = newVal;
        this._onChangeCallback(this.selectedDates);
    }

    protected selectMulti(newVal: Date | Date[]): void {
        if (newVal instanceof Array) {
            // XXX: Behavior for deselect with array
            this.selectedDates = this.selectedDates.concat(newVal);
        } else {
            if (this.selectedDates.every((date: Date) => date.toDateString() !== newVal.toDateString())) {
                this.selectedDates.push(newVal);
            } else {
                // Deselect if already selected
                this.selectedDates = this.selectedDates.filter(
                    (date: Date) => date.toDateString() !== newVal.toDateString()
                );
            }
        }
        this._onChangeCallback(this.selectedDates);
    }

    protected selectRange(newVal: Date | Date[]): void {

        if (newVal instanceof Array) {

            this._rangeStarted = false;
            newVal.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
            let start: Date = newVal[0];
            this.selectedDates = [start];

            while (start.toDateString() !== newVal[newVal.length - 1].toDateString()) {
                start = this.calendarModel.timedelta(start, "day", 1);
                this.selectedDates.push(start);
            }
        } else {
            // Single date toggle on range selection
            if (!this._rangeStarted) {
                this._rangeStarted = true;
                this.selectedDates = [newVal];
            } else {
                // End value for range selection mode; toggle off
                this._rangeStarted = false;

                // Selected range end is the same as start; toggle new range selection
                /// XXX: Or maybe we should just return a range of 1 ??
                if (this.selectedDates[0].toDateString() === newVal.toDateString()) {
                    this.selectedDates = [];
                    this._onChangeCallback(this.selectedDates);
                    return;
                }
                this.selectedDates.push(newVal);
                this.selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());

                let start: Date = this.selectedDates[0];
                const end: Date = this.selectedDates.pop();

                while (start.toDateString() !== end.toDateString()) {
                    start = this.calendarModel.timedelta(start, "day", 1);
                    this.selectedDates.push(start);
                }
            }
        }
        this._onChangeCallback(this.selectedDates);
    }
    protected prevMonth(): void {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "month", -1);
    }

    protected nextMonth(): void {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "month", 1);
    }

    // Util methods for the template

    protected getMonthName(date: Date): string {
        return date.toLocaleString(this.locale, { month: "long" });
    }
    protected getFormattedDate(): string {

        const formatOptions = {
            day: "numeric",
            month: "short",
            weekday: "short"
        };

        let res = this._viewDate.toLocaleString(this.locale, formatOptions);

        if (this.selectedDates) {
            res = this.selectedDates.toLocaleString(this.locale, formatOptions);
        }
        return res;
    }

    protected isInactive(day: ICalendarDate): boolean {
        return day.isNextMonth || day.isPrevMonth;
    }

    protected isWeekend(day: ICalendarDate): boolean {
        return day.date.getDay() === 0 || day.date.getDay() === 6;
    }

    protected isSelected(day: ICalendarDate): boolean {
        if (this.selection === "multi" || this.selection === "range") {
            for (const date of this.selectedDates) {
                if (date.toDateString() === day.date.toDateString()) {
                    return true;
                }
            }
            return false;
        }
        if (this.selectedDates) {
            return day.date.toDateString() === this.selectedDates.toDateString();
        }
        return false;
    }

    protected isToday(day: ICalendarDate): boolean {
        const today = new Date(Date.now());
        return (day.date.getFullYear() === today.getFullYear() &&
                day.date.getMonth() === today.getMonth() &&
                day.date.getDate() === today.getDate());
    }

    protected get isDefaultView(): boolean {
        return this.activeView === CalendarView.DEFAULT;
    }

    protected get isYearView(): boolean {
        return this.activeView === CalendarView.YEAR;
    }

    protected get isDecadeView(): boolean {
        return this.activeView === CalendarView.DECADE;
    }

    protected activeViewYear(): void {
        this.activeView = CalendarView.YEAR;
    }

    protected activeViewDecade(): void {
        this.activeView = CalendarView.DECADE;
    }

    // XXX: WiP! Will still have to discuss what are we showing
    //      and how are we showing it
    protected getDecade() {
        let start = this._viewDate.getFullYear() - 5;
        const res = [];

        for (let i = 0; i < 11; i++) {
            res.push(start);
            start++;
        }

        return res;
    }

    protected getYear() {
        let start = new Date(this._viewDate.getFullYear(), 0, 1);
        const res = [];

        for (let i = 0; i < 12; i++) {
            res.push(start);
            start = this.calendarModel.timedelta(start, "month", 1);
        }

        return res;
    }

    protected changeYear(event) {
        const year = parseInt(event.target.textContent, 10);
        this._viewDate = new Date(year, 0, 1);
        this.activeView = CalendarView.YEAR;
    }

    protected changeMonth(event) {
        const month = event.target.dataset.index;
        this._viewDate = new Date(this._viewDate.getFullYear(), month, 1);
        this.activeView = CalendarView.DEFAULT;
    }

    protected dateTracker(index, item) {
        return `${item.date.getMonth()}{item.date.getDate()}`;
    }

    protected rowTracker(index, item) {
        return index;
    }

    private _onTouchedCallback: () => void = () => {};
    private _onChangeCallback: (_: Date) => void = () => {};
}

@NgModule({
    declarations: [IgxCalendarComponent],
    exports: [IgxCalendarComponent],
    imports: [CommonModule, FormsModule]
})
export class IgxCalendarModule {}
