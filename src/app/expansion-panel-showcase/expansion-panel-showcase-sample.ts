import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { IgxExpansionPanelBodyComponent, IgxExpansionPanelComponent, IgxExpansionPanelDescriptionDirective, IgxExpansionPanelHeaderComponent, IgxExpansionPanelIconDirective, IgxExpansionPanelTitleDirective } from 'igniteui-angular';
import { PropertyPanelConfig } from '../properties-panel/properties-panel.component';
import { PropertyChangeService } from '../properties-panel/property-change.service';
import { defineComponents, IgcExpansionPanelComponent} from "igniteui-webcomponents";

defineComponents(IgcExpansionPanelComponent);

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'expansion-panel-showcase-sample',
    templateUrl: './expansion-panel-showcase-sample.html',
    styleUrls: ['expansion-panel-showcase-sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent, IgxExpansionPanelTitleDirective, IgxExpansionPanelDescriptionDirective, NgIf, IgxExpansionPanelIconDirective, IgxExpansionPanelBodyComponent]
})
export class ExpansionPanelShowcaseSampleComponent implements OnInit {
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

    constructor(public propertyChangeService: PropertyChangeService) {}

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    protected get open(){
        return this.propertyChangeService.getProperty('open');
    }

    protected get disabled(){
        return this.propertyChangeService.getProperty('disabled');
    }

    private indicatorPositionMap = {
        start: 'left',
        end: 'right'
    };

    protected get indicatorPositionWC(){
        return this.propertyChangeService.getProperty('indicatorPosition');
    }

    protected get indicatorPositionAngular(){
        const position = this.propertyChangeService.getProperty('indicatorPosition');
        return this.indicatorPositionMap[position];
    }
}
