import { useAnimation } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { growVerIn, growVerOut } from 'igniteui-angular';
import { IgxTreeSearchResolver } from 'projects/igniteui-angular/src/lib/tree/common';
import { IgxTreeNodeComponent } from 'projects/igniteui-angular/src/lib/tree/tree-node/tree-node.component';
import { IgxTreeComponent } from 'projects/igniteui-angular/src/lib/tree/tree.component';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

@Component({
    selector: 'app-tree-sample',
    templateUrl: 'tree.sample.html',
    styleUrls: ['tree.sample.scss']
})
export class TreeSampleComponent implements AfterViewInit {
    @ViewChild('tree1', { static: true })
    public tree: IgxTreeComponent;

    public selectionModes = [];

    public selectionMode = 'None';

    public animationDuration = 400;

    public data;

    public singleBranchExpand = false;

    constructor(private cdr: ChangeDetectorRef) {
        this.selectionModes = [
            { label: 'None', selectMode: 'None', selected: this.selectionMode === 'None', togglable: true },
            { label: 'Multiple', selectMode: 'Multiple', selected: this.selectionMode === 'Multiple', togglable: true },
            { label: 'Cascade', selectMode: 'Cascading', selected: this.selectionMode === 'Cascading', togglable: true }
        ];
        this.data = HIERARCHICAL_SAMPLE_DATA;
        this.mapData(this.data);
    }

    public ngAfterViewInit() {
        this.tree.nodes.toArray().forEach(node => {
            node.selectedChange.subscribe((ev) => {
                console.log(ev);
            });
        });
    }

    public selectCellSelectionMode(args) {
        this.tree.selection = this.selectionModes[args.index].selectMode;
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
        console.log(event);
        if (event.newSelection.find(x => x.id === 'igxTreeNode_1')) {
            //event.newSelection = [...event.newSelection, this.tree.nodes.toArray()[0]];
        }
    }

    public customSearch(term: string) {
        const searchResult = this.tree.findNodes(term, this.containsComparer);
        console.log(searchResult);
    }

    public getNodes() {
        this.tree.getNextNode(this.tree.nodes.toArray()[0]);
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
