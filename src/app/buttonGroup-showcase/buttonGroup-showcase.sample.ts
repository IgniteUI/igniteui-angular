import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import { ButtonGroupAlignment, IgxButtonDirective, IgxButtonGroupComponent, IgxIconComponent, IgxLayoutDirective } from 'igniteui-angular';
import { defineComponents, IgcButtonGroupComponent, IgcToggleButtonComponent } from "igniteui-webcomponents";
import { PropertyPanelConfig } from '../properties-panel/properties-panel.component';
import { PropertyChangeService } from '../properties-panel/property-change.service';

defineComponents(IgcButtonGroupComponent, IgcToggleButtonComponent);
interface IButton {
    ripple?: string;
    label?: string;
    disabled?: boolean;
    togglable?: boolean;
    selected?: boolean;
    color?: string;
    bgcolor?: string;
    icon?: string;
}

class Button {
    public ripple: string;
    public label: string;
    public disabled: boolean;
    public togglable: boolean;
    public selected: boolean;
    public color: string;
    public bgcolor: string;
    public icon: string;

    constructor(obj?: IButton) {
        this.ripple = obj.ripple || 'gray';
        this.label = obj.label;
        this.selected = obj.selected || false;
        this.togglable = obj.togglable;
        this.disabled = obj.disabled || false;
        this.color = obj.color;
        this.bgcolor = obj.bgcolor;
        this.icon = obj.icon;
    }
}

@Component({
    selector: 'app-buttongroup-showcase-sample',
    templateUrl: 'buttonGroup-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxButtonDirective, IgxIconComponent, NgFor, IgxLayoutDirective]
})

export class ButtonGroupShowcaseSampleComponent implements OnInit {
    public cities = [];

    public ngOnInit(): void {
        this.cities = [
            {
                disabled: false,
                label: 'Sofia',
                selected: true,
                togglable: false
            },
            {
                disabled: false,
                label: 'London',
                selected: false
            },
            {
                disabled: false,
                label: 'New York',
                selected: false
            },
            {
                disabled: true,
                label: 'Tokyo',
                selected: false
            }
        ];

        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    public panelConfig: PropertyPanelConfig = {
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
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
                options: ['single', 'single-required', 'multiple'],
                defaultValue: 'single'
            }
        }
    }

    constructor(protected propertyChangeService: PropertyChangeService) {}

    private selectionMapping: { [key: string]: { angular: string; webComponent: string } } = {
        multiple: { angular: 'multi', webComponent: 'multiple' },
        singleRequired: { angular: 'singleRequired', webComponent: 'single-required' },

    };

    protected get angularSelection() {
        const selection = this.propertyChangeService.getProperty('selection') || 'multi';
        return this.selectionMapping[selection]?.angular || selection;
    }

    protected get webComponentSelection() {
        const selection = this.propertyChangeService.getProperty('selection') || 'multiple';
        return this.selectionMapping[selection]?.webComponent || selection;
    }

    protected get disabled() {
        return this.propertyChangeService.getProperty('disabled')
    }

    protected get alignment() {
        return this.propertyChangeService.getProperty('alignment')
    }
}
