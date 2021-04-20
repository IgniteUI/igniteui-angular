import { configureTestSuite } from '../test-utils/configure-suite';
import { waitForAsync, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IgxTreeNavigationComponent, IgxTreeScrollComponent } from './tree-samples.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxTreeNavigationService } from './tree-navigation.service';
import { ElementRef, EventEmitter } from '@angular/core';
import { IgxTreeSelectionService } from './tree-selection.service';
import { TreeTestFunctions } from './tree-functions.spec';
import { IgxTreeService } from './tree.service';
import { IgxTreeComponent, IgxTreeModule } from './tree.component';
import { IgxTree, IgxTreeNode, IgxTreeSelectionType } from './common';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';

describe('IgxTree - Navigation #treeView', () => {
    configureTestSuite();

    describe('Navigation - UI Tests', () => {
        let fix;
        let tree: IgxTreeComponent;
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxTreeNavigationComponent,
                    IgxTreeScrollComponent
                ],
                imports: [IgxTreeModule, NoopAnimationsModule]
            }).compileComponents();
        }));

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeNavigationComponent);
            fix.detectChanges();
            tree = fix.componentInstance.tree;
        }));

        describe('UI Interaction tests - None', () => {
            beforeEach(fakeAsync(() => {
                tree.selection = IgxTreeSelectionType.None;
                fix.detectChanges();
            }));

            it('Initial tab index without focus SHOULD be 0 for all nodes and active input should be set correctly', () => {
                const visibleNodes = (tree as any).navService.visibleChildren;
                visibleNodes.forEach(node => {
                    expect(node.header.nativeElement.tabIndex).toEqual(0);
                });

                // Should render node with `node.active === true`, set through input, as active in the tree
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[17]);
                expect(tree.nodes.toArray()[17].active).toBeTruthy();

                tree.nodes.first.header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();
                visibleNodes.forEach(node => {
                    if (node !== tree.nodes.first) {
                        expect(node.header.nativeElement.tabIndex).toEqual(-1);
                    } else {
                        expect(node.header.nativeElement.tabIndex).toEqual(0);
                    }
                });
            });

            it('Should focus/activate correct node on ArrowDown/ArrowUp (+ Ctrl) key pressed', () => {
                spyOn(tree.activeNodeChanged, 'emit').and.callThrough();
                tree.nodes.first.header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.first);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.first);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.first);

                // ArrowDown + Ctrl should only focus the next visible node
                UIInteractions.triggerKeyDownEvtUponElem('arrowdown', tree.nodes.first.nativeElement, true, false, false, true);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[17]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.first);

                // ArrowDown should focus and activate the next visible node
                UIInteractions.triggerKeyDownEvtUponElem('arrowdown', tree.nodes.first.nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[28]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[28]);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.toArray()[28]);

                // ArrowUp + Ctrl should only focus the previous visible node
                UIInteractions.triggerKeyDownEvtUponElem('arrowup', tree.nodes.toArray()[28].nativeElement, true, false, false, true);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[17]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[28]);

                // ArrowUp should focus and activate the previous visible node
                UIInteractions.triggerKeyDownEvtUponElem('arrowup', tree.nodes.toArray()[17].nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.first);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.first);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.first);
            });

            it('Should focus and activate the first/last visible node on Home/End key press', () => {
                spyOn(tree.activeNodeChanged, 'emit').and.callThrough();
                tree.nodes.first.expand();
                fix.detectChanges();
                tree.nodes.toArray()[2].header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('home', tree.nodes.toArray()[2].nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.first);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.first);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.first);

                UIInteractions.triggerKeyDownEvtUponElem('end', tree.nodes.first.nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.last);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.last);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.last);
            });

            it('Should collapse/navigate to correct node on Arrow left key press', fakeAsync(() => {
                spyOn(tree.activeNodeChanged, 'emit').and.callThrough();
                // If node is collapsed and has no parents the focus and activation should not be moved on Arrow left key press
                tree.nodes.first.header.nativeElement.dispatchEvent(new Event('pointerdown'));
                tick();
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowleft', tree.nodes.first.nativeElement);
                tick();
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.first);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.first);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.first);

                // If node is collapsed and has parent the focus and activation should be moved to the parent node on Arrow left key press
                tree.nodes.first.expand();
                tick();
                fix.detectChanges();
                UIInteractions.triggerKeyDownEvtUponElem('arrowdown', tree.nodes.first.nativeElement);
                tick();
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowleft', tree.nodes.first.nativeElement);
                tick();
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.first);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.first);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.first);

                // If node is expanded the node should collapse on Arrow left key press
                UIInteractions.triggerKeyDownEvtUponElem('arrowleft', tree.nodes.first.nativeElement);
                tick();
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.first);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.first);
                expect(tree.nodes.first.expanded).toBeFalsy();
            }));

            it('Should expand/navigate to correct node on Arrow right key press', () => {
                spyOn(tree.activeNodeChanged, 'emit').and.callThrough();
                // If node has no children the focus and activation should not be moved on Arrow right key press
                tree.nodes.last.header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowright', tree.nodes.last.nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.last);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.last);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.last);

                // If node is collapsed and has children the node should be expanded on Arrow right key press
                UIInteractions.triggerKeyDownEvtUponElem('home', tree.nodes.last.nativeElement);
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowright', tree.nodes.first.nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.first);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.first);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.first);
                expect(tree.nodes.first.expanded).toBeTruthy();

                // If node is expanded and has children the focus and activation should be moved to the first child on Arrow right key press
                UIInteractions.triggerKeyDownEvtUponElem('arrowright', tree.nodes.first.nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[1]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[1]);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.toArray()[1]);
            });

            it('Pressing Asterisk on focused node should expand all expandable nodes in the same group', () => {
                tree.nodes.first.header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowright', tree.nodes.first.nativeElement);
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowright', tree.nodes.first.nativeElement);
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('*', tree.nodes.first.nativeElement);
                fix.detectChanges();

                expect(tree.nodes.toArray()[2].expanded).toBeTruthy();
                expect(tree.nodes.toArray()[12].expanded).toBeTruthy();
            });

            it('Pressing Enter should activate the focused node and not prevent the keydown event`s deafault behavior', () => {
                spyOn(tree.activeNodeChanged, 'emit').and.callThrough();
                tree.nodes.first.header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowdown', tree.nodes.first.nativeElement, true, false, false, true);
                fix.detectChanges();

                const mockEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
                spyOn(mockEvent, 'preventDefault');
                tree.nodes.toArray()[17].nativeElement.dispatchEvent(mockEvent);
                expect(mockEvent.preventDefault).not.toHaveBeenCalled();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[17]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[17]);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.toArray()[17]);
            });

            it('Should correctly set node`s selection state on Space key press', () => {
                spyOn(tree.activeNodeChanged, 'emit').and.callThrough();
                // Space on None Selection Mode
                tree.selection = 'None';
                tree.nodes.first.header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowdown', tree.nodes.first.nativeElement, true, false, false, true);
                fix.detectChanges();

                spyOn((tree as any).selectionService, 'selectNode').and.callThrough();
                spyOn((tree as any).selectionService, 'deselectNode').and.callThrough();
                spyOn((tree as any).selectionService, 'selectMultipleNodes').and.callThrough();

                UIInteractions.triggerKeyDownEvtUponElem('space', tree.nodes.toArray()[17].nativeElement);
                fix.detectChanges();

                expect(tree.nodes.toArray()[17].selected).toBeFalsy();
                expect((tree as any).selectionService.selectNode).toHaveBeenCalledTimes(0);
                expect((tree as any).selectionService.deselectNode).toHaveBeenCalledTimes(0);
                expect((tree as any).selectionService.selectMultipleNodes).toHaveBeenCalledTimes(0);
                expect((tree as any).navService.activeNode).not.toEqual(tree.nodes.toArray()[17]);

                // Space for select
                tree.selection = 'BiState';
                UIInteractions.triggerKeyDownEvtUponElem('space', tree.nodes.toArray()[17].nativeElement);
                fix.detectChanges();

                expect(tree.nodes.toArray()[17].selected).toBeTruthy();
                expect((tree as any).selectionService.selectNode).toHaveBeenCalledTimes(1);
                expect((tree as any).selectionService.deselectNode).toHaveBeenCalledTimes(0);
                expect((tree as any).selectionService.selectMultipleNodes).toHaveBeenCalledTimes(0);
                expect((tree as any).selectionService.selectNode).toHaveBeenCalledWith(tree.nodes.toArray()[17]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[17]);
                expect(tree.activeNodeChanged.emit).toHaveBeenCalledWith(tree.nodes.toArray()[17]);

                // Space with Shift key
                UIInteractions.triggerKeyDownEvtUponElem('arrowup', tree.nodes.toArray()[17].nativeElement, true, false, false, true);
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('space', tree.nodes.first.nativeElement, true, false, true, false);
                fix.detectChanges();

                expect(tree.nodes.first.selected).toBeTruthy();
                expect(tree.nodes.toArray()[17].selected).toBeTruthy();
                expect((tree as any).selectionService.selectNode).toHaveBeenCalledTimes(1);
                expect((tree as any).selectionService.deselectNode).toHaveBeenCalledTimes(0);
                expect((tree as any).selectionService.selectMultipleNodes).toHaveBeenCalledTimes(1);
                expect((tree as any).selectionService.selectMultipleNodes).toHaveBeenCalledWith(tree.nodes.first);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.first);

                // Space for deselect

                UIInteractions.triggerKeyDownEvtUponElem('arrowdown', tree.nodes.first.nativeElement, true, false, false, true);
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('space', tree.nodes.toArray()[17].nativeElement);
                fix.detectChanges();

                expect(tree.nodes.toArray()[17].selected).toBeFalsy();
                expect((tree as any).selectionService.selectNode).toHaveBeenCalledTimes(1);
                expect((tree as any).selectionService.deselectNode).toHaveBeenCalledTimes(1);
                expect((tree as any).selectionService.selectMultipleNodes).toHaveBeenCalledTimes(1);
                expect((tree as any).selectionService.deselectNode).toHaveBeenCalledWith(tree.nodes.toArray()[17]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[17]);
            });
        });

        describe('UI Interaction tests - Scroll to focused node', () => {
            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(IgxTreeScrollComponent);
                fix.detectChanges();
                tree = fix.componentInstance.tree;
                tree.selection = IgxTreeSelectionType.None;
                fix.detectChanges();
            }));

            it('The tree container should be scrolled so that the focused node is in view', fakeAsync(() => {
                // set another node as active element, expect node to be in view
                tick();
                const treeElement = tree.nativeElement;
                let targetNode = tree.nodes.last;
                let nodeElement = targetNode.nativeElement;
                let nodeRect = nodeElement.getBoundingClientRect();
                let treeRect = treeElement.getBoundingClientRect();
                // expect node is in view
                expect((treeRect.top > nodeRect.top) || (treeRect.bottom < nodeRect.bottom)).toBeFalsy();
                targetNode = tree.nodes.first;
                nodeElement = targetNode?.header.nativeElement;
                targetNode.active = true;
                tick();
                fix.detectChanges();
                nodeRect = nodeElement.getBoundingClientRect();
                treeRect = treeElement.getBoundingClientRect();
                expect(treeElement.scrollTop).toBe(0);
                expect((treeRect.top > nodeRect.top) || (treeRect.bottom < nodeRect.bottom)).toBeFalsy();
                let lastNodeIndex = 0;
                let nodeIndex = 0;
                for (let i = 0; i < 150; i++) {
                    while (nodeIndex === lastNodeIndex) {
                        nodeIndex = Math.floor(Math.random() * tree.nodes.length);
                    }
                    lastNodeIndex = nodeIndex;
                    targetNode = tree.nodes.toArray()[nodeIndex];
                    nodeElement = targetNode.header.nativeElement;
                    targetNode.active = true;
                    tick();
                    fix.detectChanges();
                    tick();
                    fix.detectChanges();
                    // recalculate rectangles
                    treeRect = treeElement.getBoundingClientRect();
                    nodeRect = targetNode.header.nativeElement.getBoundingClientRect();
                    expect((treeRect.top <= nodeRect.top) && (treeRect.bottom >= nodeRect.bottom)).toBeTruthy();
                }
            }));
        });

        describe('UI Interaction tests - Disabled Nodes', () => {
            beforeEach(fakeAsync(() => {
                tree.selection = IgxTreeSelectionType.None;
                fix.detectChanges();
                fix.componentInstance.isDisabled = true;
                fix.detectChanges();
            }));

            it('TabIndex on disabled node should be -1', () => {
                expect(tree.nodes.last.header.nativeElement.tabIndex).toEqual(-1);
            });

            it('Should focus and activate the first/last enabled and visible node on Home/End key press', () => {
                tree.nodes.first.disabled = true;
                fix.detectChanges();

                tree.nodes.toArray()[38].header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('home', tree.nodes.first.nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[17]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[17]);

                UIInteractions.triggerKeyDownEvtUponElem('end', tree.nodes.toArray()[17].nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[38]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[38]);
            });

            it('Should navigate to correct node on Arrow left/right key press', () => {
                // If a node is collapsed and has a disabled parent the focus and activation
                // should not be moved from the node on Arrow left key press
                tree.nodes.first.expanded = true;
                fix.detectChanges();
                tree.nodes.toArray()[2].header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                tree.nodes.first.disabled = true;
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowleft', tree.nodes.toArray()[2].nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[2]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[2]);

                // If a node is expanded and all its children are disabled the focus and activation
                // should not be moved from the node on Arrow right key press

                UIInteractions.triggerKeyDownEvtUponElem('arrowright', tree.nodes.toArray()[2].nativeElement);
                fix.detectChanges();

                tree.nodes.toArray()[2]._children.forEach(child => {
                    child.disabled = true;
                });
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowright', tree.nodes.toArray()[2].nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[2]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[2]);

                // If a node is expanded and has enabled children the focus and activation
                // should be moved to the first enabled child on Arrow right key press

                tree.nodes.toArray()[4].disabled = false;
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowright', tree.nodes.toArray()[2].nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[4]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[4]);
            });

            it('Should navigate to the right node on Arrow up/down key press', () => {
                tree.nodes.toArray()[28].disabled = true;
                tree.nodes.toArray()[38].header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowup', tree.nodes.toArray()[38].nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[17]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[17]);

                UIInteractions.triggerKeyDownEvtUponElem('arrowdown', tree.nodes.toArray()[17].nativeElement);
                fix.detectChanges();

                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[38]);
                expect((tree as any).navService.activeNode).toEqual(tree.nodes.toArray()[38]);
            });

            it('Pressing Asterisk on focused node should expand only the enabled and expandable nodes in the same group', () => {
                tree.nodes.toArray()[17].disabled = true;
                tree.nodes.first.header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('*', tree.nodes.first.nativeElement);
                fix.detectChanges();

                expect(tree.nodes.toArray()[17].expanded).toBeFalsy();
                expect(tree.nodes.first.expanded).toBeTruthy();
                expect(tree.nodes.toArray()[28].expanded).toBeTruthy();
                expect(tree.nodes.toArray()[38].expanded).toBeTruthy();
                expect(tree.nodes.last.expanded).toBeFalsy();
            });
        });

        describe('UI Interaction tests - igxTreeNodeLink', () => {
            beforeEach(fakeAsync(() => {
                tree.selection = IgxTreeSelectionType.None;
                fix.detectChanges();
                fix.componentInstance.showNodesWithDirective = true;
                fix.detectChanges();
            }));

            it('Nodes with igxTreeNodeLink should have tabIndex -1', () => {
                expect(tree.nodes.toArray()[41].header.nativeElement.tabIndex).toEqual(-1);
                expect(tree.nodes.last.header.nativeElement.tabIndex).toEqual(-1);
            });

            it('When focus falls on link with directive, document.activeElement should be link with directive', fakeAsync(() => {
                tree.nodes.toArray()[40].header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('arrowdown', tree.nodes.toArray()[40].nativeElement);
                fix.detectChanges();
                tick();
                fix.detectChanges();

                const linkNode = tree.nodes.toArray()[41].linkChildren.first.nativeElement;
                expect(linkNode.tabIndex).toEqual(0);

                // When focus falls on link with directive, parent has focused class (nav.service.focusedNode === link.parent)
                expect((tree as any).navService.focusedNode).toEqual(tree.nodes.toArray()[41]);
                expect(document.activeElement).toEqual(linkNode);
            }));

            it('Link with passed parent in ng-template outisde of node parent has proper ref to parent', () => {
                tree.nodes.toArray()[40].header.nativeElement.dispatchEvent(new Event('pointerdown'));
                fix.detectChanges();

                tree.nodes.toArray()[46].expanded = true;
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('end', tree.nodes.toArray()[46].nativeElement);
                fix.detectChanges();

                expect(tree.nodes.last.registeredChildren[0].tabIndex).toEqual(0);
            });

        });
    });

    describe('IgxTreeNavigationSerivce - Unit Tests', () => {
        let selectionService: IgxTreeSelectionService;
        let treeService: IgxTreeService;
        let navService: IgxTreeNavigationService;
        let mockTree: IgxTree;
        let mockEmitter: EventEmitter<IgxTreeNode<any>>;
        let mockNodesLevel1: IgxTreeNodeComponent<any>[];
        let mockNodesLevel2_1: IgxTreeNodeComponent<any>[];
        let mockNodesLevel2_2: IgxTreeNodeComponent<any>[];
        let mockNodesLevel3_1: IgxTreeNodeComponent<any>[];
        let mockNodesLevel3_2: IgxTreeNodeComponent<any>[];
        let allNodes: IgxTreeNodeComponent<any>[];
        const mockQuery1: any = {};
        const mockQuery2: any = {};
        const mockQuery3: any = {};
        const mockQuery4: any = {};
        const mockQuery5: any = {};
        const mockQuery6: any = {};

        beforeEach(() => {
            selectionService = new IgxTreeSelectionService();
            treeService = new IgxTreeService();
            navService?.ngOnDestroy();
            navService = new IgxTreeNavigationService(treeService, selectionService);
            mockNodesLevel1 = TreeTestFunctions.createNodeSpies(0, 3, null, [mockQuery2, mockQuery3, []], [mockQuery6, mockQuery3, []]);
            mockNodesLevel2_1 = TreeTestFunctions.createNodeSpies(1, 2,
                mockNodesLevel1[0], [mockQuery4, mockQuery5], [mockQuery4, mockQuery5]);
            mockNodesLevel2_2 = TreeTestFunctions.createNodeSpies(1, 1, mockNodesLevel1[1], [[]]);
            mockNodesLevel3_1 = TreeTestFunctions.createNodeSpies(2, 2, mockNodesLevel2_1[0], [[], []]);
            mockNodesLevel3_2 = TreeTestFunctions.createNodeSpies(2, 2, mockNodesLevel2_1[1], [[], []]);
            allNodes = [
                mockNodesLevel1[0],
                mockNodesLevel2_1[0],
                ...mockNodesLevel3_1,
                mockNodesLevel2_1[1],
                ...mockNodesLevel3_2,
                mockNodesLevel1[1],
                ...mockNodesLevel2_2,
                mockNodesLevel1[2]
            ];

            Object.assign(mockQuery1, TreeTestFunctions.createQueryListSpy(allNodes));
            Object.assign(mockQuery2, TreeTestFunctions.createQueryListSpy(mockNodesLevel2_1));
            Object.assign(mockQuery3, TreeTestFunctions.createQueryListSpy(mockNodesLevel2_2));
            Object.assign(mockQuery4, TreeTestFunctions.createQueryListSpy(mockNodesLevel3_1));
            Object.assign(mockQuery5, TreeTestFunctions.createQueryListSpy(mockNodesLevel3_2));
            Object.assign(mockQuery6, TreeTestFunctions.createQueryListSpy([
                mockNodesLevel2_1[0],
                ...mockNodesLevel3_1,
                mockNodesLevel2_1[1],
                ...mockNodesLevel3_2
            ]));
        });

        describe('IgxNavigationService', () => {
            beforeEach(() => {
                mockEmitter = jasmine.createSpyObj('emitter', ['emit']);
                mockTree = jasmine.createSpyObj('tree', [''],
                    { selection: IgxTreeSelectionType.BiState, activeNodeChanged: mockEmitter, nodes: mockQuery1 });
                navService.register(mockTree);
            });

            it('Should properly register the specified tree', () => {
                navService = new IgxTreeNavigationService(treeService, selectionService);

                expect((navService as any).tree).toBeFalsy();

                navService.register(mockTree);
                expect((navService as any).tree).toEqual(mockTree);
            });

            it('Should properly calculate VisibleChildren collection', () => {
                navService.init_invisible_cache();
                expect(navService.visibleChildren.length).toEqual(3);

                (Object.getOwnPropertyDescriptor(allNodes[0], 'expanded').get as jasmine.Spy<any>)
                    .and.returnValue(true);
                navService.init_invisible_cache();
                expect(navService.visibleChildren.length).toEqual(5);

                (Object.getOwnPropertyDescriptor(allNodes[0], 'disabled').get as jasmine.Spy<any>)
                    .and.returnValue(true);
                navService.update_disabled_cache(allNodes[0]);
                expect(navService.visibleChildren.length).toEqual(4);
                allNodes.forEach(e => {
                    (Object.getOwnPropertyDescriptor(e, 'disabled').get as jasmine.Spy<any>)
                        .and.returnValue(true);
                    navService.update_disabled_cache(e);
                });
                expect(navService.visibleChildren.length).toEqual(0);
                mockTree.nodes = null;
                expect(navService.visibleChildren.length).toEqual(0);
            });

            it('Should set activeNode and focusedNode correctly', () => {
                const someNode = {
                    tabIndex: null,
                    header: {
                        nativeElement: jasmine.createSpyObj('nativeElement', ['focus'])
                    }
                } as any;

                const someNode2 = {
                    tabIndex: null,
                    header: {
                        nativeElement: jasmine.createSpyObj('nativeElement', ['focus'])
                    }
                } as any;

                navService.focusedNode = someNode;
                expect(someNode.header.nativeElement.focus).toHaveBeenCalled();
                expect(someNode.tabIndex).toBe(0);

                navService.setFocusedAndActiveNode(someNode2);

                expect(navService.activeNode).toEqual(someNode2);
                expect(someNode2.header.nativeElement.focus).toHaveBeenCalled();
                expect(someNode2.tabIndex).toBe(0);
                expect(someNode.tabIndex).toBe(-1);
                expect(mockTree.activeNodeChanged.emit).toHaveBeenCalledTimes(1);
                expect(mockTree.activeNodeChanged.emit).toHaveBeenCalledWith(someNode2);

                // do not change active node when call w/ same node
                navService.focusedNode = navService.focusedNode;
                expect(mockTree.activeNodeChanged.emit).toHaveBeenCalledTimes(1);

                // handle call w/ null
                navService.focusedNode = null;
                expect(someNode2.tabIndex).toBe(-1);
                expect(mockTree.activeNodeChanged.emit).toHaveBeenCalledTimes(1);

            });

            it('Should traverse visibleChildren on handleKeyDown', async () => {
                navService.init_invisible_cache();
                const mockEvent1 = new KeyboardEvent('keydown', { key: 'arrowdown', bubbles: true });
                spyOn(mockEvent1, 'preventDefault');
                spyOn(navService, 'handleKeydown').and.callThrough();
                navService.focusedNode = mockNodesLevel1[0];

                navService.handleKeydown(mockEvent1);

                expect(mockEvent1.preventDefault).toHaveBeenCalled();
                expect(navService.handleKeydown).toHaveBeenCalledTimes(1);
                expect(navService.focusedNode).toEqual(mockNodesLevel1[1]);

                const mockEvent2 = new KeyboardEvent('keydown', { key: 'arrowup', bubbles: true });
                spyOn(mockEvent2, 'preventDefault');
                navService.handleKeydown(mockEvent2);

                expect(mockEvent2.preventDefault).toHaveBeenCalled();
                expect(navService.handleKeydown).toHaveBeenCalledTimes(2);
                expect(navService.focusedNode).toEqual(mockNodesLevel1[0]);

                const mockEvent3 = new KeyboardEvent('keydown', { key: 'arrowdown', bubbles: true, repeat: true });
                spyOn(mockEvent3, 'preventDefault');
                // when event is repeated, prevent default and wait
                navService.handleKeydown(mockEvent3);
                expect(navService.handleKeydown).toHaveBeenCalledTimes(3);
                expect(mockEvent3.preventDefault).toHaveBeenCalled();
                // when event is repeating, node does not change immediately
                expect(navService.focusedNode).toEqual(mockNodesLevel1[0]);
                await wait(1);
                expect(navService.focusedNode).toEqual(mockNodesLevel1[1]);

                // does nothing if there is no focused node
                navService.focusedNode = null;
                const mockEvent4 = new KeyboardEvent('keydown', { key: 'arrowdown', bubbles: true, repeat: false });
                spyOn(mockEvent4, 'preventDefault');
                navService.handleKeydown(mockEvent4);
                expect(mockEvent4.preventDefault).not.toHaveBeenCalled();

                // do not move focused node if on last node
                navService.focusedNode = allNodes[allNodes.length - 1];
                navService.handleKeydown(mockEvent4);
                expect(navService.focusedNode).toEqual(allNodes[allNodes.length - 1]);
            });

            it('Should update visible children on all relevant tree events', () => {
                const mockTreeService = jasmine.createSpyObj<IgxTreeService>('mockSelection',
                    ['register', 'collapse', 'expand', 'collapsing'], {
                    collapsingNodes: jasmine.createSpyObj<Set<IgxTreeNodeComponent<any>>>('mockCollpasingSet',
                        ['add', 'delete', 'has'], {
                        size: 0
                    }),
                    expandedNodes: jasmine.createSpyObj<Set<IgxTreeNodeComponent<any>>>('mockExpandedSet',
                        ['add', 'delete', 'has'], {
                        size: 0
                    }),
                });
                const mockElementRef = jasmine.createSpyObj<ElementRef>('mockElement', ['nativeElement'], {
                    nativeElement: jasmine.createSpyObj<HTMLElement>('mockElement', ['focus'], {
                        clientHeight: 300,
                        scrollHeight: 300
                    })
                });
                const mockSelectionService = jasmine.createSpyObj<IgxTreeSelectionService>('mockSelection',
                    ['selectNodesWithNoEvent', 'selectMultipleNodes', 'deselectNode', 'selectNode', 'register']);
                const nav = new IgxTreeNavigationService(mockTreeService, mockSelectionService);
                const lvl1Nodes = TreeTestFunctions.createNodeSpies(0, 5);
                const mockQuery = TreeTestFunctions.createQueryListSpy(lvl1Nodes);
                Object.assign(mockQuery, { changes: new EventEmitter<any>() });
                spyOn(nav, 'init_invisible_cache');
                spyOn(nav, 'update_disabled_cache');
                spyOn(nav, 'update_visible_cache');
                spyOn(nav, 'register');
                const tree = new IgxTreeComponent(nav, mockSelectionService, mockTreeService, mockElementRef);
                tree.nodes = mockQuery;
                expect(nav.register).toHaveBeenCalledWith(tree);
                expect(nav.init_invisible_cache).not.toHaveBeenCalled();
                expect(nav.update_disabled_cache).not.toHaveBeenCalled();
                expect(nav.update_visible_cache).not.toHaveBeenCalled();
                // not initialized
                tree.ngOnInit();
                // manual call
                expect(nav.init_invisible_cache).not.toHaveBeenCalled();
                expect(nav.update_disabled_cache).not.toHaveBeenCalled();
                expect(nav.update_visible_cache).not.toHaveBeenCalled();
                // nav service will now be updated after any of the following are emitted
                const emitNode = tree.nodes.first;
                tree.disabledChange.emit(emitNode);
                expect(nav.init_invisible_cache).not.toHaveBeenCalled();
                expect(nav.update_disabled_cache).toHaveBeenCalledTimes(1);
                expect(nav.update_visible_cache).toHaveBeenCalledTimes(0);
                tree.disabledChange.emit(emitNode);
                expect(nav.update_disabled_cache).toHaveBeenCalledTimes(2);
                tree.nodeCollapsing.emit({
                    node: emitNode,
                    owner: tree,
                    cancel: false
                });
                expect(nav.update_visible_cache).toHaveBeenCalledTimes(1);
                tree.nodeExpanding.emit({
                    node: emitNode,
                    owner: tree,
                    cancel: false
                });
                expect(nav.update_visible_cache).toHaveBeenCalledTimes(2);
                // attach emitters to mock children
                lvl1Nodes.forEach(e => {
                    e.expandedChange = new EventEmitter<boolean>();
                    e.openAnimationDone = new EventEmitter();
                    e.closeAnimationDone = new EventEmitter();
                });
                tree.ngAfterViewInit();
                // inits cache on tree.ngAfterViewInit();
                expect(nav.init_invisible_cache).toHaveBeenCalledTimes(1);
                // init cache when tree nodes collection changes;
                (tree.nodes as any).changes.emit();
                expect(nav.init_invisible_cache).toHaveBeenCalledTimes(2);
                emitNode.expandedChange.emit(true);
                expect(nav.update_visible_cache).toHaveBeenCalledTimes(3);
                emitNode.expandedChange.emit(false);
                expect(nav.update_visible_cache).toHaveBeenCalledTimes(4);
                nav.ngOnDestroy();
                tree.ngOnDestroy();
            });
        });
    });
});



