import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IgxTreeComponent, IgxTreeExpandIndicatorDirective, IgxTreeNodeComponent, IgxTreeNodeLinkDirective } from './public_api';
import { HIERARCHICAL_SAMPLE_DATA } from 'src/app/shared/sample-data';
import { NgTemplateOutlet } from '@angular/common';
import { IgxIconComponent } from '../icon/icon.component';

@Component({
    template: `
    <igx-tree #tree1 class="medium">
        @for (node of data; track node) {
            <igx-tree-node [selected]="node.ID === 'ALFKI'" [data]="node">
                {{ node.CompanyName }}
                @for (child of node.ChildCompanies; track child) {
                    <igx-tree-node [data]="child">
                        {{ child.CompanyName }}
                        @for (leafchild of child.ChildCompanies; track leafchild) {
                            <igx-tree-node [data]="leafchild">
                                {{ leafchild.CompanyName }}
                            </igx-tree-node>
                        }
                    </igx-tree-node>
                }
            </igx-tree-node>
        }
    </igx-tree>
    `,
    standalone: true,
    imports: [IgxTreeComponent, IgxTreeNodeComponent]
})
export class IgxTreeSimpleComponent {
    @ViewChild(IgxTreeComponent, { static: true }) public tree: IgxTreeComponent;
    public data = HIERARCHICAL_SAMPLE_DATA;
}

@Component({
    template: `
    <igx-tree #tree1 class="medium">
        @for (node of data; track node) {
            <igx-tree-node [data]="node" [(selected)]="node.selected">
                {{ node.CompanyName }}
                @for (child of node.ChildCompanies; track child) {
                    <igx-tree-node [data]="child" [(selected)]="child.selected">
                        {{ child.CompanyName }}
                        @for (leafchild of child.ChildCompanies; track leafchild) {
                            <igx-tree-node [data]="leafchild" [(selected)]="leafchild.selected">
                                {{ leafchild.CompanyName }}
                            </igx-tree-node>
                        }
                    </igx-tree-node>
                }
            </igx-tree-node>
        }
    </igx-tree>
    `,
    standalone: true,
    imports: [IgxTreeComponent, IgxTreeNodeComponent]
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
        @for (node of data; track node) {
            <igx-tree-node [data]="node" [active]="node.ID === 'COMMI'">
                {{ node.CompanyName }}
                <igx-tree-node [disabled]="isDisabled">Disable Node Level 1</igx-tree-node>
                @for (child of node.ChildCompanies; track child) {
                    <igx-tree-node [data]="child">
                        {{ child.CompanyName }}
                        @for (leafchild of child.ChildCompanies; track leafchild) {
                            <igx-tree-node [data]="leafchild">
                                {{ leafchild.CompanyName }}
                            </igx-tree-node>
                        }
                        <igx-tree-node [disabled]="isDisabled">Disable Node Level 2</igx-tree-node>
                    </igx-tree-node>
                }
            </igx-tree-node>
        }
        <igx-tree-node [disabled]="isDisabled">Disable Node Level 0</igx-tree-node>
        @if (showNodesWithDirective) {
            <igx-tree-node>
                <a id="link" igxTreeNodeLink href="https://infragistics.com">Link to Infragistics</a>
                @for (node of [].constructor(3); track node) {
                    <igx-tree-node>
                        <a igxTreeNodeLink href="https://infragistics.com">Link to Infragistics</a>
                    </igx-tree-node>
                }
                <igx-tree-node [disabled]="isDisabled">
                    <a igxTreeNodeLink href="https://infragistics.com">Link to Infragistics</a>
                </igx-tree-node>
            </igx-tree-node>
        }
        @if (showNodesWithDirective) {
            <igx-tree-node #parentNode>
                <ng-template *ngTemplateOutlet="nodeTemplate; context { $implicit: parentNode }"></ng-template>
                <igx-tree-node #disabledChild [disabled]="isDisabled">
                    <ng-template *ngTemplateOutlet="nodeTemplate; context { $implicit: disabledChild }"></ng-template>
                </igx-tree-node>
                @for (node of [].constructor(3); track node) {
                    <igx-tree-node #childNode>
                        <ng-template *ngTemplateOutlet="nodeTemplate; context { $implicit: childNode }"></ng-template>
                    </igx-tree-node>
                }
            </igx-tree-node>
        }
        <ng-template #nodeTemplate let-node>
            <a [igxTreeNodeLink]="node" href="https://infragistics.com">Link to Infragistics</a>
        </ng-template>
    </igx-tree>
    `,
    standalone: true,
    imports: [IgxTreeComponent, IgxTreeNodeComponent, IgxTreeNodeLinkDirective, NgTemplateOutlet]
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
        @for (node of data; track node) {
            <igx-tree-node [data]="node" [active]="node.ID === 'FRANS'" [expanded]="true">
                {{ node.CompanyName }}
                @for (child of node.ChildCompanies; track child) {
                    <igx-tree-node [data]="child" [expanded]="true">
                        {{ child.CompanyName }}
                        @for (leafchild of child.ChildCompanies; track leafchild) {
                            <igx-tree-node [data]="leafchild">
                                {{ leafchild.CompanyName }}
                            </igx-tree-node>
                        }
                    </igx-tree-node>
                }
            </igx-tree-node>
        }
        <ng-template igxTreeExpandIndicator let-expanded>
            <igx-icon>{{ expanded ? "close_fullscreen": "open_in_full"}}</igx-icon>
        </ng-template>
    </igx-tree>
    `,
    standalone: true,
    imports: [IgxTreeComponent, IgxTreeNodeComponent, IgxTreeExpandIndicatorDirective, IgxIconComponent]
})
export class IgxTreeScrollComponent {
    @ViewChild(IgxTreeComponent, { static: true }) public tree: IgxTreeComponent;
    public data = HIERARCHICAL_SAMPLE_DATA;
}
