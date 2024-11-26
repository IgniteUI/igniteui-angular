import { Component, HostBinding } from '@angular/core';
import { ColumnType } from '../../common/grid.interface';
import { BaseFilteringComponent } from './base-filtering.component';
import { IgxIconComponent } from '../../../icon/icon.component';
import { IgxButtonDirective } from '../../../directives/button/button.directive';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { NgIf } from '@angular/common';

/**
 * A component used for presenting Excel style column moving UI.
 */
@Component({
    selector: 'igx-excel-style-moving',
    templateUrl: './excel-style-moving.component.html',
    imports: [NgIf, IgxButtonGroupComponent, IgxButtonDirective, IgxIconComponent]
})
export class IgxExcelStyleMovingComponent {
    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-excel-filter__move')
    public defaultClass = true;

    constructor(public esf: BaseFilteringComponent) { }

    private get visibleColumns() {
        return this.esf.grid.visibleColumns.filter(col => !col.columnGroup);
    }

    /**
     * @hidden @internal
     */
    public get canNotMoveLeft() {
        return this.esf.column.visibleIndex === 0 ||
            (this.esf.grid.unpinnedColumns.indexOf(this.esf.column) === 0 && this.esf.column.disablePinning) ||
            (this.esf.column.level !== 0 && !this.findColumn(0, this.visibleColumns));
    }

    /**
     * @hidden @internal
     */
    public get canNotMoveRight() {
        return this.esf.column.visibleIndex === this.visibleColumns.length - 1 ||
            (this.esf.column.level !== 0 && !this.findColumn(1, this.visibleColumns));
    }

    /**
     * @hidden @internal
     */
    public onMoveButtonClicked(moveDirection) {
        let targetColumn;
        if (this.esf.column.pinned) {
            if (this.esf.column.isLastPinned && moveDirection === 1 && this.esf.grid.isPinningToStart) {
                targetColumn = this.esf.grid.unpinnedColumns[0];
                moveDirection = 0;
            } else if (this.esf.column.isFirstPinned && moveDirection === 0 && !this.esf.grid.isPinningToStart) {
                targetColumn = this.esf.grid.unpinnedColumns[this.esf.grid.unpinnedColumns.length - 1];
                moveDirection = 1;
            } else {
                targetColumn = this.findColumn(moveDirection, this.esf.grid.pinnedColumns);
            }
        } else if (this.esf.grid.unpinnedColumns.indexOf(this.esf.column) === 0 && moveDirection === 0 &&
                    this.esf.grid.isPinningToStart) {
            targetColumn = this.esf.grid.pinnedColumns[this.esf.grid.pinnedColumns.length - 1];
            if (targetColumn.parent) {
                targetColumn = targetColumn.topLevelParent;
            }
            moveDirection = 1;
        } else if (this.esf.grid.unpinnedColumns.indexOf(this.esf.column) === this.esf.grid.unpinnedColumns.length - 1 &&
            moveDirection === 1 && !this.esf.grid.isPinningToStart) {
            targetColumn = this.esf.grid.pinnedColumns[0];
            moveDirection = 0;
        } else {
            targetColumn = this.findColumn(moveDirection, this.esf.grid.unpinnedColumns);
        }
        this.esf.grid.moveColumn(this.esf.column, targetColumn, moveDirection);
    }

    protected get esfSize(): string {
        const esf = this.esf as any;
        return esf.size;
    }

    private findColumn(moveDirection: number, columns: ColumnType[]) {
        let index = columns.indexOf(this.esf.column);
        if (moveDirection === 0) {
            while (index > 0) {
                index--;
                if (columns[index].level === this.esf.column.level && columns[index].parent === this.esf.column.parent) {
                    return columns[index];
                }
            }
            return columns[0];
        } else {
            while (index < columns.length - 1) {
                index++;
                if (columns[index].level === this.esf.column.level && columns[index].parent === this.esf.column.parent) {
                    return columns[index];
                }
            }
        }
    }
}
