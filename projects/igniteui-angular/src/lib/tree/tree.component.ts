import { CommonModule } from '@angular/common';
import {
    Component, QueryList, Input, Output, EventEmitter, ContentChild, Directive,
    NgModule, TemplateRef, OnInit, AfterViewInit, ContentChildren, OnDestroy, HostBinding, ElementRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { growVerIn, growVerOut } from '../animations/grow';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxExpansionPanelModule } from '../expansion-panel/public_api';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputGroupModule } from '../input-group/public_api';
import {
    IGX_TREE_COMPONENT, IGX_TREE_SELECTION_TYPE, IgxTree, ITreeNodeToggledEventArgs,
    ITreeNodeTogglingEventArgs, ITreeNodeSelectionEvent, IgxTreeNode, IgxTreeSearchResolver, ITreeKeydownEventArgs
} from './common';
import { IgxTreeNavigationService } from './tree-navigation.service';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';
import { IgxTreeSelectionService } from './tree-selection.service';
import { IgxTreeService } from './tree.service';

let init_id = 0;

// TODO: Implement aria functionality
/**
 * @hidden @internal
 * Used for links (`a` tags) in the body of an `igx-tree-node`. Handles aria and event dispatch.
 */
@Directive({
    selector: `[igxTreeNodeLink]`
})
export class IgxTreeNodeLinkDirective {
    /** @hidden @internal */
    @HostBinding('role')
    public role = 'tree-item';
}

/**
 * @hidden @internal
 * Used for templating the select marker of the tree
 */
@Directive({
    selector: '[igxTreeSelectMarker]'
})
export class IgxTreeSelectMarkerDirective {
}

/**
 * @hidden @internal
 * Used for templating the expand indicator of the tree
 */
@Directive({
    selector: '[igxTreeExpandIndicator]'
})
export class IgxTreeExpandIndicatorDirective {
}

@Component({
    selector: 'igx-tree',
    templateUrl: 'tree.component.html',
    styleUrls: ['tree.component.scss'],
    providers: [
        IgxTreeService,
        IgxTreeSelectionService,
        IgxTreeNavigationService,
        { provide: IGX_TREE_COMPONENT, useExisting: IgxTreeComponent },
    ]
})
export class IgxTreeComponent implements IgxTree, OnInit, AfterViewInit, OnDestroy {

    /**
     * Gets/Sets tree selection mode
     *
     * @remarks
     * By default the tree selection mode is 'None'
     * @param selectionMode: IGX_TREE_SELECTION_TYPE
     */
    @Input()
    public get selection() {
        return this._selection;
    }

    public set selection(selectionMode: IGX_TREE_SELECTION_TYPE) {
        this._selection = selectionMode;
        this.selectionService.clearNodesSelection();
    }

    /** Get/Set how the tree should handle branch expansion.
     * If set to `true`, only a single branch can be expanded at a time, collapsing all others
     *
     * ```html
     * <igx-tree [singleBranchExpand]="true">
     * ...
     * </igx-tree>
     * ```
     *
     * ```typescript
     * const tree: IgxTree = this.tree;
     * this.tree.singleBranchExpand = false;
     * ```
     */
    @Input()
    public singleBranchExpand = false;

    /** Get/Set the animation settings that branches should use when expanding/collpasing.
     *
     * ```html
     * <igx-tree [animationSettings]="customAnimationSettings">
     * </igx-tree>
     * ```
     *
     * ```typescript
     * const animationSettings: ToggleAnimationSettings = {
     *      openAnimation: growVerIn,
     *      closeAnimation: growVerOut
     * };
     *
     * this.tree.animationSettings = animationSettings;
     * ```
     */
    @Input()
    public animationSettings: ToggleAnimationSettings = {
        openAnimation: growVerIn,
        closeAnimation: growVerOut
    };

    /**
     * Gets/Sets the activeNode
     *
     * @param node: IgxTreeNode<any>
     */
    @Input()
    public get activeNode() {
        return this.navService.activeNode;
    }

