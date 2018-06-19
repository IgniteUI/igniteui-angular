import { Component, ViewChild, AfterContentInit } from '@angular/core';
import { IgxRadioGroupDirective } from 'igniteui-angular';

@Component({
    selector: 'app-radio-sample',
    styleUrls: ['radio.sample.css'],
    templateUrl: 'radio.sample.html'
})
export class RadioSampleComponent implements AfterContentInit {
    @ViewChild('radioGroupZZ', { read: IgxRadioGroupDirective }) public radioGroup: IgxRadioGroupDirective;

    selectedValue: any;

    ngAfterContentInit(): void {
        setTimeout(() => this.selectedValue = this.radioGroup.value);
    }

    onBtnClick(evt) {
        this.radioGroup.value = "Baz";
    }

    onRadioChange(evt) {
        this.selectedValue = evt.value;
    }
}
