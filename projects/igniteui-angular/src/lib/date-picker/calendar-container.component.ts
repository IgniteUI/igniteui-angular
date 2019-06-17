import { Component, ViewChild, Input, Output, EventEmitter, HostListener, HostBinding } from '@angular/core';
import { IgxCalendarComponent } from '../calendar';
import { InteractionMode } from '../core/enums';
import { IgxDatePickerActionsDirective } from './date-picker.directives';

/**
 * @hidden
 */
@Component({
    selector: 'igx-calendar-container',
    styles: [':host {display: block;}'],
    templateUrl: 'calendar-container.component.html'
})
export class IgxCalendarContainerComponent {
    @ViewChild('calendar', { static: true })
    public calendar: IgxCalendarComponent;

    @Input()
    public mode: InteractionMode = InteractionMode.Dialog;

    @Input()
    public vertical = false;

    @Input()
    public cancelButtonLabel: string;

    @Input()
    public todayButtonLabel: string;

    @Input()
    public datePickerActions: IgxDatePickerActionsDirective;

    @Output()
    public onClose = new EventEmitter();

    @Output()
    public onTodaySelection = new EventEmitter();

    @HostBinding('class.igx-date-picker')
    public styleClass = 'igx-date-picker';

    @HostBinding('class.igx-date-picker--dropdown')
    get dropdownCSS(): boolean {
        return this.mode === InteractionMode.DropDown;
    }

    @HostBinding('class.igx-date-picker--vertical')
    get verticalCSS(): boolean {
        return this.vertical && this.mode === InteractionMode.Dialog;
    }

    @HostListener('keydown.esc', ['$event'])
    @HostListener('keydown.alt.arrowup', ['$event'])
    public onEscape(event) {
        event.preventDefault();
        this.onClose.emit();
    }

    /**
     * Returns whether the date-picker is in readonly dialog mode.
     *
     * @hidden
    */
    public get isReadonly() {
        return this.mode === InteractionMode.Dialog;
    }

    /**
     * Emits close event for the calendar.
     */
    public closeCalendar() {
        this.onClose.emit();
    }

    /**
    * Emits today selection event for the calendar.
    */
    public triggerTodaySelection() {
        this.onTodaySelection.emit();
    }
}
