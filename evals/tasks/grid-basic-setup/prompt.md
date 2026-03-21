# Agent Prompt: Grid Basic Setup

You are working in an Angular 20+ project that already has `igniteui-angular` installed.

Create an `EmployeeListComponent` at `src/app/employee-list/employee-list.component.ts` that shows a data grid with employee data, sorting on all columns, and pagination with 5 items per page.

Use this flat employee data:

```typescript
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
```

Requirements:
- Use the Ignite UI for Angular `igx-grid` component (NOT tree-grid, hierarchical-grid, or pivot-grid)
- Display columns: id, name, department, salary, hireDate
- Enable sorting on all columns
- Add a paginator with page size of 5
- Import from the `igniteui-angular/grids/grid` entry point (not the root barrel)
- Component must be standalone with ChangeDetectionStrategy.OnPush
- Create both a `.ts` file and a `.html` template file
