import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs';

import { RemoteService } from '../shared/remote.service';
import { IgxDropDirective } from '../../../projects/igniteui-angular/src/lib/directives/drag-drop/drag-drop.directive';
import { IgxRowDragDirective, IgxRowDragGhostDirective, IgxDragIndicatorIconDirective } from '../../../projects/igniteui-angular/src/lib/grids/row-drag.directive';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxCellTemplateDirective } from '../../../projects/igniteui-angular/src/lib/grids/columns/templates.directive';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';
import { DisplayDensity } from '../../../projects/igniteui-angular/src/lib/core/density';

enum DragIcon {
    DEFAULT = 'drag_indicator',
    BLOCK = 'block',
    ALLOW = 'add'
}

@Component({
    selector: 'app-grid-row-draggable-sample',
    templateUrl: 'grid-row-draggable.sample.html',
    styleUrls: ['grid-row-draggable.sample.scss'],
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxSwitchComponent, FormsModule, IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective, IgxIconComponent, IgxRowDragDirective, IgxRowDragGhostDirective, IgxDropDirective, IgxDragIndicatorIconDirective, AsyncPipe]
})
export class GridRowDraggableComponent implements AfterViewInit {

    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    private grid1: IgxGridComponent;
    @ViewChild('grid2', { read: IgxGridComponent, static: true })
    private grid2: IgxGridComponent;

    public remote: Observable<any[]>;
    public newData = [];
    public dragdrop = true;
    public density: DisplayDensity = 'comfortable';
    public displayDensities;

    constructor(private remoteService: RemoteService, private cdr: ChangeDetectorRef) {
        this.remoteService.urlBuilder = () => this.remoteService.url;

        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];
    }

    public ngAfterViewInit() {
        this.remote = this.remoteService.remoteData;
        this.remoteService.getData(this.grid1.data);
        this.cdr.detectChanges();
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public handleRowDrag() {

    }

    public handleRowDrop() {

    }

    public onDropAllowed(args) {
        args.cancel = true;
        this.grid2.addRow(args.dragData.data);
        this.grid1.deleteRow(args.dragData.key);
    }

    public onEnterAllowed(args) {
        this.changeGhostIcon(args.drag.ghostElement, DragIcon.ALLOW);
    }

    public onLeaveAllowed(args) {
        this.changeGhostIcon(args.drag.ghostElement, DragIcon.DEFAULT);
    }

    public onEnterBlocked(args) {
        this.changeGhostIcon(args.drag.ghostElement, DragIcon.BLOCK);
    }

    public onLeaveBlocked(args) {
        this.changeGhostIcon(args.drag.ghostElement, DragIcon.DEFAULT);
    }

    public onDropBlocked(args) {
        args.cancel = true;
    }

    private changeGhostIcon(ghost, icon: string) {
        if (ghost) {
            ghost.querySelector('igx-icon').innerHTML = icon;
        }
    }
}