    public set activeNode(node: IgxTreeNode<any>) {
        if (this.navService.activeNode === node) {
            return;
        }
        if (!node) {
            this.navService.activeNode = null;
        } else {
            this.navService.activeNode = node;
            (this.navService.activeNode as any)?.cdr.detectChanges();
        }
    }

    /** Emitted when the node selection is changed through interaction
     *
     * ```html
     * <igx-tree (nodeSelection)="handleNodeSelection($event)">
     * </igx-tree>
     * ```
     *
     *```typescript
     * public handleNodeSelection(event: ITreeNodeSelectionEvent) {
     *  const newSelection: IgxTreeNode<any>[] = event.newSelection;
     *  const added: IgxTreeNode<any>[] = event.added;
     *  console.log("New selection will be: ", newSelection);
     *  console.log("Added nodes: ", event.added);
     * }
     *```
     */
    @Output()
    public nodeSelection = new EventEmitter<ITreeNodeSelectionEvent>();

    /** Emitted when a node is expanding, before it finishes
     *
     * ```html
     * <igx-tree (nodeExpanding)="handleNodeExpanding($event)">
     * </igx-tree>
     * ```
     *
     *```typescript
     * public handleNodeExpanding(event: ITreeNodeTogglingEventArgs) {
     *  const expandedNode: IgxTreeNode<any> = event.node;
     *  if (expandedNode.disabled) {
     *      event.cancel = true;
     *  }
     * }
     *```
     */
    @Output()
    public nodeExpanding = new EventEmitter<ITreeNodeTogglingEventArgs>();

    /** Emitted when a node is expanded, after it finishes
     *
     * ```html
     * <igx-tree (nodeExpanded)="handleNodeExpanded($event)">
     * </igx-tree>
     * ```
     *
     *```typescript
     * public handleNodeExpanded(event: ITreeNodeToggledEventArgs) {
     *  const expandedNode: IgxTreeNode<any> = event.node;
     *  console.log("Node is expanded: ", expandedNode.data);
     * }
     *```
     */
    @Output()
    public nodeExpanded = new EventEmitter<ITreeNodeToggledEventArgs>();

    /** Emitted when a node is collapsing, before it finishes
     *
     * ```html
     * <igx-tree (nodeCollapsing)="handleNodeCollapsing($event)">
     * </igx-tree>
     * ```
     *
     *```typescript
     * public handleNodeCollapsing(event: ITreeNodeTogglingEventArgs) {
     *  const collapsedNode: IgxTreeNode<any> = event.node;
     *  if (collapsedNode.alwaysOpen) {
     *      event.cancel = true;
     *  }
     * }
     *```
     */
    @Output()
    public nodeCollapsing = new EventEmitter<ITreeNodeTogglingEventArgs>();

    /** Emitted when a node is collapsed, after it finishes
     *
     * ```html
     * <igx-tree (nodeCollapsed)="handleNodeCollapsed($event)">
     * </igx-tree>
     * ```
     *
     *```typescript
     * public handleNodeCollapsed(event: ITreeNodeToggledEventArgs) {
     *  const collapsedNode: IgxTreeNode<any> = event.node;
     *  console.log("Node is collapsed: ", collapsedNode.data);
     * }
     *```
     */
    @Output()
    public nodeCollapsed = new EventEmitter<ITreeNodeToggledEventArgs>();

    /**
     * Emitted when keydown is triggered over element inside tree component.
     *
     * @remarks
     * This event is fired only if the key combination is supported in the tree.
     * Return the target object and the original event. This event is cancelable.
     * @example
     * ```html
     *  <igx-tree (treeKeydown)="customKeydown($event)"></igx-tree>
     * ```
     */
    @Output()
    public treeKeydown = new EventEmitter<ITreeKeydownEventArgs>();

