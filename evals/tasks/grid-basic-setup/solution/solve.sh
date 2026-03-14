#!/bin/bash
# Reference solution for grid-basic-setup
# Proves the task is solvable and validates grader correctness

set -euo pipefail

mkdir -p src/app/employee-list

# Create the component TypeScript file
cat > src/app/employee-list/employee-list.component.ts << 'EOF'
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IgxPaginatorComponent } from 'igniteui-angular/grids/grid';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IGX_GRID_DIRECTIVES, IgxPaginatorComponent],
})
export class EmployeeListComponent {
  employees = [
    { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 95000, hireDate: new Date('2020-03-15') },
    { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 72000, hireDate: new Date('2019-07-22') },
    { id: 3, name: 'Carol Davis', department: 'Engineering', salary: 105000, hireDate: new Date('2018-01-10') },
    { id: 4, name: 'David Wilson', department: 'Sales', salary: 68000, hireDate: new Date('2021-11-05') },
    { id: 5, name: 'Eva Martinez', department: 'Engineering', salary: 98000, hireDate: new Date('2020-09-18') },
    { id: 6, name: 'Frank Brown', department: 'Marketing', salary: 75000, hireDate: new Date('2017-04-30') },
    { id: 7, name: 'Grace Lee', department: 'Sales', salary: 82000, hireDate: new Date('2019-12-01') },
    { id: 8, name: 'Henry Taylor', department: 'Engineering', salary: 110000, hireDate: new Date('2016-06-14') },
  ];
}
EOF

# Create the template
cat > src/app/employee-list/employee-list.component.html << 'EOF'
<igx-grid [data]="employees" [allowFiltering]="false" width="100%" height="600px">
  <igx-column field="id" header="ID" [sortable]="true"></igx-column>
  <igx-column field="name" header="Name" [sortable]="true"></igx-column>
  <igx-column field="department" header="Department" [sortable]="true"></igx-column>
  <igx-column field="salary" header="Salary" [sortable]="true"></igx-column>
  <igx-column field="hireDate" header="Hire Date" [sortable]="true"></igx-column>
  <igx-paginator [perPage]="5"></igx-paginator>
</igx-grid>
EOF
