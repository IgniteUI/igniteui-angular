import { EventEmitter, Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode, IGX_TREE_SELECTION_TYPE } from './common';
import { NAVIGATION_KEYS } from '../core/utils';

@Injectable()
export class IgxTreeNavigationService {
    public _activeNode: IgxTreeNode<any> = null;
    public _focusedNode: IgxTreeNode<any> = null;
    protected pendingNavigation = false;
    private tree: IgxTree;
    private lastActiveNode: IgxTreeNode<any> = {} as IgxTreeNode<any>;
    private lastFocusedNode: IgxTreeNode<any> = {} as IgxTreeNode<any>;
    private _visibleChildren: IgxTreeNode<any>[] = [];
    private _invisibleChildren: Set<IgxTreeNode<any>> = new Set();
    private _disabledChildren: Set<IgxTreeNode<any>> = new Set();

    private _cacheChange = new EventEmitter<void>();

    constructor() {
        this._cacheChange.subscribe(() => {
            this._visibleChildren =
                this.tree.nodes ?
                    this.tree.nodes.filter(e => !(this._invisibleChildren.has(e) || this._disabledChildren.has(e))) :
                    [];
        });
    }

    public update_disabled_cache(node: IgxTreeNode<any>): void {
        if (node.disabled) {
            this._disabledChildren.add(node);
        } else {
            this._disabledChildren.delete(node);
        }
        this._cacheChange.emit();
    }

    public get visibleChildren(): IgxTreeNode<any>[] {
        return this._visibleChildren;
    }

    public init_invisible_cache() {
        this.tree.nodes.filter(e => e.level === 0).forEach(node => {
            this.update_visible_cache(node, node.expanded, false);
        });
        this._cacheChange.emit();
    }

    public update_visible_cache(node: IgxTreeNode<any>, expanded: boolean, shouldEmit = true): void {
        if (expanded) {
            node.children.forEach(child => {
                this._invisibleChildren.delete(child);
                this.update_visible_cache(child, child.expanded, false);
            });
        } else {
            node.allChildren.forEach(c => this._invisibleChildren.add(c));
        }

        if (shouldEmit) {
            this._cacheChange.emit();
        }
    }

    public get_all_children(node: IgxTreeNode<any>): IgxTreeNode<any>[] {
        const children = [];
        if (node && node.children && node.children.length) {
            node.children.forEach((child) => {
                children.push(...this.get_all_children(child));
                children.push(child);
            });
        }
        return children;
    }

    public get activeNode() {
        return this._activeNode;
    }

    public set activeNode(value: IgxTreeNode<any>) {
        if (this._activeNode === value) {
            return;
        }
        this.lastActiveNode = this._activeNode;
        this._activeNode = value;

        if (this.lastActiveNode?.id) {
            (this.lastActiveNode as any).cdr.markForCheck();
        }

        if (this._activeNode !== this.lastActiveNode) {
            this.tree.activeNodeChanged.emit(this._activeNode);
        }
    }

    public get focusedNode() {
        return this._focusedNode;
    }

    public set focusedNode(value: IgxTreeNode<any>) {
        if (this._focusedNode === value) {
            return;
        }
        this.lastFocusedNode = this._focusedNode;
        if (this.lastFocusedNode) {
            this.lastFocusedNode.tabIndex = -1;
        }
        this._focusedNode = value;
        if (this._focusedNode !== null) {
            this._focusedNode.tabIndex = 0;
            (this._focusedNode as any).header.nativeElement.focus();
        }
    }

    public handleFocusedAndActiveNode(node: IgxTreeNode<any>, isActive: boolean = true) {
        if (isActive) {
            this.activeNode = node;
        }
        this.focusedNode = node;
    }

    public register(tree: IgxTree) {
        this.tree = tree;
    }

    public isActiveNode(node: IgxTreeNode<any>): boolean {
        return this._activeNode === node;
    }

    public isFocusedNode(node: IgxTreeNode<any>): boolean {
        return this._focusedNode === node;
    }

    public handleNavigation(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (key === 'tab') {
            return;
        }
        if (event.repeat && NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
        }
        if (event.repeat) {
            setTimeout(() => this.dispatchEvent(event), 1);
        } else {
            this.dispatchEvent(event);
        }
    }

