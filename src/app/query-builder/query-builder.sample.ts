import { Component, ViewChild, OnInit } from '@angular/core';
import {
    FilteringExpressionsTree,
    FilteringLogic,
    IgxQueryBuilderComponent,
    changei18n,
    IExpressionTree,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxRippleDirective,
    IgxQueryBuilderHeaderComponent,
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxDateFilteringOperand,
    IgxTimeFilteringOperand,
    IgxDateTimeFilteringOperand
} from 'igniteui-angular';
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
    public fieldsEntityA: Array<any>;
    public fieldsEntityB: Array<any>;
    public displayDensities;
    public expressionTree: IExpressionTree;
    public queryResult: string;

    public ngOnInit(): void {
        this.fieldsEntityA = [
            { field: 'Id', dataType: 'number' },
            { field: 'Name', dataType: 'string' },
            { field: 'Validated', dataType: 'boolean' },
            { field: 'Date created', dataType: 'date' },
            { field: 'Time created', dataType: 'time' },
            { field: 'DateTime created', dataType: 'dateTime' }
        ];
        this.fieldsEntityB = [
            { field: 'Number', dataType: 'number' },
            { field: 'String', dataType: 'string' },
            { field: 'Boolean', dataType: 'boolean' },
            { field: 'Date', dataType: 'date' },
            { field: 'Time', dataType: 'time' },
            { field: 'DateTime', dataType: 'dateTime' }
        ];
        this.entities = [
            {
                name: 'Entity A',
                fields: this.fieldsEntityA
            },
            {
                name: 'Entity B',
                fields: this.fieldsEntityB
            }
        ];

        const innerTree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Entity B', ['Number']);
        innerTree.filteringOperands.push({
            fieldName: 'Number',
            condition: IgxNumberFilteringOperand.instance().condition('equals'),
            conditionName: IgxNumberFilteringOperand.instance().condition('equals').name,
            searchVal: 123
        });
        innerTree.filteringOperands.push({
            fieldName: 'String',
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            conditionName: IgxStringFilteringOperand.instance().condition('equals').name,
            searchVal: 'abc'
        });
        innerTree.filteringOperands.push({
            fieldName: 'Boolean',
            condition: IgxBooleanFilteringOperand.instance().condition('true'),
            conditionName: IgxBooleanFilteringOperand.instance().condition('true').name
        });
        innerTree.filteringOperands.push({
            fieldName: 'Date',
            condition: IgxDateFilteringOperand.instance().condition('before'),
            conditionName: IgxDateFilteringOperand.instance().condition('before').name,
            searchVal: new Date()
        });
        innerTree.filteringOperands.push({
            fieldName: 'Time',
            condition: IgxTimeFilteringOperand.instance().condition('before'),
            conditionName: IgxTimeFilteringOperand.instance().condition('before').name,
            searchVal: new Date()
        });
        innerTree.filteringOperands.push({
            fieldName: 'DateTime',
            condition: IgxDateTimeFilteringOperand.instance().condition('before'),
            conditionName: IgxDateTimeFilteringOperand.instance().condition('before').name,
            searchVal: new Date()
        });

        const tree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Entity A', ['*']);
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxStringFilteringOperand.instance().condition('in'),
            conditionName: IgxStringFilteringOperand.instance().condition('in').name,
            searchTree: innerTree
        });
        tree.filteringOperands.push({
            fieldName: 'Validated',
            condition: IgxBooleanFilteringOperand.instance().condition('true'),
            conditionName: IgxBooleanFilteringOperand.instance().condition('true').name
        });

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

    public canCommitExpressionTree() {
        console.log(this.queryBuilder.canCommit());
    }

    public commitExpressionTree() {
        this.queryBuilder.commit();
    }

    public discardExpressionTree() {
        this.queryBuilder.discard();
    }
}
