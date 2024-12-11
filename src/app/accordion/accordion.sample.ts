import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IGX_ACCORDION_DIRECTIVES } from 'igniteui-angular';
import { IgcAccordionComponent, IgcExpansionPanelComponent, defineComponents } from 'igniteui-webcomponents';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcAccordionComponent, IgcExpansionPanelComponent);

@Component({
    selector: 'app-accordion-sample',
    templateUrl: 'accordion.sample.html',
    styleUrls: ['accordion.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [FormsModule, IGX_ACCORDION_DIRECTIVES]
})
export class AccordionSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        singleExpand: {
            label: 'Single Branch Expand',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
    }

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }
}
