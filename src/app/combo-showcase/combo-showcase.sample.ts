import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxButtonGroupComponent,
    IgxComboAddItemDirective,
    IgxComboComponent,
    IgxComboFooterDirective,
    IgxComboHeaderDirective,
    IgxHintDirective,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSimpleComboComponent,
    IgxSwitchComponent,
    SortingDirection,
} from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';
import { defineComponents, IgcComboComponent } from "igniteui-webcomponents";
import { PropertyPanelConfig, PropertyChangeService, Properties } from '../properties-panel/property-change.service';

defineComponents(IgcComboComponent);

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'combo-showcase-sample',
    templateUrl: './combo-showcase.sample.html',
    styleUrls: ['combo-showcase.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [
        IgxInputGroupComponent,
        IgxInputDirective,
        FormsModule,
        IgxSimpleComboComponent,
        IgxLabelDirective,
        IgxHintDirective,
        IgxComboComponent,
        IgxComboHeaderDirective,
        IgxComboFooterDirective,
        IgxComboAddItemDirective,
        IgxPrefixDirective,
        IgxIconComponent,
        IgxSwitchComponent,
        IgxButtonGroupComponent,
        SizeSelectorComponent,
    ]
})
export class ComboShowcaseSampleComponent {
    protected items: any[] = [];
    public valueKeyVar = 'field';

    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
            }
        },
        placeholderSearch: {
            label: 'Search Placeholder',
            control: {
                type: 'text',
                defaultValue: 'Enter a Search Term'
            }
        },
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
        groupSorting: {
            label: 'Group Sorting Direction',
            control: {
                type: 'button-group',
                options: ['asc', 'desc', 'none'],
                defaultValue: 'asc'
            }
        },
        caseSensitiveIcon: {
            label: 'Case Sensitive Icon',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        disableFiltering: {
            label: 'Disable Filtering',
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
    }

    public properties: Properties;

    constructor(
        private propertyChangeService: PropertyChangeService) {
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
            Mountain: ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
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

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    protected get groupSortingAngular() {
        const sortingValue = this.propertyChangeService.getProperty('groupSorting');

        switch (sortingValue) {
            case 'asc':
                return SortingDirection.Asc;
            case 'desc':
                return SortingDirection.Desc;
            case 'none':
                return SortingDirection.None;
            default:
                return SortingDirection.Asc;
        }
    }

    protected get filteringOptions() {
        return {
            caseSensitive: this.properties.caseSensitiveIcon
        };
    }
}
