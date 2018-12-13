import { CommonModule } from '@angular/common';
import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ContentChild,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
    HostListener,
    ElementRef,
    TemplateRef,
    Directive
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    IgxCalendarComponent,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarModule,
    IgxCalendarSubheaderTemplateDirective,
    WEEKDAYS
} from '../calendar/index';
import { IgxDialogComponent, IgxDialogModule } from '../dialog/dialog.component';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule, IgxInputDirective } from '../input-group/index';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { OverlaySettings } from '../services';
import { DateRangeDescriptor } from '../core/dates/dateRange';
import { EditorProvider } from '../core/edit-provider';

@Directive({
    selector: '[igxDatePickerTemplate]'
})
export class IgxDatePickerTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}


export interface IFormatViews {
    day?: boolean;
    month?: boolean;
    year?: boolean;
}

export interface IFormatOptions {
    day?: string;
    month?: string;
    weekday?: string;
    year?: string;
}
let NEXT_ID = 0;
/**
 * **Ignite UI for Angular Date Picker** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date_picker.html)
 *
 * The Ignite UI Date Picker displays a popup calendar that lets users select a single date.
 *
 * Example:
 * ```html
 * <igx-date-picker [(ngModel)]="selectedDate"></igx-date-picker>
 * ```
 */
@Component({
    providers:
        [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxDatePickerComponent, multi: true }],
    // tslint:disable-next-line:component-selector
    selector: 'igx-date-picker',
    styles: [':host {display: block;}'],
    templateUrl: 'date-picker.component.html'
})
export class IgxDatePickerComponent implements ControlValueAccessor, EditorProvider, OnInit, OnDestroy {
    /**
     *An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     *```html
     *<igx-date-picker [id]="'igx-date-picker-3'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-date-picker-${NEXT_ID++}`;

    /**
     *An @Input property that applies custom formatter on the selected or passed date.
     *```typescript
     *public date: Date = new Date();
     *private dayFormatter = new Intl.DateTimeFormat("en", { weekday: "long" });
     *private monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });
     *public formatter = (date: Date) => { return `You selected
     *                     ${this.dayFormatter.format(date)},
     *                     ${date.getDate()} ${this.monthFormatter.format(date)},
     *                     ${date.getFullYear()}`;
     *}
     *```
     *```html
     *<igx-date-picker [value]="date" [formatter]="formatter"></igx-date-picker>
     *```
     */
    @Input()
    public formatter: (val: Date) => string;

    /**
     *An @Input property that disables the `IgxDatePickerComponent`.
     *```html
     *<igx-date-picker [disabled]="'true'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    public disabled: boolean;

    /**
     *An @Input property that sets the selected date.
     *```typescript
     *public date: Date = new Date();
     *```
     *```html
     *<igx-date-picker [value]="date"></igx-date-picker>
     *```
     */
    @Input()
    public value: Date;

    /**
     * An @Input property that sets the `IgxDatePickerComponent` label.
     * The default label is 'Date'.
     * ```html
     * <igx-date-picker [label]="Calendar"></igx-date-picker>
     * ```
     */
    @Input()
    public label = 'Date';

    /**
     * An @Input property that sets the `IgxDatePickerComponent` label visibility.
     * By default the visibility is set to true.
     * <igx-date-picker [labelVisibility]="false"></igx-date-picker>
     */
    @Input()
    public labelVisibility = true;

    /**
     *An @Input property that sets locales. Default locale is en.
     *```html
     *<igx-date-picker locale="ja-JP" [value]="date"></igx-date-picker>
     *```
     */
    @Input() public locale: string = Constants.DEFAULT_LOCALE_DATE;

    /**
     *An @Input property that sets on which day the week starts.
     *```html
     *<igx-date-picker [weekStart]="WEEKDAYS.FRIDAY" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Input() public weekStart: WEEKDAYS | number = WEEKDAYS.SUNDAY;

    /**
     *Returns the format options of the `IgxDatePickerComponent`.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    let formatOptions = this.datePicker.formatOptions;
     *}
     *```
     */
    @Input()
    public get formatOptions(): IFormatOptions {
        return this._formatOptions;
    }
    /**
     *Sets the format options of the `IgxDatePickerComponent`.
     *```typescript
     *public Options;
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.Options = {
     *        day: "numeric",
     *        month: "long",
     *        weekday: "long",
     *        year: "numeric"
     *    }
     *this.datePicker.formatOptions = this.Options;
     *}
     *```
     */
    public set formatOptions(formatOptions: IFormatOptions) {
        this._formatOptions = Object.assign(this._formatOptions, formatOptions);
    }

