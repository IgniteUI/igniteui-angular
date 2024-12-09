import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { cloneDeep } from 'lodash-es';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';
import { IgxTreeComponent, IgxTreeNodeComponent, IgxTreeSelectionType } from 'igniteui-angular';
import { defineComponents, IgcTreeComponent, IgcTreeItemComponent } from 'igniteui-webcomponents';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcTreeComponent, IgcTreeItemComponent);

interface CompanyData {
    ID: string;
    CompanyName?: string;
    ChildCompanies?: CompanyData[];
}

@Component({
    selector: 'app-tree-showcase-sample',
    templateUrl: 'tree-showcase.sample.html',
    styleUrls: ['tree-showcase.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [NgFor, NgIf, IgxTreeComponent, IgxTreeNodeComponent]
})
export class TreeShowcaseSampleComponent {
    public data: CompanyData[];
    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large']
            }
        },
        singleBranchExpand: {
            label: 'Single Branch Expand',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        toggleNodeOnClick: {
            label: 'Toggle Node on Click',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        selection: {
            control: {
                type: 'button-group',
                options: ['none', 'multiple', 'cascade'],
                defaultValue: 'none'
            }
        }
    }

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.data = cloneDeep(HIERARCHICAL_SAMPLE_DATA);
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    public angSelection = IgxTreeSelectionType.None;

    private mapData(data: any[]) {
        data.forEach(x => {
            x.selected = false;
            if (x.ChildCompanies?.length) {
                this.mapData(x.ChildCompanies);
            }
        });
    }

    private selectionMap = {
        none: IgxTreeSelectionType.None,
        multiple: IgxTreeSelectionType.BiState,
        cascade: IgxTreeSelectionType.Cascading
    };

    protected get selectionAngular() : IgxTreeSelectionType {
        const selection = this.propertyChangeService.getProperty('selection');
        return this.selectionMap[selection];
    }
}
