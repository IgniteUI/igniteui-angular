import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode, IgxTreeSelectionType, ITreeNodeSelectionEvent } from './common';

/** A collection containing the nodes affected in the selection as well as their direct parents */
interface CascadeSelectionNodeCollection {
    nodes: Set<IgxTreeNode<any>>;
    parents: Set<IgxTreeNode<any>>;
};

/** @hidden @internal */
@Injectable()
export class IgxTreeSelectionService {
    private tree: IgxTree;
    private nodeSelection: Set<IgxTreeNode<any>> = new Set<IgxTreeNode<any>>();
    private indeterminateNodes: Set<IgxTreeNode<any>> = new Set<IgxTreeNode<any>>();

    private nodesToBeSelected: Set<IgxTreeNode<any>>;
    private nodesToBeIndeterminate: Set<IgxTreeNode<any>>;

    public register(tree: IgxTree) {
        this.tree = tree;
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
        if (this.tree.selection === IgxTreeSelectionType.None) {
            return;
        }
        this.emitNodeSelectionEvent([...this.getSelectedNodes(), node], [node], [], event);
    }

    /** Deselect the specified node and emit event. */
    public deselectNode(node: IgxTreeNode<any>, event?: Event): void {
        const newSelection = this.getSelectedNodes().filter(r => r !== node);
        this.emitNodeSelectionEvent(newSelection, [], [node], event);
    }

    /** Clears node selection */
    public clearNodesSelection(): void {
        this.nodeSelection.clear();
        this.indeterminateNodes.clear();
    }

    public isNodeSelected(node: IgxTreeNode<any>): boolean {
        return this.nodeSelection.has(node);
    }

    public isNodeIndeterminate(node: IgxTreeNode<any>): boolean {
        return this.indeterminateNodes.has(node);
    }

    /** Select specified nodes. No event is emitted. */
    public selectNodesWithNoEvent(nodes: IgxTreeNode<any>[], clearPrevSelection = false, shouldEmit = true): void {
        if (this.tree && this.tree.selection === IgxTreeSelectionType.Cascading) {
            this.cascadeSelectNodesWithNoEvent(nodes, clearPrevSelection);
            return;
        }

        const oldSelection = this.getSelectedNodes();

        if (clearPrevSelection) {
            this.nodeSelection.clear();
        }
        nodes.forEach(node => this.nodeSelection.add(node));

        if (shouldEmit) {
            this.emitSelectedChangeEvent(oldSelection);
        }
    }

    /** Deselect specified nodes. No event is emitted. */
    public deselectNodesWithNoEvent(nodes?: IgxTreeNode<any>[], shouldEmit = true): void {
        const oldSelection = this.getSelectedNodes();

        if (!nodes) {
            this.nodeSelection.clear();
        } else if (this.tree && this.tree.selection === IgxTreeSelectionType.Cascading) {
            this.cascadeDeselectNodesWithNoEvent(nodes);
        } else {
            nodes.forEach(node => this.nodeSelection.delete(node));
        }

        if (shouldEmit) {
            this.emitSelectedChangeEvent(oldSelection);
        }
    }

    /** Called on `node.ngOnDestroy` to ensure state is correct after node is removed */
    public ensureStateOnNodeDelete(node: IgxTreeNode<any>): void {
        if (this.tree?.selection !== IgxTreeSelectionType.Cascading) {
            return;
        }
        requestAnimationFrame(() => {
            if (this.isNodeSelected(node)) {
                // node is destroyed, do not emit event
                this.deselectNodesWithNoEvent([node], false);
            } else {
                if (!node.parentNode) {
                    return;
                }
                const assitantLeafNode = node.parentNode?.allChildren.find(e => !e._children?.length);
                if (!assitantLeafNode) {
                    return;
                }
                this.retriggerNodeState(assitantLeafNode);
            }
        });
    }

    /** Retriggers a node's selection state */
    private retriggerNodeState(node: IgxTreeNode<any>): void {
        if (node.selected) {
            this.nodeSelection.delete(node);
            this.selectNodesWithNoEvent([node], false, false);
        } else {
            this.nodeSelection.add(node);
            this.deselectNodesWithNoEvent([node], false);
        }
    }

