import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject, viewChild } from '@angular/core';

import { SAMPLE_DATA } from '../shared/sample-data';
import { GridSelectionMode, IChangeCheckboxEventArgs, IgxGridComponent, IgxSwitchComponent, IGX_BUTTON_GROUP_DIRECTIVES, IGX_GRID_DIRECTIVES } from 'igniteui-angular';
import { PropertyChangeService } from '../properties-panel/property-change.service';

interface NamedOption<T> {
    label: string;
    value: T;
}

@Component({
    providers: [],
    selector: 'app-grid-column-moving-sample',
    styleUrls: ['grid-auto-size.sample.scss'],
    templateUrl: 'grid-auto-size.sample.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IGX_GRID_DIRECTIVES, IGX_BUTTON_GROUP_DIRECTIVES, IgxSwitchComponent]
})
export class GridAutoSizeSampleComponent implements AfterViewInit {
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;
    private readonly customControlsTemplate = viewChild.required<TemplateRef<any>>('customControls');
    private readonly propertyChangeService = inject(PropertyChangeService);

    public data: Array<any>;
    public columns: Array<any> = [
        { field: 'ID', width: 'auto', resizable: true, sortable: false, filterable: true, groupable: true, summary: true, type: 'string' },
        { field: 'CompanyName', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string'},
        { field: 'ContactName', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
        { field: 'ContactTitle', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
        { field: 'Address', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
        { field: 'City', width: 'auto', resizable: true, sortable: false, filterable: false, groupable: true, summary: true, type: 'string' },
        { field: 'Region', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
        { field: 'PostalCode', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
        { field: 'Phone', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
        { field: 'Fax', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'string' },
        { field: 'Employees', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: false, type: 'number' },
        { field: 'DateCreated', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: false, type: 'date' },
        { field: 'Contract', width: 'auto', resizable: true, sortable: true, filterable: true, groupable: true, summary: true, type: 'boolean' }
    ];
    public height = '100%';
    public gridContainerHidden = false;
    public containerHeight: string = null;
    public containerDisplay: 'block' | 'contents' = 'block';
    public selectionMode = GridSelectionMode.multiple;

    protected readonly containerDisplayOptions: NamedOption<'block' | 'contents'>[] = [
        { label: 'Block', value: 'block' },
        { label: 'Contents', value: 'contents' }
    ];
    protected readonly containerHeightOptions: NamedOption<string>[] = [
        { label: 'Null', value: null },
        { label: '100%', value: '100%' },
        { label: '400px', value: '400px' }
    ];
    protected readonly gridHeightOptions: NamedOption<string>[] = [
        { label: 'Null', value: null },
        { label: '100%', value: '100%' },
        { label: '800px', value: '800px' }
    ];
    protected readonly dataOptions: NamedOption<number>[] = [
        { label: 'Large', value: undefined },
        { label: 'Small · 5', value: 5 },
        { label: 'Small · 3', value: 3 },
        { label: 'None', value: 0 }
    ];
    protected dataSelection = -1;

    public ngAfterViewInit(): void {
        this.grid1.moving = true;
        this.propertyChangeService.setCustomControls(this.customControlsTemplate());
        this.propertyChangeService.setPanelTitle('Grid Auto Size');
    }

    protected setContainerDisplay(target: HTMLElement, mode: 'block' | 'contents'): void {
        this.containerDisplay = mode;
        target.style.display = mode;
    }

    protected onContainerVisibilityChange(event: IChangeCheckboxEventArgs): void {
        this.gridContainerHidden = event.checked;
    }

    protected onDataSelectionChange(index: number): void {
        this.dataSelection = index;
        this.setData(this.dataOptions[index].value);
    }

    public checkCols(): void {
        const columns = this.grid1.columns;
        columns.forEach(c => console.log(c.width));
    }

    public setData(count?): void {
        this.data = SAMPLE_DATA.slice(0, count);
    }
}
