import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import {
    IgxHierarchicalGridComponent
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';
import { HierarchicalRemoteService } from './hierarchical-remote.service';
import { debounceTime } from 'rxjs/operators';
import { IgxRowIslandComponent } from '../../../projects/igniteui-angular/src/lib/grids/hierarchical-grid/row-island.component';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxHierarchicalGridComponent as IgxHierarchicalGridComponent_1 } from '../../../projects/igniteui-angular/src/lib/grids/hierarchical-grid/hierarchical-grid.component';
import { NgIf } from '@angular/common';
import { IgxCellTemplateDirective } from '../../../projects/igniteui-angular/src/lib/grids/columns/templates.directive';

@Component({
    selector: 'app-hierarchical-grid-remote-virtualization-sample',
    templateUrl: 'hierarchical-grid-remote-virtualization.html',
    styleUrls: ['hierarchical-grid-remote-virtualization.scss'],
    providers: [RemoteService],
    standalone: true,
    imports: [IgxCellTemplateDirective, NgIf, IgxHierarchicalGridComponent_1, IgxColumnComponent, IgxRowIslandComponent]
})
export class HierarchicalGridRemoteVirtualizationComponent implements AfterViewInit {
    @ViewChild('hGrid', { static: true })
    private hGrid: IgxHierarchicalGridComponent;

    public selectionMode;
    public remoteData = [];
    public gridData = [];
    public totalCount: number;

    public isExpanding = false;

    constructor(private remoteService: HierarchicalRemoteService, private cdr: ChangeDetectorRef) {
        remoteService.url = 'https://services.odata.org/V4/Northwind/Northwind.svc/Customers?$expand=Orders';
    }

    public handleLoad(args) {
        this.remoteService.getData(args, this.hGrid, (data) => {
            this.gridData = data;
            this.cdr.detectChanges();
        });
    }

    public ngAfterViewInit() {
        // load initial data
        this.handleLoad(this.hGrid.virtualizationState);

        // update when row is expanded/collapsed
        this.hGrid.expansionStatesChange.subscribe(() => this.handleLoad(this.hGrid.virtualizationState));

        // update on scroll
        this.hGrid.dataPreLoad.pipe().subscribe(() => {
            const data = this.remoteService.getDataFromCache(this.hGrid.virtualizationState);
            if (data) {
                this.gridData = data;
            }
        });

        // handle remote request after user stops scrolling for 500ms
        this.hGrid.dataPreLoad.pipe(debounceTime(500)).subscribe((event) => {
            this.handleLoad(event);
        });
    }
}