    public isFocusable(node: IgxTreeNode<any>): boolean {
        return this.visibleChildren.indexOf((node as any).nativeElement) < 0 ? false : true;
        // if (!node.parentNode) {
        //     return true;
        // }
        // if (!node.parentNode.expanded) {
        //     return false;
        // }
        // return this.isFocusable(node.parentNode);
    }

    public dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.focusedNode || !(NAVIGATION_KEYS.has(key) || key === '*' || key === 'enter')) {
            return;
        }

        this.getNextPosition(this.focusedNode, key, event);
        if (NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
        }
    }

    public focusNode(event: FocusEvent) {
        event.preventDefault();
        if ((this.tree as any).nativeElement.parentElement.nextSibling.contains(event.relatedTarget)) {
            this.handleFocusedAndActiveNode(this.visibleChildren[this.visibleChildren.length - 1], false);
        } else {
            this.handleFocusedAndActiveNode(this.tree.nodes.first, false);
        }
    }

    protected getNextPosition(node: IgxTreeNode<any>, key: string, event: KeyboardEvent) {
        switch (key) {
            case 'home':
                this.handleFocusedAndActiveNode(this.tree.nodes.first);
                break;
            case 'end':
                this.handleFocusedAndActiveNode(this.visibleChildren[this.visibleChildren.length - 1]);
                break;
            case 'arrowleft':
            case 'left':
                this.handleArrowLeft();
                break;
            case 'arrowright':
            case 'right':
                this.handleArrowRight();
                break;
            case 'arrowup':
            case 'up':
                this.handleUpDownArrow(true, event);
                break;
            case 'arrowdown':
            case 'down':
                this.handleUpDownArrow(false, event);
                break;
            case '*':
                this.handleAsterisk();
                break;
            case ' ':
            case 'spacebar':
            case 'space':
                this.handleSpace(event.shiftKey);
                break;
            default:
                return;
        }
        return node;
    }

    protected handleUpDownArrow(isUp: boolean, event: KeyboardEvent) {
        const next = isUp ? this.tree.getPreviousNode(this.focusedNode) :
            this.tree.getNextNode(this.focusedNode);
        if (next === this.focusedNode) {
            return;
        }
        event.preventDefault();

        if (event.ctrlKey) {
            this.handleFocusedAndActiveNode(next, false);
        } else {
            this.handleFocusedAndActiveNode(next);
        }
    }

    protected handleArrowRight() {
        if (this.focusedNode.children.length > 0) {
            if (!this.focusedNode.expanded) {
                this.handleFocusedAndActiveNode(this.focusedNode);
                this.focusedNode.expand();
            } else {
                const firstChild = this.focusedNode.children.toArray().find(node => node.disabled === false);
                if (firstChild) {
                    this.handleFocusedAndActiveNode(firstChild);
                }
            }
        }
    }

    protected handleArrowLeft() {
        if (this.focusedNode.expanded && this.focusedNode.children?.length) {
            this.handleFocusedAndActiveNode(this.focusedNode);
            this.focusedNode.collapse();
        } else {
            if (this.focusedNode.parentNode && !this.focusedNode.parentNode.disabled) {
                this.handleFocusedAndActiveNode(this.focusedNode.parentNode);
            }
        }
    }

    protected handleAsterisk() {
        if (this.focusedNode.parentNode) {
            const children = this.focusedNode.parentNode.children;
            children.forEach(child => {
                if (!child.disabled) {
                    child.expanded = true;
                }
            });
        } else {
            const rootNodes = this.tree.nodes.filter(node => node.level === 0);
            rootNodes.forEach(node => {
                if (!node.disabled) {
                    node.expanded = true;
                }
            });
        }
    }

    protected handleSpace(shiftKey = false) {
        if (this.tree.selection === IGX_TREE_SELECTION_TYPE.None) {
            return;
        }

        this.handleFocusedAndActiveNode(this.focusedNode);
        if (shiftKey) {
            (this.tree as any).selectionService.selectMultipleNodes(this.focusedNode);
            return;
        }

        if (this.focusedNode.selected) {
            (this.tree as any).selectionService.deselectNode(this.focusedNode);
        } else {
            (this.tree as any).selectionService.selectNode(this.focusedNode);
        }
    }
}
