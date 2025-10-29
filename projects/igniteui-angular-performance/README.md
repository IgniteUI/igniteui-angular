# Ignite UI performance project

This project contains sample applications for the grid, tree grid, and pivot grid, with predefined data source sizes of 1,000, 100,000, and 1,000,000 records. These samples are used to measure the performance of different grid features using an internal `PerformanceService`, which is a wrapper around the browser's Performance API.

To run the application:

```sh
npm run start:performance
```

## Using the performance service

The performance service is intended to be used as an injectable service inside a component that would be measured. In order to inject it add a private property in the component:

```ts
private performanceService = inject(PerformanceService);
```

This will initialize the service and also create a global `$$igcPerformance` variable that can be used for convenience.

### API

```ts
performanceService.setLogEnabled(true);
```

- Set whether the service should use `console.debug` to print the performance entries. Defaults to `false`.

```ts
const end = performanceService.start(name);
data.sort();
end();
```

- Starts a performance measuring. The method returns a function that should be invoked after the code you want to measure has finished executing. This creates a `PerformanceMeasure` entry in the browser's performance timeline.

```ts
const performanceMeasures: PerformanceEntryList = performanceService.getMeasures(name?);
```

- Gets list of `PerformanceMeasure` entries`. If a name is provided, it returns only the measures with that name.

```ts
performanceService.clearMeasures(name?);
```

- Clears all performed measures. If a `name` is provided, it clears only the measures with that name.

> **Note:** The `$$igcPerformance` global object could be used as an alternative to the injected `performanceService` instance.

### Reading results

Let's say that we want to measure the time that the grid's sorting pipeline takes to sort the data. We first go to the `IgxGridSortingPipe` and modify the code to look like this:

```ts
@Pipe({
  name: 'gridSort',
  standalone: true,
})
export class IgxGridSortingPipe implements PipeTransform {
  private performance = inject(PerformanceService);

  constructor(@Inject(IGX_GRID_BASE) private grid: GridType) {}

  public transform(
    collection: any[],
    sortExpressions: ISortingExpression[],
    groupExpressions: IGroupingExpression[],
    sorting: IGridSortingStrategy,
    id: string,
    pipeTrigger: number,
    pinned?
  ): any[] {
    // This is important!
    this.performance.setLogEnabled(true);
    const endSorting = this.performance.start('Sorting pipe');

    let result: any[];
    const expressions = groupExpressions.concat(sortExpressions);
    if (!expressions.length) {
      result = collection;
    } else {
      result = DataUtil.sort(
        cloneArray(collection),
        expressions,
        sorting,
        this.grid
      );
    }
    this.grid.setFilteredSortedData(result, pinned);

    // This is important!
    endSorting();

    return result;
  }
}
```

If you run a sample and sort a column, the performance service will measure the execution time of the sorting pipe. There are two ways to see the results:

1.  If `setLogEnabled` is called with `true` then the service will print the measurement result in the console using `console.debug`.
<img width="1720" height="863" alt="performance-console" src="https://github.com/user-attachments/assets/000d0bfd-a180-447d-ac27-2f82904e1150" />

2.  The browser's DevTools Performance tab can be used for a more detailed analysis. Before triggering the action (e.g., sorting), start a new performance recording in DevTools.


https://github.com/user-attachments/assets/8aa80ead-82d0-48a4-a6d2-1c17b3d099b1


You should look at the timings tab in the performance window in dev-tools.
