import { EventEmitter } from '@angular/core';
import { IgxTree, IgxTreeNode, IGX_TREE_SELECTION_TYPE, ITreeNodeSelectionEvent } from './common';
import { TreeTestFunctions } from './tree-functions.spec';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';
import { IgxTreeSelectionService } from './tree-selection.service';

describe('IgxTreeSelectionService - Unit Tests #treeView', () => {
    let selectionService: IgxTreeSelectionService;
    let mockEmitter: EventEmitter<ITreeNodeSelectionEvent>;
    let mockTree: IgxTree;
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

    beforeEach(() => {
        selectionService = new IgxTreeSelectionService();
        mockNodesLevel1 = TreeTestFunctions.createNodeSpies(3, null, [mockQuery2, mockQuery3]);
        mockNodesLevel2_1 = TreeTestFunctions.createNodeSpies(2, mockNodesLevel1[0], [mockQuery4, mockQuery5]);
        mockNodesLevel2_2 = TreeTestFunctions.createNodeSpies(1, mockNodesLevel1[1], null);
        mockNodesLevel3_1 = TreeTestFunctions.createNodeSpies(2, mockNodesLevel2_1[0], null);
        mockNodesLevel3_2 = TreeTestFunctions.createNodeSpies(2, mockNodesLevel2_1[1], null);
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
    });

    describe('IgxTreeSelectionService - BiState & None', () => {
        beforeEach(() => {
            mockEmitter = jasmine.createSpyObj('emitter', ['emit']);
            mockTree = jasmine.createSpyObj('tree', [''],
                { selection: IGX_TREE_SELECTION_TYPE.BiState, nodeSelection: mockEmitter, nodes: mockQuery1 });
            selectionService.register(mockTree);
        });

        it('Should properly register the specified tree', () => {
            selectionService = new IgxTreeSelectionService();

            expect((selectionService as any).tree).toBeFalsy();

            selectionService.register(mockTree);
            expect((selectionService as any).tree).toEqual(mockTree);
        });

        it('Should return proper value when isNodeSelected is called', () => {
            const selectionSet: Set<IgxTreeNode<any>> = (selectionService as any).nodeSelection;

            expect(selectionSet.size).toBe(0);

            spyOn(selectionSet, 'clear').and.callThrough();

            const mockNode1 = jasmine.createSpyObj<IgxTreeNode<any>>(['id', 'selected']);
            const mockNode2 = jasmine.createSpyObj<IgxTreeNode<any>>(['id', 'selected']);
            expect(selectionService.isNodeSelected(mockNode1)).toBeFalsy();
            expect(selectionService.isNodeSelected(mockNode2)).toBeFalsy();

            selectionSet.add(mockNode1);

            expect(selectionService.isNodeSelected(mockNode1)).toBeTruthy();
            expect(selectionService.isNodeSelected(mockNode2)).toBeFalsy();
            expect(selectionSet.size).toBe(1);

            selectionService.clearNodesSelection();

            expect(selectionService.isNodeSelected(mockNode1)).toBeFalsy();
            expect(selectionService.isNodeSelected(mockNode2)).toBeFalsy();
            expect(selectionSet.clear).toHaveBeenCalled();
            expect(selectionSet.size).toBe(0);
        });

        it('Should handle selection based on tree.selection', () => {
            const mockSelectedChangeEmitter: EventEmitter<boolean> = jasmine.createSpyObj('emitter', ['emit']);
            const mockNode = jasmine.createSpyObj<IgxTreeNode<any>>(['id', 'selected'], { selectedChange: mockSelectedChangeEmitter });

            // None
            (Object.getOwnPropertyDescriptor(mockTree, 'selection').get as jasmine.Spy<any>).and.returnValue(IGX_TREE_SELECTION_TYPE.None);
            selectionService.selectNode(mockNode);
            expect(selectionService.isNodeSelected(mockNode)).toBeFalsy();
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();
            expect(mockNode.selectedChange.emit).not.toHaveBeenCalled();

            // BiState
            (Object.getOwnPropertyDescriptor(mockTree, 'selection').get as jasmine.Spy<any>)
                .and.returnValue(IGX_TREE_SELECTION_TYPE.BiState);
            let expected: ITreeNodeSelectionEvent = {
                oldSelection: [], newSelection: [mockNode],
                added: [mockNode], removed: [], event: undefined, cancel: false
            };

            selectionService.selectNode(mockNode);

            expect(selectionService.isNodeSelected(mockNode)).toBeTruthy();
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
            expect(mockNode.selectedChange.emit).toHaveBeenCalledTimes(1);
            expect(mockNode.selectedChange.emit).toHaveBeenCalledWith(true);

            // Cascading
            selectionService.deselectNode(mockNode);

            (Object.getOwnPropertyDescriptor(mockTree, 'selection').get as jasmine.Spy<any>)
                .and.returnValue(IGX_TREE_SELECTION_TYPE.Cascading);
            selectionService.selectNode(allNodes[1]);

            expected = {
                oldSelection: [], newSelection: [allNodes[1], allNodes[2], allNodes[3]],
                added: [allNodes[1], allNodes[2], allNodes[3]], removed: [], event: undefined, cancel: false
            };

            expect(selectionService.isNodeSelected(allNodes[1])).toBeTruthy();
            expect(selectionService.isNodeSelected(allNodes[2])).toBeTruthy();
            expect(selectionService.isNodeSelected(allNodes[3])).toBeTruthy();
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeTruthy();
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(3);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
            for (let i = 1; i < 4; i++) {
                expect(allNodes[i].selectedChange.emit).toHaveBeenCalled();
                expect(allNodes[i].selectedChange.emit).toHaveBeenCalledWith(true);
            }
        });

        it('Should deselect nodes', () => {
            const mockSelectedChangeEmitter: EventEmitter<boolean> = jasmine.createSpyObj('emitter', ['emit']);
            const mockNode1 = jasmine.createSpyObj<IgxTreeNode<any>>(['id', 'selected'], { selectedChange: mockSelectedChangeEmitter });
            const mockNode2 = jasmine.createSpyObj<IgxTreeNode<any>>(['id', 'selected'], { selectedChange: mockSelectedChangeEmitter });

            selectionService.deselectNode(mockNode1);

            expect(selectionService.isNodeSelected(mockNode1)).toBeFalsy();
            expect(selectionService.isNodeSelected(mockNode2)).toBeFalsy();
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();
            expect(mockNode1.selectedChange.emit).not.toHaveBeenCalled();

            // mark a node as selected
            selectionService.selectNode(mockNode1);

            expect(selectionService.isNodeSelected(mockNode1)).toBeTruthy();
            expect(selectionService.isNodeSelected(mockNode2)).toBeFalsy();
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);
            expect(mockNode1.selectedChange.emit).toHaveBeenCalledTimes(1);
            expect(mockNode1.selectedChange.emit).toHaveBeenCalledWith(true);

            // deselect node
            const expected: ITreeNodeSelectionEvent = {
                newSelection: [], oldSelection: [mockNode1],
                removed: [mockNode1], added: [], event: undefined, cancel: false
            };
            selectionService.deselectNode(mockNode1);

            expect(selectionService.isNodeSelected(mockNode1)).toBeFalsy();
            expect(selectionService.isNodeSelected(mockNode2)).toBeFalsy();
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(2);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
            expect(mockNode1.selectedChange.emit).toHaveBeenCalledTimes(2);
            expect(mockNode1.selectedChange.emit).toHaveBeenCalledWith(false);
        });

        it('Should be able to deselect all nodes', () => {
            selectionService.selectNodesWithNoEvent(allNodes.slice(0, 3));
            for (const node of allNodes.slice(0, 3)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();

            selectionService.deselectNodesWithNoEvent();

            for (const node of allNodes.slice(0, 3)) {
                expect(selectionService.isNodeSelected(node)).toBeFalsy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(false);
            }
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();
        });

        it('Should be able to deselect range of nodes', () => {
            selectionService.selectNodesWithNoEvent(allNodes.slice(0, 3));

            for (const node of allNodes.slice(0, 3)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();

            selectionService.deselectNodesWithNoEvent([allNodes[0], allNodes[2]]);

            expect(selectionService.isNodeSelected(allNodes[0])).toBeFalsy();
            expect(selectionService.isNodeSelected(allNodes[2])).toBeFalsy();
            expect(allNodes[0].selectedChange.emit).toHaveBeenCalled();
            expect(allNodes[0].selectedChange.emit).toHaveBeenCalledWith(false);
            expect(allNodes[2].selectedChange.emit).toHaveBeenCalled();
            expect(allNodes[2].selectedChange.emit).toHaveBeenCalledWith(false);
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();
        });

        it('Should be able to select multiple nodes', () => {
            selectionService.selectNodesWithNoEvent(allNodes.slice(0, 3));

            for (const node of allNodes.slice(0, 3)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(selectionService.isNodeSelected(allNodes[3])).toBeFalsy();

            selectionService.selectNodesWithNoEvent([allNodes[3]]);
            for (const node of allNodes.slice(0, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
            }
            expect(allNodes[3].selectedChange.emit).toHaveBeenCalled();
            expect(allNodes[3].selectedChange.emit).toHaveBeenCalledWith(true);

            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();
        });

        it('Should be able to clear selection when adding multiple nodes', () => {
            selectionService.selectNodesWithNoEvent(allNodes.slice(0, 3));

            for (const node of allNodes.slice(0, 3)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(selectionService.isNodeSelected(allNodes[3])).toBeFalsy();

            selectionService.selectNodesWithNoEvent(allNodes.slice(1, 4), true);

            for (const node of allNodes.slice(1, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(selectionService.isNodeSelected(allNodes[0])).toBeFalsy();
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();
        });

        it('Should add newly selected nodes to the existing selection', () => {
            selectionService.selectNode(mockTree.nodes.first);

            let expected: ITreeNodeSelectionEvent = {
                oldSelection: [], newSelection: [mockQuery1.first],
                added: [mockQuery1.first], removed: [], event: undefined, cancel: false
            };

            expect(selectionService.isNodeSelected(allNodes[0])).toBeTruthy();
            expect(mockTree.nodes.first.selectedChange.emit).toHaveBeenCalled();
            expect(mockTree.nodes.first.selectedChange.emit).toHaveBeenCalledWith(true);

            for (let i = 1; i < allNodes.length; i++) {
                expect(selectionService.isNodeSelected(allNodes[i])).toBeFalsy();
            }

            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);

            expected = {
                oldSelection: [allNodes[0]], newSelection: [allNodes[0], allNodes[1]],
                added: [allNodes[1]], removed: [], event: undefined, cancel: false
            };

            selectionService.selectNode(mockTree.nodes.toArray()[1]);

            expect(mockTree.nodes.toArray()[1].selectedChange.emit).toHaveBeenCalled();
            expect(mockTree.nodes.toArray()[1].selectedChange.emit).toHaveBeenCalledWith(true);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(2);
            expect(selectionService.isNodeSelected(allNodes[0])).toBeTruthy();
            expect(selectionService.isNodeSelected(allNodes[1])).toBeTruthy();
        });

        it('Should be able to select a range of nodes', () => {
            selectionService.selectNode(allNodes[3]);

            // only third node is selected
            expect(selectionService.isNodeSelected(allNodes[3])).toBeTruthy();
            expect(allNodes[3].selectedChange.emit).toHaveBeenCalled();
            expect(allNodes[3].selectedChange.emit).toHaveBeenCalledWith(true);
            for (let i = 0; i < allNodes.length; i++) {
                if (i !== 3) {
                    expect(selectionService.isNodeSelected(allNodes[i])).toBeFalsy();
                }
            }

            // select all nodes from third to eighth
            selectionService.selectMultipleNodes(allNodes[8]);

            allNodes.forEach((node, index) => {
                if (index >= 3 && index <= 8) {
                    expect(selectionService.isNodeSelected(node)).toBeTruthy();
                    expect(node.selectedChange.emit).toHaveBeenCalled();
                    expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
                } else {
                    expect(selectionService.isNodeSelected(node)).toBeFalsy();
                }
            });

            const expected: ITreeNodeSelectionEvent = {
                oldSelection: [allNodes[3]], newSelection: allNodes.slice(3, 9),
                added: allNodes.slice(4, 9), removed: [], event: undefined, cancel: false
            };
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        });

        it('Should be able to select a range of nodes in reverse order', () => {
            selectionService.selectNode(allNodes[8]);

            // only eighth node is selected
            expect(selectionService.isNodeSelected(allNodes[8])).toBeTruthy();
            expect(allNodes[8].selectedChange.emit).toHaveBeenCalled();
            expect(allNodes[8].selectedChange.emit).toHaveBeenCalledWith(true);
            for (let i = 0; i < allNodes.length; i++) {
                if (i !== 8) {
                    expect(selectionService.isNodeSelected(allNodes[i])).toBeFalsy();
                }
            }

            // select all nodes from eighth to second
            selectionService.selectMultipleNodes(allNodes[2]);

            allNodes.forEach((node, index) => {
                if (index >= 2 && index <= 8) {
                    expect(selectionService.isNodeSelected(node)).toBeTruthy();
                    expect(node.selectedChange.emit).toHaveBeenCalled();
                    expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
                } else {
                    expect(selectionService.isNodeSelected(node)).toBeFalsy();
                }
            });

            const expected: ITreeNodeSelectionEvent = {
                oldSelection: [allNodes[8]], newSelection: [allNodes[8], ...allNodes.slice(2, 8)],
                added: allNodes.slice(2, 8), removed: [], event: undefined, cancel: false
            };
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        });
    });

    describe('IgxTreeSelectionService - Cascading', () => {
        beforeEach(() => {
            mockEmitter = jasmine.createSpyObj('emitter', ['emit']);
            mockTree = jasmine.createSpyObj('tree', [''],
                { selection: IGX_TREE_SELECTION_TYPE.Cascading, nodeSelection: mockEmitter, nodes: mockQuery1 });
            selectionService.register(mockTree);
        });

        it('Should deselect nodes', () => {
            selectionService.deselectNode(allNodes[1]);

            for (const node of allNodes.slice(1, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeFalsy();
                expect(node.selectedChange.emit).not.toHaveBeenCalled();
            }
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();

            // mark a node as selected
            selectionService.selectNode(allNodes[1]);

            for (const node of allNodes.slice(1, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeTruthy();
            expect(allNodes[0].selectedChange.emit).not.toHaveBeenCalled();
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);

            const expected: ITreeNodeSelectionEvent = {
                newSelection: [], oldSelection: [allNodes[1], allNodes[2], allNodes[3]],
                removed: [allNodes[1], allNodes[2], allNodes[3]], added: [], event: undefined, cancel: false
            };
            // deselect node
            selectionService.deselectNode(allNodes[1]);

            for (const node of allNodes.slice(1, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeFalsy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(false);
            }
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeFalse();
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(2);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        });

        it('Should be able to deselect range of nodes', () => {
            selectionService.selectNodesWithNoEvent([allNodes[1], allNodes[4]]);

            for (const node of allNodes.slice(0, 7)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();

            selectionService.deselectNodesWithNoEvent([allNodes[1], allNodes[5]]);

            for (const node of allNodes.slice(1, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeFalsy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(false);
            }
            expect(selectionService.isNodeSelected(allNodes[5])).toBeFalsy();
            expect(selectionService.isNodeSelected(allNodes[6])).toBeTruthy();
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeTruthy();
            expect(selectionService.isNodeIndeterminate(allNodes[4])).toBeTruthy();
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();
        });

        it('Should be able to select multiple nodes', () => {
            selectionService.selectNodesWithNoEvent([allNodes[1], allNodes[8]]);

            for (const node of allNodes.slice(1, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(selectionService.isNodeSelected(allNodes[7])).toBeTruthy();
            expect(selectionService.isNodeSelected(allNodes[8])).toBeTruthy();
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeTruthy();

            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();
        });

        it('Should be able to clear selection when adding multiple nodes', () => {
            selectionService.selectNodesWithNoEvent([allNodes[1]], true);

            for (const node of allNodes.slice(1, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeTruthy();
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();

            selectionService.selectNodesWithNoEvent([allNodes[3], allNodes[4]], true);

            for (const node of allNodes.slice(3, 7)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeTruthy();
            expect(selectionService.isNodeIndeterminate(allNodes[1])).toBeTruthy();
            expect(selectionService.isNodeSelected(allNodes[2])).toBeFalsy();
            expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();
        });

        it('Should add newly selected nodes to the existing selection', () => {
            selectionService.selectNode(allNodes[1]);

            let expected: ITreeNodeSelectionEvent = {
                oldSelection: [], newSelection: allNodes.slice(1, 4),
                added: allNodes.slice(1, 4), removed: [], event: undefined, cancel: false
            };

            for (const node of allNodes.slice(1, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            for (let i = 4; i < allNodes.length; i++) {
                expect(selectionService.isNodeSelected(allNodes[i])).toBeFalsy();
            }
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeTruthy();
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);

            expected = {
                oldSelection: allNodes.slice(1, 4), newSelection: [allNodes[1], allNodes[2], allNodes[3], allNodes[5]],
                added: [allNodes[5]], removed: [], event: undefined, cancel: false
            };

            selectionService.selectNode(allNodes[5]);

            for (const node of allNodes.slice(1, 4)) {
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
                expect(node.selectedChange.emit).toHaveBeenCalled();
                expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
            }
            expect(selectionService.isNodeSelected(allNodes[5])).toBeTruthy();
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeTruthy();
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(2);
        });

        it('Should be able to select a range of nodes', () => {
            selectionService.selectNode(allNodes[3]);
            expect(selectionService.isNodeSelected(allNodes[3])).toBeTruthy();

            // select all nodes from first to eighth
            selectionService.selectMultipleNodes(allNodes[8]);

            allNodes.forEach((node, index) => {
                if (index >= 4 && index <= 8) {
                    expect(selectionService.isNodeSelected(node)).toBeTruthy();
                    expect(node.selectedChange.emit).toHaveBeenCalled();
                    expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
                } else if (index === 3) {
                    expect(selectionService.isNodeSelected(node)).toBeTruthy();
                } else {
                    expect(selectionService.isNodeSelected(node)).toBeFalsy();
                }
            });

            const expected: ITreeNodeSelectionEvent = {
                oldSelection: [allNodes[3]], newSelection: allNodes.slice(3, 9),
                added: allNodes.slice(4, 9),
                removed: [], event: undefined, cancel: false
            };
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
            expect(selectionService.isNodeIndeterminate(allNodes[0])).toBeTruthy();
            expect(selectionService.isNodeIndeterminate(allNodes[1])).toBeTruthy();
        });

        it('Should be able to select a range of nodes in reverse order', () => {
            selectionService.selectNode(allNodes[8]);

            // only seventh and eighth node are selected
            expect(selectionService.isNodeSelected(allNodes[7])).toBeTruthy();
            expect(selectionService.isNodeSelected(allNodes[8])).toBeTruthy();
            expect(allNodes[7].selectedChange.emit).toHaveBeenCalled();
            expect(allNodes[7].selectedChange.emit).toHaveBeenCalledWith(true);
            expect(allNodes[8].selectedChange.emit).toHaveBeenCalled();
            expect(allNodes[8].selectedChange.emit).toHaveBeenCalledWith(true);
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);

            for (let i = 0; i < allNodes.length; i++) {
                if (i !== 7 && i !== 8) {
                    expect(selectionService.isNodeSelected(allNodes[i])).toBeFalsy();
                }
            }

            // select all nodes from eight to second
            selectionService.selectMultipleNodes(allNodes[2]);

            allNodes.forEach((node, index) => {
                if (index <= 8) {
                    expect(selectionService.isNodeSelected(node)).toBeTruthy();
                    if (index < 7) {
                        expect(node.selectedChange.emit).toHaveBeenCalled();
                        expect(node.selectedChange.emit).toHaveBeenCalledWith(true);
                    }
                } else {
                    expect(selectionService.isNodeSelected(node)).toBeFalsy();
                }
            });

            const expected: ITreeNodeSelectionEvent = {
                oldSelection: [allNodes[8], allNodes[7]],
                newSelection: [allNodes[8], allNodes[7], ...allNodes.slice(2, 7), allNodes[1], allNodes[0]],
                added: [...allNodes.slice(2, 7), allNodes[1], allNodes[0]], removed: [], event: undefined, cancel: false
            };
            expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        });
    });
});
