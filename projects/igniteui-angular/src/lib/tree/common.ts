import { EventEmitter, InjectionToken, QueryList, TemplateRef } from '@angular/core';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs, mkenum } from '../core/utils';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxTreeNavigationService } from './tree-navigation.service';

// Component interfaces

/** Comparer function that can be used when searching through IgxTreeNode<any>[] */
export type IgxTreeSearchResolver = (data: any, node: IgxTreeNode<any>) => boolean;
export interface IgxTree {
    id: string;
    /** @hidden @internal */
    nodes: QueryList<IgxTreeNode<any>>;
    singleBranchExpand: boolean;
    selection: IGX_TREE_SELECTION_TYPE;
    selectMarker: TemplateRef<any>;
    expandIndicator: TemplateRef<any>;
    animationSettings: ToggleAnimationSettings;
    navService: IgxTreeNavigationService;
    /** @hidden @internal */
    disabledChange: EventEmitter<IgxTreeNode<any>>;
    nodeSelection: EventEmitter<ITreeNodeSelectionEvent>;
    nodeExpanding: EventEmitter<ITreeNodeTogglingEventArgs>;
    nodeExpanded: EventEmitter<ITreeNodeToggledEventArgs>;
    nodeCollapsing: EventEmitter<ITreeNodeTogglingEventArgs>;
    nodeCollapsed: EventEmitter<ITreeNodeToggledEventArgs>;
    activeNodeChanged: EventEmitter<IgxTreeNode<any>>;
    expandAll(nodes: IgxTreeNode<any>[]): void;
    collapseAll(nodes: IgxTreeNode<any>[]): void;
    deselectAll(node?: IgxTreeNode<any>[]): void;
    getPreviousNode(node: IgxTreeNode<any>): IgxTreeNode<any>;
    getNextNode(node: IgxTreeNode<any>): IgxTreeNode<any>;
    findNodes(searchTerm: any, comparer?: IgxTreeSearchResolver): IgxTreeNode<any>[] | null;
}

// Item interfaces
export interface IgxTreeNode<T> {
    id: any;
    parentNode?: IgxTreeNode<any> | null;
    path: IgxTreeNode<any>[];
    expanded: boolean | null;
    selected: boolean | null;
    disabled: boolean;
    level: number;
    data: T;
    /** @hidden @internal */
    nativeElement: HTMLElement;
    /** @hidden @internal */
    tabIndex: number;
    /** @hidden @internal */
    allChildren: QueryList<IgxTreeNode<any>>;
    children: QueryList<IgxTreeNode<any>> | null;
    selectedChange: EventEmitter<boolean>;
    expandedChange: EventEmitter<boolean>;
    expand(): void;
    collapse(): void;
    toggle(): void;
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
export const IGX_TREE_SELECTION_TYPE = mkenum({
    None: 'None',
    BiState: 'BiState',
    Cascading: 'Cascading'
});
export type IGX_TREE_SELECTION_TYPE = (typeof IGX_TREE_SELECTION_TYPE)[keyof typeof IGX_TREE_SELECTION_TYPE];

// Token
export const IGX_TREE_COMPONENT = new InjectionToken<IgxTree>('IgxTreeToken');
export const IGX_TREE_NODE_COMPONENT = new InjectionToken<IgxTreeNode<any>>('IgxTreeNodeToken');
