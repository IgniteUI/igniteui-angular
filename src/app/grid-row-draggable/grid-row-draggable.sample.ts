import { AfterViewInit, ChangeDetectorRef, Component, HostBinding, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs';

import { RemoteService } from '../shared/remote.service';
import { IgxButtonGroupComponent, IgxCellTemplateDirective, IgxColumnComponent, IgxGridComponent, IgxIconComponent, IgxSwitchComponent, IgxRowDragGhostDirective, IgxDragIndicatorIconDirective, IgxDropDirective } from 'igniteui-angular';
import { IgxRowDragDirective } from 'projects/igniteui-angular/src/lib/grids/row-drag.directive';


enum DragIcon {
    DEFAULT = 'drag_indicator',
    BLOCK = 'block',
    ALLOW = 'add'
}

@Component({
    selector: 'app-grid-row-draggable-sample',
    templateUrl: 'grid-row-draggable.sample.html',
    styleUrls: ['grid-row-draggable.sample.scss'],
    providers: [RemoteService],
    imports: [IgxButtonGroupComponent, IgxSwitchComponent, FormsModule, IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective, IgxIconComponent, IgxRowDragDirective, IgxRowDragGhostDirective, IgxDropDirective, IgxDragIndicatorIconDirective, AsyncPipe]
})
export class GridRowDraggableComponent implements AfterViewInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    private grid1: IgxGridComponent;
    @ViewChild('grid2', { read: IgxGridComponent, static: true })
    private grid2: IgxGridComponent;

    public remote: Observable<any[]>;
    public newData = [];
    public dragdrop = true;
    public size = 'large';
    public sizes;

    constructor(private remoteService: RemoteService, private cdr: ChangeDetectorRef) {
        this.remoteService.urlBuilder = () => this.remoteService.url;

        this.sizes = [
            { label: 'small', selected: this.size === 'small', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'large', selected: this.size === 'large', togglable: true }
        ];
    }

    public ngAfterViewInit() {
        this.remote = this.remoteService.remoteData;
        this.remoteService.getData(this.grid1.data);
        this.cdr.detectChanges();
    }

    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
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
