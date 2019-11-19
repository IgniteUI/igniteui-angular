import { Component, Input, ContentChild, ViewChild, AfterViewInit, AfterContentInit, OnDestroy } from '@angular/core';
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
        this.mode = InteractionMode.Dialog;
        this.monthsViewNumber = 1;
        this.weekStart = WEEKDAYS.SUNDAY;
        this.locale = 'en';
        this.todayButtonText = 'Today';
        this.doneButtonText = 'Done';
        this.destroy = new Subject<boolean>();
    }

    public open() {
        this.showCalendar();
    }

    public showToday(event: KeyboardEvent): void {
        const today = new Date();
        event.stopPropagation();
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
            closeOnOutsideClick: true,
            modal: true,
            positionStrategy: new GlobalPositionStrategy()
        };
    }

    /**
     * @hidden
     */
    public ngAfterViewInit(): void {
        if (this.mode === InteractionMode.DropDown) {
            if (this.singleInput) {
                fromEvent(this.singleInput.nativeElement, 'keydown').pipe(
                    takeUntil(this.destroy)
                ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));

                this.toggle.onClosed.pipe(
                    takeUntil(this.destroy)
                ).subscribe(() => this.singleInput.setFocus());
            }
            if (this.startInput && this.endInput) {
                fromEvent(this.startInput.nativeElement, 'keydown').pipe(
                    takeUntil(this.destroy)
                ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));

                this.toggle.onClosed.pipe(
                    takeUntil(this.destroy)
                ).subscribe(() => this.startInput.setFocus());

                fromEvent(this.endInput.nativeElement, 'keydown').pipe(
                    takeUntil(this.destroy)
                ).subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
            }
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
                    this.hideCalendar(event);
                }
                break;
            case KEYS.DOWN_ARROW:
            case KEYS.DOWN_ARROW_IE:
                if (event.altKey) {
                    this.showDropDown(event);
                }
                break;
            case KEYS.ESCAPE:
            case KEYS.ESCAPE_IE:
                this.hideCalendar(event);
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
        } else {
            // first selection in range
            this.startInput || this.endInput ?
                this.handleTwoInputSelection([selectionData[0], null]) :
                this.handleSingleInputSelection([selectionData[0], null]);
        }
    }

    /**
     * @hidden
     */
    public showCalendar(event?: MouseEvent): void {
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
    }

    /**
     * @hidden
     */
    public hideCalendar(event: MouseEvent | KeyboardEvent) {
        event.stopPropagation();
        event.preventDefault();
        if (!this.toggle.collapsed) {
            const element = event.target as HTMLElement;
            this.toggle.close();
            element.focus();
        }
    }

    /**
     * @hidden
     */
    public onOpened(): void {
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

    private handleSingleInputSelection(selectionData: Date[]) {
        if (this.singleInput) {
            this.singleInput.value = this.extractRange(selectionData);
        }
    }

    private handleTwoInputSelection(selectionData: Date[]) {
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
        if (this.startInput && !this.endInput || !this.startInput && this.endInput) {
            // TODO: better error message
            throw new Error('You must apply both igxDateRangeStart and igxDateRangeEnd if you are using two input elements.');
        }
    }
}
