import { Component, ViewChild, OnInit } from '@angular/core';
import {
    FilteringExpressionsTree, IgxStringFilteringOperand,
    FilteringLogic,
    IgxQueryBuilderComponent,
    changei18n,
    IExpressionTree,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxRippleDirective,
    IgxQueryBuilderHeaderComponent} from 'igniteui-angular';
import { IgxResourceStringsFR } from 'igniteui-angular-i18n';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';
import { CommonModule } from '@angular/common';
import { IgxQueryBuilderSearchValueTemplateDirective } from 'igniteui-angular/src/lib/query-builder/query-builder.directives';
import { FormsModule } from '@angular/forms';

@Component({
    providers: [],
    selector: 'app-query-builder-sample',
    styleUrls: ['query-builder.sample.scss'],
    templateUrl: 'query-builder.sample.html',
    standalone: true,
    imports: [FormsModule, IgxButtonGroupComponent, IgxQueryBuilderComponent, IgxQueryBuilderHeaderComponent, IgxButtonDirective, IgxRippleDirective, SizeSelectorComponent, CommonModule, IgxQueryBuilderSearchValueTemplateDirective]
})
export class QueryBuilderComponent implements OnInit {
    @ViewChild('queryBuilder', { static: true })
    public queryBuilder: IgxQueryBuilderComponent;

    @ViewChild('searchValueTemplate', { read: IgxQueryBuilderSearchValueTemplateDirective, static: true })
    public searchValueTemplate: IgxQueryBuilderSearchValueTemplateDirective;

    public entities: Array<any>;
    public assaysFields: Array<any>;
    public compoundsFields: Array<any>;
    public displayDensities;
    public expressionTree: IExpressionTree;
    public queryResult: string;
    private backendUrl = "http://localhost:3333/";

    public ngOnInit(): void {
        this.assaysFields = [
            { field: 'Id', dataType: 'number' },
            { field: 'CompoundId', dataType: 'number' },
            { field: 'Name', dataType: 'string' },
            { field: 'EndpointName', dataType: 'string' },
            { field: 'EndpointValue', dataType: 'string' },
            { field: 'Date', dataType: 'date' }
        ];
        this.compoundsFields = [
            { field: 'Id', dataType: 'number' },
            { field: 'Structure', dataType: 'string' },
            { field: 'Date', dataType: 'date' }
        ];
        this.entities = [
            {
                name: 'Assays',
                fields: this.assaysFields
            },
            {
                name: 'Compounds',
                fields: this.compoundsFields
            }
        ];

        const innerTree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Assays', ['Id']);
        innerTree.filteringOperands.push({
            fieldName: 'Name',
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            conditionName: IgxStringFilteringOperand.instance().condition('equals').name,
            searchVal: 'Hepacity',
            // ignoreCase: true
        });
        innerTree.filteringOperands.push({
            fieldName: 'EndpointName',
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            conditionName: IgxStringFilteringOperand.instance().condition('equals').name,
            searchVal: 'IC60',
            // ignoreCase: true
        });

        const innerTree2 = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Assays', ['Name']);
        innerTree2.filteringOperands.push({
            fieldName: 'Name',
            condition: IgxStringFilteringOperand.instance().condition('null'),
            conditionName: IgxStringFilteringOperand.instance().condition('null').name,
            // ignoreCase: true
        });

        const tree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Compounds', ['*']);
        tree.filteringOperands.push({
                fieldName: 'Id',
                condition: IgxStringFilteringOperand.instance().condition('in'),
                conditionName: IgxStringFilteringOperand.instance().condition('in').name,
                searchTree: innerTree
            });
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            conditionName: IgxStringFilteringOperand.instance().condition('equals').name,
            searchVal: '123',
            ignoreCase: true
        });

        // tree.filteringOperands.push({
        //     fieldName: 'Structure',
        //     condition: IgxStringFilteringOperand.instance().condition('in'),
        //     searchTree: innerTree2
        // });

        // const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
        // orTree.filteringOperands.push({
        //     fieldName: 'ID',
        //     condition: IgxStringFilteringOperand.instance().condition('contains'),
        //     searchVal: 'b',
        //     ignoreCase: true
        // });
        // orTree.filteringOperands.push({
        //     fieldName: 'CompanyName',
        //     condition: IgxStringFilteringOperand.instance().condition('contains'),
        //     searchVal: 'c',
        //     ignoreCase: true
        // });
        // tree.filteringOperands.push(orTree);
        // tree.filteringOperands.push({
        //     fieldName: 'CompanyName',
        //     condition: IgxStringFilteringOperand.instance().condition('contains'),
        //     searchVal: 'd',
        //     ignoreCase: true
        // });

        this.expressionTree = tree;
        // this.onChange();
    }

    public handleExpressionTreeChange() {
        console.log(this.queryBuilder.expressionTree);
    }

    public async onChange() {
        // const tree = JSON.stringify(this.expressionTree);
        // const resp = await fetch(this.backendUrl, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: tree
        // })
        // if (resp.status == 200) {
        //     this.queryResult = await resp.text();
        // }
    }

    public changeLocale(locale: string) {
        if (locale === 'fr') {
            changei18n(IgxResourceStringsFR);
        }
        this.queryBuilder.locale = locale;
    }

    public printExpressionTree(tree: IExpressionTree) {
        if (JSON.stringify(tree) !== JSON.stringify(this.expressionTree)) {
            // this.expressionTree = tree;
            // this.onChange();
        }
        return tree ? JSON.stringify(tree, null, 2) : 'Please add an expression!';
    }
}
