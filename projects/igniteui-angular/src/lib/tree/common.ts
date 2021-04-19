import { ElementRef, EventEmitter, InjectionToken, QueryList, TemplateRef } from '@angular/core';
import { DisplayDensity } from '../core/displayDensity';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs, mkenum } from '../core/utils';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';

// Component interfaces

/** Comparer function that can be used when searching through IgxTreeNode<any>[] */
export type IgxTreeSearchResolver = (data: any, node: IgxTreeNode<any>) => boolean;

export interface IgxTree {
    /** @hidden @internal */
    nodes: QueryList<IgxTreeNode<any>>;
    /** @hidden @internal */
    rootNodes: IgxTreeNode<any>[];
    singleBranchExpand: boolean;
    selection: IgxTreeSelectionType;
    expandIndicator: TemplateRef<any>;
    animationSettings: ToggleAnimationSettings;
    /** @hidden @internal */
    displayDensity: DisplayDensity;
    /** @hidden @internal */
    forceSelect: IgxTreeNode<any>[];
    /** @hidden @internal */
    disabledChange: EventEmitter<IgxTreeNode<any>>;
    /** @hidden @internal */
    activeNodeBindingChange: EventEmitter<IgxTreeNode<any>>;
    nodeSelection: EventEmitter<ITreeNodeSelectionEvent>;
    nodeExpanding: EventEmitter<ITreeNodeTogglingEventArgs>;
    nodeExpanded: EventEmitter<ITreeNodeToggledEventArgs>;
    nodeCollapsing: EventEmitter<ITreeNodeTogglingEventArgs>;
    nodeCollapsed: EventEmitter<ITreeNodeToggledEventArgs>;
    activeNodeChanged: EventEmitter<IgxTreeNode<any>>;
    expandAll(nodes: IgxTreeNode<any>[]): void;
    collapseAll(nodes: IgxTreeNode<any>[]): void;
    deselectAll(node?: IgxTreeNode<any>[]): void;
    findNodes(searchTerm: any, comparer?: IgxTreeSearchResolver): IgxTreeNode<any>[] | null;
}

// Item interfaces
export interface IgxTreeNode<T> {
    parentNode?: IgxTreeNode<any> | null;
    loading: boolean;
    path: IgxTreeNode<any>[];
    expanded: boolean | null;
    /** @hidden @internal */
    indeterminate: boolean;
    selected: boolean | null;
    disabled: boolean;
    /** @hidden @internal */
    isFocused: boolean;
    active: boolean;
    level: number;
    data: T;
    /** @hidden @internal */
    nativeElement: HTMLElement;
    /** @hidden @internal */
    header: ElementRef;
    /** @hidden @internal */
    tabIndex: number;
    /** @hidden @internal */
    allChildren: QueryList<IgxTreeNode<any>>;
    /** @hidden @internal */
    _children: QueryList<IgxTreeNode<any>> | null;
    selectedChange: EventEmitter<boolean>;
    expandedChange: EventEmitter<boolean>;
    expand(): void;
    collapse(): void;
    toggle(): void;
    /** @hidden @internal */
    addLinkChild(node: any): void;
    /** @hidden @internal */
    removeLinkChild(node: any): void;
}

// Events
export interface ITreeNodeSelectionEvent extends IBaseCancelableBrowserEventArgs {
    oldSelection: IgxTreeNode<any>[];
    newSelection: IgxTreeNode<any>[];
    added: IgxTreeNode<any>[];
    removed: IgxTreeNode<any>[];
    event?: Event;
}

export interface ITreeNodeEditingEvent extends IBaseCancelableBrowserEventArgs {
    node: IgxTreeNode<any>;
    value: string;
}

export interface ITreeNodeEditedEvent extends IBaseEventArgs {
    node: IgxTreeNode<any>;
    value: any;
}

export interface ITreeNodeTogglingEventArgs extends IBaseEventArgs, IBaseCancelableBrowserEventArgs {
    node: IgxTreeNode<any>;
}

export interface ITreeNodeToggledEventArgs extends IBaseEventArgs {
    node: IgxTreeNode<any>;
}

// Enums
export const IgxTreeSelectionType = mkenum({
    None: 'None',
    BiState: 'BiState',
    Cascading: 'Cascading'
});
export type IgxTreeSelectionType = (typeof IgxTreeSelectionType)[keyof typeof IgxTreeSelectionType];

// Token
export const IGX_TREE_COMPONENT = new InjectionToken<IgxTree>('IgxTreeToken');
export const IGX_TREE_NODE_COMPONENT = new InjectionToken<IgxTreeNode<any>>('IgxTreeNodeToken');
