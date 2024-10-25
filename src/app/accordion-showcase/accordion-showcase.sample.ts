import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IGX_ACCORDION_DIRECTIVES } from 'igniteui-angular';
import { IgcAccordionComponent, IgcExpansionPanelComponent, defineComponents } from 'igniteui-webcomponents';

defineComponents(IgcAccordionComponent, IgcExpansionPanelComponent);

@Component({
    selector: 'app-accordion-showcase-sample',
    templateUrl: 'accordion-showcase.sample.html',
    styleUrls: ['accordion-showcase.sample.scss'],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [FormsModule, IGX_ACCORDION_DIRECTIVES]
})
export class AccordionShowcaseSampleComponent {}
