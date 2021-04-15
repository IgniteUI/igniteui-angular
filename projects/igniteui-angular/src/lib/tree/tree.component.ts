import { CommonModule } from '@angular/common';
import {
    Component, QueryList, Input, Output, EventEmitter, ContentChild, Directive,
    NgModule, TemplateRef, OnInit, AfterViewInit, ContentChildren, OnDestroy, HostBinding, ElementRef, Optional, Inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { growVerIn, growVerOut } from '../animations/grow';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/displayDensity';
import { IgxExpansionPanelModule } from '../expansion-panel/public_api';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputGroupModule } from '../input-group/public_api';
import { IgxProgressBarModule } from '../progressbar/progressbar.component';
import {
    IGX_TREE_COMPONENT, IGX_TREE_SELECTION_TYPE, IgxTree, ITreeNodeToggledEventArgs,
    ITreeNodeTogglingEventArgs, ITreeNodeSelectionEvent, IgxTreeNode, IgxTreeSearchResolver
} from './common';
import { IgxTreeNavigationService } from './tree-navigation.service';
import { IgxTreeNodeComponent, IgxTreeNodeLinkDirective } from './tree-node/tree-node.component';
import { IgxTreeSelectionService } from './tree-selection.service';
import { IgxTreeService } from './tree.service';

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
    providers: [
        IgxTreeService,
        IgxTreeSelectionService,
        IgxTreeNavigationService,
        { provide: IGX_TREE_COMPONENT, useExisting: IgxTreeComponent },
    ]
})
export class IgxTreeComponent extends DisplayDensityBase implements IgxTree, OnInit, AfterViewInit, OnDestroy {

    @HostBinding('class.igx-tree')
    public cssClass = 'igx-tree';

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
     * @example
     * ```html
     * <igx-tree (nodeCollapsed)="handleNodeCollapsed($event)">
     * </igx-tree>
     * ```
     * ```typescript
     * public handleNodeCollapsed(event: ITreeNodeToggledEventArgs) {
     *  const collapsedNode: IgxTreeNode<any> = event.node;
     *  console.log("Node is collapsed: ", collapsedNode.data);
     * }
     * ```
     */
    @Output()
    public nodeCollapsed = new EventEmitter<ITreeNodeToggledEventArgs>();

    /**
     * Emitted when the active node is changed.
     *
     * @example
     * ```
     * <igx-tree (activeNodeChanged)="activeNodeChanged($event)"></igx-tree>
     * ```
     */
    @Output()
    public activeNodeChanged = new EventEmitter<IgxTreeNode<any>>();

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

    /** @hidden @internal */
    public disabledChange = new EventEmitter<IgxTreeNode<any>>();

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

    /**
     * Emitted when the active node is set through API
     *
     * @hidden @internal
     */
    public activeNodeBindingChange = new EventEmitter<IgxTreeNode<any>>();

    private _selection: IGX_TREE_SELECTION_TYPE = IGX_TREE_SELECTION_TYPE.None;
    private destroy$ = new Subject<void>();
    private unsubChildren$ = new Subject<void>();

    constructor(
        private navService: IgxTreeNavigationService,
        private selectionService: IgxTreeSelectionService,
        private treeService: IgxTreeService,
        private element: ElementRef<HTMLElement>,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions?: IDisplayDensityOptions) {
        super(_displayDensityOptions);
        this.selectionService.register(this);
        this.treeService.register(this);
        this.navService.register(this);
    }

    /** @hidden @internal */
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
        const results = this.nodes.filter(node => compareFunc(searchTerm, node));
        return results?.length === 0 ? null : results;
    }

    /** @hidden @internal */
    public handleKeydown(event: KeyboardEvent) {
        this.navService.handleKeydown(event);
    }

    /** @hidden @internal */
    public ngOnInit() {
        super.ngOnInit();
        this.disabledChange.pipe(takeUntil(this.destroy$)).subscribe((e) => {
            this.navService.update_disabled_cache(e);
        });
        this.activeNodeBindingChange.pipe(takeUntil(this.destroy$)).subscribe((node) => {
            this.expandToNode(this.navService.activeNode);
            this.scrollNodeIntoView(node?.header?.nativeElement);
        });
        this.onDensityChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
            requestAnimationFrame(() => {
                this.scrollNodeIntoView(this.navService.activeNode?.header.nativeElement);
            });
        });
        this.subToCollapsing();
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        this.nodes.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.subToChanges();
        });
        this.scrollNodeIntoView(this.navService.activeNode?.header?.nativeElement);
        this.subToChanges();
    }

    /** @hidden @internal */
    public ngOnDestroy() {
        this.unsubChildren$.next();
        this.unsubChildren$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }

    private expandToNode(node: IgxTreeNode<any>) {
        if (node && node.parentNode) {
            node.path.forEach(n => {
                if (n !== node && !n.expanded) {
                    n.expanded = true;
                }
            });
        }
    }

    private subToCollapsing() {
        this.nodeCollapsing.pipe(takeUntil(this.destroy$)).subscribe(event => {
            if (event.cancel) {
                return;
            }
            this.navService.update_visible_cache(event.node, false);
        });
        this.nodeExpanding.pipe(takeUntil(this.destroy$)).subscribe(event => {
            if (event.cancel) {
                return;
            }
            this.navService.update_visible_cache(event.node, true);
        });
    }

    private subToChanges() {
        this.unsubChildren$.next();
        this.nodes.forEach(node => {
            node.expandedChange.pipe(takeUntil(this.unsubChildren$)).subscribe(nodeState => {
                this.navService.update_visible_cache(node, nodeState);
            });
            node.closeAnimationDone.pipe(takeUntil(this.unsubChildren$)).subscribe(() => {
                const targetElement = this.navService.focusedNode?.header.nativeElement;
                this.scrollNodeIntoView(targetElement);
            });
            node.openAnimationDone.pipe(takeUntil(this.unsubChildren$)).subscribe(() => {
                const targetElement = this.navService.focusedNode?.header.nativeElement;
                this.scrollNodeIntoView(targetElement);
            });
        });
        this.navService.init_invisible_cache();
    }

    private scrollNodeIntoView(el: HTMLElement) {
        if (!el) {
            return;
        }
        const nodeRect = el.getBoundingClientRect();
        const treeRect = this.nativeElement.getBoundingClientRect();
        const topOffset = treeRect.top > nodeRect.top ? nodeRect.top - treeRect.top : 0;
        const bottomOffset = treeRect.bottom < nodeRect.bottom ? nodeRect.bottom - treeRect.bottom : 0;
        const shouldScroll = !!topOffset || !!bottomOffset;
        if (shouldScroll && this.nativeElement.scrollHeight > this.nativeElement.clientHeight) {
            // this.nativeElement.scrollTop = nodeRect.y - treeRect.y - nodeRect.height;
            this.nativeElement.scrollTop =
            this.nativeElement.scrollTop + bottomOffset + topOffset + (topOffset ? -1 : +1) * nodeRect.height;
        }
    }

    private _comparer = <T>(data: T, node: IgxTreeNodeComponent<T>) => node.data === data;

}

/**
 * @hidden
 *
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
        IgxProgressBarModule
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
