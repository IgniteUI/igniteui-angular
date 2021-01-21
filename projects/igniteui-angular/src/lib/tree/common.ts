import { EventEmitter, InjectionToken, QueryList, TemplateRef } from '@angular/core';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs, mkenum } from '../core/utils';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';

// Component interfaces

export type IgxTreeSearchResolver = (data: any, node: IgxTreeNode<any>) => boolean;
export interface IgxTree {
    id: string;
    singleBranchExpand: boolean;
    selection: IGX_TREE_SELECTION_TYPE;
    selectMarker: TemplateRef<any>;
    expandIndicator: TemplateRef<any>;
    animationSettings: ToggleAnimationSettings;
    nodeExpanding: EventEmitter<ITreeNodeTogglingEventArgs>;
    nodeExpanded: EventEmitter<ITreeNodeToggledEventArgs>;
    nodeCollapsing: EventEmitter<ITreeNodeTogglingEventArgs>;
    nodeCollapsed: EventEmitter<ITreeNodeToggledEventArgs>;
    expandAll(nodes: IgxTreeNode<any>[]): void;
    collapseAll(nodes: IgxTreeNode<any>[]): void;
    selectAll(node: IgxTreeNode<any>[]): void;
    findNodes(searchTerm: any, comparer?: IgxTreeSearchResolver): IgxTreeNode<any>[] | null;
}

// Item interfaces
export interface IgxTreeNode<T> {
    id: any;
    parentNode?: IgxTreeNode<any> | null;
    expanded: boolean | null;
    selected: boolean | null;
    level: number;
    data: T;
    children: QueryList<IgxTreeNode<any>> | null;
}

// Events
export interface ITreeNodeSelectionEvent extends IBaseCancelableBrowserEventArgs {
    node: IgxTreeNode<any>;
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
