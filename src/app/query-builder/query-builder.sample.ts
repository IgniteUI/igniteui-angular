import { Component, ViewChild, OnInit } from '@angular/core';
import { FilteringExpressionsTree, IgxStringFilteringOperand,
    FilteringLogic,
    DisplayDensity,
    IgxQueryBuilderComponent,
    changei18n,
    IExpressionTree} from 'igniteui-angular';
import { IgxResourceStringsFR } from 'igniteui-angular-i18n';

@Component({
    providers: [],
    selector: 'app-query-builder-sample',
    styleUrls: ['query-builder.sample.scss'],
    templateUrl: 'query-builder.sample.html'
})
export class QueryBuilderComponent implements OnInit {
    @ViewChild('queryBuilder', { static: true })
    public queryBuilder: IgxQueryBuilderComponent;

    public fields: Array<any>;
    public displayDensities;
    public density: DisplayDensity = 'comfortable';
    public advancedFilteringTree: IExpressionTree;

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'compact', selected: this.density === 'compact', togglable: true }
        ];

        this.fields = [
            { field: 'ID', dataType: 'string' },
            { field: 'CompanyName', dataType: 'string'},
            { field: 'ContactName', dataType: 'string' },
            { field: 'Employees', dataType: 'number' },
            { field: 'ContactTitle', dataType: 'string' },
            { field: 'DateCreated', dataType: 'date' },
            { field: 'TimeCreated', dataType: 'time' },
            { field: 'Address', dataType: 'string' },
            { field: 'City', dataType: 'string' },
            { field: 'Region', dataType: 'string' },
            { field: 'PostalCode', dataType: 'string' },
            { field: 'Phone', dataType: 'string' },
            { field: 'Fax', dataType: 'string' },
            { field: 'Contract', dataType: 'boolean' }
        ];

        const tree = new FilteringExpressionsTree(FilteringLogic.And);
        tree.filteringOperands.push({
            fieldName: 'ID',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'a',
            ignoreCase: true
        });
        const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
        orTree.filteringOperands.push({
            fieldName: 'ID',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'b',
            ignoreCase: true
        });
        orTree.filteringOperands.push({
            fieldName: 'CompanyName',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'c',
            ignoreCase: true
        });
        tree.filteringOperands.push(orTree);
        tree.filteringOperands.push({
            fieldName: 'CompanyName',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'd',
            ignoreCase: true
        });

        this.advancedFilteringTree = tree;
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public changeLocale(locale: string) {
        if (locale === 'fr') {
            changei18n(IgxResourceStringsFR);
        }
        this.queryBuilder.locale = locale;
    }
}
