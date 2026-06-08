import { Component, ViewChild, OnInit, HostBinding } from '@angular/core';
import { IgxGridComponent, IgxColumnComponent, IFilteringExpressionsTree, GridSelectionMode, IgxButtonGroupComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent } from 'igniteui-angular';
import { GridESFLoadOnDemandService } from './grid-esf-load-on-demand.service';

@Component({
    selector: 'app-grid-esf-load-on-demand',
    templateUrl: './grid-esf-load-on-demand.component.html',
    styleUrls: ['./grid-esf-load-on-demand.component.scss'],
    imports: [IgxButtonGroupComponent, IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxColumnComponent]
})
export class GridEsfLoadOnDemandComponent implements OnInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    
    @ViewChild('grid1', { static: true })
    public grid1: IgxGridComponent;

    public data: Array<any>;
    public size = 'large';
    public sizes;
    public selectionMode;

    private esfService = new GridESFLoadOnDemandService();

    public columnValuesStrategy = (column: IgxColumnComponent,
                                    columnExprTree: IFilteringExpressionsTree,
                                    done: (uniqueValues: any[]) => void) => {
    this.esfService.getColumnData(column, columnExprTree, uniqueValues => done(uniqueValues));
    };

    public ngOnInit(): void {
        this.sizes = [
            { label: 'large', selected: this.size === 'large', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'small', selected: this.size === 'small', togglable: true }
        ];

        this.data = this.esfService.getRecordsData();
        this.selectionMode = GridSelectionMode.multiple;
    }

    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
    }
}
