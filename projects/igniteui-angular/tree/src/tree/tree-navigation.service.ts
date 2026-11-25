import { Injectable, OnDestroy, inject } from '@angular/core';
import { IgxTree, IgxTreeNode, IgxTreeSelectionType } from './common';
import {
    IgxKeyBindingHandler,
    IgxKeyBindingsService,
    arrowDown,
    arrowLeft,
    arrowRight,
    arrowUp,
    asteriskKey,
    ctrlKey,
    endKey,
    enterKey,
    homeKey,
    shiftKey,
    spaceBar
} from 'igniteui-angular/core';
import { IgxTreeService } from './tree.service';
import { IgxTreeSelectionService } from './tree-selection.service';
import { Subject } from 'rxjs';

/** @hidden @internal */
@Injectable()
export class IgxTreeNavigationService implements OnDestroy {
    private treeService = inject(IgxTreeService);
    private selectionService = inject(IgxTreeSelectionService);
    private readonly _keyBindings = inject(IgxKeyBindingsService);

    private tree!: IgxTree;

    private _focusedNode: IgxTreeNode<any> = null!;
    private _lastFocusedNode: IgxTreeNode<any> = null!;
    private _activeNode: IgxTreeNode<any> = null!;

    private _visibleChildren: IgxTreeNode<any>[] = [];
    private _invisibleChildren: Set<IgxTreeNode<any>> = new Set();
    private _disabledChildren: Set<IgxTreeNode<any>> = new Set();

    private _cacheChange = new Subject<void>();

    constructor() {
        this._cacheChange.subscribe(() => {
            this._visibleChildren =
                this.tree?.nodes ?
                    this.tree.nodes.filter(e => !(this._invisibleChildren.has(e) || this._disabledChildren.has(e))) :
                    [];
        });

        this._keyBindings
            .configure({ skip: () => !this.focusedNode, bindingDefaults: { repeat: true } })
            .set(homeKey, this.deferOnRepeat(() => this.setFocusedAndActiveNode(this.visibleChildren[0])))
            .set(endKey, this.deferOnRepeat(() => this.setFocusedAndActiveNode(this.visibleChildren[this.visibleChildren.length - 1])))
            .set(arrowLeft, this.deferOnRepeat(() => this.handleArrowLeft()))
            .set(arrowRight, this.deferOnRepeat(() => this.handleArrowRight()))
            .set(arrowUp, this.deferOnRepeat(() => this.handleUpDownArrow(true, true)))
            .set(arrowDown, this.deferOnRepeat(() => this.handleUpDownArrow(false, true)))
            .set([ctrlKey, arrowUp], this.deferOnRepeat(() => this.handleUpDownArrow(true, false)))
            .set([ctrlKey, arrowDown], this.deferOnRepeat(() => this.handleUpDownArrow(false, false)))
            // `*` takes Shift on most keyboards, but not on the numeric keypad.
            .set(asteriskKey, this.deferOnRepeat(() => this.handleAsterisk()))
            .set([shiftKey, asteriskKey], this.deferOnRepeat(() => this.handleAsterisk()))
            .set(spaceBar, this.deferOnRepeat(() => this.handleSpace(false)))
            .set([shiftKey, spaceBar], this.deferOnRepeat(() => this.handleSpace(true)))
            .set(enterKey, () => {
                this.activeNode = this.focusedNode;
            }, { preventDefault: false });
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
            this.update_visible_cache(node, node.expanded!, false);
        });
        this._cacheChange.next();
    }

    public update_visible_cache(node: IgxTreeNode<any>, expanded: boolean, shouldEmit = true): void {
        if (expanded) {
            node._children!.forEach(child => {
                this._invisibleChildren.delete(child);
                this.update_visible_cache(child, child.expanded!, false);
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
    public setFocusedAndActiveNode(node: IgxTreeNode<any>, isActive = true): void {
        if (isActive) {
            this.activeNode = node;
        }
        this.focusedNode = node;
    }

    public ngOnDestroy() {
        this._cacheChange.next();
        this._cacheChange.complete();
    }

    /** Returns a key handler that runs `action`, a tick later for a held key. */
    private deferOnRepeat(action: () => void): IgxKeyBindingHandler {
        return (event) => {
            if (event.repeat) {
                setTimeout(action, 1);
            } else {
                action();
            }
        };
    }

    private handleArrowLeft(): void {
        if (this.focusedNode.expanded && !this.treeService.collapsingNodes.has(this.focusedNode) && this.focusedNode._children?.length) {
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
        if (this.focusedNode._children!.length > 0) {
            if (!this.focusedNode.expanded) {
                this.activeNode = this.focusedNode;
                this.focusedNode.expand();
            } else {
                if (this.treeService.collapsingNodes.has(this.focusedNode)) {
                    this.focusedNode.expand();
                    return;
                }
                const firstChild = this.focusedNode._children!.find(node => !node.disabled);
                if (firstChild) {
                    this.setFocusedAndActiveNode(firstChild);
                }
            }
        }
    }

    private handleUpDownArrow(isUp: boolean, activate: boolean): void {
        const next = this.getVisibleNode(this.focusedNode, isUp ? -1 : 1);
        if (next === this.focusedNode) {
            return;
        }

        this.setFocusedAndActiveNode(next, activate);
    }

    private handleAsterisk(): void {
        const nodes = this.focusedNode.parentNode ? this.focusedNode.parentNode._children : this.tree.rootNodes;
        nodes?.forEach(node => {
            if (!node.disabled && (!node.expanded || this.treeService.collapsingNodes.has(node))) {
                node.expand();
            }
        });
    }

    private handleSpace(selectRange: boolean): void {
        if (this.tree.selection === IgxTreeSelectionType.None) {
            return;
        }

        this.activeNode = this.focusedNode;
        if (selectRange) {
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