    /**
     *Returns the format views of the `IgxDatePickerComponent`.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    let formatViews = this.datePicker.formatViews;
     *}
     *```
     */
    @Input()
    public get formatViews(): IFormatViews {
        return this._formatViews;
    }

    /**
     *Sets the format views of the `IgxDatePickerComponent`.
     *```typescript
     *public Views;
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.Views = {day:false, month: false, year:false};
     *    this.datePicker.formatViews = this.Views;
     *}
     *```
     */
    public set formatViews(formatViews: IFormatViews) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     * Gets the disabled dates descriptors.
     * ```typescript
     * let disabledDates = this.datepicker.disabledDates;
     * ```
     */
    public get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }

    /**
     * Sets the disabled dates' descriptors.
     * ```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.datePicker.disabledDates = [
     *      new DateRangeDescriptor(DateRangeType.Between, [new Date("2020-1-1"), new Date("2020-1-15")]),
     *      new DateRangeDescriptor(DateRangeType.Weekends)];
     *}
     *```
     */
    public set disabledDates(value: DateRangeDescriptor[]) {
        this._disabledDates = value;
    }

    /**
     * Gets the special dates descriptors.
     * ```typescript
     * let specialDates = this.datepicker.specialDates;
     * ```
     */
    public get specialDates(): DateRangeDescriptor[] {
        return this._specialDates;
    }

    /**
     * Sets the special dates' descriptors.
     * ```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.datePicker.specialDates = [
     *      new DateRangeDescriptor(DateRangeType.Between, [new Date("2020-1-1"), new Date("2020-1-15")]),
     *      new DateRangeDescriptor(DateRangeType.Weekends)];
     *}
     *```
     */
    public set specialDates(value: DateRangeDescriptor[]) {
        this._specialDates = value;
    }

    /**
     *An @Input proeprty that sets the orientation of the `IgxDatePickerComponent` header.
     *```html
     *<igx-date-picker [vertical]="'true'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Input()
    public vertical = false;

    /**
     *An @Input property that renders today button with custom label.
     *```html
     *<igx-date-picker cancelButtonLabel="cancel" todayButtonLabel="Tomorrow"></igx-date-picker>
     *```
     */
    @Input()
    public todayButtonLabel: string;

    /**
     *An @Input property that renders cancel button with custom label.
     *```html
     *<igx-date-picker cancelButtonLabel="Close" todayButtonLabel="Today"></igx-date-picker>
     *```
     */
    @Input()
    public cancelButtonLabel: string;

    /**
     *An event that is emitted when the `IgxDatePickerComponent` is opened.
     *```typescript
     *public open(event){
     *    alert("The date-picker has been opened!");
     *}
     *```
     *```html
     *<igx-date-picker (onOpen)="open($event)" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Output()
    public onOpen = new EventEmitter<IgxDatePickerComponent>();

    /**
     *"An event that is emitted when the `IgxDatePickerComponent` is closed.
     *```typescript
     *public close(event){
     *    alert("The date-picker has been closed!");
     *}
     *```
     *```html
     *<igx-date-picker (onClose)="close($event)" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Output()
    public onClose = new EventEmitter<IgxDatePickerComponent>();
    /**
     *An @Output property that is fired when selection is made in the calendar.
     *```typescript
     *public selection(event){
     *    alert("A date has been selected!");
     *}
     *```
     *```html
     *<igx-date-picker (onSelection)="selection($event)" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Output()
    public onSelection = new EventEmitter<Date>();

    /**
     * @hidden
     */
    @ViewChild('defaultDatePickerTemplate', { read: TemplateRef })
    protected defaultDatePickerTemplate: TemplateRef<any>;

    /**
     *@hidden
     */
    @ContentChild(IgxDatePickerTemplateDirective, { read: IgxDatePickerTemplateDirective })
    protected datePickerTemplateDirective: IgxDatePickerTemplateDirective;

    /**
     *Returns the formatted date.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *public selection(event){
     *    let selectedDate = this.datePicker.displayData;
     *    alert(selectedDate);
     *}
     *```
     *```html
     *<igx-date-picker #MyDatePicker (onSelection)="selection()" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    public get displayData() {
        if (this.value) {
            return this._customFormatChecker(this.formatter, this.value);
        }

        return '';
    }

    /**
     *@hidden
     */
    @ContentChild(IgxCalendarHeaderTemplateDirective, { read: IgxCalendarHeaderTemplateDirective })

    public headerTemplate: IgxCalendarHeaderTemplateDirective;
    /**
     *@hidden
     */
    @ContentChild(IgxCalendarSubheaderTemplateDirective, { read: IgxCalendarSubheaderTemplateDirective })
    public subheaderTemplate: IgxCalendarSubheaderTemplateDirective;

    /**
     *@hidden
     */
    @ViewChild('container', { read: ViewContainerRef })
    public container: ViewContainerRef;

    /**
     *@hidden
     */
    @ViewChild(IgxDialogComponent)
    public alert: IgxDialogComponent;

    /**
     *@hidden
     */
    public calendarRef: ComponentRef<IgxCalendarComponent>;

    /**
     *@hidden
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     *@hidden
     */
    public get calendar() {
        return this.calendarRef.instance;
    }

    protected destroy$ = new Subject<boolean>();

    private _formatOptions = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };

    private _formatViews = {
        day: false,
        month: true,
        year: false
    };

    private _disabledDates: DateRangeDescriptor[] = null;

    private _specialDates: DateRangeDescriptor[] = null;

    @ViewChild(IgxInputDirective) protected input: IgxInputDirective;

    constructor(private resolver: ComponentFactoryResolver) { }

    /**
     *Method that sets the selected date.
     *```typescript
     *public date = new Date();
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.datePicker.writeValue(this.date);
     *}
     *```
     *@param value The date you want to select.
     *@memberOf {@link IgxDatePickerComponent}
     */
    public writeValue(value: Date) {
        this.value = value;
    }

    /**
     *@hidden
     */
    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }

    /**
     *@hidden
     */
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    /** @hidden */
    getEditElement() {
        return this.input.nativeElement;
    }

    /**
     *@hidden
     */
    public ngOnInit(): void {
        this.alert.onOpen.pipe(takeUntil(this.destroy$)).subscribe((ev) => this._focusCalendarDate());
        this.alert.toggleRef.onClosed.pipe(takeUntil(this.destroy$)).subscribe((ev) => this.handleDialogCloseAction());
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     *Selects today's date from calendar and change the input field value, @calendar.viewDate and @calendar.value.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *this.datePicker.triggerTodaySelection();
     *}
     *```
     *@memberOf {@link IgxDatePickerComponent}
     */
    public triggerTodaySelection() {
        const today = new Date(Date.now());
        this.handleSelection(today);
    }

    /**
     * Change the calendar selection and calling this method will emit the @calendar.onSelection event,
     * which will fire @handleSelection method.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *this.datePicker.selectDate(this.date);
     *}
     * ```
     * @param date passed date that has to be set to the calendar.
     * @memberOf {@link IgxDatePickerComponent}
     */
    public selectDate(date: Date) {
        this.value = date;
        this.onSelection.emit(date);
        this._onChangeCallback(date);
    }

    /**
     * Deselects the calendar date.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *this.datePicker.deselectDate();
     *}
     * ```
     * @memberOf {@link IgxDatePickerComponent}
     */
    public deselectDate() {
        this.value = null;
        this._onChangeCallback(null);
    }

    /**
     * Open the dialog and update the calendar.
     *
     * @hidden
     */
    public openDialog(): void {
        this.createCalendarRef();
        if (this.outlet) {
            const overlaySettings: OverlaySettings = {
                outlet: this.outlet
            };
            this.alert.open(overlaySettings);
        } else {
            this.alert.open();
        }
        this._onTouchedCallback();
        this.onOpen.emit(this);
    }

    private createCalendarRef(): void {
        const factory = this.resolver.resolveComponentFactory(IgxCalendarComponent);

        this.calendarRef = this.container.createComponent(factory);

        this.calendarRef.changeDetectorRef.detach();
        this.updateCalendarInstance();
        this.calendarRef.location.nativeElement.classList.add('igx-date-picker__date--opened');
        this.calendarRef.changeDetectorRef.reattach();
    }

    /**
     * Closes the dialog, after was clearing all calendar items from dom.
     *
     * @hidden
     */
    public handleDialogCloseAction() {
        this.onClose.emit(this);
        this.calendarRef.destroy();
        if (this.input) {
            this.input.nativeElement.focus();
        }
    }

    /**
     * Evaluates when @calendar.onSelection event was fired
     * and update the input value.
     *
     * @param event selected value from calendar.
     *
     * @hidden
     */
    public handleSelection(date: Date) {
        if (this.value) {
            date.setHours(this.value.getHours());
            date.setMinutes(this.value.getMinutes());
            date.setSeconds(this.value.getSeconds());
            date.setMilliseconds(this.value.getMilliseconds());
        }

        this.value = date;
        this.calendar.viewDate = date;
        this._onChangeCallback(date);
        this.alert.close();
        this.onSelection.emit(date);
    }

    @HostListener('keydown.spacebar', ['$event'])
    @HostListener('keydown.space', ['$event'])
    public onSpaceClick(event) {
        this.openDialog();
        event.preventDefault();
    }

    /**
     * Gets the input group template.
     * ```typescript
     * let template = this.template();
     * ```
     * @memberof IgxTimePickerComponent
     */
    get template(): TemplateRef<any> {
        if (this.datePickerTemplateDirective) {
            return this.datePickerTemplateDirective.template;
        }
        return this.defaultDatePickerTemplate;
    }

    /**
     * Gets the context passed to the input group template.
     * @memberof IgxTimePickerComponent
     */
    get context() {
        return {
            value: this.value,
            displayData: this.displayData,
            openDialog: () => { this.openDialog(); }
        };
    }

    private updateCalendarInstance() {
        this.calendar.formatOptions = this._formatOptions;
        this.calendar.formatViews = this._formatViews;
        this.calendar.locale = this.locale;
        this.calendar.vertical = this.vertical;
        this.calendar.disabledDates = this.disabledDates;
        this.calendar.specialDates = this.specialDates;

        if (this.headerTemplate) {
            this.calendar.headerTemplate = this.headerTemplate;
        }

        if (this.subheaderTemplate) {
            this.calendar.subheaderTemplate = this.subheaderTemplate;
        }

        if (this.value) {
            this.calendar.value = this.value;
            this.calendar.viewDate = this.value;
        }
        this.calendar.weekStart = this.weekStart;
        this.calendar.onSelection.pipe(takeUntil(this.destroy$)).subscribe((ev: Date) => this.handleSelection(ev));
    }

    // Focus a date, after the celendar appearence into DOM.
    private _focusCalendarDate() {
        requestAnimationFrame(() => {
            this.calendar.focusActiveDate();
        });
    }

    private _setLocaleToDate(value: Date, locale: string = Constants.DEFAULT_LOCALE_DATE): string {
        return value.toLocaleDateString(locale);
    }

    /**
     * Apply custom user formatter upon date.
     * @param formatter custom formatter function.
     * @param date passed date
     */
    private _customFormatChecker(formatter: (_: Date) => string, date: Date) {
        return this.formatter ? this.formatter(date) : this._setLocaleToDate(date, this.locale);
    }

    private _onTouchedCallback: () => void = () => { };

    private _onChangeCallback: (_: Date) => void = () => { };
}

class Constants {
    public static readonly DEFAULT_LOCALE_DATE = 'en';
}

/**
 * The IgxDatePickerModule provides the {@link IgxDatePickerComponent} inside your application.
 */
@NgModule({
    declarations: [IgxDatePickerComponent, IgxDatePickerTemplateDirective],
    entryComponents: [IgxCalendarComponent],
    exports: [IgxDatePickerComponent, IgxDatePickerTemplateDirective],
    imports: [CommonModule, IgxIconModule, IgxInputGroupModule, IgxDialogModule, IgxCalendarModule]
})
export class IgxDatePickerModule { }
