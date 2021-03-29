import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode } from './common';

/** @hidden @internal */
@Injectable()
export class IgxTreeService {
    public expandedNodes: Set<IgxTreeNode<any>> = new Set<IgxTreeNode<any>>();
    public collapsingNodes: Set<IgxTreeNode<any>> = new Set<IgxTreeNode<any>>();
    private tree: IgxTree;

    /**
     * Adds the node to the `expandedNodes` set and fires the nodes change event
     *
     * @param node target node
     * @param uiTrigger is the event triggered by a ui interraction (so we know if we should animate)
     * @returns void
     */
    public expand(node: IgxTreeNode<any>, uiTrigger?: boolean): void {
        this.collapsingNodes.delete(node);
        if (!this.expandedNodes.has(node)) {
            node.expandedChange.emit(true);
        } else {
            return;
        }
        this.expandedNodes.add(node);
        if (this.tree.singleBranchExpand) {
            this.tree.findNodes(node, this.siblingComparer)?.forEach(e => {
                if (uiTrigger) {
                    e.collapse();
                } else {
                    e.expanded = false;
                }
            });
        }
    }

    public collapsing(node: IgxTreeNode<any>) {
        this.collapsingNodes.add(node);
    }

    /**
     * Removes the node from the 'expandedNodes' set and emits the node's change event
     *
     * @param node target node
     * @returns void
     */
    public collapse(node: IgxTreeNode<any>): void {
        if (this.expandedNodes.has(node)) {
            node.expandedChange.emit(false);
        }
        this.collapsingNodes.delete(node);
        this.expandedNodes.delete(node);
    }

    public isExpanded(node: IgxTreeNode<any>): boolean {
        return this.expandedNodes.has(node);
    }

    public register(tree: IgxTree) {
        this.tree = tree;
    }

    private siblingComparer:
    (data: IgxTreeNode<any>, node: IgxTreeNode<any>) => boolean =
    (data: IgxTreeNode<any>, node: IgxTreeNode<any>) => node !== data && node.level === data.level;
}
