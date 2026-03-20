import { Component, QueryList, Input, Output, EventEmitter, ContentChild, Directive, TemplateRef, OnInit, AfterViewInit, ContentChildren, OnDestroy, HostBinding, ElementRef, booleanAttribute, inject } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

import {
    IGX_TREE_COMPONENT, IgxTreeSelectionType, IgxTree, ITreeNodeToggledEventArgs,
    ITreeNodeTogglingEventArgs, ITreeNodeSelectionEvent, IgxTreeNode, IgxTreeSearchResolver
} from './common';
import { IgxTreeNavigationService } from './tree-navigation.service';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';
import { IgxTreeSelectionService } from './tree-selection.service';
import { IgxTreeService } from './tree.service';
import { growVerIn, growVerOut } from 'igniteui-angular/animations';
import { PlatformUtil, resizeObservable } from 'igniteui-angular/core';
import { ToggleAnimationSettings } from 'igniteui-angular/expansion-panel';

/**
 * @hidden @internal
 * Used for templating the select marker of the tree
 */
@Directive({
    selector: '[igxTreeSelectMarker]',
    standalone: true
})
export class IgxTreeSelectMarkerDirective {
}

/**
 * @hidden @internal
 * Used for templating the expand indicator of the tree
 */
@Directive({
    selector: '[igxTreeExpandIndicator]',
    standalone: true
})
export class IgxTreeExpandIndicatorDirective {
}

/**
 * IgxTreeComponent allows a developer to show a set of nodes in a hierarchical fashion.
 *
 * @remark
 * The Angular Tree Component allows users to represent hierarchical data in a tree-view structure,
 * maintaining parent-child relationships, as well as to define static tree-view structure without a corresponding data model.
 * Its primary purpose is to allow end-users to visualize and navigate within hierarchical data structures.
 * The Ignite UI for Angular Tree Component also provides load on demand capabilities, item activation,
 * bi-state and cascading selection of items through built-in checkboxes, built-in keyboard navigation and more.
 */
@Component({
    selector: 'igx-tree',
    templateUrl: 'tree.component.html',
    providers: [
        IgxTreeService,
        IgxTreeSelectionService,
        IgxTreeNavigationService,
        { provide: IGX_TREE_COMPONENT, useExisting: IgxTreeComponent },
    ],
    standalone: true
})
export class IgxTreeComponent implements IgxTree, OnInit, AfterViewInit, OnDestroy {
    private navService = inject(IgxTreeNavigationService);
    private selectionService = inject(IgxTreeSelectionService);
    private treeService = inject(IgxTreeService);
    private element = inject<ElementRef<HTMLElement>>(ElementRef);
    private platform = inject(PlatformUtil);


    @HostBinding('class.igx-tree')
    public cssClass = 'igx-tree';

    /**
     * Gets/Sets tree selection mode
     *
     * @remarks
     * By default the tree selection mode is 'None'
     * @param selectionMode: IgxTreeSelectionType
     */
    @Input()
    public get selection() {
        return this._selection;
    }

    public set selection(selectionMode: IgxTreeSelectionType) {
        this._selection = selectionMode;
        this.selectionService.clearNodesSelection();
    }

    /** Get/Set how the tree should handle branch expansion.
     * If set to `true`, only a single branch can be expanded at a time, collapsing all others
     */
    @Input({ transform: booleanAttribute })
    public singleBranchExpand = false;

    /** Get/Set if nodes should be expanded/collapsed when clicking over them.
     */
    @Input({ transform: booleanAttribute })
    public toggleNodeOnClick = false;


    /** Get/Set the animation settings that branches should use when expanding/collpasing.
     */
    @Input()
    public animationSettings: ToggleAnimationSettings = {
        openAnimation: growVerIn,
        closeAnimation: growVerOut
    };

    /** Emitted when the node selection is changed through interaction
     */
    @Output()
    public nodeSelection = new EventEmitter<ITreeNodeSelectionEvent>();

    /** Emitted when a node is expanding, before it finishes
     */
    @Output()
    public nodeExpanding = new EventEmitter<ITreeNodeTogglingEventArgs>();

    /** Emitted when a node is expanded, after it finishes
     */
    @Output()
    public nodeExpanded = new EventEmitter<ITreeNodeToggledEventArgs>();

    /** Emitted when a node is collapsing, before it finishes
     */
    @Output()
    public nodeCollapsing = new EventEmitter<ITreeNodeTogglingEventArgs>();

    /** Emitted when a node is collapsed, after it finishes
     */
    @Output()
    public nodeCollapsed = new EventEmitter<ITreeNodeToggledEventArgs>();

    /**
     * Emitted when the active node is changed.
     */
    @Output()
    public activeNodeChanged = new EventEmitter<IgxTreeNode<any>>();

    /**
     * A custom template to be used for the expand indicator of nodes
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

    /** @hidden @internal */
    public forceSelect = [];

    /** @hidden @internal */
    public resizeNotify = new Subject<void>();

    private _selection: IgxTreeSelectionType = IgxTreeSelectionType.None;
    private destroy$ = new Subject<void>();
    private unsubChildren$ = new Subject<void>();

    constructor() {
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
     */
    public collapseAll(nodes?: IgxTreeNode<any>[]) {
        nodes = nodes || this.nodes.toArray();
        nodes.forEach(e => e.expanded = false);
    }

    /**
     * Deselect all nodes if the nodes collection is empty. Otherwise, deselect the nodes in the nodes collection.
     *
     * @param nodes: IgxTreeNodeComponent<any>[]
     */
    public deselectAll(nodes?: IgxTreeNodeComponent<any>[]) {
        this.selectionService.deselectNodesWithNoEvent(nodes);
    }

    /**
     * Returns all of the nodes that match the passed searchTerm.
     * Accepts a custom comparer function for evaluating the search term against the nodes.
     *
     * @remarks
     * Default search compares the passed `searchTerm` against the node's `data` Input.
     * When using `findNodes` w/o a `comparer`, make sure all nodes have `data` passed.
     *
     * @param searchTerm The data of the searched node
     * @param comparer A custom comparer function that evaluates the passed `searchTerm` against all nodes.
     * @returns Array of nodes that match the search. `null` if no nodes are found.
     *
     * Using a custom comparer
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
        this.disabledChange.pipe(takeUntil(this.destroy$)).subscribe((e) => {
            this.navService.update_disabled_cache(e);
        });
        this.activeNodeBindingChange.pipe(takeUntil(this.destroy$)).subscribe((node) => {
            this.expandToNode(this.navService.activeNode);
            this.scrollNodeIntoView(node?.header?.nativeElement);
        });
        this.subToCollapsing();
        this.resizeNotify.pipe(
            throttleTime(40, null, { trailing: true }),
            takeUntil(this.destroy$)
        )
        .subscribe(() => {
            requestAnimationFrame(() => {
                this.scrollNodeIntoView(this.navService.activeNode?.header.nativeElement);
            });
        });
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        this.nodes.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.subToChanges();
        });
        this.scrollNodeIntoView(this.navService.activeNode?.header?.nativeElement);
        this.subToChanges();
        resizeObservable(this.nativeElement).pipe(takeUntil(this.destroy$)).subscribe(() => this.resizeNotify.next());
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
        const toBeSelected = [...this.forceSelect];
        if(this.platform.isBrowser) {
            requestAnimationFrame(() => {
                this.selectionService.selectNodesWithNoEvent(toBeSelected);
            });
        }
        this.forceSelect = [];
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
