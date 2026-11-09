import { NgTemplateOutlet } from '@angular/common';
import {
    Component,
    ViewChild,
    Output,
    EventEmitter,
    HostBinding,
    ChangeDetectionStrategy,
    inject
} from '@angular/core';
import { IgxButtonDirective, IgxButtonType, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxCalendarComponent } from 'igniteui-angular/calendar';
import { IgxDividerComponent } from 'igniteui-angular/directives';
import {
    IBaseEventArgs,
    DateRange,
    CustomDateRange,
    PickerInteractionMode,
    IDateRangePickerResourceStrings,
    IgxPickerActionsDirective,
    IgxKeyBindingsService,
    altKey,
    arrowUp
} from 'igniteui-angular/core';
import { IgxPredefinedRangesAreaComponent } from '../../date-range-picker/predefined-ranges/predefined-ranges-area.component';

/** @hidden */

@Component({
    selector: 'igx-calendar-container',
    styles: [':host {display: block;}'],
    templateUrl: 'calendar-container.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [IgxKeyBindingsService],
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
    private readonly _keyBindings = inject(IgxKeyBindingsService);

    @ViewChild(IgxCalendarComponent, { static: true })
    public calendar!: IgxCalendarComponent;

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

    @HostBinding('class.igx-date-picker--dialog')
    public get dialogCSS(): boolean {
        return this.mode === PickerInteractionMode.Dialog;
    }

    public usePredefinedRanges = false;
    public customRanges: CustomDateRange[] = [];
    public resourceStrings!: IDateRangePickerResourceStrings;
    public vertical = false;
    public closeButtonLabel!: string;
    public closeButtonType: IgxButtonType = 'flat';
    public cancelButtonLabel!: string;
    public cancelButtonType: IgxButtonType = 'flat';
    public todayButtonLabel!: string;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public pickerActions!: IgxPickerActionsDirective;

    constructor() {
        // Stop the event before it reaches IgxDatePickerComponent/IgxDateRangePickerComponent,
        // which also handle Alt+ArrowUp and would call close() a second time.
        this._keyBindings
            .configure({ skip: [] })
            .set([altKey, arrowUp], () => this.calendarClose.emit(), { stopPropagation: true });
    }

    public get isReadonly() {
        return this.mode === PickerInteractionMode.Dialog;
    }
}

/** @hidden */
