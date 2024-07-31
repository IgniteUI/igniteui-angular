import { Component, ViewChild, OnInit } from '@angular/core';
import { FilteringExpressionsTree, IgxStringFilteringOperand,
    FilteringLogic,
    IgxQueryBuilderComponent,
    changei18n,
    IExpressionTree,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxRippleDirective} from 'igniteui-angular';
import { IgxResourceStringsFR } from 'igniteui-angular-i18n';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';

@Component({
    providers: [],
    selector: 'app-query-builder-sample',
    styleUrls: ['query-builder.sample.scss'],
    templateUrl: 'query-builder.sample.html',
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxQueryBuilderComponent, IgxButtonDirective, IgxRippleDirective, SizeSelectorComponent]
})
export class QueryBuilderComponent implements OnInit {
    @ViewChild('queryBuilder', { static: true })
    public queryBuilder: IgxQueryBuilderComponent;

    public entities: Array<any>;
    public fields: Array<any>;
    public displayDensities;
    public expressionTree: IExpressionTree;

    public ngOnInit(): void {
        this.entities = [
            { 
                name: 'Assays', fields: [
                    { field: 'Id', dataType: 'number' },
                    { field: 'CompoundId', dataType: 'number' },
                    { field: 'Name', dataType: 'string' },
                    { field: 'EndpointName', dataType: 'string' },
                    { field: 'EndpointValue', dataType: 'string' }
                ]
            },
            {
                name: 'Compounds', fields: [
                    { field: 'Id', dataType: 'number' },
                    { field: 'Structure', dataType: 'string' }
                ]
            }
        ];

        const innerTree = new FilteringExpressionsTree(FilteringLogic.And, 'Assays', 'Id');
        innerTree.filteringOperands.push({
            fieldName: 'Name',
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            searchVal: 'Hepacity',
            // ignoreCase: true
        });
        innerTree.filteringOperands.push({
            fieldName: 'EndpointName',
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            searchVal: 'IC60',
            // ignoreCase: true
        });
        const tree = new FilteringExpressionsTree(FilteringLogic.And, 'Compounds', 'Id');
        tree.filteringOperands.push({
                fieldName: 'Id',
                condition: IgxStringFilteringOperand.instance().condition('IN'),
                searchTree: innerTree
            });
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'xxx'
        });

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
    }

    public changeLocale(locale: string) {
        if (locale === 'fr') {
            changei18n(IgxResourceStringsFR);
        }
        this.queryBuilder.locale = locale;
    }
}
