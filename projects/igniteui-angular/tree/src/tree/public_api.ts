import { IgxTreeNodeComponent, IgxTreeNodeLinkDirective } from './tree-node/tree-node.component';
import { IgxTreeComponent, IgxTreeExpandIndicatorDirective } from './tree.component';

export { IgxTreeComponent, IgxTreeExpandIndicatorDirective } from './tree.component';
export * from './tree-node/tree-node.component';
export { IgxTreeSearchResolver, ITreeNodeSelectionEvent, ITreeNodeEditingEvent,
    ITreeNodeEditedEvent, ITreeNodeTogglingEventArgs, ITreeNodeToggledEventArgs,
    IgxTreeSelectionType, IgxTree, IgxTreeNode
} from './common';

/* NOTE: Tree directives collection for ease-of-use import in standalone components scenario */
export const IGX_TREE_DIRECTIVES = [
    IgxTreeComponent,
    IgxTreeNodeComponent,
    IgxTreeNodeLinkDirective,
    IgxTreeExpandIndicatorDirective
] as const;
