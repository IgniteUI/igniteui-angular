import { useAnimation } from '@angular/animations';
import { NgFor, NgTemplateOutlet, NgIf, AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxTreeNodeComponent,
    IgxTreeSearchResolver,
    IgxTreeComponent,
    ITreeNodeTogglingEventArgs,
    ITreeNodeToggledEventArgs,
    ITreeNodeSelectionEvent,
    IgxTreeNode,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxLayoutDirective, 
    IgxSwitchComponent,
    IgxTreeNodeLinkDirective,
    IgxTreeExpandIndicatorDirective
} from 'igniteui-angular';
import { Subject } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';
import { growVerIn, growVerOut } from 'igniteui-angular/animations';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';

interface CompanyData {
    ID: string;
    CompanyName?: string;
    ContactName?: string;
    ContactTitle?: string;
    Address?: string;
    City?: string;
    Region?: string;
    PostalCode?: string;
    Country?: string;
    Phone?: string;
    Fax?: string;
    ChildCompanies?: CompanyData[];
    selected?: boolean;
    expanded?: boolean;
    disabled?: boolean;
    active?: boolean;
}

@Component({
    selector: 'app-tree-sample',
    templateUrl: 'tree.sample.html',
    styleUrls: ['tree.sample.scss'],
    imports: [
        IgxLayoutDirective,
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxButtonDirective,
        IgxLabelDirective,
        FormsModule,
        IgxSwitchComponent,
        IgxButtonGroupComponent,
        IgxTreeComponent,
        IgxTreeNodeComponent,
        NgFor,
        IgxTreeNodeLinkDirective,
        IgxTreeExpandIndicatorDirective,
        NgTemplateOutlet,
        IgxIconComponent,
        NgIf,
        AsyncPipe,
        SizeSelectorComponent
    ]
})
export class TreeSampleComponent implements AfterViewInit {
    @ViewChild('tree1', { static: true })
    public tree: IgxTreeComponent;

    @ViewChild('test', { static: true })
    public testNode: IgxTreeNodeComponent<any>;

    public selectionModes = [];

    public selectionMode = 'Cascading';

    public animationDuration = 400;

    public data: CompanyData[];

    public singleBranchExpand = false;

    public asyncItems = new Subject<CompanyData[]>();
    public loadDuration = 6000;
    private iteration = 0;
    private addedIndex = 0;

    private initData: CompanyData[];

    constructor(private cdr: ChangeDetectorRef) {
        this.selectionModes = [
            { label: 'None', selectMode: 'None', selected: this.selectionMode === 'None', togglable: true },
            { label: 'Multiple', selectMode: 'Multiple', selected: this.selectionMode === 'Multiple', togglable: true },
            { label: 'Cascade', selectMode: 'Cascading', selected: this.selectionMode === 'Cascading', togglable: true }
        ];
        this.data = cloneDeep(HIERARCHICAL_SAMPLE_DATA);
        this.initData = cloneDeep(HIERARCHICAL_SAMPLE_DATA);
        this.mapData(this.data);
    }

    public setDummy() {
        this.data = generateHierarchicalData('ChildCompanies', 3, 6, 0);
    }

    public handleNodeExpanding(_event: ITreeNodeTogglingEventArgs) {
        // do something w/ data
    }

    public handleNodeExpanded(_event: ITreeNodeToggledEventArgs) {
        // do something w/ data
    }

    public handleNodeCollapsing(_event: ITreeNodeTogglingEventArgs) {
        // do something w/ data
    }

    public handleNodeCollapsed(_event: ITreeNodeToggledEventArgs) {
        // do something w/ data
    }


    public addDataChild(key: string) {
        const targetNode = this.getNodeByName(key);
        if (!targetNode.data.ChildCompanies) {
            targetNode.data.ChildCompanies = [];
        }
        const data = targetNode.data.ChildCompanies;
        data.push(Object.assign({}, data[data.length - 1],
            { CompanyName: `Added ${this.addedIndex++}`, selected: this.addedIndex % 2 === 0, ChildCompanies: [] }));
        this.cdr.detectChanges();
    }

    public deleteLastChild(key: string) {
        const targetNode = this.getNodeByName(key);
        if (!targetNode.data.ChildCompanies) {
            targetNode.data.ChildCompanies = [];
        }
        const data = targetNode.data.ChildCompanies;
        data.splice(data.length - 1, 1);
    }

    public deleteNodesFromParent(key: string, deleteNodes: string) {
        const parent = this.getNodeByName(key);
        const nodeIds = deleteNodes.split(';');
        nodeIds.forEach((nodeId) => {
            const index = parent.data.ChildCompanies.findIndex(e => e.ID === nodeId);
            parent.data.ChildCompanies.splice(index, 1);
        });
    }

