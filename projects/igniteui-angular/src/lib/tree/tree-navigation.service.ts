import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode } from './common';

@Injectable()
export class IgxTreeNavigationService {
    public _activeNode: IgxTreeNode<any> = {} as IgxTreeNode<any>;
    public lastActiveNode: IgxTreeNode<any> = {} as IgxTreeNode<any>;
    protected pendingNavigation = false;
    private tree: IgxTree;

    public get activeNode() {
        return this._activeNode;
    }

    public set activeNode(value: IgxTreeNode<any>) {
        this.lastActiveNode = this._activeNode;
        this._activeNode = value;
    }

    public register(tree: IgxTree) {
        this.tree = tree;
    }

    public isActiveNode(node: IgxTreeNode<any>): boolean {
        return this._activeNode === node;
    }

    // protected getNextPosition(rowIndex: number, colIndex: number, key: string, shift: boolean, ctrl: boolean, event: KeyboardEvent) {
    //     if (!this.isDataRow(rowIndex, true) && (key.indexOf('down') < 0 || key.indexOf('up') < 0) && ctrl) {
    //         return { rowIndex, colIndex };
    //     }
    //     switch (key) {
    //         case 'pagedown':
    //         case 'pageup':
    //             event.preventDefault();
    //             if (key === 'pagedown') {
    //                 this.grid.verticalScrollContainer.scrollNextPage();
    //             } else {
    //                 this.grid.verticalScrollContainer.scrollPrevPage();
    //             }
    //             const editCell = this.grid.crudService.cell;
    //             this.grid.verticalScrollContainer.onChunkLoad
    //                 .pipe(first()).subscribe(() => {
    //                     if (editCell && this.grid.rowList.map(r => r.index).indexOf(editCell.rowIndex) < 0) {
    //                         this.grid.tbody.nativeElement.focus({ preventScroll: true });
    //                     }
    //                 });
    //             break;
    //         case 'tab':
    //             this.handleEditing(shift, event);
    //             break;
    //         case 'end':
    //             rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row;
    //             colIndex = this.lastColumnIndex;
    //             break;
    //         case 'home':
    //             rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row;
    //             colIndex = 0;
    //             break;
    //         case 'arrowleft':
    //         case 'left':
    //             colIndex = ctrl ? 0 : this.activeNode.column - 1;
    //             break;
    //         case 'arrowright':
    //         case 'right':
    //             colIndex = ctrl ? this.lastColumnIndex : this.activeNode.column + 1;
    //             break;
    //         case 'arrowup':
    //         case 'up':
    //             if (ctrl && !this.isDataRow(rowIndex) || (this.grid.rowEditable && this.grid.crudService.rowEditingBlocked)) {
    //                 break;
    //             }
    //             colIndex = this.activeNode.column !== undefined ? this.activeNode.column : 0;
    //             rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row - 1;
    //             break;
    //         case 'arrowdown':
    //         case 'down':
    //             if ((ctrl && !this.isDataRow(rowIndex)) || (this.grid.rowEditable && this.grid.crudService.rowEditingBlocked)) {
    //                 break;
    //             }
    //             colIndex = this.activeNode.column !== undefined ? this.activeNode.column : 0;
    //             rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row + 1;
    //             break;
    //         case 'enter':
    //         case 'f2':
    //             const cell = this.grid.getCellByColumnVisibleIndex(this.activeNode.row, this.activeNode.column);
    //             if (!this.isDataRow(rowIndex) || !cell.editable) {
    //                 break;
    //             }
    //             this.grid.crudService.enterEditMode(cell, event);
    //             break;
    //         case 'escape':
    //         case 'esc':
    //             if (!this.isDataRow(rowIndex)) {
    //                 break;
    //             }

    //             if (this.grid.crudService.isInCompositionMode) {
    //                 return;
    //             }

    //             if (this.grid.crudService.cellInEditMode || this.grid.crudService.rowInEditMode) {
    //                 this.grid.endEdit(false, event);
    //                 if (isEdge()) {
    //                     this.grid.cdr.detectChanges();
    //                 }
    //                 this.grid.tbody.nativeElement.focus();
    //             }
    //             break;
    //         case ' ':
    //         case 'spacebar':
    //         case 'space':
    //             const rowObj = this.grid.getRowByIndex(this.activeNode.row);
    //             if (this.grid.isRowSelectable && rowObj) {
    //                 if (this.isDataRow(rowIndex)) {
    //                     if (rowObj.selected) {
    //                         this.grid.selectionService.deselectRow(rowObj.rowID, event);
    //                     } else {
    //                         this.grid.selectionService.selectRowById(rowObj.rowID, false, event);
    //                     }
    //                 }
    //                 if (this.isGroupRow(rowIndex)) {
    //                     ((rowObj as any) as IgxGridGroupByRowComponent).onGroupSelectorClick(event);
    //                 }
    //             }
    //             break;
    //         default:
    //             return;
    //     }
    //     return { rowIndex, colIndex };
    // }
}
