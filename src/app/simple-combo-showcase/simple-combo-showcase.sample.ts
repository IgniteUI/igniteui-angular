import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    IGX_SIMPLE_COMBO_DIRECTIVES,
    IgxHintDirective,
    IgxLabelDirective,
} from 'igniteui-angular';
import { defineComponents, IgcComboComponent } from 'igniteui-webcomponents';
import { PropertyPanelConfig, PropertyChangeService, Properties } from '../properties-panel/property-change.service';

defineComponents(IgcComboComponent);

@Component({
    selector: 'simple-combo-showcase-sample',
    templateUrl: './simple-combo-showcase.sample.html',
    styleUrls: ['simple-combo-showcase.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        IgxLabelDirective,
        IgxHintDirective,
        IGX_SIMPLE_COMBO_DIRECTIVES,
    ]
})
export class SimpleComboShowcaseSampleComponent {
    protected items: any[] = [];
    public valueKeyVar = 'field';
    public angularSimpleComboVal: any;

    public panelConfig: PropertyPanelConfig = {
        placeholder: {
            control: {
                type: 'text'
            }
        },
        name: {
            control: {
                type: 'text'
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
    }

    public properties: Properties;

    constructor(
        private propertyChangeService: PropertyChangeService,
        private destroyRef: DestroyRef) {
        const division = {
            'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
            'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
            'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
            'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
            'East North Central 01': ['Illinois', 'Indiana'],
            'West North Central 01': ['Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
            'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
            'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
            'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia'],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
            'Mountain': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
            'Pacific 01': ['Alaska', 'California'],
            'Pacific 02': ['Hawaii', 'Oregon', 'Washington']
        };

        const keys = Object.keys(division);

        for (const key of keys) {
            division[key].map((e) => {
                this.items.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
            });
        }

        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const propertyChange = this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });

        this.destroyRef.onDestroy(() => propertyChange.unsubscribe());
    }
}