    /** Returns array of the selected nodes. */
    private getSelectedNodes(): IgxTreeNode<any>[] {
        return this.nodeSelection.size ? Array.from(this.nodeSelection) : [];
    }

    /** Returns array of the nodes in indeterminate state. */
    private getIndeterminateNodes(): IgxTreeNode<any>[] {
        return this.indeterminateNodes.size ? Array.from(this.indeterminateNodes) : [];
    }

    private emitNodeSelectionEvent(
        newSelection: IgxTreeNode<any>[], added: IgxTreeNode<any>[], removed: IgxTreeNode<any>[], event: Event
    ): boolean {
        if (this.tree.selection === IgxTreeSelectionType.Cascading) {
            this.emitCascadeNodeSelectionEvent(newSelection, added, removed, event);
            return;
        }
        const currSelection = this.getSelectedNodes();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args: ITreeNodeSelectionEvent = {
            oldSelection: currSelection, newSelection,
            added, removed, event, cancel: false, owner: this.tree
        };
        this.tree.nodeSelection.emit(args);
        if (args.cancel) {
            return;
        }
        this.selectNodesWithNoEvent(args.newSelection, true);
    }

    private areEqualCollections(first: IgxTreeNode<any>[], second: IgxTreeNode<any>[]): boolean {
        return first.length === second.length && new Set(first.concat(second)).size === first.length;
    }

    private cascadeSelectNodesWithNoEvent(nodes?: IgxTreeNode<any>[], clearPrevSelection = false): void {
        const oldSelection = this.getSelectedNodes();

        if (clearPrevSelection) {
            this.indeterminateNodes.clear();
            this.nodeSelection.clear();
            this.calculateNodesNewSelectionState({ added: nodes, removed: [] });
        } else {
            const newSelection = [...oldSelection, ...nodes];
            const args: Partial<ITreeNodeSelectionEvent> = { oldSelection, newSelection };

            // retrieve only the rows without their parents/children which has to be added to the selection
            this.populateAddRemoveArgs(args);

            this.calculateNodesNewSelectionState(args);
        }
        this.nodeSelection = new Set(this.nodesToBeSelected);
        this.indeterminateNodes = new Set(this.nodesToBeIndeterminate);

        this.emitSelectedChangeEvent(oldSelection);
    }

    private cascadeDeselectNodesWithNoEvent(nodes: IgxTreeNode<any>[]): void {
        const args = { added: [], removed: nodes };
        this.calculateNodesNewSelectionState(args);

        this.nodeSelection = new Set<IgxTreeNode<any>>(this.nodesToBeSelected);
        this.indeterminateNodes = new Set<IgxTreeNode<any>>(this.nodesToBeIndeterminate);
    }

    /**
     * populates the nodesToBeSelected and nodesToBeIndeterminate sets
     * with the nodes which will be eventually in selected/indeterminate state
     */
    private calculateNodesNewSelectionState(args: Partial<ITreeNodeSelectionEvent>): void {
        this.nodesToBeSelected = new Set<IgxTreeNode<any>>(args.oldSelection ? args.oldSelection : this.getSelectedNodes());
        this.nodesToBeIndeterminate = new Set<IgxTreeNode<any>>(this.getIndeterminateNodes());

        this.cascadeSelectionState(args.removed, false);
        this.cascadeSelectionState(args.added, true);
    }

    /** Ensures proper selection state for all predescessors and descendants during a selection event */
    private cascadeSelectionState(nodes: IgxTreeNode<any>[], selected: boolean): void {
        if (!nodes || nodes.length === 0) {
            return;
        }

        if (nodes && nodes.length > 0) {
            const nodeCollection: CascadeSelectionNodeCollection = this.getCascadingNodeCollection(nodes);

            nodeCollection.nodes.forEach(node => {
                if (selected) {
                    this.nodesToBeSelected.add(node);
                } else {
                    this.nodesToBeSelected.delete(node);
                }
                this.nodesToBeIndeterminate.delete(node);
            });

            Array.from(nodeCollection.parents).forEach((parent) => {
                this.handleParentSelectionState(parent);
            });
        }
    }

