import { useAnimation } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { growVerIn, growVerOut, IgxTreeComponent, IgxTreeNodeComponent, IgxTreeSearchResolver } from 'igniteui-angular';
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
        return  {
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

    public customSearch(term: string) {
        const searchResult = this.tree.findNodes(term, this.containsComparer);
        console.log(searchResult);
    }

    private containsComparer: IgxTreeSearchResolver =
    (term: any, node: IgxTreeNodeComponent<any>) => node.data.ID.ToLowerCase().indexOf(term.ToLowerCase()) > -1;
}
