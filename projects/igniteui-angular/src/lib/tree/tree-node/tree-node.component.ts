import { AnimationBuilder } from '@angular/animations';
import {
    Component, OnInit,
    OnDestroy, Input, Inject, ViewChild, TemplateRef, AfterViewInit, QueryList, ContentChildren, Optional, SkipSelf,
    HostBinding,
    ElementRef,
    ChangeDetectorRef,
    Output,
    EventEmitter,
    Directive,
    HostListener
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
import { ITreeResourceStrings } from '../../core/i18n/tree-resources';
import { CurrentResourceStrings } from '../../core/i18n/resources';

// TODO: Implement aria functionality
/**
 * @hidden @internal
 * Used for links (`a` tags) in the body of an `igx-tree-node`. Handles aria and event dispatch.
 */
@Directive({
    selector: `[igxTreeNodeLink]`
})
export class IgxTreeNodeLinkDirective {
    @HostBinding('attr.role')
    public role = 'treeitem';

    constructor(@Inject(IGX_TREE_NODE_COMPONENT)
    private node: IgxTreeNode<any>,
        private navService: IgxTreeNavigationService) {
    }

    /** @hidden @internal */
    @HostBinding('attr.tabindex')
    public get tabIndex(): number {
        return this.navService.focusedNode === this.node ? (this.node?.disabled ? -1 : 0) : -1;
    }

    /**
     * @hidden @internal
     * Clear the node's focused state
     */
    @HostListener('blur')
    public handleBlur() {
        this.node.isFocused = false;
    }

    /**
     * @hidden @internal
     * Set the node as focused
     */
    @HostListener('focus')
    public handleFocus() {
        if (!this.node.disabled) {
            if (this.navService.focusedNode !== this.node) {
                this.navService.focusedNode = this.node;
            }
            this.node.isFocused = true;
        }
    }
}

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
    providers: [
        { provide: IGX_TREE_NODE_COMPONENT, useExisting: IgxTreeNodeComponent }
    ]
})
export class IgxTreeNodeComponent<T> extends ToggleAnimationPlayer implements IgxTreeNode<T>, OnInit, AfterViewInit, OnDestroy {
    @Input()
    public data: T;

    // TO DO: return different tab index depending on anchor child
    /** @hidden @internal */
    public set tabIndex(val: number) {
        this._tabIndex = val;
    }

    /** @hidden @internal */
    public get tabIndex(): number {
        if (this.disabled) {
            return -1;
        }
        if (this._tabIndex === null) {
            if (this.navService.focusedNode === null) {
                return this.linkChildren?.length ? -1 : 0;
            }
            return -1;
        }
        return this.linkChildren?.length ? -1 : this._tabIndex;
    }

    public get animationSettings(): ToggleAnimationSettings {
        return this.tree.animationSettings;
    }

    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: ITreeResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
     */
    public get resourceStrings(): ITreeResourceStrings {
        if (!this._resourceStrings) {
            this._resourceStrings = CurrentResourceStrings.TreeResStrings;
        }
        return this._resourceStrings;
    }

    /**
     * Gets/Sets the active state of the node
     *
     * @param value: boolean
     */
    @Input()
    public set active(value: boolean) {
        if (value) {
            this.navService.activeNode = this;
        }
    }

    public get active(): boolean {
        return this.navService.activeNode === this;
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

    /**
     * Emitted when the node's `selected` property changes.
     *
     * ```html
     * <igx-tree>
     *      <igx-tree-node *ngFor="let node of data" [data]="node" [(expanded)]="data.expanded">
     * </igx-tree>
     * ```
     *
     * ```typescript
     * const node: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * node.expandedChange.pipe(takeUntil(this.destroy$)).subscribe((e: boolean) => console.log("Node expansion state changed to ", e))
     * ```
     */
    @Output()
    public expandedChange = new EventEmitter<boolean>();

    public get focused() {
        //console.log(this.navService.isActiveNode(this));
        return this.isFocused &&
        this.navService.focusedNode === this;
    }

    // TODO: Add API docs
    /**
     * Retrieves the full path to the node
     */
    public get path(): IgxTreeNode<any>[] {
        return this.parentNode?.path ? [...this.parentNode.path, this] : [this];
    }

    // TODO: bind to disabled state when node is dragged
    /** @hidden @internal */
    @Input()
    @HostBinding('class.igx-tree-node--disabled')
    public get disabled(): boolean {
        return this._disabled;
    }

    public set disabled(val: boolean) {
        if (val !== this._disabled) {
            this._disabled = val;
            this.tree.disabledChange.emit(this);
        }
    }

    /** @hidden @internal */
    @HostBinding('class.igx-tree-node')
    public cssClass = 'igx-tree-node';

    /** @hidden @internal */
    @HostBinding('attr.role')
    public get roleAttr() {
        return this.linkChildren ? 'none' : 'treeitem';
    };

    /** @hidden @internal */
    @ContentChildren(IgxTreeNodeLinkDirective, { read: ElementRef })
    public linkChildren: QueryList<ElementRef>;

    // TODO: Public API should expose array or null, not query list
    @ContentChildren(IGX_TREE_NODE_COMPONENT, { read: IGX_TREE_NODE_COMPONENT })
    public children: QueryList<IgxTreeNode<any>>;

    /** @hidden @internal */
    @ContentChildren(IGX_TREE_NODE_COMPONENT, { read: IGX_TREE_NODE_COMPONENT, descendants: true })
    public allChildren: QueryList<IgxTreeNode<any>>;

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

    @ViewChild('defaultIndicator', { read: TemplateRef, static: true })
    private _defaultExpandIndicatorTemplate: TemplateRef<any>;

    @ViewChild('childrenContainer', { read: ElementRef })
    private childrenContainer: ElementRef;

    // TODO: will be used in Drag and Drop implementation
    @ViewChild('ghostTemplate', { read: ElementRef })
    private header: ElementRef;

    // TODO: this should probably be dropped from the API
    /**
     * The unique ID of the node
     */
    public id = `igxTreeNode_${nodeId++}`;

    public isFocused: boolean;

    /** @hidden @internal */
    private _resourceStrings = CurrentResourceStrings.TreeResStrings;

    private _tabIndex = null;
    private _disabled = false;

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
        return this.treeService.isExpanded(this);
    }

