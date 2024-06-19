import { TestBed } from '@angular/core/testing';
import { IgxToolbarToken } from './token';
import { IgxGridToolbarAdvancedFilteringComponent } from './grid-toolbar-advanced-filtering.component';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('IgxGridToolbarAdvancedFilteringComponent', () => {
  let component: IgxGridToolbarAdvancedFilteringComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: IgxToolbarToken, useValue: {} }
      ],
      imports: [
        NoopAnimationsModule
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(IgxGridToolbarAdvancedFilteringComponent);
    component = fixture.componentInstance;
    component['toolbar'].grid = { resourceStrings: { igx_grid_toolbar_advanced_filtering_button_tooltip: '' } } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should extract unique field names from filtering tree', () => {
    const tree = new FilteringExpressionsTree(FilteringLogic.And);
    tree.filteringOperands.push({
      fieldName: 'ID',
      condition: IgxStringFilteringOperand.instance().condition('contains'),
      searchVal: 'a',
      ignoreCase: true
    });

    tree.filteringOperands.push({
      fieldName: 'LastName',
      condition: IgxStringFilteringOperand.instance().condition('contains'),
      searchVal: 'a',
      ignoreCase: true
    });

    const subTree = new FilteringExpressionsTree(FilteringLogic.Or);
    subTree.filteringOperands.push({
      fieldName: 'ContactTitle',
      condition: IgxStringFilteringOperand.instance().condition('doesNotContain'),
      searchVal: 'b',
      ignoreCase: true
    });
    subTree.filteringOperands.push({
      fieldName: 'ID',
      condition: IgxStringFilteringOperand.instance().condition('startsWith'),
      searchVal: 'c',
      ignoreCase: true
    });

    tree.filteringOperands.push(subTree);

    const uniqueFieldNames = component['extractUniqueFieldNamesFromFilterTree'](tree);

    expect(uniqueFieldNames).toEqual(['ID', 'LastName', 'ContactTitle']);
  });
});
