import {
  Component,
  inject,
  ViewContainerRef,
} from '@angular/core';
import { IgxButtonDirective } from 'igniteui-angular';
import { RadioGroupComponent } from 'igniteui-angular/src/lib/radio/radio-group.component';

@Component({
    selector: 'app-radio-sample',
    styleUrls: ['radio.sample.scss'],
    templateUrl: 'radio.sample.html',
    imports: [IgxButtonDirective]
})
export class RadioSampleComponent {
    private viewContainerRef = inject(ViewContainerRef);

    public createRadioGroupComponent() {
        this.viewContainerRef.clear();

        const componentRef = this.viewContainerRef.createComponent(RadioGroupComponent);
        const radioGroup = componentRef.instance as RadioGroupComponent;

        radioGroup.value = 1;
        radioGroup.required = true;

        radioGroup.radios = [
          { value: 1, label: 'Radio 1' },
          { value: 2, label: 'Radio 2' },
          { value: 3, label: 'Radio 3' },
        ];
    }
}
