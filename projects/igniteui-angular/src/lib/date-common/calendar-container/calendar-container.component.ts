import { Component, ViewChild, Input, Output, EventEmitter, HostListener, HostBinding } from '@angular/core';
import { CalendarSelection, IgxCalendarComponent } from '../../calendar/public_api';
import { InteractionMode } from '../../core/enums';
import { IgxPickerActionsDirective } from '../../date-picker/date-picker.directives';

const RANGE_PICKER_BUTTONS_CLASS = 'igx-date-range-picker-buttons';
const DATE_PICKER_BUTTONS_CLASS = 'igx-date-picker__buttons';

/** @hidden */
@Component({
    selector: 'igx-calendar-container',
    styles: [':host {display: block;}'],
    templateUrl: 'calendar-container.component.html'
})
export class IgxCalendarContainerComponent {
    @ViewChild('calendar', { static: true })
    public calendar: IgxCalendarComponent;

    @Input()
    public mode = InteractionMode.DropDown;

    @Input()
    public vertical = false;

    @Input()
    public closeButtonLabel: string;

    @Input()
    public todayButtonLabel: string;

    @Input()
    public pickerActions: IgxPickerActionsDirective;

    @Input()
    public selectionMode: CalendarSelection;

    @Input()
    public displayMonthsCount: number;

    /** @hidden @internal */
    @Output()
    public calendarClose = new EventEmitter();

    /** @hidden @internal */
    @Output()
    public todaySelection = new EventEmitter();

    @HostBinding('class.igx-date-picker')
    public styleClass = 'igx-date-picker';

    @HostBinding('class.igx-date-picker--dropdown')
    public get dropdownCSS(): boolean {
        return this.mode === InteractionMode.DropDown;
    }

    @HostBinding('class.igx-date-picker--vertical')
    public get verticalCSS(): boolean {
        return this.vertical && this.mode === InteractionMode.Dialog;
    }

    @HostListener('keydown.esc', ['$event'])
    @HostListener('keydown.alt.arrowup', ['$event'])
    public onEscape(event) {
        event.preventDefault();
        this.emitCalendarClose();
    }

    public get buttonClass(): string {
        return this.selectionMode === 'range' ? RANGE_PICKER_BUTTONS_CLASS : DATE_PICKER_BUTTONS_CLASS;
    }

    /**  Returns whether the date-picker is in readonly dialog mode. */
    public get isReadonly() {
        return this.mode === InteractionMode.Dialog;
    }

    /** Emits close event for the calendar. */
    public emitCalendarClose() {
        this.calendarClose.emit();
    }

    /**  Emits today selection event for the calendar. */
    public selectToday() {
        this.todaySelection.emit();
    }
}
