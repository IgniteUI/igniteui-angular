import { AnimationBuilder } from '@angular/animations';
import {
    Component, OnInit,
    OnDestroy, Input, Inject, ViewChild, TemplateRef, AfterViewInit, QueryList, ContentChildren, Optional, SkipSelf,
    HostBinding,
    ElementRef,
    ChangeDetectorRef,
    Output,
    EventEmitter
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ToggleAnimationPlayer, ToggleAnimationSettings } from '../../expansion-panel/toggle-animation-component';
import {
    IGX_TREE_COMPONENT, IgxTree, IgxTreeNode,
    IGX_TREE_NODE_COMPONENT, ITreeNodeTogglingEventArgs, IGX_TREE_SELECTION_TYPE
} from '../common';
import { IgxTreeNavigationService } from '../tree-navigation.service';
import { IgxTreeSelectionService } from '../tree-selection.service';
import { IgxTreeService } from '../tree.service';


let nodeId = 0;

/**
 *
 * The tree node component represents a child node of the tree component or another tree node.
 * Usage:
 *
 * ```html
 *  <igx-tree>
 *  ...
 *    <igx-tree-node [data]="data" [selected]="service.isNodeSelected(data.Key)" [expanded]="service.isNodeExpanded(data.Key)">
 *      {{ data.FirstName }} {{ data.LastName }}
 *    </tree>
 *  ...
 *  </igx-tree>
 * ```
 */
@Component({
    selector: 'igx-tree-node',
    templateUrl: 'tree-node.component.html',
    styleUrls: ['tree-node.component.scss'],
    providers: [
        { provide: IGX_TREE_NODE_COMPONENT, useExisting: IgxTreeNodeComponent }
    ]
})
export class IgxTreeNodeComponent<T> extends ToggleAnimationPlayer implements IgxTreeNode<T>, OnInit, AfterViewInit, OnDestroy {
    @Input()
    public data: T;

    public set animationSettings(val: ToggleAnimationSettings) { }

    public get animationSettings(): ToggleAnimationSettings {
        return this.tree.animationSettings;
    }

    /**
     * Emitted when the node's `selected` property changes.
     *
     * ```html
     * <igx-tree>
     *      <igx-tree-node *ngFor="let node of data" [data]="node" [(selected)]="data.selected">
     * </igx-tree>
     * ```
     *
     * ```typescript
     * const node: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * node.selectedChange.pipe(takeUntil(this.destroy$)).subscribe((e: boolean) => console.log("Node selection changed to ", e))
     * ```
     */
    @Output()
    public selectedChange = new EventEmitter<boolean>();

    // // TODO: bind to active state when keynav is implemented
    /** @hidden @internal */
    // @HostBinding('class.igx-tree-node--active')
    public get active() {
        return this.navService.isActiveNode(this);;
    }

    public get focused() {
        //console.log(this.navService.isActiveNode(this));
        return this.navService.isFocusedNode(this);;
    }

