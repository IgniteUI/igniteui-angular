import { Component, ViewChild } from '@angular/core';
import { IgxTimePickerComponent,
    IgxInputDirective,
    AutoPositionStrategy,
    OverlaySettings,
    DatePart } from 'igniteui-angular';
import { IgxSuffixDirective } from '../../../projects/igniteui-angular/src/lib/directives/suffix/suffix.directive';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxPrefixDirective } from '../../../projects/igniteui-angular/src/lib/directives/prefix/prefix.directive';
import { IgxPickerToggleComponent, IgxPickerClearComponent } from '../../../projects/igniteui-angular/src/lib/date-common/picker-icons.common';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxTimePickerActionsDirective } from '../../../projects/igniteui-angular/src/lib/time-picker/time-picker.directives';
import { IgxHintDirective } from '../../../projects/igniteui-angular/src/lib/directives/hint/hint.directive';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxTimePickerComponent as IgxTimePickerComponent_1 } from '../../../projects/igniteui-angular/src/lib/time-picker/time-picker.component';

@Component({
    selector: 'app-time-picker-sample',
    styleUrls: ['time-picker.sample.scss'],
    templateUrl: 'time-picker.sample.html',
    standalone: true,
    imports: [IgxTimePickerComponent_1, FormsModule, NgIf, IgxHintDirective, IgxTimePickerActionsDirective, IgxButtonDirective, IgxPickerToggleComponent, IgxPrefixDirective, IgxIconComponent, IgxPickerClearComponent, IgxSuffixDirective]
})
export class TimePickerSampleComponent {
    @ViewChild('tp', { read: IgxTimePickerComponent, static: true })
    public tp: IgxTimePickerComponent;

    @ViewChild('target')
    public target: IgxInputDirective;

    public itemsDelta = { hours: 1, minutes: 15, seconds: 20 };
    public format = 'hh:mm:ss tt';
    public spinLoop = true;
    public datePart = DatePart.Hours;

    public date = new Date(2018, 10, 27, 11, 45, 0, 0);
    public min = new Date(2018, 10, 27, 6, 30, 15, 0);
    public max = new Date(2018, 10, 27, 14, 20, 30, 0);
    public date1 = new Date(2018, 10, 27, 11, 45, 0, 0);
    public val = '08:30:00';
    public today = new Date(Date.now());

    public isRequired = true;

    public myOverlaySettings: OverlaySettings = {
        modal: false,
        closeOnOutsideClick: true,
        positionStrategy: new AutoPositionStrategy()
    };

    public change() {
        this.isRequired = !this.isRequired;
    }

    public valueChanged(event) {
        console.log(event);
    }

    public validationFailed(event) {
        console.log(event);
    }

    public showDate(date) {
        return date ? date.toLocaleString() : 'Value is null.';
    }

    public updateValue(event){
        this.val = event;
    }

    public selectCurrentTime(picker: IgxTimePickerComponent) {
        picker.value = new Date(Date.now());
        picker.close();
    }

    public increment() {
        this.tp.increment();
    }
    public decrement() {
        this.tp.decrement(DatePart.Minutes);
    }
}
