import { useAnimation } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
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
export class TreeSampleComponent {
    @ViewChild('tree1', { read: IgxTreeComponent })
    public tree: IgxTreeComponent;

    public animationDuration = 400;

    public data = HIERARCHICAL_SAMPLE_DATA;

    public singleBranchExpand = false;

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

    public selectAll() {
        const arr = [
            this.tree.nodes.toArray()[0],
            this.tree.nodes.toArray()[14],
            this.tree.nodes.toArray()[1],
            this.tree.nodes.toArray()[4]
        ];

        this.tree.selectAll(arr, true);
    }

    public nodeSelection(event) {
        console.log(event);
    }

    public customSearch(term: string) {
        const searchResult = this.tree.findNodes(term, this.containsComparer);
        console.log(searchResult);
    }

    private containsComparer: IgxTreeSearchResolver =
        (term: any, node: IgxTreeNodeComponent<any>) => node.data?.ID?.toLowerCase()?.indexOf(term.toLowerCase()) > -1;
}
