import { EventEmitter, QueryList } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTreeNode } from './common';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';

export const TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS = 'igx-tree-node__select';
const CHECKBOX_INPUT_CSS_CLASS = '.igx-checkbox__input';
const TREE_NODE_CSS_CLASS = 'igx-tree-node';
const TREE_NODE_WRAPPER_CSS_CLASS = 'igx-tree-node__wrapper';
const TREE_NODE_EXPAND_INDICATOR_CSS_CLASS = 'igx-tree-node__toggle-button';

export class TreeTestFunctions {

    public static getAllNodes(fix: ComponentFixture<any>) {
        return fix.debugElement.queryAll(By.css(`.${TREE_NODE_CSS_CLASS}`));
    }

    public static getNodeCheckboxDiv(nodeDOM: HTMLElement): HTMLElement {
        return nodeDOM.querySelector(`.${TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS}`);
    }

    public static getNodeExpandIndicatorDiv(nodeDOM: HTMLElement): HTMLElement {
        return nodeDOM.querySelector(`.${TREE_NODE_EXPAND_INDICATOR_CSS_CLASS}`);
    }

    public static getNodeCheckboxInput(nodeDOM: HTMLElement): HTMLInputElement {
        return TreeTestFunctions.getNodeCheckboxDiv(nodeDOM).querySelector(CHECKBOX_INPUT_CSS_CLASS);
    }

    public static getNodeWrapperDiv(nodeDOM: HTMLElement): HTMLInputElement {
        return nodeDOM.querySelector(`.${TREE_NODE_WRAPPER_CSS_CLASS}`);
    }

    public static clickNodeCheckbox(node: IgxTreeNodeComponent<any>): Event {
        const checkboxElement = TreeTestFunctions.getNodeCheckboxDiv(node.nativeElement);
        const event = new Event('click', {});
        checkboxElement.dispatchEvent(event);
        return event;
    }

    public static clickNodeExpandIndicator(node: IgxTreeNodeComponent<any>): Event {
        const indicatorElement = TreeTestFunctions.getNodeExpandIndicatorDiv(node.nativeElement);
        const event = new Event('click', {});
        indicatorElement.dispatchEvent(event);
        return event;
    }

    public static clickOnTreeNode(nodeDOM: HTMLElement): Event {
        const nodeWrapperElement = this.getNodeWrapperDiv(nodeDOM);
        const event = new MouseEvent('pointerdown', { button: 0 });
        nodeWrapperElement.dispatchEvent(event);
        return event;
    }

    public static verifyNodeSelected(node: IgxTreeNodeComponent<any>, selected = true, hasCheckbox = true, indeterminate = false) {
        expect(node.selected).toBe(selected);
        expect(node.indeterminate).toBe(indeterminate);
        if (hasCheckbox) {
            expect(this.getNodeCheckboxDiv(node.nativeElement)).not.toBeNull();
            expect(TreeTestFunctions.getNodeCheckboxInput(node.nativeElement).checked).toBe(selected);
            expect(TreeTestFunctions.getNodeCheckboxInput(node.nativeElement).indeterminate).toBe(indeterminate);
        } else {
            expect(this.getNodeCheckboxDiv(node.nativeElement)).toBeNull();
        }
    }

    public static createNodeSpy(
        properties: { [key: string]: any } = null,
        methodNames: (keyof IgxTreeNode<any>)[] = ['selected']): jasmine.SpyObj<IgxTreeNode<any>> {
        if (!properties) {
            return jasmine.createSpyObj<IgxTreeNodeComponent<any>>(methodNames);
        }
        return jasmine.createSpyObj<IgxTreeNodeComponent<any>>(methodNames, properties);
    }

    public static createNodeSpies(
        level: number,
        count: number,
        parentNode?: IgxTreeNodeComponent<any>,
        children?: any[],
        allChildren?: any[]
    ): IgxTreeNodeComponent<any>[] {
        const nodesArr = [];
        const mockEmitter: EventEmitter<boolean> = jasmine.createSpyObj('emitter', ['emit']);
        for (let i = 0; i < count; i++) {
            nodesArr.push(this.createNodeSpy({
                level,
                expanded: false,
                disabled: false,
                tabIndex: null,
                header: { nativeElement: { focus: () => undefined } },
                parentNode: parentNode ? parentNode : null,
                _children: children ? children[i] : null,
                allChildren: allChildren ? allChildren[i] : null,
                selectedChange: mockEmitter
            }));
        }
        return nodesArr;
    }

    public static createQueryListSpy(nodes: IgxTreeNodeComponent<any>[]): jasmine.SpyObj<QueryList<IgxTreeNodeComponent<any>>> {
        const mockQuery = jasmine.createSpyObj(['toArray', 'filter', 'forEach']);
        Object.defineProperty(mockQuery, 'first', { value: nodes[0], enumerable: true });
        Object.defineProperty(mockQuery, 'last', { value: nodes[nodes.length - 1], enumerable: true });
        Object.defineProperty(mockQuery, 'length', { value: nodes.length, enumerable: true });
        mockQuery.toArray.and.returnValue(nodes);
        mockQuery.filter.and.callFake((cb) => nodes.filter(cb));
        mockQuery.forEach.and.callFake((cb) => nodes.forEach(cb));
        return mockQuery;
    }
}
