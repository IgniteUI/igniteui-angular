import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../test-utils/configure-suite';
import { ChangeDetectorRef, Component, EventEmitter, QueryList, ViewChild } from '@angular/core';
import { IgxTreeComponent, IgxTreeModule } from './tree.component';
import { HIERARCHICAL_SAMPLE_DATA } from 'src/app/shared/sample-data';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { TreeTestFunctions, TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS } from './tree-functions.spec';
import { IgxTree, IGX_TREE_SELECTION_TYPE, ITreeNodeSelectionEvent } from './common';
import { IgxTreeSelectionService } from './tree-selection.service';
import { IgxTreeService } from './tree.service';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';
import { IgxTreeNavigationService } from './tree-navigation.service';

describe('IgxTree - Selection #treeView', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeSimpleComponent,
                IgxTreeSelectionSampleComponent
            ],
            imports: [IgxTreeModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    describe('UI Interaction tests - None & BiState', () => {
        let fix;
        let tree: IgxTreeComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeSimpleComponent);
            fix.detectChanges();
            tree = fix.componentInstance.tree;
            tree.selection = IGX_TREE_SELECTION_TYPE.BiState;
            fix.detectChanges();
        }));

        it('Should have checkbox on each node if selection mode is BiState', () => {
            const nodes = TreeTestFunctions.getAllNodes(fix);
            expect(nodes.length).toBe(4);
            nodes.forEach((node) => {
                const checkBoxElement = node.nativeElement.querySelector(`.${TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS}`);
                expect(checkBoxElement).not.toBeNull();
            });

            tree.selection = IGX_TREE_SELECTION_TYPE.None;
            fix.detectChanges();

            expect(nodes.length).toBe(4);
            nodes.forEach((node) => {
                const checkBoxElement = node.nativeElement.querySelector(`.${TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS}`);
                expect(checkBoxElement).toBeNull();
            });
        });

        it('Should be able to change node selection to None', () => {
            expect(tree.selection).toEqual(IGX_TREE_SELECTION_TYPE.BiState);
            const firstNode = tree.nodes.toArray()[0];
            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();
            TreeTestFunctions.verifyNodeSelected(firstNode);

            tree.selection = IGX_TREE_SELECTION_TYPE.None;
            fix.detectChanges();
            expect(tree.selection).toEqual(IGX_TREE_SELECTION_TYPE.None);
            TreeTestFunctions.verifyNodeSelected(firstNode, false, false);
        });

        it('Should be able to change node selection to Cascading', () => {
            expect(tree.selection).toEqual(IGX_TREE_SELECTION_TYPE.BiState);
            const firstNode = tree.nodes.toArray()[0];
            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();
            TreeTestFunctions.verifyNodeSelected(firstNode);

            tree.selection = IGX_TREE_SELECTION_TYPE.Cascading;
            fix.detectChanges();
            expect(tree.selection).toEqual(IGX_TREE_SELECTION_TYPE.Cascading);
            TreeTestFunctions.verifyNodeSelected(firstNode, false);
        });

        it('Click on checkbox should call node`s onSelectorClick method', () => {
            const firstNode = tree.nodes.toArray()[0];
            spyOn(firstNode, 'onSelectorClick').and.callThrough();

            const ev = TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();

            expect(firstNode.onSelectorClick).toHaveBeenCalledTimes(1);
            expect(firstNode.onSelectorClick).toHaveBeenCalledWith(ev);
        });

        it('Checkbox should correctly represent the node`s selection state', () => {
            const firstNode = tree.nodes.toArray()[0];
            firstNode.selected = true;
            fix.detectChanges();

            const secondNode = tree.nodes.toArray()[1];

            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
        });

        it('Nodes should be selected only from checkboxes', () => {
            const firstNode = tree.nodes.toArray()[0];
            firstNode.expanded = true;
            fix.detectChanges();
            const secondNode = tree.nodes.toArray()[1];

            UIInteractions.simulateClickEvent(firstNode.nativeElement);
            fix.detectChanges();
            UIInteractions.simulateClickEvent(secondNode.nativeElement);
            fix.detectChanges();

            TreeTestFunctions.verifyNodeSelected(firstNode, false);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
        });

        it('Should select multiple nodes with Shift + Click', () => {
            tree.nodes.toArray()[0].expanded = true;
            fix.detectChanges();
            const firstNode = tree.nodes.toArray()[10];

            tree.nodes.toArray()[14].expanded = true;
            fix.detectChanges();
            const secondNode = tree.nodes.toArray()[15];

            const mockEvent = new MouseEvent('click', { shiftKey: true });

            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();

            TreeTestFunctions.verifyNodeSelected(firstNode);

            // Click on other node holding Shift key
            secondNode.nativeElement.querySelector(`.${TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS}`).dispatchEvent(mockEvent);
            fix.detectChanges();

            for (let index = 10; index < 16; index++) {
                const node = tree.nodes.toArray()[index];
                TreeTestFunctions.verifyNodeSelected(node);
            }
        });

        it('Should be able to cancel nodeSelection event', () => {
            const firstNode = tree.nodes.toArray()[0];

            tree.nodeSelection.subscribe((e: any) => {
                e.cancel = true;
            });

            // Click on a node checkbox
            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();
            TreeTestFunctions.verifyNodeSelected(firstNode, false);
        });

        it('Should be able to programmatically overwrite the selection using nodeSelection event', () => {
            const firstNode = tree.nodes.toArray()[0];

            tree.nodeSelection.subscribe((e: any) => {
                e.newSelection = [tree.nodes.toArray()[1], tree.nodes.toArray()[14]];
            });

            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();

            TreeTestFunctions.verifyNodeSelected(firstNode, false);
            TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[1]);
            TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[14]);
        });
    });

    describe('UI Interaction tests - Cascading', () => {
        let fix;
        let tree: IgxTreeComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeSimpleComponent);
            fix.detectChanges();
            tree = fix.componentInstance.tree;
            tree.selection = IGX_TREE_SELECTION_TYPE.Cascading;
            fix.detectChanges();
        }));

        it('Should have checkbox on each node if selection mode is Cascading', () => {
            const nodes = TreeTestFunctions.getAllNodes(fix);
            expect(nodes.length).toBe(4);
            nodes.forEach((node) => {
                const checkBoxElement = node.nativeElement.querySelector(`.${TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS}`);
                expect(checkBoxElement).not.toBeNull();
            });
        });

        it('Should be able to change node selection to None', () => {
            expect(tree.selection).toEqual(IGX_TREE_SELECTION_TYPE.Cascading);
            TreeTestFunctions.clickNodeCheckbox(tree.nodes.toArray()[10]);
            fix.detectChanges();

            for (let i = 10; i < 14; i++) {
                TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[i]);
            }
            TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[0], false, true, true);

            tree.selection = IGX_TREE_SELECTION_TYPE.None;
            fix.detectChanges();

            expect(tree.selection).toEqual(IGX_TREE_SELECTION_TYPE.None);
            for (let i = 10; i < 14; i++) {
                TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[i], false, false);
            }
            TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[0], false, false);
        });

        it('Should be able to change node selection to BiState', () => {
            expect(tree.selection).toEqual(IGX_TREE_SELECTION_TYPE.Cascading);
            TreeTestFunctions.clickNodeCheckbox(tree.nodes.toArray()[10]);
            fix.detectChanges();

            for (let i = 10; i < 14; i++) {
                TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[i]);
            }
            TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[0], false, true, true);

            tree.selection = IGX_TREE_SELECTION_TYPE.BiState;
            fix.detectChanges();

            expect(tree.selection).toEqual(IGX_TREE_SELECTION_TYPE.BiState);
            for (let i = 10; i < 14; i++) {
                TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[i], false);
            }
            TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[0], false);
        });

        it('Checkbox should correctly represent the node`s selection state', () => {
            const firstNode = tree.nodes.toArray()[0];
            const secondNode = tree.nodes.toArray()[10];
            secondNode.selected = true;
            fix.detectChanges();

            TreeTestFunctions.verifyNodeSelected(firstNode, false, true, true);
            for (let i = 1; i < 14; i++) {
                if (i < 10) {
                    TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[i], false);
                } else {
                    TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[i]);
                }
            }
        });

        it('Should select multiple nodes with Shift + Click', () => {
            const firstNode = tree.nodes.toArray()[10];
            const secondNode = tree.nodes.toArray()[15];

            const mockEvent = new MouseEvent('click', { shiftKey: true });

            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();

            TreeTestFunctions.verifyNodeSelected(firstNode);

            // Click on other node holding Shift key
            secondNode.nativeElement.querySelector(`.${TREE_NODE_DIV_SELECTION_CHECKBOX_CSS_CLASS}`).dispatchEvent(mockEvent);
            fix.detectChanges();

            for (let index = 10; index < 21; index++) {
                const node = tree.nodes.toArray()[index];
                TreeTestFunctions.verifyNodeSelected(node);
            }
            TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[0], false, true, true);
        });

        it('Should be able to cancel nodeSelection event', () => {
            const firstNode = tree.nodes.toArray()[0];

            tree.nodeSelection.subscribe((e: any) => {
                e.cancel = true;
            });

            // Click on a node checkbox
            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();
            TreeTestFunctions.verifyNodeSelected(firstNode, false);
        });

        it('Should be able to programmatically overwrite the selection using nodeSelection event', () => {
            const firstNode = tree.nodes.toArray()[0];

            tree.nodeSelection.subscribe((e: any) => {
                e.newSelection = [tree.nodes.toArray()[10], tree.nodes.toArray()[15]];
            });

            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();

            TreeTestFunctions.verifyNodeSelected(firstNode, false, true, true);
            for (let i = 10; i < 18; i++) {
                if (i !== 14) {
                    TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[i]);
                } else {
                    TreeTestFunctions.verifyNodeSelected(tree.nodes.toArray()[i], false, true, true);
                }
            }
        });
    });

    describe('UI Interaction - Two-Way Binding', () => {
        let fix;
        let tree: IgxTreeComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeSelectionSampleComponent);
            fix.detectChanges();
            tree = fix.componentInstance.tree;
            tree.selection = IGX_TREE_SELECTION_TYPE.BiState;
            fix.detectChanges();
        }));

        it('Should correctly represent the node`s selection state on click', () => {
            const firstNode = tree.nodes.toArray()[0];
            firstNode.expanded = true;
            fix.detectChanges();
            const secondNode = tree.nodes.toArray()[1];
            secondNode.expanded = true;
            fix.detectChanges();
            const thirdNode = tree.nodes.toArray()[2];

            TreeTestFunctions.clickNodeCheckbox(thirdNode);
            fix.detectChanges();

            expect(firstNode.data.selected).toBeFalsy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, false);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true);

            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();

            expect(firstNode.data.selected).toBeTruthy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true);

            TreeTestFunctions.clickNodeCheckbox(thirdNode);
            fix.detectChanges();

            expect(firstNode.data.selected).toBeTruthy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeFalsy();
            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
            TreeTestFunctions.verifyNodeSelected(thirdNode, false);
        });

        it('Should correctly represent the node`s selection state when changing node`s selected property', () => {
            const firstNode = tree.nodes.toArray()[0];
            const secondNode = tree.nodes.toArray()[1];
            const thirdNode = tree.nodes.toArray()[2];
            thirdNode.selected = true;
            fix.detectChanges();

            expect(firstNode.data.selected).toBeFalsy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, false);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true);

            firstNode.selected = true;
            fix.detectChanges();

            expect(firstNode.data.selected).toBeTruthy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true);

            thirdNode.selected = false;
            fix.detectChanges();

            expect(firstNode.data.selected).toBeTruthy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeFalsy();
            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
            TreeTestFunctions.verifyNodeSelected(thirdNode, false);
        });

        it('Should correctly represent the node`s selection state when changing data selected property', () => {
            const firstNode = tree.nodes.toArray()[0];
            const secondNode = tree.nodes.toArray()[1];
            const thirdNode = tree.nodes.toArray()[2];
            thirdNode.data.selected = true;
            fix.detectChanges();

            expect(firstNode.data.selected).toBeFalsy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, false);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true);

            firstNode.data.selected = true;
            fix.detectChanges();

            expect(firstNode.data.selected).toBeTruthy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true);

            thirdNode.data.selected = false;
            fix.detectChanges();

            expect(firstNode.data.selected).toBeTruthy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeFalsy();
            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false);
            TreeTestFunctions.verifyNodeSelected(thirdNode, false);
        });

        it('Should correctly represent the node`s selection state on click in Cascading mode', () => {
            tree.selection = IGX_TREE_SELECTION_TYPE.Cascading;
            fix.detectChanges();

            const firstNode = tree.nodes.toArray()[0];
            firstNode.expanded = true;
            fix.detectChanges();
            const secondNode = tree.nodes.toArray()[1];
            secondNode.expanded = true;
            fix.detectChanges();
            const thirdNode = tree.nodes.toArray()[2];

            TreeTestFunctions.clickNodeCheckbox(thirdNode);
            fix.detectChanges();

            expect(firstNode.data.selected).toBeFalsy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true, true, false);

            TreeTestFunctions.clickNodeCheckbox(firstNode);
            fix.detectChanges();

            expect(firstNode.data.selected).toBeTruthy();
            expect(secondNode.data.selected).toBeTruthy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, true);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true);

            TreeTestFunctions.clickNodeCheckbox(thirdNode);
            fix.detectChanges();

            expect(firstNode.data.selected).toBeFalsy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeFalsy();
            TreeTestFunctions.verifyNodeSelected(firstNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(thirdNode, false, true, false);
        });

        it('Should correctly represent the node`s selection state when changing node`s selected property in Cascading mode', () => {
            tree.selection = IGX_TREE_SELECTION_TYPE.Cascading;
            fix.detectChanges();

            const firstNode = tree.nodes.toArray()[0];
            const secondNode = tree.nodes.toArray()[1];
            const thirdNode = tree.nodes.toArray()[2];
            thirdNode.selected = true;
            fix.detectChanges();

            expect(firstNode.data.selected).toBeFalsy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true, true, false);

            firstNode.selected = true;
            fix.detectChanges();

            expect(firstNode.data.selected).toBeTruthy();
            expect(secondNode.data.selected).toBeTruthy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, true);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true);

            thirdNode.selected = false;
            fix.detectChanges();

            expect(firstNode.data.selected).toBeFalsy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeFalsy();
            TreeTestFunctions.verifyNodeSelected(firstNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(thirdNode, false, true, false);
        });

        it('Should correctly represent the node`s selection state when changing data selected property in Cascading mode', () => {
            tree.selection = IGX_TREE_SELECTION_TYPE.Cascading;
            fix.detectChanges();

            const firstNode = tree.nodes.toArray()[0];
            const secondNode = tree.nodes.toArray()[1];
            const thirdNode = tree.nodes.toArray()[2];

            thirdNode.data.selected = true;
            fix.componentInstance.cdr.detectChanges();

            expect(firstNode.data.selected).toBeFalsy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true, true, false);

            firstNode.data.selected = true;
            fix.componentInstance.cdr.detectChanges();

            expect(firstNode.data.selected).toBeTruthy();
            expect(secondNode.data.selected).toBeTruthy();
            expect(thirdNode.data.selected).toBeTruthy();
            TreeTestFunctions.verifyNodeSelected(firstNode, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, true);
            TreeTestFunctions.verifyNodeSelected(thirdNode, true);

            thirdNode.data.selected = false;
            fix.componentInstance.cdr.detectChanges();

            expect(firstNode.data.selected).toBeFalsy();
            expect(secondNode.data.selected).toBeFalsy();
            expect(thirdNode.data.selected).toBeFalsy();
            TreeTestFunctions.verifyNodeSelected(firstNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(secondNode, false, true, true);
            TreeTestFunctions.verifyNodeSelected(thirdNode, false, true, false);
        });
    });

    describe('IgxTree - API Tests', () => {
        let mockNodes: IgxTreeNodeComponent<any>[];
        let mockQuery: jasmine.SpyObj<QueryList<any>>;
        const selectionService = new IgxTreeSelectionService();
        const treeService = new IgxTreeService();
        const navService = new IgxTreeNavigationService(treeService);
        const tree = new IgxTreeComponent(navService, selectionService, treeService, null);

        beforeEach(() => {
            mockNodes = TreeTestFunctions.createNodeSpies(5);
            mockQuery = TreeTestFunctions.createQueryListSpy(mockNodes);
            mockQuery.toArray.and.returnValue(mockNodes);
            mockQuery.forEach.and.callFake((cb) => mockNodes.forEach(cb));

            tree.selection = IGX_TREE_SELECTION_TYPE.BiState;
            (tree.nodes as any) = mockQuery;
        });

        it('Should be able to deselect all nodes', () => {
            spyOn(selectionService, 'deselectNodesWithNoEvent').and.callThrough();

            tree.nodes.forEach(node => node.selected = true);

            tree.deselectAll();
            expect((tree as any).selectionService.deselectNodesWithNoEvent).toHaveBeenCalled();
            expect((tree as any).selectionService.deselectNodesWithNoEvent).toHaveBeenCalledWith(undefined);
        });

        it('Should be able to deselect multiple nodes', () => {
            spyOn(selectionService, 'deselectNodesWithNoEvent').and.callThrough();

            tree.nodes.toArray()[0].selected = true;
            tree.nodes.toArray()[1].selected = true;

            tree.deselectAll([tree.nodes.toArray()[0], tree.nodes.toArray()[1]]);
            expect((tree as any).selectionService.deselectNodesWithNoEvent).toHaveBeenCalled();
            expect((tree as any).selectionService.deselectNodesWithNoEvent)
                .toHaveBeenCalledWith([tree.nodes.toArray()[0], tree.nodes.toArray()[1]]);
        });
    });

    describe('IgxTreeNode - API Tests', () => {
        const elementRef = { nativeElement: null };
        const selectionService = new IgxTreeSelectionService();
        const treeService = new IgxTreeService();
        const navService = new IgxTreeNavigationService(treeService);
        const mockEmitter: EventEmitter<ITreeNodeSelectionEvent> = jasmine.createSpyObj('emitter', ['emit']);;
        const mockTree: IgxTree = jasmine.createSpyObj('tree', [''],
            { selection: IGX_TREE_SELECTION_TYPE.BiState, nodeSelection: mockEmitter });
        const mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
        selectionService.register(mockTree);

        const node = new IgxTreeNodeComponent(mockTree, selectionService, treeService, navService, mockCdr, null, elementRef, null);

        it('Should call selectNodesWithNoEvent when seting node`s selected property to true', () => {
            spyOn(selectionService, 'selectNodesWithNoEvent').and.callThrough();
            node.selected = true;

            expect((node as any).selectionService.selectNodesWithNoEvent).toHaveBeenCalled();
            expect((node as any).selectionService.selectNodesWithNoEvent).toHaveBeenCalledWith([node]);
        });

        it('Should call deselectNodesWithNoEvent when seting node`s selected property to false', () => {
            spyOn(selectionService, 'deselectNodesWithNoEvent').and.callThrough();
            node.selected = false;

            expect((node as any).selectionService.deselectNodesWithNoEvent).toHaveBeenCalled();
            expect((node as any).selectionService.deselectNodesWithNoEvent).toHaveBeenCalledWith([node]);
        });

        it('Should call isNodeSelected when node`s selected getter is invoked', () => {
            spyOn(selectionService, 'isNodeSelected').and.callThrough();
            const isSelected = node.selected;

            expect(isSelected).toBeFalse();
            expect((node as any).selectionService.isNodeSelected).toHaveBeenCalled();
            expect((node as any).selectionService.isNodeSelected).toHaveBeenCalledWith(node);
        });

        it('Should call isNodeIndeterminate when node`s indeterminate getter is invoked', () => {
            spyOn(selectionService, 'isNodeIndeterminate').and.callThrough();
            const isIndeterminate = node.indeterminate;

            expect(isIndeterminate).toBeFalse();
            expect((node as any).selectionService.isNodeIndeterminate).toHaveBeenCalled();
            expect((node as any).selectionService.isNodeIndeterminate).toHaveBeenCalledWith(node);
        });
    });
});

