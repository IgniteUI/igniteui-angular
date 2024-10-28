import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { IgxButtonDirective, IgxButtonGroupComponent, IgxIconComponent, IgxLayoutDirective } from 'igniteui-angular';
import { defineComponents, IgcButtonGroupComponent, IgcToggleButtonComponent } from "igniteui-webcomponents";
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcButtonGroupComponent, IgcToggleButtonComponent);

@Component({
    selector: 'app-buttongroup-showcase-sample',
    templateUrl: 'buttonGroup-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxButtonDirective, IgxIconComponent, NgFor, IgxLayoutDirective]
})

export class ButtonGroupShowcaseSampleComponent {
    public cities = ['Sofia', 'London', 'New York', 'Tokyo'];
    private propertyChangeService = inject(PropertyChangeService);

    public panelConfig: PropertyPanelConfig = {
        alignment: {
            control: {
                type: 'button-group',
                options: ['horizontal', 'vertical'],
                defaultValue: 'horizontal'
            }
        },
        selection: {
            control: {
                type: 'select',
                options: ['single', 'singleRequired', 'multiple'],
                defaultValue: 'single'
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        }
    }

    constructor() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    private selectionMap = {
        single: 'single',
        multiple: 'multi',
        singleRequired: 'single-required'
    };

    protected get wcSelection() {
        return this.propertyChangeService.getProperty('selection');
    }

    public get angularSelection() {
        const selection = this.propertyChangeService.getProperty('selection');
        return this.selectionMap[selection];
    }

    protected get disabled() {
        return this.propertyChangeService.getProperty('disabled')
    }

    protected get alignment() {
        return this.propertyChangeService.getProperty('alignment')
    }
}
