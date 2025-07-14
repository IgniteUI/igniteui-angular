import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject } from '@angular/core';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';
import {
    IGX_TREE_DIRECTIVES,
    IgxTreeSelectionType,
    IgSizeDirective,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcTreeComponent,
    IgcTreeItemComponent,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

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
    imports: [IGX_TREE_DIRECTIVES, IgSizeDirective],
})
export class TreeShowcaseSampleComponent {
    private propertyChangeService = inject(PropertyChangeService);
    private destroyRef = inject(DestroyRef);

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

    constructor() {
        this.data = structuredClone(HIERARCHICAL_SAMPLE_DATA);
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const propertyChange =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                }
            );

        this.destroyRef.onDestroy(() => propertyChange.unsubscribe());
    }

    public angSelection = IgxTreeSelectionType.None;

    private mapData(data: any[]) {
        data.forEach((x) => {
            x.selected = false;
            if (x.ChildCompanies?.length) {
                this.mapData(x.ChildCompanies);
            }
        });
    }

    private selectionMap = new Map<string, IgxTreeSelectionType>([
        ['none', IgxTreeSelectionType.None],
        ['multiple', IgxTreeSelectionType.BiState],
        ['cascade', IgxTreeSelectionType.Cascading]
    ]);

    protected get selectionAngular(): IgxTreeSelectionType {
        const selection = this.propertyChangeService.getProperty(
            'selection'
        ) as string;
        return this.selectionMap.get(selection) ?? IgxTreeSelectionType.None;
    }
}
