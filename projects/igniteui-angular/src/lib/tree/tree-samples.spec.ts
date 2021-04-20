import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IgxTreeComponent } from './public_api';
import { HIERARCHICAL_SAMPLE_DATA } from 'src/app/shared/sample-data';

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

@Component({
    template: `
    <igx-tree #tree1 class="medium">
        <igx-tree-node *ngFor="let node of data" [data]="node" [active]="node.ID === 'COMMI'">
            {{ node.CompanyName }}
            <igx-tree-node [disabled]="isDisabled">Disable Node Level 1</igx-tree-node>
            <igx-tree-node *ngFor="let child of node.ChildCompanies" [data]="child">
                {{ child.CompanyName }}
                <igx-tree-node *ngFor="let leafchild of child.ChildCompanies" [data]="leafchild">
                    {{ leafchild.CompanyName }}
                </igx-tree-node>
                <igx-tree-node [disabled]="isDisabled">Disable Node Level 2</igx-tree-node>
            </igx-tree-node>
        </igx-tree-node>
        <igx-tree-node [disabled]="isDisabled">Disable Node Level 0</igx-tree-node>
        <igx-tree-node *ngIf="showNodesWithDirective">
            <a id="link" igxTreeNodeLink href="https://infragistics.com">Link to Infragistics</a>
            <igx-tree-node *ngFor="let node of [].constructor(3)">
                <a igxTreeNodeLink href="https://infragistics.com">Link to Infragistics</a>
            </igx-tree-node>
            <igx-tree-node [disabled]="isDisabled">
                <a igxTreeNodeLink href="https://infragistics.com">Link to Infragistics</a>
            </igx-tree-node>
        </igx-tree-node>
        <igx-tree-node #parentNode *ngIf="showNodesWithDirective">
            <ng-template *ngTemplateOutlet="nodeTemplate; context { $implicit: parentNode }"></ng-template>
            <igx-tree-node #disabledChild [disabled]="isDisabled">
                <ng-template *ngTemplateOutlet="nodeTemplate; context { $implicit: disabledChild }"></ng-template>
            </igx-tree-node>
            <igx-tree-node #childNode *ngFor="let node of [].constructor(3)">
                <ng-template *ngTemplateOutlet="nodeTemplate; context { $implicit: childNode }"></ng-template>
            </igx-tree-node>
        </igx-tree-node>
        <ng-template #nodeTemplate let-node>
            <a [igxTreeNodeLink]="node" href="https://infragistics.com">Link to Infragistics</a>
        </ng-template>
    </igx-tree>
    `
})
export class IgxTreeNavigationComponent {
    @ViewChild(IgxTreeComponent, { static: true }) public tree: IgxTreeComponent;
    public data = HIERARCHICAL_SAMPLE_DATA;
    public showNodesWithDirective = false;
    public isDisabled = false;
}
@Component({
    template: `
    <igx-tree #tree1 style="height: 300px; overflow-y: scroll; width: 400px;">
        <igx-tree-node *ngFor="let node of data" [data]="node" [active]="node.ID === 'FRANS'" [expanded]="true">
            {{ node.CompanyName }}
            <igx-tree-node *ngFor="let child of node.ChildCompanies" [data]="child" [expanded]="true">
                {{ child.CompanyName }}
                <igx-tree-node *ngFor="let leafchild of child.ChildCompanies" [data]="leafchild">
                    {{ leafchild.CompanyName }}
                </igx-tree-node>
            </igx-tree-node>
        </igx-tree-node>
    </igx-tree>
    `
})
export class IgxTreeScrollComponent {
    @ViewChild(IgxTreeComponent, { static: true }) public tree: IgxTreeComponent;
    public data = HIERARCHICAL_SAMPLE_DATA;
}
