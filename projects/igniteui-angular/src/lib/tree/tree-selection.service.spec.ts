import { EventEmitter } from '@angular/core';
import { IgxTree, IgxTreeNode, IGX_TREE_SELECTION_TYPE, ITreeNodeSelectionEvent } from './common';
import { IgxTreeSelectionService } from './tree-selection.service';

describe('IgxTreeSelectionService - Unit Tests', () => {
    let selectionService: IgxTreeSelectionService;
    let mockEmitter: EventEmitter<ITreeNodeSelectionEvent>;
    let mockTree: IgxTree;
    let mockNodesLevel1: IgxTreeNode<any>[];
    let mockNodesLevel2_1: IgxTreeNode<any>[];
    let mockNodesLevel2_2: IgxTreeNode<any>[];
    let mockNodesLevel3_1: IgxTreeNode<any>[];
    let mockNodesLevel3_2: IgxTreeNode<any>[];
    let allNodes: IgxTreeNode<any>[];
    const mockQuery1: any = {};
    const mockQuery2: any = {};
    const mockQuery3: any = {};
    const mockQuery4: any = {};
    const mockQuery5: any = {};
    beforeEach(() => {
        selectionService = new IgxTreeSelectionService();
        mockNodesLevel1 = createNodeSpies(null, [mockQuery2, mockQuery3], 3);
        mockNodesLevel2_1 = createNodeSpies(mockNodesLevel1[0], [mockQuery4, mockQuery5], 2);
        mockNodesLevel2_2 = createNodeSpies(mockNodesLevel1[1], null, 1);
        mockNodesLevel3_1 = createNodeSpies(mockNodesLevel2_1[0], null, 2);
        mockNodesLevel3_2 = createNodeSpies(mockNodesLevel2_1[1], null, 2);
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

        Object.assign(mockQuery1, createQueryListSpies(allNodes));
        Object.assign(mockQuery2, createQueryListSpies(mockNodesLevel2_1));
        Object.assign(mockQuery3, createQueryListSpies(mockNodesLevel2_2));
        Object.assign(mockQuery4, createQueryListSpies(mockNodesLevel3_1));
        Object.assign(mockQuery5, createQueryListSpies(mockNodesLevel3_2));

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
        const mockNode = jasmine.createSpyObj<IgxTreeNode<any>>(['id', 'selected']);

        // none

        // https://jasmine.github.io/tutorials/spying_on_properties
        (Object.getOwnPropertyDescriptor(mockTree, 'selection').get as jasmine.Spy<any>).and.returnValue(IGX_TREE_SELECTION_TYPE.None);
        selectionService.selectNode(mockNode);
        expect(selectionService.isNodeSelected(mockNode)).toBeFalsy();
        expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();

        // https://jasmine.github.io/tutorials/spying_on_properties
        (Object.getOwnPropertyDescriptor(mockTree, 'selection').get as jasmine.Spy<any>).and.returnValue(IGX_TREE_SELECTION_TYPE.BiState);
        const expected: ITreeNodeSelectionEvent = {
            oldSelection: [], newSelection: [mockNode],
            added: [mockNode], removed: [], event: undefined, cancel: false
        };

        // BiState
        selectionService.selectNode(mockNode);
        expect(selectionService.isNodeSelected(mockNode)).toBeTruthy();
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
    });

    it('Should deselect nodes', () => {

        const mockNode1 = jasmine.createSpyObj<IgxTreeNode<any>>(['id', 'selected']);
        const mockNode2 = jasmine.createSpyObj<IgxTreeNode<any>>(['id', 'selected']);

        selectionService.deselectNode(mockNode1);
        expect(selectionService.isNodeSelected(mockNode1)).toBeFalsy();
        expect(selectionService.isNodeSelected(mockNode2)).toBeFalsy();
        expect(mockTree.nodeSelection.emit).not.toHaveBeenCalled();

        // mark a node as selected
        selectionService.selectNode(mockNode1);
        expect(selectionService.isNodeSelected(mockNode1)).toBeTruthy();
        expect(selectionService.isNodeSelected(mockNode2)).toBeFalsy();
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);

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
    });

    it('Should be able to select all nodes', () => {
        // no argument - should select all nodes
        selectionService.selectAllNodes();

        const expected: ITreeNodeSelectionEvent = {
            oldSelection: [], newSelection: [...allNodes],
            added: [...allNodes], removed: [], event: undefined, cancel: false
        };

        for (const node of allNodes) {
            expect(selectionService.isNodeSelected(node)).toBeTruthy();
        }

        expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);
    });

     it('Should be able to deselect all nodes', () => {
        selectionService.selectAllNodes(allNodes.slice(0, 3));
        for (const node of allNodes.slice(0, 3)) {
            expect(selectionService.isNodeSelected(node)).toBeTruthy();
        }
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);

        selectionService.deselectAllNodes();
        for (const node of allNodes.slice(0, 3)) {
            expect(selectionService.isNodeSelected(node)).toBeFalsy();
        }
        const expected: ITreeNodeSelectionEvent = {
            oldSelection: allNodes.slice(0, 3), newSelection: [],
            added: [], removed: allNodes.slice(0, 3), event: undefined, cancel: false
        };
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(2);
    });

    it('Should be able to deselect range of nodes', () => {
        selectionService.selectAllNodes(allNodes.slice(0, 3));
        for (const node of allNodes.slice(0, 3)) {
            expect(selectionService.isNodeSelected(node)).toBeTruthy();
        }
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);

        selectionService.deselectAllNodes([allNodes[0], allNodes[2]]);

        expect(selectionService.isNodeSelected(allNodes[0])).toBeFalsy();
        expect(selectionService.isNodeSelected(allNodes[2])).toBeFalsy();

        const expected: ITreeNodeSelectionEvent = {
            oldSelection: allNodes.slice(0, 3), newSelection: [allNodes[1]],
            added: [], removed:[allNodes[0], allNodes[2]], event: undefined, cancel: false
        };
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(2);
    });


    it('Should be able to select multiple nodes', () => {
        selectionService.selectAllNodes(allNodes.slice(0, 3));

        const expected: ITreeNodeSelectionEvent = {
            oldSelection: [], newSelection: allNodes.slice(0, 3),
            added: allNodes.slice(0, 3), removed: [], event: undefined, cancel: false
        };

        for (const node of allNodes.slice(0, 3)) {
            expect(selectionService.isNodeSelected(node)).toBeTruthy();
        }
        expect(selectionService.isNodeSelected(allNodes[3])).toBeFalsy();
        expect(selectionService.isNodeSelected(allNodes[4])).toBeFalsy();

        expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);
    });

    it('Should be able to clear selection when adding multiple nodes', () => {
        selectionService.selectAllNodes(allNodes.slice(0, 3), true);

        let expected: ITreeNodeSelectionEvent = {
            oldSelection: [], newSelection: allNodes.slice(0, 3),
            added: allNodes.slice(0, 3), removed: [], event: undefined, cancel: false
        };

        for (const node of allNodes.slice(0, 3)) {
            expect(selectionService.isNodeSelected(node)).toBeTruthy();
        }
        expect(selectionService.isNodeSelected(allNodes[3])).toBeFalsy();
        expect(selectionService.isNodeSelected(allNodes[4])).toBeFalsy();
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(1);

        selectionService.selectAllNodes(allNodes.slice(1, 4), true);

        expected = {
            oldSelection: allNodes.slice(0, 3), newSelection: allNodes.slice(1, 4),
            added: [allNodes[3]], removed: [allNodes[0]], event: undefined, cancel: false
        };

        for (const node of allNodes.slice(1, 4)) {
            expect(selectionService.isNodeSelected(node)).toBeTruthy();
        }

        expect(selectionService.isNodeSelected(allNodes[0])).toBeFalsy();
        expect(selectionService.isNodeSelected(allNodes[4])).toBeFalsy();
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledWith(expected);
        expect(mockTree.nodeSelection.emit).toHaveBeenCalledTimes(2);
    });

    it('Should add newly selected nodes to the existing selection', () => {
        // no argument - should select all nodes
        selectionService.selectNode(mockTree.nodes.first);

        let expected: ITreeNodeSelectionEvent = {
            oldSelection: [], newSelection: [mockQuery1.first],
            added: [mockQuery1.first], removed: [], event: undefined, cancel: false
        };

        expect(selectionService.isNodeSelected(allNodes[0])).toBeTruthy();
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
        expect(selectionService.isNodeSelected(allNodes[0])).toBeTruthy();
        expect(selectionService.isNodeSelected(allNodes[1])).toBeTruthy();
    });

    it('Should be able to select a range of nodes', () => {
        selectionService.selectNode(allNodes[3]);

        // only third node is selected
        expect(selectionService.isNodeSelected(allNodes[3])).toBeTruthy();
        for (let i = 0; i < allNodes.length; i++) {
            if (i !== 3) {
                expect(selectionService.isNodeSelected(allNodes[i])).toBeFalsy();
            }
        }

        // select all nodes from third to eighth
        selectionService.selectMultipleNodes(allNodes[8]);
        allNodes.forEach((node, index) => {
            if(index >= 3 && index <= 8){
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
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
        for (let i = 0; i < allNodes.length; i++) {
            if (i !== 8) {
                expect(selectionService.isNodeSelected(allNodes[i])).toBeFalsy();
            }
        }

        // select all nodes from eighth to second
        selectionService.selectMultipleNodes(allNodes[2]);
        allNodes.forEach((node, index) => {
            if(index >= 2 && index <= 8){
                expect(selectionService.isNodeSelected(node)).toBeTruthy();
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

const createNodeSpies = (parentNode: IgxTreeNode<any>, children: any[], count?: number): IgxTreeNode<any>[] => {
    const nodesArr = [];
    for (let i = 0; i < count; i++) {
        nodesArr.push(jasmine.createSpyObj<IgxTreeNode<any>>(['id', 'selected'],
        { parentNode, children: children ? children[i] : null }));
    }
    return nodesArr;
};

const createQueryListSpies = nodes => {
    const mockQuery = jasmine.createSpyObj(['toArray', 'filter', 'forEach']);
    Object.defineProperty(mockQuery, 'first', { value: nodes[0], enumerable: true });
    Object.defineProperty(mockQuery, 'last', { value: nodes[nodes.length - 1], enumerable: true });
    mockQuery.toArray.and.returnValue(nodes);
    // does not work with ...and.callFake(mockNodes.filter);
    mockQuery.filter.and.callFake((cb) => nodes.filter(cb));
    mockQuery.forEach.and.callFake((cb) => nodes.forEach(cb));
    return mockQuery;
};
