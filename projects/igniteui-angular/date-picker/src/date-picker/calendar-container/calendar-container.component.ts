import { NgTemplateOutlet } from '@angular/common';
import {
    Component,
    ViewChild,
    Output,
    EventEmitter,
    HostListener,
    HostBinding
} from '@angular/core';
import { IgxButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxCalendarComponent } from 'igniteui-angular/calendar';
import { IgxDividerComponent } from 'igniteui-angular/directives';
import {
    IBaseEventArgs,
    DateRange,
    CustomDateRange,
    PickerInteractionMode,
    IDateRangePickerResourceStrings,
    IgxPickerActionsDirective
} from 'igniteui-angular/core';
import { IgxPredefinedRangesAreaComponent } from '../../date-range-picker/predefined-ranges/predefined-ranges-area.component';

/** @hidden */
@Component({
    selector: 'igx-calendar-container',
    styles: [':host {display: block;}'],
    templateUrl: 'calendar-container.component.html',
    imports: [
        IgxButtonDirective,
        IgxRippleDirective,
        IgxCalendarComponent,
        NgTemplateOutlet,
        IgxDividerComponent,
        IgxPredefinedRangesAreaComponent
    ]
})
export class IgxCalendarContainerComponent {
    @ViewChild(IgxCalendarComponent, { static: true })
    public calendar: IgxCalendarComponent;

    @Output()
    public calendarClose = new EventEmitter<IBaseEventArgs>();

    @Output()
    public calendarCancel = new EventEmitter<IBaseEventArgs>();

    @Output()
    public todaySelection = new EventEmitter<IBaseEventArgs>();

    @Output()
    public rangeSelected = new EventEmitter<DateRange>();


    @HostBinding('class.igx-date-picker')
    public styleClass = 'igx-date-picker';

    @HostBinding('class.igx-date-picker--dropdown')
    public get dropdownCSS(): boolean {
        return this.mode === PickerInteractionMode.DropDown;
    }

    public usePredefinedRanges = false;
    public customRanges: CustomDateRange[] = [];
    public resourceStrings!: IDateRangePickerResourceStrings;
    public vertical = false;
    public closeButtonLabel: string;
    public cancelButtonLabel: string;
    public todayButtonLabel: string;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public pickerActions: IgxPickerActionsDirective;

    @HostListener('keydown.alt.arrowup', ['$event'])
    public onEscape(event: KeyboardEvent) {
        event.preventDefault();
        this.calendarClose.emit();
    }

    public get isReadonly() {
        return this.mode === PickerInteractionMode.Dialog;
    }
}

/** @hidden */

