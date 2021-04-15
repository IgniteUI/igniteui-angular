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
import { IgxTreeSelectionService } from '../tree-selection.service';
import { IgxTreeNavigationService } from '../tree-navigation.service';
import { IgxTreeService } from '../tree.service';
import { ITreeResourceStrings } from '../../core/i18n/tree-resources';
import { CurrentResourceStrings } from '../../core/i18n/resources';
import { DisplayDensity } from '../../core/displayDensity';

// TODO: Implement aria functionality
/**
 * @hidden @internal
 * Used for links (`a` tags) in the body of an `igx-tree-node`. Handles aria and event dispatch.
 */
@Directive({
    selector: `[igxTreeNodeLink]`
})
export class IgxTreeNodeLinkDirective implements OnDestroy {

    @HostBinding('attr.role')
    public role = 'treeitem';

    /**
     * The node's parent. Should be used only when the link is defined
     * in `<ng-template>` tag outside of its parent, as Angular DI will not properly provide a reference
     *
     * ```html
     * <igx-tree>
     *     <igx-tree-node #myNode *ngFor="let node of data" [data]="node">
     *         <ng-template *ngTemplateOutlet="nodeTemplate; context: { $implicit: data, parentNode: myNode }">
     *         </ng-template>
     *     </igx-tree-node>
     *     ...
     *     <!-- node template is defined under tree to access related services -->
     *     <ng-template #nodeTemplate let-data let-node="parentNode">
     *         <a [igxTreeNodeLink]="node">{{ data.label }}</a>
     *     </ng-template>
     * </igx-tree>
     * ```
     */
    @Input('igxTreeNodeLink')
    public set parentNode(val: any) {
        if (val) {
            this._parentNode = val;
            (this._parentNode as any).addLinkChild(this);
        }
    }

    public get parentNode(): any {
        return this._parentNode;
    }

    /** A pointer to the parent node */
    private get target(): IgxTreeNode<any> {
        return this.node || this.parentNode;
    }

    private _parentNode: IgxTreeNode<any> = null;

    constructor(@Optional() @Inject(IGX_TREE_NODE_COMPONENT)
    private node: IgxTreeNode<any>,
        private navService: IgxTreeNavigationService,
        public elementRef: ElementRef) {
    }

    /** @hidden @internal */
    @HostBinding('attr.tabindex')
    public get tabIndex(): number {
        return this.navService.focusedNode === this.target ? (this.target?.disabled ? -1 : 0) : -1;
    }

    /**
     * @hidden @internal
     * Clear the node's focused state
     */
    @HostListener('blur')
    public handleBlur() {
        this.target.isFocused = false;
    }

    /**
     * @hidden @internal
     * Set the node as focused
     */
    @HostListener('focus')
    public handleFocus() {
        if (this.target && !this.target.disabled) {
            if (this.navService.focusedNode !== this.target) {
                this.navService.focusedNode = this.target;
            }
            this.target.isFocused = true;
        }
    }

