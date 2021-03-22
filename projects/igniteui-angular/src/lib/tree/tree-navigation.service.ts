import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode, IGX_TREE_SELECTION_TYPE } from './common';
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
        this.lastFocusedNode = this._focusedNode;
        this._focusedNode = value;
        (this._focusedNode as any)?.cdr.markForCheck();
        if (this.lastFocusedNode?.id) {
            (this.lastFocusedNode as any).cdr.markForCheck();
        }
        if ((this.focusedNode as any)?.header) {
            this.scrollIntoViewIfNeeded((this.focusedNode as any).header.nativeElement);
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

    public isFocusable(node: IgxTreeNode<any>): boolean {
        return Array.from((this.tree as any).nativeElement.getElementsByClassName('igx-tree-node'))
            .indexOf((node as any).nativeElement) < 0 ? false : true;
        // if (!node.parentNode) {
        //     return true;
        // }
        // if (!node.parentNode.expanded) {
        //     return false;
        // }
        // return this.isFocusable(node.parentNode);
    }

    public dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.focusedNode || !(NAVIGATION_KEYS.has(key) || key === '*' || key === 'enter')) {
            return;
        }
        // const shift = event.shiftKey;
        // const ctrl = event.ctrlKey;
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
        this.getNextPosition(this.focusedNode, key, event);
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
        // === this.tree.nativeElement.parentElement
        if ((this.tree as any).nativeElement.parentElement.nextSibling.contains(event.relatedTarget)) {
            const visibleChildren: IgxTreeNode<any>[] = this.tree.nodes.filter(n => this.isFocusable(n));
            this.handleFocusedAndActiveNode(visibleChildren[visibleChildren.length - 1], false);
            //this.focusedNode = visibleChildren[visibleChildren.length - 1];
            //visibleChildren[visibleChildren.length - 1].focus();
            //((event.target as HTMLElement).children[(event.target as HTMLElement).children.length - 1] as HTMLElement).focus();
            //(visibleChildren[visibleChildren.length - 1] as any).cdr.detectChanges();
        } else {
            this.handleFocusedAndActiveNode(this.tree.nodes.first, false);
            //this.focusedNode = visibleChildren[0];
        }
        //this.focusedNode.focus();
    }

    protected getNextPosition(node: IgxTreeNode<any>, key: string, event: KeyboardEvent) {
        const visibleChildren: IgxTreeNode<any>[] = this.tree.nodes.filter(n => this.isFocusable(n));
        switch (key) {
            case 'home':
                this.handleFocusedAndActiveNode(visibleChildren[0]);
                break;
            case 'end':
                this.handleFocusedAndActiveNode(visibleChildren[visibleChildren.length - 1]);
                break;
            case 'arrowleft':
            case 'left':
                this.handleArrowLeft();
                break;
            case 'arrowright':
            case 'right':
                this.handleArrowRight();
                break;
            case 'arrowup':
            case 'up':
                this.handleUpDownArrow(true, event);
                break;
            case 'arrowdown':
            case 'down':
                this.handleUpDownArrow(false, event);
                break;
            case '*':
                this.handleAsterisk();
                break;
            case ' ':
            case 'spacebar':
            case 'space':
                this.handleSpace(event.shiftKey);
                break;
            case 'enter':
                this.handleEnter(event.ctrlKey);
                break;
            default:
                return;
        }
        return node;
    }

    protected handleUpDownArrow(isUp: boolean, event: KeyboardEvent) {
        const next = isUp ? this.tree.getPreviousNode(this.focusedNode) :
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

        if (event.ctrlKey) {
            this.handleFocusedAndActiveNode(next, false);
        } else {
            this.handleFocusedAndActiveNode(next);
        }
        // requestAnimationFrame(() => {
        //     this.scrollIntoViewIfNeeded(document.getElementsByClassName('igx-tree-node--focused')[0]);
        // });
        //this.focusedNode = next;
    }

    protected handleArrowRight() {
        if (this.focusedNode.children.length > 0) {
            if (!this.focusedNode.expanded) {
                this.handleFocusedAndActiveNode(this.focusedNode);
                this.focusedNode.expanded = true;
            } else {
                this.handleFocusedAndActiveNode(this.focusedNode.children.first);
            }
        }
    }

    protected handleArrowLeft() {
        if (this.focusedNode.expanded) {
            this.handleFocusedAndActiveNode(this.focusedNode);
            this.focusedNode.expanded = false;
        } else {
            if (this.focusedNode.parentNode) {
                this.handleFocusedAndActiveNode(this.focusedNode.parentNode);
            }
        }
    }

    protected handleAsterisk() {
        if (this.focusedNode.parentNode) {
            const children = this.focusedNode.parentNode.children;
            children.forEach(child => child.expanded = true);
        } else {
            const rootNodes = this.tree.nodes.filter(node => node.level === 0);
            rootNodes.forEach(node => node.expanded = true);
        }
    }

    protected handleSpace(shiftKey = false) {
        if (this.tree.selection === IGX_TREE_SELECTION_TYPE.None) {
            return;
        }

        this.handleFocusedAndActiveNode(this.focusedNode);
        if (shiftKey) {
            (this.tree as any).selectionService.selectMultipleNodes(this.focusedNode);
            return;
        }

        if (this.focusedNode.selected) {
            (this.tree as any).selectionService.deselectNode(this.focusedNode);
        } else {
            (this.tree as any).selectionService.selectNode(this.focusedNode);
        }
    }

    protected handleEnter(ctrlKey = false) {
        //(this.focusedNode as any).element.nativeElement.querySelectorAll('a')[0].focus();
        const ref = (this.focusedNode as any).element.nativeElement.querySelectorAll('a')[0].href;
        if (ref) {
            if (ctrlKey) {
                window.open(ref);
            } else {
                window.open(ref, '_self');
            }
        }
    }
    protected scrollIntoViewIfNeeded(target) {
        if (target?.getBoundingClientRect().bottom > window.innerHeight) {
            target.scrollIntoView(false);
        }
        if (target?.getBoundingClientRect().top < 0) {
            target.scrollIntoView();
        }
    }

    // protected navigateInBody(next, cb: (arg: any) => void = null): void {
    //     if (this.isActiveNode(next)) {
    //         return;
    //     }
    //     this.grid.navigateTo(rowIndex, visibleColIndex, cb);
    // }
}
