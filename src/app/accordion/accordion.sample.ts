import { Component } from '@angular/core';
import { slideInLeft, slideOutRight } from 'igniteui-angular';

@Component({
    selector: 'app-accordion-sample',
    templateUrl: 'accordion.sample.html',
    styleUrls: ['accordion.sample.scss']
})
export class AccordionSampleComponent {
    public animationSettingsCustom = {
        closeAnimation: slideOutRight,
        openAnimation: slideInLeft
    };
}
