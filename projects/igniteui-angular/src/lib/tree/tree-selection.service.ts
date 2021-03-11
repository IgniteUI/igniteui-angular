import { Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode, IGX_TREE_SELECTION_TYPE, ITreeNodeSelectionEvent } from './common';
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
        this.indeterminateNodes.clear();
    }

    public isNodeSelected(node: IgxTreeNode<any>): boolean {
        return this.nodeSelection.size > 0 && this.nodeSelection.has(node);
    }

    public isNodeIndeterminate(node: IgxTreeNode<any>): boolean {
        return this.indeterminateNodes.size > 0 && this.indeterminateNodes.has(node);
    }

    /** Select specified nodes. No event is emitted. */
    public selectNodesWithNoEvent(nodes: IgxTreeNode<any>[], clearPrevSelection = false): void {
        if (this.tree && this.tree.selection === IGX_TREE_SELECTION_TYPE.Cascading) {
            this.cascadeSelectNodesWithNoEvent(nodes, clearPrevSelection);
            return;
        }

        const oldSelection = this.getSelectedNodes();

        if (clearPrevSelection) {
            this.nodeSelection.clear();
        }
        nodes.forEach(node => this.nodeSelection.add(node));

        this.emitSelectedChangeEvent(oldSelection);
    }

    /** Deselect specified nodes. No event is emitted. */
    public deselectNodesWithNoEvent(nodes?: IgxTreeNode<any>[]): void {
        const oldSelection = this.getSelectedNodes();

        if (!nodes) {
            this.nodeSelection.clear();
        } else if (this.tree && this.tree.selection === IGX_TREE_SELECTION_TYPE.Cascading) {
            this.cascadeDeselectNodesWithNoEvent(nodes);
        } else {
            nodes.forEach(node => this.nodeSelection.delete(node));
        }

        this.emitSelectedChangeEvent(oldSelection);
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
        newSelection: IgxTreeNode<any>[], added: IgxTreeNode<any>[], removed: IgxTreeNode<any>[], event?: Event
    ): boolean {
        if (this.tree.selection === IGX_TREE_SELECTION_TYPE.Cascading) {
            this.emitCascadeNodeSelectionEvent(newSelection, added, removed, event);
            return;
        }
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
            const args = { oldSelection, newSelection };

            // retrieve only the rows without their parents/children which has to be added to the selection
            this.handleAddedAndRemovedArgs(args);

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
    private calculateNodesNewSelectionState(args: any) {
        this.nodesToBeSelected = new Set<IgxTreeNode<any>>(args.oldSelection ? args.oldSelection : this.getSelectedNodes());
        this.nodesToBeIndeterminate = new Set<IgxTreeNode<any>>(this.getIndeterminateNodes());

        const removed = new Set<IgxTreeNode<any>>(args.removed);
        const added = new Set<IgxTreeNode<any>>(args.added);

        if (removed && removed.size) {
            let removedNodesParents = new Set<IgxTreeNode<any>>();

            removedNodesParents = this.collectNodesChildrenAndDirectParents(removed);

            removed.forEach(removedNode => {
                this.nodesToBeSelected.delete(removedNode);
                this.nodesToBeIndeterminate.delete(removedNode);
            });

            Array.from(removedNodesParents).forEach((parent) => {
                this.handleParentSelectionState(parent);
            });
        }

        if (added && added.size) {
            let addedNodesParents = new Set<IgxTreeNode<any>>();

            addedNodesParents = this.collectNodesChildrenAndDirectParents(added);

            added.forEach(addedNode => {
                this.nodesToBeSelected.add(addedNode);
                this.nodesToBeIndeterminate.delete(addedNode);
            });

            Array.from(addedNodesParents).forEach((parent) => {
                this.handleParentSelectionState(parent);
            });
        }
    }

    private emitCascadeNodeSelectionEvent(newSelection, added, removed, event?): boolean {
        const currSelection = this.getSelectedNodes();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args = {
            oldSelection: currSelection, newSelection,
            added, removed, event, cancel: false
        };

        this.calculateNodesNewSelectionState(args);

        args.newSelection = Array.from(this.nodesToBeSelected);

        // retrieve nodes/parents/children which has been added/removed from the selection
        this.handleAddedAndRemovedArgs(args);

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
        const nodesArray = (node && node.children) ? node.children.toArray() : [];
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

    private get_all_children(node: IgxTreeNode<any>): any[] {
        const children = [];
        if (node && node.children && node.children.length) {
            node.children.forEach((child) => {
                children.push(...this.get_all_children(child));
                children.push(child);
            });
        }
        return children;
    }

    /**
     * adds to nodesToBeProcessed set all children of the nodes which was initially within the nodesToBeProcessed set
     *
     * @param nodesToBeProcessed set of the nodes (without their parents/children) to be selected/deselected
     * @returns a new set with all direct parents of the nodes within nodesToBeProcessed set
     */
    private collectNodesChildrenAndDirectParents(nodesToBeProcessed: Set<IgxTreeNode<any>>): Set<any> {
        const processedNodesParents = new Set<IgxTreeNode<any>>();
        Array.from(nodesToBeProcessed).forEach((node) => {
            const nodeAndAllChildren = this.get_all_children(node);
            nodeAndAllChildren.forEach(n => {
                nodesToBeProcessed.add(n);
            });
            if (node && node.parentNode) {
                processedNodesParents.add(node.parentNode);
            }
        });
        return processedNodesParents;
    }

    /**
     * retrieve the nodes which should be added/removed to/from the old selection
     */
    private handleAddedAndRemovedArgs(args: any) {
        args.removed = args.oldSelection.filter(x => args.newSelection.indexOf(x) < 0);
        args.added = args.newSelection.filter(x => args.oldSelection.indexOf(x) < 0);
    }

    private emitSelectedChangeEvent(oldSelection: IgxTreeNode<any>[]) {
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
