import { NgTemplateOutlet } from '@angular/common';
import {
    Component,
    ViewChild,
    Output, EventEmitter,
    HostListener,
    HostBinding
} from '@angular/core';
import { IBaseEventArgs } from '../../core/utils';
import { PickerInteractionMode } from '../../date-common/types';
import { IgxButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxPickerActionsDirective } from '../picker-icons.common';
import { IgxCalendarComponent } from 'igniteui-angular/calendar';
import { IgxDividerDirective } from 'igniteui-angular/directives';
import { CustomDateRange, DateRange } from '../../date-range-picker/date-range-picker-inputs.common';
import { IDateRangePickerResourceStrings } from '../../core/i18n/date-range-picker-resources';
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
        IgxDividerDirective,
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
    public onEscape(event) {
        event.preventDefault();
        this.calendarClose.emit();
    }

    public get isReadonly() {
        return this.mode === PickerInteractionMode.Dialog;
    }
}

/** @hidden */

