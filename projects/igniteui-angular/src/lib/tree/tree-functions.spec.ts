import { By } from '@angular/platform-browser';

export const TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS = 'igx-tree-node__select';
const CHECKBOX_INPUT_CSS_CLASS = '.igx-checkbox__input';
const TREE_NODE_CSS_CLASS = 'igx-tree-node';

export class TreeFunctions {

    public static getAllNodes(fix) {
        return fix.debugElement.queryAll(By.css(`.${TREE_NODE_CSS_CLASS}`));
    }

    public static getNodeCheckboxDiv(nodeDOM): HTMLElement {
        return nodeDOM.querySelector(`.${TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS}`);
    }

    public static getNodeCheckboxInput(nodeDOM): HTMLInputElement {
        return TreeFunctions.getNodeCheckboxDiv(nodeDOM).querySelector(CHECKBOX_INPUT_CSS_CLASS);
    }

    public static clickNodeCheckbox(node): Event {
        const checkboxElement = TreeFunctions.getNodeCheckboxDiv(node.nativeElement);
        const event = new Event('click', {});
        checkboxElement.dispatchEvent(event);
        return event;
    }

    public static verifyNodeSelected(node, selected = true, hasCheckbox = true, indeterminate = false) {
        expect(node.selected).toBe(selected);
        expect(node.indeterminate).toBe(indeterminate);
        if (hasCheckbox) {
            expect(this.getNodeCheckboxDiv(node.nativeElement)).not.toBeNull();
            expect(TreeFunctions.getNodeCheckboxInput(node.nativeElement).checked).toBe(selected);
            expect(TreeFunctions.getNodeCheckboxInput(node.nativeElement).indeterminate).toBe(indeterminate);
        } else {
            expect(this.getNodeCheckboxDiv(node.nativeElement)).toBeNull();
        }
    }
}