    /**
     * Emmited when the active node is changed.
     *
     * @example
     * ```
     * <igx-tree (activeNodeChange)="activeNodeChange($event)"></igx-tree>
     * ```
     */
    @Output()
    public activeNodeChange = new EventEmitter<IgxTreeNode<any>>();

    // TODO: should we remove this thus checkbox aren't templatable
    /**
     * A custom template to be used for the expand indicator of nodes
     * ```html
     * <igx-tree>
     *  <ng-template igxTreeExpandIndicator let-expanded>
     *      <igx-icon>{{ expanded ? "close_fullscreen": "open_in_full"}}</igx-icon>
     *  </ng-template>
     * </igx-tree>
     * ```
     */
    @ContentChild(IgxTreeSelectMarkerDirective, { read: TemplateRef })
    public selectMarker: TemplateRef<any>;

    /**
     * A custom template to be used for the expand indicator of nodes
     * ```html
     * <igx-tree>
     *  <ng-template igxTreeExpandIndicator let-expanded>
     *      <igx-icon>{{ expanded ? "close_fullscreen": "open_in_full"}}</igx-icon>
     *  </ng-template>
     * </igx-tree>
     * ```
     */
    @ContentChild(IgxTreeExpandIndicatorDirective, { read: TemplateRef })
    public expandIndicator: TemplateRef<any>;

    /** @hidden @internal */
    @ContentChildren(IgxTreeNodeComponent, { descendants: true })
    public nodes: QueryList<IgxTreeNodeComponent<any>>;

    /**
     * Returns all **root level** nodes
     *
     * ```typescript
     * const tree: IgxTree = this.tree;
     * const rootNodes: IgxTreeNodeComponent<any>[] = tree.rootNodes;
     * ```
     */
    public get rootNodes(): IgxTreeNodeComponent<any>[] {
        return this.nodes?.filter(node => node.level === 0);
    }

    /** @hidden @internal */
    public id = `tree-${init_id++}`;

    private _selection: IGX_TREE_SELECTION_TYPE = IGX_TREE_SELECTION_TYPE.None;

    constructor(
        public navService: IgxTreeNavigationService,
        private selectionService: IgxTreeSelectionService,
        private treeService: IgxTreeService,
        private element: ElementRef<HTMLElement>) {
        this.selectionService.register(this);
        this.treeService.register(this);
        this.navService.register(this);
    }

    public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * Expands all of the passed nodes.
     * If no nodes are passed, expands ALL nodes
     *
     * @param nodes nodes to be expanded
     *
     * ```typescript
     * const targetNodes: IgxTreeNode<any> = this.tree.findNodes(true, (_data: any, node: IgxTreeNode<any>) => node.data.expandable);
     * tree.expandAll(nodes);
     * ```
     */
    public expandAll(nodes?: IgxTreeNode<any>[]) {
        nodes = nodes || this.nodes.toArray();
        nodes.forEach(e => e.expanded = true);
    }

    /**
     * Collapses all of the passed nodes.
     * If no nodes are passed, collapses ALL nodes
     *
     * @param nodes nodes to be collapsed
     *
     * ```typescript
     * const targetNodes: IgxTreeNode<any> = this.tree.findNodes(true, (_data: any, node: IgxTreeNode<any>) => node.data.collapsible);
     * tree.collapseAll(nodes);
     * ```
     */
    public collapseAll(nodes?: IgxTreeNode<any>[]) {
        nodes = nodes || this.nodes.toArray();
        nodes.forEach(e => e.expanded = false);
    }

    /**
     * Clears the active node
     *
     * ```typescript
     * tree.clearActiveNode();
     * ```
     */
    public clearActiveNode() {
        this.navService.activeNode = null;
    }

    /**
     * Deselect all nodes if the nodes collection is empty. Otherwise, deselect the nodes in the nodes collection.
     *
     * @example
     * ```typescript
     *  const arr = [
     *      this.tree.nodes.toArray()[0],
     *      this.tree.nodes.toArray()[1]
     *  ];
     *  this.tree.deselectAll(arr);
     * ```
     * @param nodes: IgxTreeNodeComponent<any>[]
     */
    public deselectAll(nodes?: IgxTreeNodeComponent<any>[]) {
        this.selectionService.deselectNodesWithNoEvent(nodes);
    }

