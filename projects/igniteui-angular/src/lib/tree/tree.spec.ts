import { AnimationBuilder } from '@angular/animations';
import { Component, ElementRef, ViewChild, QueryList, EventEmitter, ChangeDetectorRef, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DisplayDensity } from '../core/displayDensity';
import { configureTestSuite } from '../test-utils/configure-suite';
import { TreeTestFunctions } from './tree-functions.spec';
import { IgxTreeNavigationService } from './tree-navigation.service';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';
import { IgxTreeSelectionService } from './tree-selection.service';
import { IgxTreeComponent, IgxTreeModule } from './tree.component';
import { IgxTreeService } from './tree.service';

const TREE_ROOT_CLASS = 'igx-tree__root';
const NODE_TAG = 'igx-tree-node';

describe('IgxTree #treeView', () => {
    configureTestSuite();
    describe('Unit Tests', () => {
        let mockNavService: IgxTreeNavigationService;
        let mockTreeService: IgxTreeService;
        let mockSelectionService: IgxTreeSelectionService;
        let mockElementRef: ElementRef<any>;
        let mockNodes: QueryList<IgxTreeNodeComponent<any>>;
        let mockNodesArray: IgxTreeNodeComponent<any>[] = [];
        let tree: IgxTreeComponent = null;
        beforeEach(() => {
            mockNodesArray = [];
            mockNavService = jasmine.createSpyObj('navService',
                ['register', 'update_disabled_cache', 'update_visible_cache',
                    'init_invisible_cache', 'setFocusedAndActiveNode', 'handleKeydown']);
            mockTreeService = jasmine.createSpyObj('treeService',
                ['register', 'collapse', 'expand', 'collapsing', 'isExpanded']);
            mockSelectionService = jasmine.createSpyObj('selectionService',
                ['register', 'deselectNodesWithNoEvent']);
            mockElementRef = jasmine.createSpyObj('elementRef', [], {
                nativeElement: jasmine.createSpyObj('nativeElement', ['focus'], {})
            });
            tree?.ngOnDestroy();
            tree = new IgxTreeComponent(mockNavService, mockSelectionService, mockTreeService, mockElementRef);
            mockNodes = jasmine.createSpyObj('mockList', ['toArray'], {
                changes: new Subject<void>(),
                get first() {
                    return mockNodesArray[0];
                },
                get last() {
                    return mockNodesArray[mockNodesArray.length - 1];
                },
                get length() {
                    return mockNodesArray.length;
                },
                forEach: (cb: (n: IgxTreeNodeComponent<any>) => void): void => {
                    mockNodesArray.forEach(cb);
                },
                find: (cb: (n: IgxTreeNodeComponent<any>) => boolean): IgxTreeNodeComponent<any> => mockNodesArray.find(cb),
                filter: jasmine.createSpy('filter').
                    and.callFake((cb: (n: IgxTreeNodeComponent<any>) => boolean): IgxTreeNodeComponent<any>[] => mockNodesArray.filter(cb)),
            });
            spyOn(mockNodes, 'toArray').and.returnValue(mockNodesArray);
        });
        afterEach(() => {
            tree?.ngOnDestroy();
        });
        describe('IgxTreeComponent', () => {
            it('Should update nav children cache when events are fired', fakeAsync(() => {
                expect(mockNavService.init_invisible_cache).toHaveBeenCalledTimes(0);
                expect(mockNavService.update_visible_cache).toHaveBeenCalledTimes(0);
                expect(mockNavService.update_disabled_cache).toHaveBeenCalledTimes(0);
                tree.ngOnInit();
                tick();
                expect(mockNavService.init_invisible_cache).toHaveBeenCalledTimes(0);
                expect(mockNavService.update_visible_cache).toHaveBeenCalledTimes(0);
                expect(mockNavService.update_disabled_cache).toHaveBeenCalledTimes(0);
                tree.disabledChange.emit('mockNode' as any);
                tick();
                expect(mockNavService.update_disabled_cache).toHaveBeenCalledTimes(1);
                expect(mockNavService.update_disabled_cache).toHaveBeenCalledWith('mockNode' as any);
                tree.nodeCollapsing.emit({ node: 'mockNode' as any } as any);
                tick();
                expect(mockNavService.update_visible_cache).toHaveBeenCalledTimes(1);
                expect(mockNavService.update_visible_cache).toHaveBeenCalledWith('mockNode' as any, false);
                tree.nodeExpanding.emit({ node: 'mockNode' as any } as any);
                tick();
                expect(mockNavService.update_visible_cache).toHaveBeenCalledTimes(2);
                expect(mockNavService.update_visible_cache).toHaveBeenCalledWith('mockNode' as any, true);
                tree.nodes = mockNodes;
                const mockNode = TreeTestFunctions.createNodeSpy({
                    expandedChange: new EventEmitter<void>(),
                    closeAnimationDone: new EventEmitter<void>(),
                    openAnimationDone: new EventEmitter<void>()
                }) as any;
                mockNodesArray.push(
                    mockNode
                );
                console.log(mockNodesArray);
                console.log(mockNodesArray[0]);
                spyOnProperty(mockNodes, 'first', 'get').and.returnValue(mockNode);
                tree.ngAfterViewInit();
                tick();
                expect(mockNavService.init_invisible_cache).toHaveBeenCalledTimes(1);
                tree.nodes.first.expandedChange.emit(true);
                expect(mockNavService.update_visible_cache).toHaveBeenCalledTimes(3);
                expect(mockNavService.update_visible_cache).toHaveBeenCalledWith(tree.nodes.first, true);
                tree.nodes.first.expandedChange.emit(false);
                expect(mockNavService.update_visible_cache).toHaveBeenCalledTimes(4);
                expect(mockNavService.update_visible_cache).toHaveBeenCalledWith(tree.nodes.first, false);
                (tree.nodes.changes as any).next();
                tick();
                expect(mockNavService.init_invisible_cache).toHaveBeenCalledTimes(2);
                tree.ngOnDestroy();
            }));
            it('Should update delegate keyboard events to nav service', () => {
                const mockEvent: any = {};
                tree.handleKeydown(mockEvent as any);
                expect(mockNavService.handleKeydown).toHaveBeenCalledWith(mockEvent as any);
            });
            it('Should search through nodes and return expected value w/ `findNodes`', () => {
                tree.nodes = mockNodes;
                let id = 0;
                let itemRef = {} as any;
                mockNodesArray = TreeTestFunctions.createNodeSpies(0, 5);
                mockNodesArray.forEach(n => {
                    itemRef = { id: id++ };
                    n.data = itemRef;
                });
                expect(tree.findNodes(itemRef)).toEqual([mockNodesArray[mockNodesArray.length - 1]]);
                expect(tree.nodes.filter).toHaveBeenCalledTimes(1);
                expect(tree.findNodes(1, (p, n) => n.data.id === p)).toEqual([mockNodes.find(n => n.data.id === 1)]);
                expect(tree.nodes.filter).toHaveBeenCalledTimes(2);
                expect(tree.findNodes('Not found', (p, n) => n.data.id === p)).toEqual(null);
                expect(tree.nodes.filter).toHaveBeenCalledTimes(3);

            });
            it('Should return only root level nodes w/ `rootNodes` accessor', () => {
                tree.nodes = mockNodes;
                const arr = [];
                for (let i = 0; i < 7; i++) {
                    const level = i > 4 ? 1 : 0;
                    arr.push({
                        level
                    });
                }
                mockNodesArray = [...arr];
                expect(tree.rootNodes.length).toBe(5);
                mockNodesArray.forEach(n => {
                    (n as any).level = 1;
                });
                expect(tree.rootNodes.length).toBe(0);
                mockNodesArray.forEach(n => {
                    (n as any).level = 0;
                });
                expect(tree.rootNodes.length).toBe(7);
                tree.nodes = null;
                expect(tree.rootNodes).toBe(undefined);
            });
            it('Should expandAll nodes nodes w/ proper methods', () => {
                tree.nodes = mockNodes;
                const customArrayParam = [];
                for (let i = 0; i < 5; i++) {
                    const node = jasmine.createSpyObj('node', ['expand', 'collapse'], {
                        _expanded: false,
                        get expanded() {
                            return this._expanded;
                        },
                        set expanded(val: boolean) {
                            this._expanded = val;
                        }
                    });
                    node.spyProp = spyOnProperty(node, 'expanded', 'set').and.callThrough();
                    mockNodesArray.push(node);
                    if (i > 3) {
                        customArrayParam.push(node);
                    }
                }
                spyOn(mockNodesArray, 'forEach').and.callThrough();
                tree.expandAll();
                expect(mockNodesArray.forEach).toHaveBeenCalledTimes(1);
                mockNodesArray.forEach(n => {
                    expect((n as any).spyProp).toHaveBeenCalledWith(true);
                    expect((n as any).spyProp).toHaveBeenCalledTimes(1);
                });
                tree.expandAll(customArrayParam);
                customArrayParam.forEach(n => {
                    expect((n as any).spyProp).toHaveBeenCalledWith(true);
                    expect((n as any).spyProp).toHaveBeenCalledTimes(2);
                });
            });
            it('Should collapseAll nodes nodes w/ proper methods', () => {
                tree.nodes = mockNodes;
                const customArrayParam = [];
                for (let i = 0; i < 5; i++) {
                    const node = jasmine.createSpyObj('node', ['expand', 'collapse'], {
                        _expanded: false,
                        get expanded() {
                            return this._expanded;
                        },
                        set expanded(val: boolean) {
                            this._expanded = val;
                        }
                    });
                    node.spyProp = spyOnProperty(node, 'expanded', 'set').and.callThrough();
                    mockNodesArray.push(node);
                    if (i > 3) {
                        customArrayParam.push(node);
                    }
                }
                spyOn(mockNodesArray, 'forEach').and.callThrough();
                tree.collapseAll();
                expect(mockNodesArray.forEach).toHaveBeenCalledTimes(1);
                mockNodesArray.forEach(n => {
                    expect((n as any).spyProp).toHaveBeenCalledWith(false);
                    expect((n as any).spyProp).toHaveBeenCalledTimes(1);
                });
                tree.collapseAll(customArrayParam);
                customArrayParam.forEach(n => {
                    expect((n as any).spyProp).toHaveBeenCalledWith(false);
                    expect((n as any).spyProp).toHaveBeenCalledTimes(2);
                });
            });
            it('Should deselectAll nodes w/ proper methond', () => {
                tree.nodes = mockNodes;
                tree.deselectAll();
                expect(mockSelectionService.deselectNodesWithNoEvent).toHaveBeenCalledWith(undefined);
                const customParam = jasmine.createSpyObj<any>('nodes', ['toArray']);
                tree.deselectAll(customParam);
                expect(mockSelectionService.deselectNodesWithNoEvent).toHaveBeenCalledWith(customParam);
            });
        });
        describe('IgxTreeNodeComponent', () => {
            let mockTree: IgxTreeComponent;
            let mockCdr: ChangeDetectorRef;
            let mockBuilder: AnimationBuilder;

            beforeEach(() => {
                mockTree = jasmine.createSpyObj<any>('mockTree', ['findNodes'],
                    {
                        nodeCollapsing: jasmine.createSpyObj('spy', ['emit']),
                        nodeExpanding: jasmine.createSpyObj('spy', ['emit']),
                        nodeCollapsed: jasmine.createSpyObj('spy', ['emit']),
                        nodeExpanded: jasmine.createSpyObj('spy', ['emit']),
                        _displayDensity: DisplayDensity.comfortable,
                        get displayDensity() {
                            return this._displayDensity;
                        }
                    });
                mockCdr = jasmine.createSpyObj<ChangeDetectorRef>('mockCdr', ['detectChanges', 'markForCheck'], {});
                mockBuilder = jasmine.createSpyObj<AnimationBuilder>('mockAB', ['build'], {});
            });
            it('Should call service expand/collapse methods when toggling state through `[expanded]` input', () => {
                const node = new IgxTreeNodeComponent<any>(mockTree, mockSelectionService, mockTreeService,
                    mockNavService, mockCdr, mockBuilder, mockElementRef, null);
                expect(mockTreeService.collapse).not.toHaveBeenCalled();
                expect(mockTreeService.expand).not.toHaveBeenCalled();
                expect(mockTree.nodeExpanded.emit).not.toHaveBeenCalled();
                expect(mockTree.nodeCollapsed.emit).not.toHaveBeenCalled();
                expect(mockTree.nodeExpanding.emit).not.toHaveBeenCalled();
                expect(mockTree.nodeExpanded.emit).not.toHaveBeenCalled();
                node.expanded = true;
                expect(mockTreeService.expand).toHaveBeenCalledTimes(1);
                expect(mockTreeService.expand).toHaveBeenCalledWith(node, false);
                node.expanded = false;
                expect(mockTreeService.collapse).toHaveBeenCalledTimes(1);
                expect(mockTreeService.collapse).toHaveBeenCalledWith(node);
                // events are not emitted when chainging state through input
                expect(mockTree.nodeExpanded.emit).not.toHaveBeenCalled();
                expect(mockTree.nodeCollapsed.emit).not.toHaveBeenCalled();
                expect(mockTree.nodeExpanding.emit).not.toHaveBeenCalled();
                expect(mockTree.nodeExpanded.emit).not.toHaveBeenCalled();
            });
            it('Should call service expand/collapse methods when calling API state methods', () => {
                const node = new IgxTreeNodeComponent<any>(mockTree, mockSelectionService, mockTreeService,
                    mockNavService, mockCdr, mockBuilder, mockElementRef, null);
                const emitSpy = spyOn(node, 'expandedChange');
                const openAnimationSpy = spyOn(node, 'playOpenAnimation');
                const closeAnimationSpy = spyOn(node, 'playCloseAnimation');
                const mockObj = jasmine.createSpyObj<any>('mockElement', ['focus']);
                const ingArgs = {
                    owner: mockTree,
                    cancel: false,
                    node
                };
                const edArgs = {
                    owner: mockTree,
                    node
                };
                (node as any).childrenContainer = mockObj;
                expect(mockTreeService.collapse).not.toHaveBeenCalled();
                expect(mockTreeService.expand).not.toHaveBeenCalled();
                expect(mockTreeService.collapsing).not.toHaveBeenCalled();
                expect(openAnimationSpy).not.toHaveBeenCalled();
                expect(closeAnimationSpy).not.toHaveBeenCalled();
                expect(mockCdr.markForCheck).not.toHaveBeenCalled();
                expect(mockTreeService.collapsing).not.toHaveBeenCalled();
                expect(mockTree.nodeExpanding.emit).not.toHaveBeenCalledWith();
                expect(mockTree.nodeCollapsing.emit).not.toHaveBeenCalledWith();
                expect(mockTree.nodeExpanded.emit).not.toHaveBeenCalledWith();
                expect(mockTree.nodeCollapsed.emit).not.toHaveBeenCalledWith();
                expect(emitSpy).not.toHaveBeenCalled();
                node.ngOnInit();
                node.expand();
                expect(openAnimationSpy).toHaveBeenCalledWith(mockObj);
                expect(openAnimationSpy).toHaveBeenCalledTimes(1);
                expect(mockTree.nodeExpanded.emit).toHaveBeenCalledTimes(0);
                expect(mockTree.nodeExpanding.emit).toHaveBeenCalledWith(ingArgs);
                expect(mockTreeService.expand).toHaveBeenCalledWith(node, true);
                expect(mockTreeService.expand).toHaveBeenCalledTimes(1);
                node.openAnimationDone.emit();
                expect(mockTree.nodeExpanded.emit).toHaveBeenCalledTimes(1);
                expect(mockTree.nodeExpanded.emit).toHaveBeenCalledWith(edArgs);
                node.collapse();
                expect(closeAnimationSpy).toHaveBeenCalledWith(mockObj);
                expect(closeAnimationSpy).toHaveBeenCalledTimes(1);
                expect(mockTree.nodeCollapsed.emit).toHaveBeenCalledTimes(0);
                expect(mockTree.nodeCollapsing.emit).toHaveBeenCalledWith(ingArgs);
                // collapse happens after animation finishes
                expect(mockTreeService.collapse).toHaveBeenCalledTimes(0);
                node.closeAnimationDone.emit();
                expect(mockTreeService.collapse).toHaveBeenCalledTimes(1);
                expect(mockTreeService.collapse).toHaveBeenCalledWith(node);
                expect(mockTree.nodeCollapsed.emit).toHaveBeenCalledTimes(1);
                expect(mockTree.nodeCollapsed.emit).toHaveBeenCalledWith(edArgs);
                spyOn(node, 'expand');
                spyOn(node, 'collapse');
                node.toggle();
                expect(node.expand).toHaveBeenCalledTimes(1);
                expect(node.collapse).toHaveBeenCalledTimes(0);
                spyOn(mockTreeService, 'isExpanded').and.returnValue(true);
                node.toggle();
                expect(node.expand).toHaveBeenCalledTimes(1);
                expect(node.collapse).toHaveBeenCalledTimes(1);
            });
            it('Should properly get tree display density token', () => {
                const node = new IgxTreeNodeComponent<any>(mockTree, mockSelectionService, mockTreeService,
                    mockNavService, mockCdr, mockBuilder, mockElementRef, null);
                expect(node.isCosy).toBeFalse();
                expect(node.isCompact).toBeFalse();
                spyOnProperty(mockTree, 'displayDensity', 'get').and.returnValue(DisplayDensity.cosy);
                expect(node.isCosy).toBeTrue();
                expect(node.isCompact).toBeFalse();
                spyOnProperty(mockTree, 'displayDensity', 'get').and.returnValue(DisplayDensity.compact);
                expect(node.isCosy).toBeFalse();
                expect(node.isCompact).toBeTrue();
            });

            it('Should have correct path to node, regardless if node has parent or not', () => {
                const node = new IgxTreeNodeComponent<any>(mockTree, mockSelectionService, mockTreeService,
                    mockNavService, mockCdr, mockBuilder, mockElementRef, null);
                expect(node.path).toEqual([node]);
                const childNode = new IgxTreeNodeComponent<any>(mockTree, mockSelectionService, mockTreeService,
                    mockNavService, mockCdr, mockBuilder, mockElementRef, node);
                expect(childNode.path).toEqual([node, childNode]);
            });
        });
        describe('IgxTreeService', () => {
            it('Should properly register tree', () => {
                const service = new IgxTreeService();
                expect((service as any).tree).toBe(undefined);
                const mockTree = jasmine.createSpyObj<any>('tree', ['findNodes']);
                service.register(mockTree);
                expect((service as any).tree).toBe(mockTree);
            });
            it('Should keep a proper collection of expanded and collapsing nodes at all time, firing `expandedChange` when needed', () => {
                const service = new IgxTreeService();
                const mockTree = jasmine.createSpyObj<any>('tree', ['findNodes'], {
                    _singleBranchExpand: false,
                    get singleBranchExpand(): boolean {
                        return this._singleBranchExpand;
                    },
                    set singleBranchExpand(val: boolean) {
                        this._singleBranchExpand = val;
                    }
                });
                service.register(mockTree);
                spyOn(service.expandedNodes, 'add').and.callThrough();
                spyOn(service.expandedNodes, 'delete').and.callThrough();
                spyOn(service.collapsingNodes, 'add').and.callThrough();
                spyOn(service.collapsingNodes, 'delete').and.callThrough();
                expect(service.expandedNodes.size).toBe(0);
                expect(service.collapsingNodes.size).toBe(0);
                const mockNode = jasmine.createSpyObj<any>('node', ['collapse'], {
                    expandedChange: jasmine.createSpyObj('emitter', ['emit'])
                });
                service.expand(mockNode);
                expect(service.collapsingNodes.delete).toHaveBeenCalledWith(mockNode);
                expect(service.collapsingNodes.delete).toHaveBeenCalledTimes(1);
                expect(service.expandedNodes.add).toHaveBeenCalledWith(mockNode);
                expect(mockNode.expandedChange.emit).toHaveBeenCalledTimes(1);
                expect(mockNode.expandedChange.emit).toHaveBeenCalledWith(true);
                expect(service.expandedNodes.size).toBe(1);
                expect(mockNode.collapse).not.toHaveBeenCalled();
                service.expand(mockNode);
                expect(service.collapsingNodes.delete).toHaveBeenCalledTimes(2);
                expect(mockNode.expandedChange.emit).toHaveBeenCalledTimes(1);
                expect(service.expandedNodes.size).toBe(1);
                service.collapse(mockNode);
                expect(mockNode.expandedChange.emit).toHaveBeenCalledTimes(2);
                expect(mockNode.expandedChange.emit).toHaveBeenCalledWith(false);
                expect(service.collapsingNodes.delete).toHaveBeenCalledWith(mockNode);
                expect(service.collapsingNodes.delete).toHaveBeenCalledTimes(3);
                expect(service.expandedNodes.delete).toHaveBeenCalledTimes(1);
                expect(service.expandedNodes.delete).toHaveBeenCalledWith(mockNode);
                expect(service.expandedNodes.size).toBe(0);
                service.collapse(mockNode);
                expect(mockNode.expandedChange.emit).toHaveBeenCalledTimes(2);
                expect(service.collapsingNodes.delete).toHaveBeenCalledTimes(4);
                expect(service.expandedNodes.delete).toHaveBeenCalledTimes(2);
                const mockArray = [];
                for (let i = 0; i < 5; i++) {
                    const node = jasmine.createSpyObj('node', ['collapse'], {
                        _expanded: false,
                        get expanded() {
                            return this._expanded;
                        },
                        set expanded(val: boolean) {
                            this._expanded = val;
                        }
                    });
                    node.spyProp = spyOnProperty(node, 'expanded', 'set').and.callThrough();
                    mockArray.push(node);
                }
                spyOn(mockTree, 'findNodes').and.returnValue(mockArray);
                spyOnProperty(mockTree, 'singleBranchExpand', 'get').and.returnValue(true);
                service.expand(mockNode);
                mockArray.forEach(n => {
                    expect((n as any).spyProp).toHaveBeenCalledWith(false);
                    expect(n.collapse).not.toHaveBeenCalled();
                });
                service.collapse(mockNode);
                service.expand(mockNode, true);
                mockArray.forEach(n => {
                    expect(n.collapse).toHaveBeenCalled();
                    expect(n.collapse).toHaveBeenCalledTimes(1);
                });
                expect(service.collapsingNodes.size).toBe(0);
                service.collapsing(mockNode);
                expect(service.collapsingNodes.size).toBe(1);
                service.collapse(mockNode);
                spyOnProperty(mockTree, 'singleBranchExpand', 'get').and.returnValue(true);
                spyOn(mockTree, 'findNodes').and.returnValue(null);
                service.expand(mockNode, true);
                expect(mockTree.findNodes).toHaveBeenCalledWith(mockNode, (service as any).siblingComparer);
                mockArray.forEach(n => {
                    expect(n.collapse).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
    describe('Rendering Tests', () => {
        let fix: ComponentFixture<IgxTreeSampleComponent>;
        let tree: IgxTreeComponent;
        beforeAll(
            waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxTreeSampleComponent,],
                    imports: [
                        NoopAnimationsModule,
                        IgxTreeModule
                    ]
                }).compileComponents();
            })
        );
        beforeEach(() => {
            fix = TestBed.createComponent<IgxTreeSampleComponent>(IgxTreeSampleComponent);
            fix.detectChanges();
            tree = fix.componentInstance.tree;
        });

        describe('General', () => {
            it('Should only render node children', () => {
                const treeEl: HTMLElement = fix.debugElement.queryAll(By.css(`.${TREE_ROOT_CLASS}`))[0].nativeElement;
                let childNodes = treeEl.children;
                expect(childNodes.length).toBe(5);
                for (let i = 0; i < childNodes.length; i++) {
                    expect(childNodes.item(i).tagName === NODE_TAG);
                }
                fix.componentInstance.divChild = true;
                childNodes = treeEl.children;
                expect(childNodes.length).toBe(5);
                for (let i = 0; i < childNodes.length; i++) {
                    expect(childNodes.item(i).tagName === NODE_TAG);
                }
            });
            it('Should not render collapsed nodes', () => {
                let allNodes: DebugElement[] = fix.debugElement.queryAll(By.css(NODE_TAG));
                expect(allNodes.length).toBe(5);
                tree.nodes.first.expanded = true;
                fix.detectChanges();
                allNodes = fix.debugElement.queryAll(By.css(NODE_TAG));
                expect(allNodes.length).toBe(10);
                const visibleNodes = tree.nodes.filter(n => allNodes.findIndex(e => e.nativeElement === n.nativeElement) > -1);
                visibleNodes.forEach(n => {
                    expect(n.level === 0 || n.parentNode.expanded === true).toBeTruthy();
                });
            });

            it('Should apply proper node classes depending on tree displayDenisty', () => {
                pending('Test not implemented');
            });

            it('Should properly emit state toggle events', fakeAsync(() => {
                // node event spies
                const collapsingSpy = spyOn(tree.nodeCollapsing, 'emit').and.callThrough();
                const expandingSpy = spyOn(tree.nodeExpanding, 'emit').and.callThrough();
                const expandedSpy = spyOn(tree.nodeExpanded, 'emit').and.callThrough();
                const collapsedSpy = spyOn(tree.nodeCollapsed, 'emit').and.callThrough();
                expect(collapsingSpy).not.toHaveBeenCalled();
                expect(expandingSpy).not.toHaveBeenCalled();
                expect(expandedSpy).not.toHaveBeenCalled();
                expect(collapsedSpy).not.toHaveBeenCalled();
                tree.nodes.first.expand();
                expect(expandingSpy).toHaveBeenCalledTimes(1);
                expect(collapsingSpy).not.toHaveBeenCalled();
                expect(expandedSpy).not.toHaveBeenCalled();
                expect(collapsedSpy).not.toHaveBeenCalled();
                tick();
                fix.detectChanges();
                tick();
                expect(expandingSpy).toHaveBeenCalledTimes(1);
                expect(expandedSpy).toHaveBeenCalledTimes(1);
                expect(collapsingSpy).not.toHaveBeenCalled();
                expect(collapsedSpy).not.toHaveBeenCalled();
                tree.nodes.first.collapse();
                expect(expandingSpy).toHaveBeenCalledTimes(1);
                expect(expandedSpy).toHaveBeenCalledTimes(1);
                expect(collapsingSpy).toHaveBeenCalledTimes(1);
                expect(collapsedSpy).not.toHaveBeenCalled();
                tick();
                fix.detectChanges();
                tick();
                expect(expandingSpy).toHaveBeenCalledTimes(1);
                expect(expandedSpy).toHaveBeenCalledTimes(1);
                expect(collapsingSpy).toHaveBeenCalledTimes(1);
                expect(collapsedSpy).toHaveBeenCalledTimes(1);
                // cancel ingEvents
                const unsub$ = new Subject<void>();
                tree.nodeExpanding.pipe(takeUntil(unsub$)).subscribe(e => {
                    e.cancel = true;
                });
                tree.nodes.first.expand();
                expect(expandingSpy).toHaveBeenCalledTimes(2);
                expect(expandedSpy).toHaveBeenCalledTimes(1);
                tick();
                fix.detectChanges();
                tick();
                expect(expandingSpy).toHaveBeenCalledTimes(2);
                expect(expandedSpy).toHaveBeenCalledTimes(1);
                unsub$.next();
                tree.nodeCollapsing.pipe(takeUntil(unsub$)).subscribe(e => {
                    e.cancel = true;
                });
                tree.nodes.first.collapse();
                expect(collapsingSpy).toHaveBeenCalledTimes(2);
                expect(collapsedSpy).toHaveBeenCalledTimes(1);
                tick();
                fix.detectChanges();
                tick();
                expect(collapsingSpy).toHaveBeenCalledTimes(2);
                expect(collapsedSpy).toHaveBeenCalledTimes(1);
                unsub$.next();
                unsub$.complete();
            }));

            it('Should collapse all sibling nodes when `singleBranchExpand` is set and node is toggled', fakeAsync(() => {
                tree.rootNodes.forEach(n => n.expanded = true);
                fix.detectChanges();
                tree.rootNodes[0].expanded = false;
                fix.detectChanges();
                expect(tree.nodes.filter(n => n.expanded).length).toBe(4);
                tree.singleBranchExpand = true;
                tree.rootNodes.forEach(n => {
                    spyOn(n.expandedChange, 'emit').and.callThrough();
                });
                const collapsingSpy = spyOn(tree.nodeCollapsing, 'emit').and.callThrough();
                const expandingSpy = spyOn(tree.nodeExpanding, 'emit').and.callThrough();
                const expandedSpy = spyOn(tree.nodeCollapsed, 'emit').and.callThrough();
                const collapsedSpy = spyOn(tree.nodeExpanded, 'emit').and.callThrough();
                // should not emit event when nodes are toggled through input
                tree.rootNodes[0].expanded = true;
                fix.detectChanges();
                tree.rootNodes.forEach(n => {
                    expect(n.expandedChange.emit).toHaveBeenCalled();
                });
                expect(expandingSpy).not.toHaveBeenCalled();
                expect(collapsingSpy).not.toHaveBeenCalled();
                expect(expandedSpy).not.toHaveBeenCalled();
                expect(collapsedSpy).not.toHaveBeenCalled();
                expect(tree.nodes.filter(n => n.expanded).length).toBe(1);
                const expandedArgs = {
                    node: tree.rootNodes[1],
                    owner: tree
                };
                const collapsedArgs = {
                    node: tree.rootNodes[0],
                    owner: tree
                };
                tree.rootNodes[1].expand();
                tick();
                fix.detectChanges();
                expect(expandingSpy).toHaveBeenCalledTimes(1);
                expect(expandingSpy).toHaveBeenCalledWith(Object.assign({}, expandedArgs, { cancel: false }));
                expect(collapsingSpy).toHaveBeenCalledTimes(1);
                expect(expandingSpy).toHaveBeenCalledWith(Object.assign({}, collapsedArgs, { cancel: false }));
                expect(expandedSpy).toHaveBeenCalledTimes(1);
                expect(expandedSpy).toHaveBeenCalledWith(expandedArgs);
                expect(collapsedSpy).toHaveBeenCalledTimes(1);
                expect(collapsedSpy).toHaveBeenCalledWith(collapsedArgs);
                tree.singleBranchExpand = false;
                fix.detectChanges();
                const deepNode = tree.findNodes('2-1', (_id: '2-1', n: IgxTreeNodeComponent<any>) => n.data.id === '2-1')[0];
                expect(deepNode).not.toBeNull();
                fix.componentInstance.expandToNode(deepNode);
                const siblingNodes = tree.findNodes(deepNode,
                    (tn: IgxTreeNodeComponent<any>, n: IgxTreeNodeComponent<any>) => n.level === tn.level && n.parentNode === tn.parentNode
                );
                expect(siblingNodes.length).toBe(5);
                siblingNodes.forEach(n => n.expanded = true);
                fix.detectChanges();
                expect(tree.nodes.filter(e => e.expanded).length).toBe(7);
                siblingNodes[0].expanded = false;
                fix.detectChanges();
                expect(tree.nodes.filter(e => e.expanded).length).toBe(6);
                tree.singleBranchExpand = true;
                siblingNodes[0].expanded = true;
                fix.detectChanges();
                expect(tree.nodes.filter(e => e.expanded).length).toBe(3);
                const nodeLevels = tree.nodes.filter(n => n.expanded).map(n => n.level);
                expect(nodeLevels).toEqual([0, 1, 2]);
            }));
        });
        describe('ARIA', () => {
            it('Should render proper roles for tree and nodes', () => {
                pending('Test not implemented');
            });
            it('Should render proper label for expand/collapse indicator, depending on node state', () => {
                pending('Test not implemented');

            });
            it('Should render proper roles for nodes containing link children', () => {
                pending('Test not implemented');

            });
        });
    });
});
@Component({
    template: `
        <igx-tree>
            <igx-tree-node [(expanded)]="node.expanded" [data]="node" *ngFor="let node of data">
            {{ node.label }}
                <igx-tree-node [(expanded)]="child.expanded" [data]="child" *ngFor="let child of node.children">
                {{ child.label }}
                    <igx-tree-node [(expanded)]="leafChild.expanded" [data]="leafChild" *ngFor="let leafChild of child.children">
                        {{ leafChild.label }}
                    </igx-tree-node>
                </igx-tree-node>
            </igx-tree-node>
            <div *ngIf="divChild"></div>
        </igx-tree>
    `
})
class IgxTreeSampleComponent {
    @ViewChild(IgxTreeComponent)
    public tree: IgxTreeComponent;

    public divChild = true;
    public data = createHierarchicalData(5, 3);

    public expandToNode(node: IgxTreeNodeComponent<any>): void {
        node.path.forEach(n => n.expanded = true);
    }
}

class MockDataItem {
    public selected = false;
    public expanded = false;
    public children: MockDataItem[] = [];
    constructor(public id: string, public label: string) {
    }
}

const createHierarchicalData = (siblings: number, depth: number): MockDataItem[] => {
    let id = 0;
    const returnArr = [];
    for (let i = 0; i < siblings; i++) {
        const item = new MockDataItem(`${depth}-${id}`, `Label ${depth}-${id}`);
        id++;
        returnArr.push(item);
        if (depth > 0) {
            item.children = createHierarchicalData(siblings, depth - 1);
        }
    }
    return returnArr;
};
