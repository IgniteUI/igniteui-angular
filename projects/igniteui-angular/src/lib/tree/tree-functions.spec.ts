import { EventEmitter, QueryList } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';

export const TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS = 'igx-tree-node__select';
const CHECKBOX_INPUT_CSS_CLASS = '.igx-checkbox__input';
const TREE_NODE_CSS_CLASS = 'igx-tree-node';

export class TreeTestFunctions {

    public static getAllNodes(fix: ComponentFixture<any>) {
        return fix.debugElement.queryAll(By.css(`.${TREE_NODE_CSS_CLASS}`));
    }

    public static getNodeCheckboxDiv(nodeDOM: HTMLElement): HTMLElement {
        return nodeDOM.querySelector(`.${TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS}`);
    }

    public static getNodeCheckboxInput(nodeDOM: HTMLElement): HTMLInputElement {
        return TreeTestFunctions.getNodeCheckboxDiv(nodeDOM).querySelector(CHECKBOX_INPUT_CSS_CLASS);
    }

    public static clickNodeCheckbox(node: IgxTreeNodeComponent<any>): Event {
        const checkboxElement = TreeTestFunctions.getNodeCheckboxDiv(node.nativeElement);
        const event = new Event('click', {});
        checkboxElement.dispatchEvent(event);
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

    public static createNodeSpies(
        count: number,
        parentNode?: IgxTreeNodeComponent<any>,
        children?: any[],
        allChildren?: any[]
    ): IgxTreeNodeComponent<any>[] {
        const nodesArr = [];
        const mockEmitter: EventEmitter<boolean> = jasmine.createSpyObj('emitter', ['emit']);
        for (let i = 0; i < count; i++) {
            nodesArr.push(jasmine.createSpyObj<IgxTreeNodeComponent<any>>(['id', 'selected'], {
                parentNode: parentNode ? parentNode : null,
                children: children ? children[i] : null,
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
    };
}