    /**
     * Returns all of the nodes that match the passed searchTerm.
     * Accepts a custom comparer function for evaluating the search term against the nodes.
     *
     * @remark
     * Default search compares the passed `searchTerm` against the node's `data` Input.
     * When using `findNodes` w/o a `comparer`, make sure all nodes have `data` passed.
     *
     * @param searchTerm The data of the searched node
     * @param comparer A custom comparer function that evaluates the passed `searchTerm` against all nodes.
     * @returns Array of nodes that match the search. `null` if no nodes are found.
     *
     * ```html
     * <igx-tree>
     *     <igx-tree-node *ngFor="let node of data" [data]="node">
     *          {{ node.label }}
     *     </igx-tree-node>
     * </igx-tree>
     * ```
     *
     * ```typescript
     * public data: DataEntry[] = FETCHED_DATA;
     * ...
     * const matchedNodes: IgxTreeNode<DataEntry>[] = this.tree.findNodes<DataEntry>(searchTerm: data[5]);
     * ```
     *
     * Using a custom comparer
     * ```typescript
     * public data: DataEntry[] = FETCHED_DATA;
     * ...
     * const comparer: IgxTreeSearchResolver = (data: any, node: IgxTreeNode<DataEntry>) {
     *      return node.data.index % 2 === 0;
     * }
     * const evenIndexNodes: IgxTreeNode<DataEntry>[] = this.tree.findNodes<DataEntry>(null, comparer);
     * ```
     */
    public findNodes(searchTerm: any, comparer?: IgxTreeSearchResolver): IgxTreeNodeComponent<any>[] | null {
        const compareFunc = comparer || this._comparer;
        return this.nodes.filter(node => compareFunc(searchTerm, node));
    }

    public getPreviousNode(node: IgxTreeNodeComponent<any>) {
        //const visibleChildren: IgxTreeNodeComponent<any>[] = this.nodes.filter(n => this.navService.isFocusable(n));
        const nodeIndex = this.navService.visibleChildren.indexOf(node);
        if (nodeIndex > 0) {
            return this.navService.visibleChildren[nodeIndex - 1];
        }
        return node;
    }

    public getNextNode(node: IgxTreeNodeComponent<any>) {
        // const visibleChildren: IgxTreeNodeComponent<any>[] = this.nodes.filter(n => this.navService.isFocusable(n));
        const nodeIndex = this.navService.visibleChildren.indexOf(node);
        if (nodeIndex < this.navService.visibleChildren.length - 1) {
            return this.navService.visibleChildren[nodeIndex + 1];
        }
        return node;
    }

    public ngOnInit() { }
    public ngAfterViewInit() {
        this.navService.setVisibleChildren();
    }
    public ngOnDestroy() { }

    private _comparer = <T>(data: T, node: IgxTreeNodeComponent<T>) => node.data === data;

}

/**
 * NgModule defining the components and directives needed for `igx-tree`
 */
@NgModule({
    declarations: [
        IgxTreeSelectMarkerDirective,
        IgxTreeExpandIndicatorDirective,
        IgxTreeNodeLinkDirective,
        IgxTreeComponent,
        IgxTreeNodeComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IgxIconModule,
        IgxInputGroupModule,
        IgxCheckboxModule,
        IgxExpansionPanelModule
    ],
    exports: [
        IgxTreeSelectMarkerDirective,
        IgxTreeExpandIndicatorDirective,
        IgxTreeNodeLinkDirective,
        IgxTreeComponent,
        IgxTreeNodeComponent,
        IgxIconModule,
        IgxInputGroupModule,
        IgxCheckboxModule,
        IgxExpansionPanelModule
    ]
})
export class IgxTreeModule {
}
