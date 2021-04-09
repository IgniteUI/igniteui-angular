import { useAnimation } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, OnDestroy } from '@angular/core';
import {
    DisplayDensity, growVerIn, growVerOut,
    IgxTreeNodeComponent, IgxTreeSearchResolver, IgxTreeNode, IgxTreeComponent
} from 'igniteui-angular';
import { Subject } from 'rxjs';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

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
    styleUrls: ['tree.sample.scss']
})
export class TreeSampleComponent implements AfterViewInit, OnDestroy {
    @ViewChild('tree1', { static: true })
    public tree: IgxTreeComponent;

    @ViewChild('test', { static: true })
    public testNode: IgxTreeNode<any>;

    public selectionModes = [];

    public selectionMode = 'None';

    public animationDuration = 400;

    public density: DisplayDensity = DisplayDensity.comfortable;

    public displayDensities: { label: DisplayDensity; selectMode: DisplayDensity; selected: boolean; togglable: boolean }[] = [
        {
            label: DisplayDensity.comfortable,
            selectMode: DisplayDensity.comfortable,
            selected: this.density === DisplayDensity.comfortable,
            togglable: false
        },
        {
            label: DisplayDensity.cosy,
            selectMode: DisplayDensity.cosy,
            selected: this.density === DisplayDensity.cosy,
            togglable: false
        },
        {
            label: DisplayDensity.compact,
            selectMode: DisplayDensity.compact,
            selected: this.density === DisplayDensity.compact,
            togglable: false
        }
    ];

    public data: CompanyData[];

    public singleBranchExpand = false;

    public asyncItems = new Subject<CompanyData[]>();
    public loadDuration = 6000;
    private iteration = 0;

    private initData: CompanyData[];

    constructor(private cdr: ChangeDetectorRef) {
        this.selectionModes = [
            { label: 'None', selectMode: 'None', selected: this.selectionMode === 'None', togglable: true },
            { label: 'Multiple', selectMode: 'Multiple', selected: this.selectionMode === 'Multiple', togglable: true },
            { label: 'Cascade', selectMode: 'Cascading', selected: this.selectionMode === 'Cascading', togglable: true }
        ];
        this.data = HIERARCHICAL_SAMPLE_DATA;
        this.initData = HIERARCHICAL_SAMPLE_DATA;
        this.mapData(this.data);
    }

    public setDummy() {
        this.data = generateHierarchicalData('ChildCompanies', 3, 6, 0);
    }

    public handleEvent(event: any) {
        // event.cancel = true;
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

    public handleActive(event: any) {
        const activeNodes = this.tree.findNodes(true, (_anything, node) => node.active);
        if (activeNodes) {
            activeNodes.forEach(e => e.active = false);
        }
    }

    public ngAfterViewInit() {
        this.tree.nodes.toArray().forEach(node => {
            node.selectedChange.subscribe((ev) => {
                // console.log(ev);
            });
        });
        // if (localStorage.getItem('activeNode')) {
        //     this.activatedNode = this.customSearch(JSON.parse(localStorage.getItem('activeNode')).ID)[0];
        //     this.cdr.detectChanges();
        // }
    }

    public ngOnDestroy() {
        // if (this.activatedNode) {
        //     localStorage.setItem('activeNode', JSON.stringify(this.activatedNode.data));
        // } else {
        //     localStorage.setItem('activeNode', JSON.stringify(this.testNode.data));
        // }
    }

    public selectCellSelectionMode(args) {
        this.tree.selection = this.selectionModes[args.index].selectMode;
    }

    public changeDensity(args) {
        this.density = this.displayDensities[args.index].selectMode;
    }

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

    public nodeSelection(event) {
        // console.log(event);
        if (event.newSelection.find(x => x.id === 'igxTreeNode_1')) {
            //event.newSelection = [...event.newSelection, this.tree.nodes.toArray()[0]];
        }
    }

    public customSearch(term: string) {
        const searchResult = this.tree.findNodes(term, this.containsComparer);
        // console.log(searchResult);
        return searchResult;
    }

    public activeNodeChanged(evt) {
        // console.log(evt);
    }

    public keydown(evt) {
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
