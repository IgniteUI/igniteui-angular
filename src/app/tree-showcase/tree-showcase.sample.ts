import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { cloneDeep } from 'lodash-es';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';
import { IgxTreeComponent, IgxTreeNodeComponent, IgxTreeSelectionType } from 'igniteui-angular';
import { defineComponents, IgcTreeComponent, IgcTreeItemComponent } from 'igniteui-webcomponents';
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

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
export class TreeShowcaseSampleComponent implements OnInit {
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

    constructor(private cdr: ChangeDetectorRef, private propertyChangeService: PropertyChangeService) {
        this.data = cloneDeep(HIERARCHICAL_SAMPLE_DATA);
    }

    public angSelection = IgxTreeSelectionType.None;

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    private mapData(data: any[]) {
        data.forEach(x => {
            x.selected = false;
            if (x.ChildCompanies?.length) {
                this.mapData(x.ChildCompanies);
            }
        });
    }

    protected get size(){
        return this.propertyChangeService.getProperty('size');
    }

    protected get singleBranchExpand() {
        return this.propertyChangeService.getProperty('singleBranchExpand');
    }

    protected get toggleNodeOnClick() {
        return this.propertyChangeService.getProperty('toggleNodeOnClick');
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

    protected get selectionWC() {
        return this.propertyChangeService.getProperty('selection');
    }
}
