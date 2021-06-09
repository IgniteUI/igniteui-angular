import { Component, ViewChild } from '@angular/core';
import { slideInLeft, slideOutRight } from 'igniteui-angular';
import { IgxAccordionExpansionMode } from 'projects/igniteui-angular/src/lib/accordion/accordion.common';
import { IgxAccordionComponent } from 'projects/igniteui-angular/src/lib/accordion/accordion.component';

@Component({
    selector: 'app-accordion-sample',
    templateUrl: 'accordion.sample.html',
    styleUrls: ['accordion.sample.scss']
})
export class AccordionSampleComponent {
    @ViewChild('accordion', { static: true }) public accordion: IgxAccordionComponent;
    public animationSettingsCustom = {
        closeAnimation: slideOutRight,
        openAnimation: slideInLeft
    };

    public changeExpMode() {
        if (this.accordion.expansionMode === IgxAccordionExpansionMode.Single) {
            this.accordion.expansionMode = IgxAccordionExpansionMode.Multiple;
        } else {
            this.accordion.expansionMode = IgxAccordionExpansionMode.Single;
        }
    }

    public panelExpanding(event) {
        console.log(event);
    }
    public panelExpanded(event) {
        console.log(event);
    }

    public contentExpanding(event) {
        // console.log('PANEL');
        // console.log(event);
    }
}
