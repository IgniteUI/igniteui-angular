import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode, IGX_TREE_SELECTION_TYPE } from './common';
import { NAVIGATION_KEYS } from '../core/utils';
import { IgxTreeService } from './tree.service';
import { IgxTreeSelectionService } from './tree-selection.service';
import { Subject } from 'rxjs';

@Injectable()
export class IgxTreeNavigationService {
    private tree: IgxTree;

    private _focusedNode: IgxTreeNode<any> = null;
    private _lastFocusedNode: IgxTreeNode<any> = null;
    private _activeNode: IgxTreeNode<any> = null;

    private _visibleChildren: IgxTreeNode<any>[] = [];
    private _invisibleChildren: Set<IgxTreeNode<any>> = new Set();
    private _disabledChildren: Set<IgxTreeNode<any>> = new Set();

    private _cacheChange = new Subject<void>();

    constructor(private treeService: IgxTreeService, private selectionService: IgxTreeSelectionService) {
        this._cacheChange.subscribe(() => {
            this._visibleChildren =
                this.tree.nodes ?
                    this.tree.nodes.filter(e => !(this._invisibleChildren.has(e) || this._disabledChildren.has(e))) :
                    [];
        });
    }

    public register(tree: IgxTree) {
        this.tree = tree;
    }

    public get focusedNode() {
        return this._focusedNode;
    }

    public set focusedNode(value: IgxTreeNode<any>) {
        if (this._focusedNode === value) {
            return;
        }
        this._lastFocusedNode = this._focusedNode;
        if (this._lastFocusedNode) {
            this._lastFocusedNode.tabIndex = -1;
        }
        this._focusedNode = value;
        if (this._focusedNode !== null) {
            this._focusedNode.tabIndex = 0;
            this._focusedNode.header.nativeElement.focus();
        }
    }

    public get activeNode() {
        return this._activeNode;
    }

    public set activeNode(value: IgxTreeNode<any>) {
        if (this._activeNode === value) {
            return;
        }
        this._activeNode = value;
        this.tree.activeNodeChanged.emit(this._activeNode);
    }

    public get visibleChildren(): IgxTreeNode<any>[] {
        return this._visibleChildren;
    }

    public update_disabled_cache(node: IgxTreeNode<any>): void {
        if (node.disabled) {
            this._disabledChildren.add(node);
        } else {
            this._disabledChildren.delete(node);
        }
        this._cacheChange.next();
    }

    public init_invisible_cache() {
        this.tree.nodes.filter(e => e.level === 0).forEach(node => {
            this.update_visible_cache(node, node.expanded, false);
        });
        this._cacheChange.next();
    }

    public update_visible_cache(node: IgxTreeNode<any>, expanded: boolean, shouldEmit = true): void {
        if (expanded) {
            node.children.forEach(child => {
                this._invisibleChildren.delete(child);
                this.update_visible_cache(child, child.expanded, false);
            });
        } else {
            node.allChildren.forEach(c => this._invisibleChildren.add(c));
        }

        if (shouldEmit) {
            this._cacheChange.next();
        }
    }

    /**
     * Sets the node as focused (and active)
     *
     * @param node target node
     * @param isActive if true, sets the node as active
     */
    public setFocusedAndActiveNode(node: IgxTreeNode<any>, isActive: boolean = true): void {
        if (isActive) {
            this.activeNode = node;
        }
        this.focusedNode = node;
    }

    /** Handler for keydown events. Used in tree.component.ts */
    public handleKeydown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.focusedNode) {
            return;
        }
        if (!(NAVIGATION_KEYS.has(key) || key === '*')) {
            if (key === 'enter') {
                this.activeNode = this.focusedNode;
            }
            return;
        }
        event.preventDefault();
        if (event.repeat) {
            setTimeout(() => this.handleNavigation(event), 1);
        } else {
            this.handleNavigation(event);
        }
    }

    private handleNavigation(event: KeyboardEvent) {
        switch (event.key.toLowerCase()) {
            case 'home':
                this.setFocusedAndActiveNode(this.visibleChildren[0]);
                break;
            case 'end':
                this.setFocusedAndActiveNode(this.visibleChildren[this.visibleChildren.length - 1]);
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
            default:
                return;
        }
    }

    private handleArrowLeft(): void {
        if (this.focusedNode.expanded && !this.treeService.collapsingNodes.has(this.focusedNode) && this.focusedNode.children?.length) {
            this.activeNode = this.focusedNode;
            this.focusedNode.collapse();
        } else {
            const parentNode = this.focusedNode.parentNode;
            if (parentNode && !parentNode.disabled) {
                this.setFocusedAndActiveNode(parentNode);
            }
        }
    }

    private handleArrowRight(): void {
        if (this.focusedNode.children.length > 0) {
            if (!this.focusedNode.expanded) {
                this.activeNode = this.focusedNode;
                this.focusedNode.expand();
            } else {
                if (this.treeService.collapsingNodes.has(this.focusedNode)) {
                    this.focusedNode.expand();
                    return;
                }
                const firstChild = this.focusedNode.children.find(node => !node.disabled);
                if (firstChild) {
                    this.setFocusedAndActiveNode(firstChild);
                }
            }
        }
    }

    private handleUpDownArrow(isUp: boolean, event: KeyboardEvent): void {
        const next = isUp ? this.getVisibleNode(this.focusedNode, -1) :
            this.getVisibleNode(this.focusedNode, 1);
        if (next === this.focusedNode) {
            return;
        }

        if (event.ctrlKey) {
            this.setFocusedAndActiveNode(next, false);
        } else {
            this.setFocusedAndActiveNode(next);
        }
    }

    private handleAsterisk(): void {
        const nodes = this.focusedNode.parentNode ? this.focusedNode.parentNode.children : this.tree.rootNodes;
        nodes?.forEach(node => {
            if (!node.disabled && (!node.expanded || this.treeService.collapsingNodes.has(node))) {
                node.expand();
            }
        });
    }

    private handleSpace(shiftKey = false): void {
        if (this.tree.selection === IGX_TREE_SELECTION_TYPE.None) {
            return;
        }

        this.activeNode = this.focusedNode;
        if (shiftKey) {
            this.selectionService.selectMultipleNodes(this.focusedNode);
            return;
        }

        if (this.focusedNode.selected) {
            this.selectionService.deselectNode(this.focusedNode);
        } else {
            this.selectionService.selectNode(this.focusedNode);
        }
    }

    /** Gets the next visible node in the given direction - 1 -> next, -1 -> previous */
    private getVisibleNode(node: IgxTreeNode<any>, dir: 1 | -1 = 1): IgxTreeNode<any> {
        const nodeIndex = this.visibleChildren.indexOf(node);
        return this.visibleChildren[nodeIndex + dir] || node;
    }
}