    private emitCascadeNodeSelectionEvent(newSelection, added, removed, event?): boolean {
        const currSelection = this.getSelectedNodes();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args: ITreeNodeSelectionEvent = {
            oldSelection: currSelection, newSelection,
            added, removed, event, cancel: false, owner: this.tree
        };

        this.calculateNodesNewSelectionState(args);

        args.newSelection = Array.from(this.nodesToBeSelected);

        // retrieve nodes/parents/children which has been added/removed from the selection
        this.populateAddRemoveArgs(args);

        this.tree.nodeSelection.emit(args);

        if (args.cancel) {
            return;
        }

        // if args.newSelection hasn't been modified
        if (this.areEqualCollections(Array.from(this.nodesToBeSelected), args.newSelection)) {
            this.nodeSelection = new Set<IgxTreeNode<any>>(this.nodesToBeSelected);
            this.indeterminateNodes = new Set(this.nodesToBeIndeterminate);
            this.emitSelectedChangeEvent(currSelection);
        } else {
            // select the nodes within the modified args.newSelection with no event
            this.cascadeSelectNodesWithNoEvent(args.newSelection, true);
        }
    }

    /**
     * recursively handle the selection state of the direct and indirect parents
     */
    private handleParentSelectionState(node: IgxTreeNode<any>) {
        if (!node) {
            return;
        }
        this.handleNodeSelectionState(node);
        if (node.parentNode) {
            this.handleParentSelectionState(node.parentNode);
        }
    }

    /**
     * Handle the selection state of a given node based the selection states of its direct children
     */
    private handleNodeSelectionState(node: IgxTreeNode<any>) {
        const nodesArray = (node && node._children) ? node._children.toArray() : [];
        if (nodesArray.length) {
            if (nodesArray.every(n => this.nodesToBeSelected.has(n))) {
                this.nodesToBeSelected.add(node);
                this.nodesToBeIndeterminate.delete(node);
            } else if (nodesArray.some(n => this.nodesToBeSelected.has(n) || this.nodesToBeIndeterminate.has(n))) {
                this.nodesToBeIndeterminate.add(node);
                this.nodesToBeSelected.delete(node);
            } else {
                this.nodesToBeIndeterminate.delete(node);
                this.nodesToBeSelected.delete(node);
            }
        } else {
            // if the children of the node has been deleted and the node was selected do not change its state
            if (this.isNodeSelected(node)) {
                this.nodesToBeSelected.add(node);
            } else {
                this.nodesToBeSelected.delete(node);
            }
            this.nodesToBeIndeterminate.delete(node);
        }
    }

    /**
     * Get a collection of all nodes affected by the change event
     *
     * @param nodesToBeProcessed set of the nodes to be selected/deselected
     * @returns a collection of all affected nodes and all their parents
     */
    private getCascadingNodeCollection(nodes: IgxTreeNode<any>[]): CascadeSelectionNodeCollection {
        const collection: CascadeSelectionNodeCollection = {
            parents: new Set<IgxTreeNode<any>>(),
            nodes: new Set<IgxTreeNode<any>>(nodes)
        };

        Array.from(collection.nodes).forEach((node) => {
            const nodeAndAllChildren = node.allChildren?.toArray() || [];
            nodeAndAllChildren.forEach(n => {
                collection.nodes.add(n);
            });

            if (node && node.parentNode) {
                collection.parents.add(node.parentNode);
            }
        });
        return collection;
    }

    /**
     * retrieve the nodes which should be added/removed to/from the old selection
     */
    private populateAddRemoveArgs(args: Partial<ITreeNodeSelectionEvent>): void {
        args.removed = args.oldSelection.filter(x => args.newSelection.indexOf(x) < 0);
        args.added = args.newSelection.filter(x => args.oldSelection.indexOf(x) < 0);
    }

    /** Emits the `selectedChange` event for each node affected by the selection */
    private emitSelectedChangeEvent(oldSelection: IgxTreeNode<any>[]): void {
        this.getSelectedNodes().forEach(n => {
            if (oldSelection.indexOf(n) < 0) {
                n.selectedChange.emit(true);
            }
        });

        oldSelection.forEach(n => {
            if (!this.nodeSelection.has(n)) {
                n.selectedChange.emit(false);
            }
        });
    }
}
