# Task: Add a Data Grid with Sorting and Pagination

You are working in an Angular 20+ project that already has `igniteui-angular` installed and a theme applied.

## Requirements

Add a data grid to the `EmployeeListComponent` that displays employee data with the following features:

1. **Data source**: Use the following flat employee data (add it as a property in the component):

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

2. **Columns**: Display all fields — `id`, `name`, `department`, `salary`, `hireDate`

3. **Sorting**: Enable sorting on all columns

4. **Pagination**: Add a paginator with a page size of 5

5. **Component**: Create or edit the file at `src/app/employee-list/employee-list.component.ts` (with its template and styles)

## Constraints

- Use the Ignite UI for Angular `igx-grid` component — do NOT use a native HTML `<table>`, Angular Material table, or any other grid library.
- Import from the correct `igniteui-angular` entry point.
- The component must be standalone and use `ChangeDetectionStrategy.OnPush`.
