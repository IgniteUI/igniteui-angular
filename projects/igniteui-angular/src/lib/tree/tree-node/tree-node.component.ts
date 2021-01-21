import { AnimationBuilder } from '@angular/animations';
import {
    Component, OnInit,
    OnDestroy, Input, Inject, ViewChild, TemplateRef, AfterViewInit, QueryList, ContentChildren, Optional, SkipSelf,
    HostBinding,
    ElementRef,
    ChangeDetectorRef
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { IgxSelectionAPIService } from '../../core/selection';
import { ToggleAnimationPlayer, ToggleAnimationSettings } from '../../expansion-panel/toggle-animation-component';
import { IGX_TREE_COMPONENT, IgxTree, IgxTreeNode, IGX_TREE_NODE_COMPONENT, ITreeNodeTogglingEventArgs } from '../common';
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

    public set animationSettings(val: ToggleAnimationSettings) {}

    public get animationSettings(): ToggleAnimationSettings {
        return this.tree.animationSettings;
    }

    @Input()
    public selectMarker: TemplateRef<any>;

    @Input()
    public expandIndicator: TemplateRef<any>;

    @HostBinding('class.igx-tree-node')
    public cssClass = 'igx-tree-node';

    @ContentChildren(IGX_TREE_NODE_COMPONENT, { read: IGX_TREE_NODE_COMPONENT })
    public children: QueryList<IgxTreeNode<any>>;

    @ViewChild('defaultSelect', { read: TemplateRef, static: true })
    private _defaultSelectMarker: TemplateRef<any>;

    @ViewChild('defaultIndicator', { read: TemplateRef, static: true })
    private _defaultExpandIndicatorTemplate: TemplateRef<any>;

    @ViewChild('childrenContainer', { read: ElementRef })
    private childrenContainer: ElementRef;

    public inEdit = false;

    public id = `igxTreeNode_${nodeId++}`;

    constructor(
        @Inject(IGX_TREE_COMPONENT) public tree: IgxTree,
        protected selectionService: IgxSelectionAPIService,
        protected treeService: IgxTreeService,
        protected cdr: ChangeDetectorRef,
        protected builder: AnimationBuilder,
        @Optional() @SkipSelf() @Inject(IGX_TREE_NODE_COMPONENT) public parentNode: IgxTreeNode<any>
    ) {
        super(builder);
    }

    public get level(): number {
        return this.parentNode ? this.parentNode.level + 1 : 0;
    }

    @Input()
    public get selected(): boolean {
        return this.selectionService.get(this.tree.id).has(this.id);
    }

    public set selected(val: boolean) {
        if (val) {
            this.treeService.select(this);
        } else {
            this.treeService.deselect(this);
        }
    }

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

    public get selectMarkerTemplate(): TemplateRef<any> {
        return this.selectMarker ? this.selectMarker : this._defaultSelectMarker;
    }

    public get expandIndicatorTemplate(): TemplateRef<any> {
        return this.expandIndicator ? this.expandIndicator : this._defaultExpandIndicatorTemplate;
    }

    public get templateContext(): any {
        return {
            $implicit: this
        };
    }

    public ngOnInit() {
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