    public ngOnDestroy() {
        this.target.removeLinkChild(this);
    }
}

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
 *    </igx-tree-node>
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
    /**
     * The data entry that the node is visualizing.
     *
     * @remarks
     * Required for searching through nodes.
     *
     * @example
     * ```html
     *  <igx-tree>
     *  ...
     *    <igx-tree-node [data]="data">
     *      {{ data.FirstName }} {{ data.LastName }}
     *    </igx-tree-node>
     *  ...
     *  </igx-tree>
     * ```
     */
    @Input()
    public data: T;

    /**
     * To be used for load-on-demand scenarios in order to specify whether the node is loading data.
     *
     * @remarks
     * Loading nodes do not render children.
     */
    @Input()
    public loading = false;

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
                return this.hasLinkChildren ? -1 : 0;
            }
            return -1;
        }
        return this.hasLinkChildren ? -1 : this._tabIndex;
    }

    /** @hidden @internal */
    public get animationSettings(): ToggleAnimationSettings {
        return this.tree.animationSettings;
    }

    /**
     * Gets/Sets the resource strings.
     *
     * @remarks
     * Uses EN resources by default.
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
            this.tree.activeNodeBindingChange.emit(this);
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
     *      <igx-tree-node *ngFor="let node of data" [data]="node" [(selected)]="node.selected">
     *      </igx-tree-node>
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
     * Emitted when the node's `expanded` property changes.
     *
     * ```html
     * <igx-tree>
     *      <igx-tree-node *ngFor="let node of data" [data]="node" [(expanded)]="node.expanded">
     *      </igx-tree-node>
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

    /** @hidden @internal */
    public get focused() {
        return this.isFocused &&
            this.navService.focusedNode === this;
    }

    /**
     * Retrieves the full path to the node incuding itself
     *
     * ```typescript
     * const node: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * const path: IgxTreeNode<any>[] = node.path;
     * ```
     */
    public get path(): IgxTreeNode<any>[] {
        return this.parentNode?.path ? [...this.parentNode.path, this] : [this];
    }

    // TODO: bind to disabled state when node is dragged
    /**
     * Gets/Sets the disabled state of the node
     *
     * @param value: boolean
     */
    @Input()
    @HostBinding('class.igx-tree-node--disabled')
    public get disabled(): boolean {
        return this._disabled;
    }

    public set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            this.tree.disabledChange.emit(this);
        }
    }

    /** @hidden @internal */
    @HostBinding('class.igx-tree-node')
    public cssClass = 'igx-tree-node';

    /** @hidden @internal */
    @HostBinding('attr.role')
    public get role() {
        return this.hasLinkChildren ? 'none' : 'treeitem';
    };

    /** @hidden @internal */
    @ContentChildren(IgxTreeNodeLinkDirective, { read: ElementRef })
    public linkChildren: QueryList<ElementRef>;

    /** @hidden @internal */
    @ContentChildren(IGX_TREE_NODE_COMPONENT, { read: IGX_TREE_NODE_COMPONENT })
    public _children: QueryList<IgxTreeNode<any>>;

    /** @hidden @internal */
    @ContentChildren(IGX_TREE_NODE_COMPONENT, { read: IGX_TREE_NODE_COMPONENT, descendants: true })
    public allChildren: QueryList<IgxTreeNode<any>>;

    /**
     * Return the child nodes of the node (if any)
     *
     * @remark
     * Returns `null` if node does not have children
     *
     * @example
     * ```typescript
     * const node: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * const children: IgxTreeNode<any>[] = node.children;
     * ```
     */
    public get children(): IgxTreeNode<any>[] {
        return this._children?.length ? this._children.toArray() : null;
    }

    // TODO: will be used in Drag and Drop implementation
    /** @hidden @internal */
    @ViewChild('ghostTemplate', { read: ElementRef })
    public header: ElementRef;

    @ViewChild('defaultIndicator', { read: TemplateRef, static: true })
    private _defaultExpandIndicatorTemplate: TemplateRef<any>;

    @ViewChild('childrenContainer', { read: ElementRef })
    private childrenContainer: ElementRef;

    private get hasLinkChildren(): boolean {
        return this.linkChildren?.length > 0 || this.registeredChildren?.length > 0;
    }

    /** @hidden @internal */
    public get isCompact(): boolean {
        return this.tree?.displayDensity === DisplayDensity.compact;
    }

    /** @hidden @internal */
    public get isCosy(): boolean {
        return this.tree?.displayDensity === DisplayDensity.cosy;
    }

    /** @hidden @internal */
    public isFocused: boolean;

    /** @hidden @internal */
    public registeredChildren: IgxTreeNodeLinkDirective[] = [];

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
    /** @hidden @internal */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /** @hidden @internal */
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

    /** @hidden @internal */
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
            return;
        }
        if (this.registeredChildren.length) {
            this.registeredChildren[0].elementRef.nativeElement.focus();
            return;
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

    /** @hidden @internal */
    public addLinkChild(link: IgxTreeNodeLinkDirective) {
        this._tabIndex = -1;
        this.registeredChildren.push(link);
    };

    /** @hidden @internal */
    public removeLinkChild(link: IgxTreeNodeLinkDirective) {
        const index = this.registeredChildren.indexOf(link);
        if (index !== -1) {
            this.registeredChildren.splice(index, 1);
        }
    }
}
