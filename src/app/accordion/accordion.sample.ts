import { Component, ViewChild } from '@angular/core';
import { IGX_ACCORDION_DIRECTIVES, IgxAccordionComponent, slideInLeft, slideOutRight } from 'igniteui-angular';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { FormsModule } from '@angular/forms';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';

@Component({
    selector: 'app-accordion-sample',
    templateUrl: 'accordion.sample.html',
    styleUrls: ['accordion.sample.scss'],
    standalone: true,
    imports: [IgxSwitchComponent, FormsModule, IgxButtonDirective, IgxAccordionComponent, IGX_ACCORDION_DIRECTIVES]
})
export class AccordionSampleComponent {
    @ViewChild('accordion', { static: true }) public accordion: IgxAccordionComponent;
    public animationSettingsCustom = {
        closeAnimation: slideOutRight,
        openAnimation: slideInLeft
    };

    public singleBranchExpand = false;

    public panelExpanding(event) {
        console.log(event);
    }
    public panelExpanded(event) {
        console.log(event);
    }
}
