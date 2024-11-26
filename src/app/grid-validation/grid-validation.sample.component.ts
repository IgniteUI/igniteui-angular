import { Component, Directive, ViewChild, Input } from '@angular/core';
import { NgTemplateOutlet, NgIf, NgFor } from '@angular/common';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, ValidatorFn, Validators, FormsModule } from '@angular/forms';

import { data } from '../shared/data';

import { HIERARCHICAL_DATA } from '../shared/hierarchicalData';
import { GridColumnDataType, IGX_GRID_DIRECTIVES, IGridFormGroupCreatedEventArgs, IGridValidationStatusEventArgs, IRecordValidationState, IgxGridComponent, IgxHierarchicalGridComponent, IgxRowIslandComponent, IgxTreeGridComponent, RowType, IgxActionStripComponent, IgxGridPinningActionsComponent, IgxGridEditingActionsComponent, IgxSwitchComponent } from 'igniteui-angular';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = nameRe.test(control.value);
      return forbidden ? {forbiddenName: {value: control.value}} : null;
    };
  }

@Directive({
    selector: '[appForbiddenName]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenValidatorDirective, multi: true }],
    standalone: true
})
  export class ForbiddenValidatorDirective extends Validators {
    @Input('appForbiddenName')
    public forbiddenName = '';

    public validate(control: AbstractControl): ValidationErrors | null {
      return this.forbiddenName ? forbiddenNameValidator(new RegExp(this.forbiddenName, 'i'))(control)
                                : null;
    }
  }


@Component({
    selector: 'app-grid-row-edit',
    styleUrls: [`grid-validation.sample.component.scss`],
    templateUrl: 'grid-validation.sample.component.html',
    imports: [
        NgFor,
        NgIf,
        NgTemplateOutlet,
        FormsModule,
        ForbiddenValidatorDirective,
        IGX_GRID_DIRECTIVES,
        IgxTreeGridComponent,
        IgxHierarchicalGridComponent,
        IgxRowIslandComponent,
        IgxActionStripComponent,
        IgxGridPinningActionsComponent,
        IgxGridEditingActionsComponent,
        IgxSwitchComponent,
    ]
})
export class GridValidationSampleComponent {
    public rowEditWithTransactions = true;
    public rowEditNoTransactions = true;
    public transactionData = JSON.parse(JSON.stringify(data));
    public data = data;
    public rowStyles = {
      background: (row: RowType) => {
          return row.validation.status === 'INVALID' ? '#FF000033' : '#00000000';
      }
  };
    public columns = [
        { field: 'ProductID' },
        { field: 'ProductName' },
        { field: 'UnitPrice' },
        { field: 'UnitsInStock' }
    ];

