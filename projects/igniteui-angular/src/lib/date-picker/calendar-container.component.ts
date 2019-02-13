import { Component, ViewChild, Input, Output, EventEmitter, HostListener, HostBinding } from '@angular/core';
import { DatePickerInteractionMode, IgxCalendarComponent } from 'igniteui-angular';

@Component({
    selector: 'igx-calendar-container',
    styles: [':host {display: block;}'],
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

    @HostBinding('class.igx-date-picker')
    public styleClass = 'igx-date-picker';

    @HostBinding('class.igx-date-picker--dropdown')
    get dropdownCSS(): boolean {
        return this.mode === DatePickerInteractionMode.EDITABLE;
    }

    @HostBinding('class.igx-date-picker--vertical')
    get verticalCSS(): boolean {
        return this.vertical && this.mode === DatePickerInteractionMode.READONLY;
    }

    @HostListener('keydown.esc', ['$event'])
    @HostListener('keydown.alt.arrowup', ['$event'])
    public onSpaceClick(event) {
        event.preventDefault();
        this.onClose.emit();
    }

    public closeCalendar() {
        this.onClose.emit();
    }

    public triggerTodaySelection() {
        this.onTodaySelection.emit();
    }
}