    public addSeveralNodes(key: string) {
        const targetNode = this.getNodeByName(key);
        if (!targetNode.data.ChildCompanies) {
            targetNode.data.ChildCompanies = [];
        }
        const arr = [{
            ID: 'Some1',
            CompanyName: 'Test 1',
            selected: false,
            ChildCompanies: [{
                ID: 'Some4',
                CompanyName: 'Test 5',
                selected: true,
            }]
        },
        {
            ID: 'Some2',
            CompanyName: 'Test 2',
            selected: false
        },
        {
            ID: 'Some3',
            CompanyName: 'Test 3',
            selected: false
        }];
        this.getNodeByName(key).data.ChildCompanies = arr;
        this.cdr.detectChanges();
    }

    public handleRemote(node: IgxTreeNodeComponent<any>, event: boolean) {
        console.log(event);
        node.loading = true;
        setTimeout(() => {
            const newData: CompanyData[] = [];
            for (let i = 0; i < 10; i++) {
                newData.push({
                    ID: `Remote ${i}`,
                    CompanyName: `Remote ${i}`
                });
            }
            node.loading = false;
            this.asyncItems.next(newData);
        }, this.loadDuration);
    }

    public ngAfterViewInit() {
        this.tree.nodes.toArray().forEach(node => {
            node.selectedChange.subscribe(() => {});
        });
    }

    public toggleSelectionMode() { }

    public addItem() {
        const newArray = [...this.data];
        const children = Math.floor(Math.random() * 4);
        const createChildren = (count: number): CompanyData[] => {
            const array = [];
            for (let i = 0; i < count; i++) {
                this.iteration++;
                array.push({
                    ID: `TEST${this.iteration}`,
                    CompanyName: `TEST${this.iteration}`
                });
            }
            return array;
        };

        this.iteration++;
        newArray.push({
            ID: `TEST${this.iteration}`,
            CompanyName: `TEST${this.iteration}`,
            ChildCompanies: createChildren(children)
        });
        this.data = newArray;
    }

    public resetData() {
        this.data = [...this.initData];
    }

    public get animationSettings() {
        return {
            openAnimation: useAnimation(growVerIn, {
                params: {
                    duration: `${this.animationDuration}ms`
                }
            }),
            closeAnimation: useAnimation(growVerOut, {
                params: {
                    duration: `${this.animationDuration}ms`
                }
            })
        };
    }

    public selectSpecific() {
        this.tree.nodes.toArray()[0].selected = true;
        this.tree.nodes.toArray()[14].selected = true;
        this.tree.nodes.toArray()[1].selected = true;
        this.tree.nodes.toArray()[4].selected = true;
    }

    public selectAll() {
        this.tree.nodes.toArray().forEach(node => node.selected = true);
    }

    public deselectSpecific() {
        const arr = [
            this.tree.nodes.toArray()[0],
            this.tree.nodes.toArray()[14],
            this.tree.nodes.toArray()[1],
            this.tree.nodes.toArray()[4]
        ];
        this.tree.deselectAll(arr);
    }

    public deselectAll() {
        this.tree.deselectAll();
    }

    public changeNodeSelectionState() {
        this.tree.nodes.toArray()[8].selected = !this.tree.nodes.toArray()[8].selected;
    }

    public changeNodeData() {
        this.tree.nodes.toArray()[8].data.selected = !this.tree.nodes.toArray()[8].data.selected;
        this.cdr.detectChanges();
    }

    public nodeSelection(event: ITreeNodeSelectionEvent) {
        // console.log(event);
        if (event.newSelection.find(x => x.data.ID === 'igxTreeNode_1')) {
            //event.newSelection = [...event.newSelection, this.tree.nodes.toArray()[0]];
        }
    }

    public customSearch(term: string) {
        const searchResult = this.tree.findNodes(term, this.containsComparer);
        // console.log(searchResult);
        return searchResult;
    }

    public activeNodeChanged(_event: IgxTreeNode<any>) {
        // active node changed
    }

    public keydown(_event: KeyboardEvent) {
        // console.log(evt);
    }

    private mapData(data: any[]) {
        data.forEach(x => {
            x.selected = false;
            if (x.hasOwnProperty('ChildCompanies') && x.ChildCompanies.length) {
                this.mapData(x.ChildCompanies);
            }
        });
    }

    private containsComparer: IgxTreeSearchResolver =
        (term: any, node: IgxTreeNodeComponent<any>) => node.data?.ID?.toLowerCase()?.indexOf(term.toLowerCase()) > -1;

    private getNodeByName(key: string) {
        return this.tree.findNodes(key, (_term: string, n: IgxTreeNodeComponent<any>) => n.data?.ID === _term)[0];
    }
}


const generateHierarchicalData = (childKey: string, level = 7, children = 6, iter = 0): any[] => {
    const returnArray = [];
    if (level === 0) {
        return returnArray;
    }
    for (let i = 0; i < children; i++) {
        // create Root member
        iter++;
        returnArray.push({
            ID: `Dummy${iter}`, CompanyName: `Dummy-${iter}`,
            [childKey]: generateHierarchicalData(childKey, children, level - 1)
        });
    }
    return returnArray;
};
