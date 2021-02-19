import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode, IGX_TREE_SELECTION_TYPE, ITreeNodeSelectionEvent } from './common';
@Injectable()
export class IgxTreeSelectionService {
    private tree: IgxTree;
    private nodeSelection: Set<IgxTreeNode<any>> = new Set<IgxTreeNode<any>>();

    public register(tree: IgxTree) {
        this.tree = tree;
    }

    /** Select all nodes if the nodes collection is empty. Otherwise, select the nodes in the nodes collection */
    public selectAllNodes(nodes?: IgxTreeNode<any>[], clearPrevSelection = false) {
        if (nodes) {
            let removed = [];
            if (clearPrevSelection) {
                removed = this.getSelectedNodes().filter(n => nodes.indexOf(n) < 0);
            }
            const added = nodes.filter(n => this.getSelectedNodes().indexOf(n) < 0);
            const newSelection = clearPrevSelection ? nodes : [...this.getSelectedNodes(), ...added];
            this.emitNodeSelectionEvent(newSelection, added, removed);
        } else {
            const addedNodes = this.allNodes.filter((n: IgxTreeNode<any>) => !this.isNodeSelected(n));
            const newSelection = this.nodeSelection.size ? this.getSelectedNodes().concat(addedNodes) : addedNodes;
            this.emitNodeSelectionEvent(newSelection, addedNodes, []);
        }
    }

    /** Deselect all nodes if the nodes collection is empty. Otherwise, deselect the nodes in the nodes collection */
    public deselectAllNodes(nodes?: IgxTreeNode<any>[]) {
        if (nodes) {
            const newSelection = this.getSelectedNodes().filter(n => nodes.indexOf(n) < 0);
            this.emitNodeSelectionEvent(newSelection, [], nodes);
        } else {
            this.emitNodeSelectionEvent([], [], this.getSelectedNodes());
        }
    }

    /** Select range from last selected node to the current specified node. */
    public selectMultipleNodes(node: IgxTreeNode<any>, event?: Event): void {
        if (!this.nodeSelection.size) {
            this.selectNode(node);
            return;
        }
        const lastSelectedNodeIndex = this.tree.nodes.toArray().indexOf(this.getSelectedNodes()[this.nodeSelection.size - 1]);
        const currentNodeIndex = this.tree.nodes.toArray().indexOf(node);
        const nodes = this.tree.nodes.toArray().slice(Math.min(currentNodeIndex, lastSelectedNodeIndex),
            Math.max(currentNodeIndex, lastSelectedNodeIndex) + 1);

        const added = nodes.filter(_node => !this.isNodeSelected(_node));
        const newSelection = this.getSelectedNodes().concat(added);
        this.emitNodeSelectionEvent(newSelection, added, [], event);
    }

    /** Select the specified node and emit event. */
    public selectNode(node: IgxTreeNode<any>, event?: Event): void {
        // TODO: handle cascade mode
        if (this.tree.selection === IGX_TREE_SELECTION_TYPE.None) {
            return;
        }
        this.emitNodeSelectionEvent([...this.getSelectedNodes(), node], [node], [], event);
    }

    /** Deselect the specified node and emit event. */
    public deselectNode(node: IgxTreeNode<any>, event?): void {
        // TODO: handle cascade mode
        const newSelection = this.getSelectedNodes().filter(r => r !== node);
        this.emitNodeSelectionEvent(newSelection, [], [node], event);
    }

    public clearNodesSelection(): void {
        this.nodeSelection.clear();
    }

    public isNodeSelected(node: IgxTreeNode<any>): boolean {
        return this.nodeSelection.size > 0 && this.nodeSelection.has(node);
    }

    /** Select specified nodes. No event is emitted. */
    private selectNodesWithNoEvent(nodes: IgxTreeNode<any>[], clearPrevSelection = false): void {
        // TODO: add to spec
        // TODO: handle cascade mode
        if (clearPrevSelection) {
            this.nodeSelection.clear();
        }
        nodes.forEach(node => this.nodeSelection.add(node));
    }

    /** Returns array of the selected nodes. */
    private getSelectedNodes(): IgxTreeNode<any>[] {
        return this.nodeSelection.size ? Array.from(this.nodeSelection) : [];
    }

    private emitNodeSelectionEvent(
        newSelection: IgxTreeNode<any>[], added: IgxTreeNode<any>[], removed: IgxTreeNode<any>[], event?: Event
    ): boolean {
        const currSelection = this.getSelectedNodes();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args: ITreeNodeSelectionEvent = {
            oldSelection: currSelection, newSelection,
            added, removed, event, cancel: false
        };
        this.tree.nodeSelection.emit(args);
        if (args.cancel) {
            return;
        }
        this.selectNodesWithNoEvent(args.newSelection, true);
    }

    private get allNodes() {
        return this.tree.nodes;
    }

    private areEqualCollections(first: IgxTreeNode<any>[], second: IgxTreeNode<any>[]): boolean {
        return first.length === second.length && new Set(first.concat(second)).size === first.length;
    }
}
