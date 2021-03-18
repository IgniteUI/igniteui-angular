import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode } from './common';
import { NAVIGATION_KEYS } from '../core/utils';

@Injectable()
export class IgxTreeNavigationService {
    public _activeNode: IgxTreeNode<any> = {} as IgxTreeNode<any>;
    public _focusedNode: IgxTreeNode<any> = {} as IgxTreeNode<any>;
    protected pendingNavigation = false;
    private tree: IgxTree;
    private lastActiveNode: IgxTreeNode<any> = {} as IgxTreeNode<any>;
    private lastFocusedNode: IgxTreeNode<any> = {} as IgxTreeNode<any>;

    public get activeNode() {
        return this._activeNode;
    }

    public set activeNode(value: IgxTreeNode<any>) {
        this.lastActiveNode = this._activeNode;
        this._activeNode = value;
        if (this.lastActiveNode.id) {
            (this.lastActiveNode as any).cdr.markForCheck();
        }
    }

    public get focusedNode() {
        return this._focusedNode;
    }

    public set focusedNode(value: IgxTreeNode<any>) {
        //this.lastActiveNode = this._activeNode;
        //value.focus();
        this.lastFocusedNode = this._focusedNode;
        this._focusedNode = value;
        (this._focusedNode as any)?.cdr.markForCheck();
        if (this.lastFocusedNode?.id) {
            (this.lastFocusedNode as any).cdr.markForCheck();
        }
    }

    public handleFocusedAndActiveNode(node: IgxTreeNode<any>, isActive: boolean = true) {
        if (isActive) {
            this.activeNode = node;
        }
        this.focusedNode = node;
    }

    public register(tree: IgxTree) {
        this.tree = tree;
    }

    public isActiveNode(node: IgxTreeNode<any>): boolean {
        return this._activeNode === node;
    }

    public isFocusedNode(node: IgxTreeNode<any>): boolean {
        return this._focusedNode === node;
    }

    public handleNavigation(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        requestAnimationFrame(() => {
            console.log(document.activeElement);
        });
        if (key === 'tab') {
            return;
        }
        if (event.repeat && NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
        }
        if (event.repeat) {
            setTimeout(() => this.dispatchEvent(event), 1);
        } else {
            this.dispatchEvent(event);
        }
    }

