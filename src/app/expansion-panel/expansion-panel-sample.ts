import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxExpansionPanelBodyComponent, IgxExpansionPanelComponent, IgxExpansionPanelDescriptionDirective, IgxExpansionPanelHeaderComponent, IgxExpansionPanelTitleDirective } from 'igniteui-angular';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';
import { defineComponents, IgcExpansionPanelComponent} from "igniteui-webcomponents";

defineComponents(IgcExpansionPanelComponent);

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'expansion-panel-sample',
    templateUrl: './expansion-panel-sample.html',
    styleUrls: ['expansion-panel-sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent, IgxExpansionPanelTitleDirective, IgxExpansionPanelDescriptionDirective, IgxExpansionPanelBodyComponent]
})
export class ExpansionPanelSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        indicatorPosition: {
            label: 'Indicator Position',
            control: {
                type: 'radio-inline',
                options: ['start', 'end'],
                defaultValue: 'start'
            }
        },
        open: {
            control: {
                type: 'boolean'
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        }
    }

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    private indicatorPositionMap = {
        start: 'left',
        end: 'right'
    };

    protected get indicatorPositionAngular(){
        const position = this.propertyChangeService.getProperty('indicatorPosition');
        return this.indicatorPositionMap[position];
    }
}
