import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode } from './common';

/** @hidden @internal */
@Injectable()
export class IgxTreeService {
    public expandedNodes: Set<string> = new Set<string>();
    public collapsingNodes: Set<string> = new Set<string>();
    private tree: IgxTree;

    /**
     * Adds the node to the `expandedNodes` set and fires the nodes change event
     *
     * @param node target node
     * @param uiTrigger is the event triggered by a ui interraction (so we know if we should animate)
     * @returns void
     */
    public expand(node: IgxTreeNode<any>, uiTrigger?: boolean): void {
        if (!this.expandedNodes.has(node.id)) {
            node.expandedChange.emit(true);
        } else {
            return;
        }
        this.expandedNodes.add(node.id);
        this.collapsingNodes.delete(node.id);
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
        this.collapsingNodes.add(node.id);
    }

    /**
     * Removes the node from the 'expandedNodes' set and emits the node's change event
     *
     * @param node target node
     * @returns void
     */
    public collapse(node: IgxTreeNode<any>): void {
        const id = node.id;
        if (this.expandedNodes.has(id)) {
            node.expandedChange.emit(false);
        } else {
            return;
        }
        this.collapsingNodes.delete(id);
        this.expandedNodes.delete(id);
    }

    public isExpanded(node: IgxTreeNode<any>): boolean {
        return this.expandedNodes.has(node.id);
    }

    public register(tree: IgxTree) {
        this.tree = tree;
    }

    private siblingComparer:
    (data: IgxTreeNode<any>, node: IgxTreeNode<any>) => boolean =
    (data: IgxTreeNode<any>, node: IgxTreeNode<any>) => node !== data && node.level === data.level;
}