@Component({
    template: `
    <igx-tree #tree1 class="medium">
            <igx-tree-node *ngFor="let node of data" [selected]="node.ID === 'ALFKI'" [data]="node">
                {{ node.CompanyName }}
                <igx-tree-node *ngFor="let child of node.ChildCompanies" [data]="child">
                    {{ child.CompanyName }}
                    <igx-tree-node *ngFor="let leafchild of child.ChildCompanies" [data]="leafchild">
                        {{ leafchild.CompanyName }}
                    </igx-tree-node>
                </igx-tree-node>
            </igx-tree-node>
        </igx-tree>
    `
})
export class IgxTreeSimpleComponent {
    @ViewChild(IgxTreeComponent, { static: true }) public tree: IgxTreeComponent;
    public data = HIERARCHICAL_SAMPLE_DATA;
}

@Component({
    template: `
    <igx-tree #tree1 class="medium">
            <igx-tree-node *ngFor="let node of data" [data]="node" [(selected)]="node.selected">
                {{ node.CompanyName }}
                <igx-tree-node *ngFor="let child of node.ChildCompanies" [data]="child" [(selected)]="child.selected">
                    {{ child.CompanyName }}
                    <igx-tree-node *ngFor="let leafchild of child.ChildCompanies" [data]="leafchild" [(selected)]="leafchild.selected">
                        {{ leafchild.CompanyName }}
                    </igx-tree-node>
                </igx-tree-node>
            </igx-tree-node>
        </igx-tree>
    `
})
export class IgxTreeSelectionSampleComponent {
    @ViewChild(IgxTreeComponent, { static: true }) public tree: IgxTreeComponent;
    public data;
    constructor(public cdr: ChangeDetectorRef) {
        this.data = HIERARCHICAL_SAMPLE_DATA;
        this.mapData(this.data);
    }
    private mapData(data: any[]) {
        data.forEach(x => {
            x.selected = false;
            if (x.hasOwnProperty('ChildCompanies') && x.ChildCompanies.length) {
                this.mapData(x.ChildCompanies);
            }
        });
    }
}