    // TODO: bind to disabled state when node is dragged
    /** @hidden @internal */
    @HostBinding('class.igx-tree-node--disabled')
    public get disabled() {
        return false;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-tree-node')
    public cssClass = 'igx-tree-node';

    // TODO: Public API should expose array or null, not query list
    @ContentChildren(IGX_TREE_NODE_COMPONENT, { read: IGX_TREE_NODE_COMPONENT })
    public children: QueryList<IgxTreeNode<any>>;

    // TODO: Expose in public API instead of `children` query list
    /**
     * Return the child nodes of the node (if any)
     *
     * @remark
     * Returns `null` if node does not have children
     *
     * ```typescript
     * const node: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * const children: IgxTreeNode<any>[] = node.children;
     * ```
     */
    public get _children(): IgxTreeNode<any>[] {
        return this.children?.length ? this.children.toArray() : null;
    }

    @ViewChild('defaultSelect', { read: TemplateRef, static: true })
    private _defaultSelectMarker: TemplateRef<any>;

    @ViewChild('defaultIndicator', { read: TemplateRef, static: true })
    private _defaultExpandIndicatorTemplate: TemplateRef<any>;

    @ViewChild('childrenContainer', { read: ElementRef })
    private childrenContainer: ElementRef;

    // TODO: this should probably be dropped from the API
    /**
     * The unique ID of the node
     */
    public id = `igxTreeNode_${nodeId++}`;

    constructor(
        @Inject(IGX_TREE_COMPONENT) public tree: IgxTree,
        protected selectionService: IgxTreeSelectionService,
        protected treeService: IgxTreeService,
        protected navService: IgxTreeNavigationService,
        protected cdr: ChangeDetectorRef,
        protected builder: AnimationBuilder,
        private element: ElementRef<HTMLElement>,
        @Optional() @SkipSelf() @Inject(IGX_TREE_NODE_COMPONENT) public parentNode: IgxTreeNode<any>
    ) {
        super(builder);
    }

    public get isFocusable(): boolean {
        if (!this.parentNode) {
            return true;
        }
        return this.parentNode.expanded;
    }

    /**
     * @hidden @internal
     */
    public get showSelectors() {
        return this.tree.selection !== IGX_TREE_SELECTION_TYPE.None;
    }

    /**
     * @hidden @internal
     */
    public get indeterminate(): boolean {
        return this.selectionService.isNodeIndeterminate(this);
    }

    /** The depth of the node, relative to the root
     *
     * ```html
     * <igx-tree>
     *  ...
     *  <igx-tree-node #node>
     *      My level is {{ node.level }}
     *  </igx-tree-node>
     * </igx-tree>
     * ```
     *
     * ```typescript
     * const node: IgxTreeNode<any> = this.tree.findNodes(data[12])[0];
     * const level: number = node.level;
     * ```
     */
    public get level(): number {
        return this.parentNode ? this.parentNode.level + 1 : 0;
    }

    /** Get/set whether the node is selected. Supporst two-way binding.
     *
     * ```html
     * <igx-tree>
     *  ...
     *  <igx-tree-node *ngFor="let node of data" [(selected)]="node.selected">
     *      {{ node.label }}
     *  </igx-tree-node>
     * </igx-tree>
     * ```
     *
     * ```typescript
     * const node: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * const selected = node.selected;
     * node.selected = true;
     * ```
     */
    @Input()
    public get selected(): boolean {
        return this.selectionService.isNodeSelected(this);
    }

    public set selected(val: boolean) {
        if (val && !this.selectionService.isNodeSelected(this)) {
            this.selectionService.selectNodesWithNoEvent([this]);
        }
        if (!val && this.selectionService.isNodeSelected(this)) {
            this.selectionService.deselectNodesWithNoEvent([this]);
        }
    }

    /** Get/set whether the node is expanded
     *
     * ```html
     * <igx-tree>
     *  ...
     *  <igx-tree-node *ngFor="let node of data" [expanded]="node.name === this.expandedNode">
     *      {{ node.label }}
     *  </igx-tree-node>
     * </igx-tree>
     * ```
     *
     * ```typescript
     * const node: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * const expanded = node.expanded;
     * node.expanded = true;
     * ```
     */
    @Input()
    public get expanded() {
        return this.treeService.isExpanded(this.id);
    }

    public set expanded(val: boolean) {
        if (val) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    /** @hidden @internal */
    public get selectMarkerTemplate(): TemplateRef<any> {
        return this.tree?.selectMarker ? this.tree.selectMarker : this._defaultSelectMarker;
    }

    /** @hidden @internal */
    public get expandIndicatorTemplate(): TemplateRef<any> {
        return this.tree?.expandIndicator ? this.tree.expandIndicator : this._defaultExpandIndicatorTemplate;
    }

    /**
     * The native DOM element representing the node. Could be null in certain environments.
     *
     * ```typescript
     * // get the nativeElement of the second node
     * const node: IgxTreeNode = this.tree.nodes.first();
     * const nodeElement: HTMLElement = node.nativeElement;
     * ```
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    public ngOnInit() {
        // this.zone.runOutsideAngular(() => {
        //     this.nativeElement.addEventListener('pointerdown', this.pointerdown);
        // });
        this.openAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(
            () => {
                this.tree.nodeExpanded.emit({ owner: this.tree, node: this });
            }
        );
        this.closeAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.tree.nodeCollapsed.emit({ owner: this.tree, node: this });
            this.treeService.collapse(this.id);
            this.cdr.markForCheck();
        });
    }

    public ngAfterViewInit() {
    }

    /**
     * @hidden @internal
     */
    public onSelectorClick(event) {
        event.stopPropagation();
        event.preventDefault();
        this.navService.handleFocusedAndActiveNode(this);
        if (event.shiftKey) {
            this.selectionService.selectMultipleNodes(this, event);
            return;
        }
        if (this.selected) {
            this.selectionService.deselectNode(this, event);
        } else {
            this.selectionService.selectNode(this, event);
        }
    }

    /**
     * @hidden @internal
     */
    public expandNode() {
        this.expanded = !this.expanded;
        this.navService.handleFocusedAndActiveNode(this);
    }

    /**
     * @hidden @internal
     */
    public onPointerDown(event) {
        event.stopPropagation();
        event.preventDefault();
        (this.tree as any).nativeElement.children[0].focus();
        this.navService.handleFocusedAndActiveNode(this);
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    private expand() {
        if (this.treeService.isExpanded(this.id)) {
            return;
        }
        const args: ITreeNodeTogglingEventArgs = {
            owner: this.tree,
            node: this,
            cancel: false

        };
        this.tree.nodeExpanding.emit(args);
        if (!args.cancel) {
            this.treeService.expand(this);
            this.cdr.detectChanges();
            this.playOpenAnimation(
                this.childrenContainer
            );
        }
    }

    private collapse() {
        if (!this.treeService.isExpanded(this.id)) {
            return;
        }
        const args: ITreeNodeTogglingEventArgs = {
            owner: this.tree,
            node: this,
            cancel: false

        };
        this.tree.nodeCollapsing.emit(args);
        if (!args.cancel) {
            this.playCloseAnimation(
                this.childrenContainer
            );
        }
    }
}
