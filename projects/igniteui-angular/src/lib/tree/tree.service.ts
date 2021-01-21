import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode } from './common';

/** @hidden @internal */
@Injectable()
export class IgxTreeService {
    public expandedNodes: Set<string> = new Set<string>();
    private tree: IgxTree;

    public expand(node: IgxTreeNode<any>): void {
        this.expandedNodes.add(node.id);
        if (this.tree.singleBranchExpand) {
            this.tree.findNodes(node, this.siblingComparer)?.forEach(e => {
                e.expanded = false;
            });
        }
    }

    public collapse(id: string): void {
        this.expandedNodes.delete(id);
    }

    public isExpanded(id: string): boolean {
        return this.expandedNodes.has(id);
    }

    public select(node: IgxTreeNode<any>): void {
    }

    public deselect(node: IgxTreeNode<any>): void {
    }

    public register(tree: IgxTree) {
        this.tree = tree;
    }

    private siblingComparer:
    (data: IgxTreeNode<any>, node: IgxTreeNode<any>) => boolean =
    (data: IgxTreeNode<any>, node: IgxTreeNode<any>) => node !== data && node.level === data.level;
}
