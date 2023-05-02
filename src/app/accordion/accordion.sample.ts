import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IGX_ACCORDION_DIRECTIVES, IgxAccordionComponent, IgxButtonDirective, IgxSwitchComponent, slideInLeft, slideOutRight } from 'igniteui-angular';

@Component({
    selector: 'app-accordion-sample',
    templateUrl: 'accordion.sample.html',
    styleUrls: ['accordion.sample.scss'],
    standalone: true,
    imports: [IgxSwitchComponent, FormsModule, IgxButtonDirective, IGX_ACCORDION_DIRECTIVES]
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
