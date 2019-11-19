import { Component, Input, ContentChild, ViewChild, AfterViewInit, AfterContentInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { InteractionMode } from '../core/enums';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxCalendarComponent, WEEKDAYS } from '../calendar/index';
import { OverlaySettings, ConnectedPositioningStrategy, GlobalPositionStrategy } from '../services/index';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KEYS, isIE } from '../core/utils';
import { IgxDateRangeStartDirective, IgxDateRangeEndDirective, IgxDateRangeDirective } from './igx-date-range.directives';

@Component({
    selector: 'igx-date-range',
    templateUrl: './igx-date-range.component.html'
})
export class IgxDateRangeComponent implements AfterViewInit, AfterContentInit, OnDestroy {
    // TODO: docs
    @Input()
    public mode: InteractionMode;

    @Input()
    public monthsViewNumber: number;

    @Input()
    public hideOutsideDays: boolean;

    @Input()
    public weekStart: number;

    @Input()
    public locale: string;

    @Input()
    public formatter: (val: Date) => string;

    @Input()
    public todayButtonText: string;

    @Input()
    public doneButtonText: string;

    @Output()
    public rangeSelected: EventEmitter<IgxDateRangeComponent>;

    @Output()
    public onOpened: EventEmitter<IgxDateRangeComponent>;

    @Output()
    public onClosed: EventEmitter<IgxDateRangeComponent>;

    @ContentChild(IgxDateRangeStartDirective, { read: IgxDateRangeStartDirective, static: false })
    public startInput: IgxDateRangeStartDirective;

    @ContentChild(IgxDateRangeEndDirective, { read: IgxDateRangeEndDirective, static: false })
    public endInput: IgxDateRangeEndDirective;

    @ContentChild(IgxDateRangeDirective, { read: IgxDateRangeDirective, static: false })
    public singleInput: IgxDateRangeDirective;

    /**
     * @hidden
     */
    @ViewChild(IgxCalendarComponent, { read: IgxCalendarComponent, static: false })
    protected calendar: IgxCalendarComponent;

