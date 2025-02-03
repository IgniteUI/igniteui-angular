import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import {
    IgxCheckboxComponent,
    IgxSwitchComponent,
    IgxRadioComponent,
    RadioGroupAlignment,
    IgxRadioGroupDirective,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcCheckboxComponent,
    IgcSwitchComponent,
    IgcRadioComponent,
    IgcRadioGroupComponent,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(
    IgcCheckboxComponent,
    IgcSwitchComponent,
    IgcRadioComponent,
    IgcRadioGroupComponent
);

@Component({
    selector: 'app-input-controls-sample',
    styleUrls: ['input-controls.sample.scss'],
    templateUrl: 'input-controls.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        IgxCheckboxComponent,
        IgxSwitchComponent,
        IgxRadioComponent,
        IgxRadioGroupDirective
    ]
})
export class InputControlsSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        indeterminate: {
            label: 'Indeterminate Checkbox',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        required: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        invalid: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        checked: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        labelPosition: {
            label: 'Label Position',
            control: {
                type: 'button-group',
                options: ['before', 'after'],
                defaultValue: 'after'
            }
        },
        alignment: {
            label: 'Radio Group Alignment',
            control: {
                type: 'button-group',
                options: ['vertical', 'horizontal'],
                defaultValue: 'vertical'
            }
        },
        name: {
            control: {
                type: 'text'
            }
        },
        value: {
            control: {
                type: 'text'
            }
        },
    };

    public properties: Properties;

    constructor(
        private propertyChangeService: PropertyChangeService,
        private destroyRef: DestroyRef
    ) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const { unsubscribe } =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                }
            );

        this.destroyRef.onDestroy(() => unsubscribe);
    }

    private alignmentMap = new Map<string, RadioGroupAlignment>([
        ['vertical', RadioGroupAlignment.vertical],
        ['horizontal', RadioGroupAlignment.horizontal],
    ]);

    public get alignment(): RadioGroupAlignment {
        const alignment = this.propertyChangeService.getProperty('alignment');
        return this.alignmentMap.get(alignment) || RadioGroupAlignment.vertical;
    }
}