    public set expanded(val: boolean) {
        if (val) {
            this.treeService.expand(this, false);
        } else {
            this.treeService.collapse(this);
        }
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
        this.openAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(
            () => {
                this.tree.nodeExpanded.emit({ owner: this.tree, node: this });
            }
        );
        this.closeAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.tree.nodeCollapsed.emit({ owner: this.tree, node: this });
            this.treeService.collapse(this);
            this.cdr.markForCheck();
        });
    }

    public ngAfterViewInit() { }

    /**
     * @hidden @internal
     * Sets the focus to the node's <a> child, if present
     * Sets the node as the tree service's focusedNode
     * Marks the node as the current active element
     */
    public handleFocus(): void {
        if (this.disabled) {
            return;
        }
        if (this.navService.focusedNode !== this) {
            this.navService.focusedNode = this;
        }
        this.isFocused = true;
        if (this.linkChildren?.length) {
            this.linkChildren.first.nativeElement.focus();
        }
    }

    /**
     * @hidden @internal
     * Clear the node's focused status
     */
    public clearFocus(): void {
        this.isFocused = false;
    }

    /**
     * @hidden @internal
     */
    public onSelectorClick(event) {
        // event.stopPropagation();
        event.preventDefault();
        // this.navService.handleFocusedAndActiveNode(this);
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
     * Toggles the node expansion state, triggering animation
     *
     * ```html
     * <igx-tree>
     *      <igx-tree-node #node>My Node</igx-tree-node>
     * </igx-tree>
     * <button igxButton (click)="node.toggle()">Toggle Node</button>
     * ```
     *
     * ```typescript
     * const myNode: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * myNode.toggle();
     * ```
     */
    public toggle() {
        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    /** @hidden @internal */
    public indicatorClick() {
        this.toggle();
        this.navService.setFocusedAndActiveNode(this);
    }

    /**
     * @hidden @internal
     */
    public onPointerDown(event) {
        event.stopPropagation();
        this.navService.setFocusedAndActiveNode(this);
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    /**
     * Expands the node, triggering animation
     *
     * ```html
     * <igx-tree>
     *      <igx-tree-node #node>My Node</igx-tree-node>
     * </igx-tree>
     * <button igxButton (click)="node.expand()">Expand Node</button>
     * ```
     *
     * ```typescript
     * const myNode: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * myNode.expand();
     * ```
     */
    public expand() {
        // if (this.treeService.isExpanded(this)) {
        //     return;
        // }
        const args: ITreeNodeTogglingEventArgs = {
            owner: this.tree,
            node: this,
            cancel: false

        };
        this.tree.nodeExpanding.emit(args);
        if (!args.cancel) {
            this.treeService.expand(this, true);
            this.cdr.detectChanges();
            this.playOpenAnimation(
                this.childrenContainer
            );
        }
    }

    /**
     * Collapses the node, triggering animation
     *
     * ```html
     * <igx-tree>
     *      <igx-tree-node #node>My Node</igx-tree-node>
     * </igx-tree>
     * <button igxButton (click)="node.collapse()">Collapse Node</button>
     * ```
     *
     * ```typescript
     * const myNode: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * myNode.collapse();
     * ```
     */
    public collapse() {
        // if (!this.treeService.isExpanded(this)) {
        //     return;
        // }
        const args: ITreeNodeTogglingEventArgs = {
            owner: this.tree,
            node: this,
            cancel: false

        };
        this.tree.nodeCollapsing.emit(args);
        if (!args.cancel) {
            this.treeService.collapsing(this);
            this.playCloseAnimation(
                this.childrenContainer
            );
        }
    }
}
