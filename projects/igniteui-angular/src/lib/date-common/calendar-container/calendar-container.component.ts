import { CommonModule } from '@angular/common';
import { NgModule, Component, ViewChild, Output, EventEmitter, HostListener, HostBinding } from '@angular/core';
import { IgxCalendarComponent, IgxCalendarModule } from '../../calendar/public_api';
import { IBaseEventArgs } from '../../core/utils';
import { PickerInteractionMode } from '../../date-common/types';
import { IgxButtonModule } from '../../directives/button/button.directive';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxPickerActionsDirective } from '../picker-icons.common';

/** @hidden */
@Component({
    selector: 'igx-calendar-container',
    styles: [':host {display: block;}'],
    templateUrl: 'calendar-container.component.html'
})
export class IgxCalendarContainerComponent {
    @ViewChild(IgxCalendarComponent, { static: true })
    public calendar: IgxCalendarComponent;

    @Output()
    public calendarClose = new EventEmitter<IBaseEventArgs>();

    @Output()
    public todaySelection = new EventEmitter<IBaseEventArgs>();

    @HostBinding('class.igx-date-picker')
    public styleClass = 'igx-date-picker';

    @HostBinding('class.igx-date-picker--dropdown')
    public get dropdownCSS(): boolean {
        return this.mode === PickerInteractionMode.DropDown;
    }

    @HostBinding('class.igx-date-picker--vertical')
    public get verticalCSS(): boolean {
        return this.vertical && this.mode === PickerInteractionMode.Dialog;
    }

    public vertical = false;
    public closeButtonLabel: string;
    public todayButtonLabel: string;
    public mode = PickerInteractionMode.DropDown;
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
@NgModule({
    declarations: [IgxCalendarContainerComponent],
    entryComponents: [IgxCalendarContainerComponent],
    imports: [
        CommonModule,
        IgxButtonModule,
        IgxRippleModule,
        IgxCalendarModule
    ],
    exports: [IgxCalendarContainerComponent]
})
export class IgxCalendarContainerModule { }