    public dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.activeNode || !(NAVIGATION_KEYS.has(key))) {
            return;
        }
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
        // if (NAVIGATION_KEYS.has(key)) {
        //     event.preventDefault();
        //     return;
        // }

        // if (this.emitKeyDown(type, this.activeNode.row, event)) {
        //     return;
        // }
        // if (event.altKey) {
        //     this.handleAlt(key, event);
        //     return;
        // }
        // if ([' ', 'spacebar', 'space'].indexOf(key) === -1) {
        //     this.grid.selectionService.keyboardStateOnKeydown(this.activeNode, shift, shift && key === 'tab');
        // }
        this.getNextPosition(this.focusedNode, key, shift, ctrl, event);
        if (NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
            //this.activeNode = position;
        }
        //this.grid.cdr.detectChanges();
    }

    public focusNode(event: FocusEvent) {
        event.preventDefault();
        // const allTabbableElements = document.querySelectorAll(
        //     'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
        // );
        // const tabbableArr = Array.prototype.slice.call(allTabbableElements);
        // if ((this.tree as any).nativeElement.contains(event.relatedTarget)) {
        //     console.log((this.tree as any).nativeElement);
        //     //(this.tree as any).nativeElement.children[0].focus();
        //     requestAnimationFrame(() => {
        //         document.dispatchEvent(new KeyboardEvent('keydown', { code: '9', shiftKey: true }));
        //     });
        //     const index = tabbableArr.indexOf(event.currentTarget);
        //     const previousElement = tabbableArr[index - 1];
        //     //previousElement.focus();
        //     return;
        // }
        //(event.target as HTMLElement).blur();
        const visibleChildren: IgxTreeNode<any>[] = this.tree.nodes.filter(n => n.isFocusable);
        // === this.tree.nativeElement.parentElement
        if ((this.tree as any).nativeElement.parentElement.nextSibling.contains(event.relatedTarget)) {
            this.handleFocusedAndActiveNode(visibleChildren[visibleChildren.length - 1], false);
            //this.focusedNode = visibleChildren[visibleChildren.length - 1];
            //visibleChildren[visibleChildren.length - 1].focus();
            //((event.target as HTMLElement).children[(event.target as HTMLElement).children.length - 1] as HTMLElement).focus();
            //(visibleChildren[visibleChildren.length - 1] as any).cdr.detectChanges();
        }else {
            this.handleFocusedAndActiveNode(visibleChildren[0], false);
            //this.focusedNode = visibleChildren[0];
        }
        //this.focusedNode.focus();
    }

    protected getNextPosition(node: IgxTreeNode<any>, key: string, shift: boolean, ctrl: boolean, event: KeyboardEvent) {
        // if (!this.isDataRow(rowIndex, true) && (key.indexOf('down') < 0 || key.indexOf('up') < 0) && ctrl) {
        //     return { rowIndex, colIndex };
        // }
        switch (key) {
            // case 'end':
            //     rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row;
            //     colIndex = this.lastColumnIndex;
            //     break;
            // case 'home':
            //     rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row;
            //     colIndex = 0;
            //     break;
            // case 'arrowleft':
            // case 'left':
            //     colIndex = ctrl ? 0 : this.activeNode.column - 1;
            //     break;
            // case 'arrowright':
            // case 'right':
            //     colIndex = ctrl ? this.lastColumnIndex : this.activeNode.column + 1;
            //     break;
            case 'arrowup':
            case 'up':
                this.handleTab(true, event);
                break;
            case 'arrowdown':
            case 'down':
                this.handleTab(false, event);
                break;
            // case ' ':
            // case 'spacebar':
            // case 'space':
            //     const rowObj = this.grid.getRowByIndex(this.activeNode.row);
            //     if (this.grid.isRowSelectable && rowObj) {
            //         if (this.isDataRow(rowIndex)) {
            //             if (rowObj.selected) {
            //                 this.grid.selectionService.deselectRow(rowObj.rowID, event);
            //             } else {
            //                 this.grid.selectionService.selectRowById(rowObj.rowID, false, event);
            //             }
            //         }
            //         if (this.isGroupRow(rowIndex)) {
            //             ((rowObj as any) as IgxGridGroupByRowComponent).onGroupSelectorClick(event);
            //         }
            //     }
            //     break;
            default:
                return;
        }
        return node;
    }

    protected handleTab(shift: boolean, event: KeyboardEvent) {
        const next = shift ? this.tree.getPreviousNode(this.focusedNode) :
            this.tree.getNextNode(this.focusedNode);
        if (next === this.focusedNode) {
            return;
        }
        event.preventDefault();
        // if ((this.grid.rowInEditMode && this.grid.rowEditTabs.length) &&
        //     (this.activeNode.row !== next.rowIndex || this.isActiveNode(next.rowIndex, next.visibleColumnIndex))) {
        //     if (shift) {
        //         this.grid.rowEditTabs.last.element.nativeElement.focus();
        //     } else {
        //         this.grid.rowEditTabs.first.element.nativeElement.focus();
        //     }
        //     return;
        // }

        // if (this.grid.rowInEditMode && !this.grid.rowEditTabs.length) {
        //     if (shift && next.rowIndex === this.activeNode.row && next.visibleColumnIndex === this.activeNode.column) {
        //         next.visibleColumnIndex = this.grid.lastEditableColumnIndex;
        //     } else if (!shift && next.rowIndex === this.activeNode.row && next.visibleColumnIndex === this.activeNode.column) {
        //         next.visibleColumnIndex = this.grid.firstEditableColumnIndex;
        //     } else {
        //         next.rowIndex = this.activeNode.row;
        //     }
        // }

        // this.navigateInBody(next, (obj) => {
        //     obj.target.activate(event);
        //     //this.tree.cdr.detectChanges();
        // });

        this.handleFocusedAndActiveNode(next);
        //this.focusedNode = next;
    }

    // protected navigateInBody(next, cb: (arg: any) => void = null): void {
    //     if (this.isActiveNode(next)) {
    //         return;
    //     }
    //     this.grid.navigateTo(rowIndex, visibleColIndex, cb);
    // }
}