    public treeColumns: {
        field: string;
        label: string;
        width: number;
        resizable: boolean;
        dataType: GridColumnDataType;
        hasSummary: boolean;
    }[] = [
      { field: 'employeeID', label: 'ID', width: 200, resizable: true, dataType: 'number', hasSummary: false },
      { field: 'Salary', label: 'Salary', width: 200, resizable: true, dataType: 'number', hasSummary: true },
      { field: 'firstName', label: 'First Name', width: 300, resizable: true, dataType: 'string', hasSummary: false },
      { field: 'lastName', label: 'Last Name', width: 150, resizable: true, dataType: 'string', hasSummary: false },
      { field: 'Title', label: 'Title', width: 200, resizable: true, dataType: 'string', hasSummary: true }
  ];
    public treeData = [
      { Salary: 2500, employeeID: 0, PID: -1, firstName: 'Andrew', lastName: 'Fuller', Title: 'Vice President, Sales' },
      { Salary: 3500, employeeID: 1, PID: -1, firstName: 'Jonathan', lastName: 'Smith', Title: 'Human resources' },
      { Salary: 1500, employeeID: 2, PID: -1, firstName: 'Nancy', lastName: 'Davolio', Title: 'CFO' },
      { Salary: 2500, employeeID: 3, PID: -1, firstName: 'Steven', lastName: 'Buchanan', Title: 'CTO' },
      // sub of ID 0
      { Salary: 2500, employeeID: 4, PID: 0, firstName: 'Janet', lastName: 'Leverling', Title: 'Sales Manager' },
      {
          Salary: 3500, employeeID: 5, PID: 0, firstName: 'Laura', lastName: 'Callahan',
          Title: 'Inside Sales Coordinator'
      },
      { Salary: 1500, employeeID: 6, PID: 0, firstName: 'Margaret', lastName: 'Peacock', Title: 'Sales Representative' },
      { Salary: 2500, employeeID: 7, PID: 0, firstName: 'Michael', lastName: 'Suyama', Title: 'Sales Representative' },
      // sub of ID 4
      { Salary: 2500, employeeID: 8, PID: 4, firstName: 'Anne', lastName: 'Dodsworth', Title: 'Sales Representative' },
      { Salary: 3500, employeeID: 9, PID: 4, firstName: 'Danielle', lastName: 'Davis', Title: 'Sales Representative' },
      { Salary: 1500, employeeID: 10, PID: 4, firstName: 'Robert', lastName: 'King', Title: 'Sales Representative' },
      // sub of ID 2
      { Salary: 2500, employeeID: 11, PID: 2, firstName: 'Peter', lastName: 'Lewis', Title: 'Chief Accountant' },
      { Salary: 3500, employeeID: 12, PID: 2, firstName: 'Ryder', lastName: 'Zenaida', Title: 'Accountant' },
      { Salary: 1500, employeeID: 13, PID: 2, firstName: 'Wang', lastName: 'Mercedes', Title: 'Accountant' },
      // sub of ID 3
      { Salary: 1500, employeeID: 14, PID: 3, firstName: 'Theodore', lastName: 'Zia', Title: 'Software Architect' },
      { Salary: 4500, employeeID: 15, PID: 3, firstName: 'Lacota', lastName: 'Mufutau', Title: 'Product Manager' },
      // sub of ID 16
      { Salary: 2500, employeeID: 16, PID: 15, firstName: 'Jin', lastName: 'Elliott', Title: 'Product Owner' },
      { Salary: 3500, employeeID: 17, PID: 15, firstName: 'Armand', lastName: 'Ross', Title: 'Product Owner' },
      { Salary: 1500, employeeID: 18, PID: 15, firstName: 'Dane', lastName: 'Rodriquez', Title: 'Team Leader' },
      // sub of ID 19
      {
          Salary: 2500, employeeID: 19, PID: 18, firstName: 'Declan', lastName: 'Lester',
          Title: 'Senior Software Developer'
      },
      {
          Salary: 3500, employeeID: 20, PID: 18, firstName: 'Bernard', lastName: 'Jarvis',
          Title: 'Senior Software Developer'
      },
      { Salary: 1500, employeeID: 21, PID: 18, firstName: 'Jason', lastName: 'Clark', Title: 'QA' },
      { Salary: 1500, employeeID: 22, PID: 18, firstName: 'Mark', lastName: 'Young', Title: 'QA' },
      // sub of ID 20
      { Salary: 1500, employeeID: 23, PID: 20, firstName: 'Jeremy', lastName: 'Donaldson', Title: 'Software Developer' }
  ];

  public hGridData = HIERARCHICAL_DATA;
  public hColumns = [
    { field: 'FirstName' },
    { field: 'LastName' },
    { field: 'Title' },
    { field: 'City' }
];

public hColumns2 = [
  { field: 'ShipName' },
  { field: 'ShipAddress' },
  { field: 'ShipCity' },
  { field: 'OrderDate' }
];


    @ViewChild('gridTransactions', { read:  IgxGridComponent })
    public gridWithTransaction: IgxGridComponent;

    @ViewChild('gridNoTransactions', { read:  IgxGridComponent })
    public gridNoTransactions: IgxGridComponent;

    public commitWithTransactions() {
      const invalid: IRecordValidationState[] = this.gridWithTransaction.validation.getInvalid();
        if (invalid.length > 0) {
           if (confirm('There are invalid values about to be submitted. Do you want to continue')) {
            this.gridWithTransaction.transactions.commit(this.transactionData);
            this.gridWithTransaction.validation.clear();
           }
        } else {
            this.gridWithTransaction.transactions.commit(this.transactionData);
        }
    }

    public undo() {
      this.gridWithTransaction.transactions.undo();
    }

    public redo() {
      this.gridWithTransaction.transactions.redo();
    }

    public clearValidity() {
        this.gridNoTransactions.validation.clear();
        this.gridNoTransactions.markForCheck();
    }

    public cellEdit(evt) {
        // can cancel if there are validation errors
        if (!evt.isValid && !this.rowEditNoTransactions) {
            evt.cancel = true;
        }
    }

    public formCreateHandler(form: IGridFormGroupCreatedEventArgs) {
        // can add validators here
        const prodName = form.formGroup.get('ProductName');
        prodName.addValidators(forbiddenNameValidator(/bob/i));
    }

    public validationChange(evtArgs: IGridValidationStatusEventArgs){
        alert(evtArgs.status === 'INVALID' ? 'state became INVALID' : 'state became VALID');
    }

    public updateRow(id) {
      this.gridWithTransaction.updateRow({
        ProductID: 1,
        ProductName: '',
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: '10 boxes x 20 bags',
        UnitPrice: '18.0000',
        UnitsInStock: 39,
        UnitsOnOrder: 0,
        ReorderLevel: 10.567,
        Discontinued: false,
        OrderDate: null,
        OrderDate2: new Date(1991, 2, 12, 18, 40, 50).toISOString()
      }, id)
    }

    public updateCell(id) {
      this.gridWithTransaction.updateCell('', id, 'ProductName');
    }
}
