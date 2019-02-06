import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { IgxCalendarComponent } from '../calendar';
import { DatePickerInteractionMode } from 'igniteui-angular';

@Component({
    selector: 'igx-calendar-container',
    templateUrl: 'calendar-container.component.html'
})
export class IgxCalendarContainerComponent {
    @ViewChild('calendar')
    public calendar: IgxCalendarComponent;

    @Input()
    public mode = DatePickerInteractionMode.READONLY;

    @Input()
    public vertical = false;

    @Input()
    public cancelButtonLabel: string;

    @Input()
    public todayButtonLabel: string;

    @Output()
    public onClose = new EventEmitter();

    @Output()
    public onTodaySelection = new EventEmitter();

    public closeCalendar() {
        this.onClose.emit();
    }

    public triggerTodaySelection() {
        this.onTodaySelection.emit();
    }
}
