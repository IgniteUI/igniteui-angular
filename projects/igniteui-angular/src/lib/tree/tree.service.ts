import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode } from './common';

/** @hidden @internal */
@Injectable()
export class IgxTreeService {
    public expandedNodes: Set<string> = new Set<string>();
    public collapsingNodes: Set<string> = new Set<string>();
    private tree: IgxTree;

    public expand(node: IgxTreeNode<any>): void {
        this.expandedNodes.add(node.id);
        this.collapsingNodes.delete(node.id);
        if (this.tree.singleBranchExpand) {
            this.tree.findNodes(node, this.siblingComparer)?.forEach(e => {
                e.expanded = false;
            });
        }
    }

    public collapsing(id: string) {
        this.collapsingNodes.add(id);
    }

    public collapse(id: string): void {
        this.collapsingNodes.delete(id);
        this.expandedNodes.delete(id);
    }

    public isExpanded(id: string): boolean {
        return this.expandedNodes.has(id);
    }

    public register(tree: IgxTree) {
        this.tree = tree;
    }

    private siblingComparer:
    (data: IgxTreeNode<any>, node: IgxTreeNode<any>) => boolean =
    (data: IgxTreeNode<any>, node: IgxTreeNode<any>) => node !== data && node.level === data.level;
}