    /**
     * @hidden
     */
    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective, static: false })
    protected toggle: IgxToggleDirective;

    private dropDownOverlaySettings: OverlaySettings;
    private dialogOverlaySettings: OverlaySettings;
    private destroy: Subject<boolean>;

    constructor() {
        this.locale = 'en';
        this.monthsViewNumber = 1;
        this.doneButtonText = 'Done';
        this.todayButtonText = 'Today';
        this.weekStart = WEEKDAYS.SUNDAY;
        this.mode = InteractionMode.Dialog;
        this.destroy = new Subject<boolean>();
        this.onOpened = new EventEmitter<IgxDateRangeComponent>();
        this.onClosed = new EventEmitter<IgxDateRangeComponent>();
        this.rangeSelected = new EventEmitter<IgxDateRangeComponent>();
    }

    public open() {
        this.showCalendar();
    }

    public close() {
        this.hideCalendar();
    }

    public showToday(event: KeyboardEvent): void {
        event.stopPropagation();
        const today = new Date();
        this.calendar.selectDate(today);
        this.handleSelection(this.calendar.selectedDates);
    }

    public get value(): Date | Date[] {
        return this.calendar.value;
    }

    public selectRange(startDate: Date, endDate: Date): void {
        const dateRange = [startDate, endDate];
        this.calendar.selectDate(dateRange);
        this.handleSelection(dateRange);
    }

    /**
     * @hidden
     */
    public ngAfterContentInit(): void {
        this.validateNgContent();
        this.dropDownOverlaySettings = {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: new ConnectedPositioningStrategy({
                target: this.getPositionTarget()
            })
        };
        this.dialogOverlaySettings = {
            modal: true,
            closeOnOutsideClick: true,
            positionStrategy: new GlobalPositionStrategy()
        };
    }

    /**
     * @hidden
     */
    public ngAfterViewInit(): void {
        switch (this.mode) {
            case InteractionMode.DropDown:
                this.attachOnKeydown();
                this.applyFocusOnClose();
                break;
            case InteractionMode.Dialog:
                this.applyFocusOnClose();
                break;
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy(): void {
        this.destroy.next(true);
        this.destroy.complete();
    }

    /**
     * @hidden
     */
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KEYS.UP_ARROW:
            case KEYS.UP_ARROW_IE:
                if (event.altKey) {
                    this.hideCalendar();
                }
                break;
            case KEYS.DOWN_ARROW:
            case KEYS.DOWN_ARROW_IE:
                if (event.altKey) {
                    this.showDropDown();
                }
                break;
            case KEYS.ESCAPE:
            case KEYS.ESCAPE_IE:
                this.hideCalendar();
                break;
        }
    }

    /**
     * @hidden
     */
    public handleSelection(selectionData: Date[]): void {
        if (selectionData.length > 1) {
            // range selection
            this.startInput || this.endInput ?
                this.handleTwoInputSelection(selectionData) :
                this.handleSingleInputSelection(selectionData);
            this.rangeSelected.emit(this);
        } else {
            // first selection in the range
            this.startInput || this.endInput ?
                this.handleTwoInputSelection([selectionData[0], null]) :
                this.handleSingleInputSelection([selectionData[0], null]);
        }
    }

    /**
     * @hidden
     */
    public showCalendar(event?: MouseEvent | KeyboardEvent): void {
        switch (this.mode) {
            case InteractionMode.Dialog:
                this.showDialog(event);
                break;
            case InteractionMode.DropDown:
                this.showDropDown(event);
                break;
            default:
                // TODO: better error message
                throw new Error('Unknown mode.');
        }
        this.onOpened.emit(this);
    }

    /**
     * @hidden
     */
    public hideCalendar(): void {
        if (!this.toggle.collapsed) {
            this.toggle.close();
            this.startInput ? this.startInput.nativeElement.focus() :
                this.singleInput.nativeElement.focus();
        }
        this.onClosed.emit(this);
    }

    /**
     * @hidden
     */
    public onCalendarOpened(): void {
        requestAnimationFrame(() => {
            this.calendar.daysView.focusActiveDate();
        });
    }

    /**
     *  @hidden
     */
    protected showDialog(event?: MouseEvent | KeyboardEvent): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.activateToggleOpen(this.dialogOverlaySettings);
    }

    /**
     * @hidden
     */
    protected showDropDown(event?: MouseEvent | KeyboardEvent): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.activateToggleOpen(this.dropDownOverlaySettings);
    }

    private handleSingleInputSelection(selectionData: Date[]): void {
        if (this.singleInput) {
            this.singleInput.value = this.extractRange(selectionData);
        }
    }

    private handleTwoInputSelection(selectionData: Date[]): void {
        const selectionRange = this.extractRange(selectionData);
        if (this.startInput) {
            this.startInput.value = selectionRange[0];
        }
        if (this.endInput) {
            this.endInput.value = selectionRange[selectionRange.length - 1];
        }
    }

    private getPositionTarget(): HTMLElement {
        if (this.startInput && this.endInput) {
            return this.startInput.nativeElement;
        }
        if (this.startInput) {
            return this.startInput.nativeElement;
        }
        if (this.endInput) {
            return this.endInput.nativeElement;
        }

        return this.singleInput.nativeElement;
    }

    private applyFormatting(date: Date): string {
        return this.formatter ? this.formatter(date) : this.applyLocaleToDate(date);
    }

    private applyLocaleToDate(value: Date): string {
        if (isIE() && value) {
            const localeDateStrIE = new Date(value.getFullYear(), value.getMonth(), value.getDate(),
                value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds());
            return localeDateStrIE.toLocaleDateString(this.locale);
        }

        return value ? value.toLocaleDateString(this.locale) : null;
    }

    private extractRange(selection: Date[]): string[] {
        return [this.applyFormatting(selection[0]), this.applyFormatting(selection[selection.length - 1])];
    }

    private activateToggleOpen(overlaySettings: OverlaySettings): void {
        if (this.toggle.collapsed) {
            this.toggle.open(overlaySettings);
        }
    }

    private validateNgContent(): void {
        if (!this.singleInput && (!this.startInput || !this.endInput)) {
            // TODO: better error message
            throw new Error('You must apply both igxDateRangeStart and igxDateRangeEnd if you are using two input elements.');
        }
    }

    private attachOnKeydown(): void {
        if (this.singleInput) {
            fromEvent(this.singleInput.nativeElement, 'keydown').pipe(
                takeUntil(this.destroy)
            ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
        }
        if (this.startInput && this.endInput) {
            fromEvent(this.startInput.nativeElement, 'keydown').pipe(
                takeUntil(this.destroy)
            ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));

            fromEvent(this.endInput.nativeElement, 'keydown').pipe(
                takeUntil(this.destroy)
            ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
        }
    }

    private applyFocusOnClose() {
        if (this.singleInput) {
            this.toggle.onClosed.pipe(
                takeUntil(this.destroy)
            ).subscribe(() => this.singleInput.setFocus());
        }
        if (this.startInput) {
            this.toggle.onClosed.pipe(
                takeUntil(this.destroy)
            ).subscribe(() => this.startInput.setFocus());
        }
    }
}
