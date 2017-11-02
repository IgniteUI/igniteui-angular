# Roadmap - Ignite UI for Angular

## Next three months (due January 15th, 2018)

1. Row objects - 1st sprint (by November 20th, 2017)  
	In order to implement virtualization in the Grid, we would need a row object to be abstracted. 
2. Cell objects - 2nd sprint (by December 11th, 2017)
2. Column component refactoring and API review
3. Virtualization - research 1st sprint  
	We need a virtual container as an extension/feature of the `DataContainer`. Virtualization would behave similar to how the controls operate with the `Paging` pipe. There would be a mechanism for components to request the `DataContainer` to skip `n` records and return `k` records. Then the control takes care of rendering those `k` records in a container, which we call `virtual DOM container`. The side of the `virtual DOM container` will be fixed, and there should be no difference for the component whether the records are available in memory, or should be requested from a remote service. This is, in fact, a generalization of the `Paging` feature, where with paging the skip is performed on a multiple of `k` and `k` is fixed and controlled by the developer.
4. Grid Row virtualization - after row objects and virtualization are implemented
5. Grid Column virtualization - after row objects and column component refactoring are done  
	This feature enables Grid columns to be virtualized. The feature splits records into parts, and only a certain part of the record is rendered.
6. Filter UI - 2 sprints design, then implementation (by December 31st, 2017)  
	We need a filtering UI component, which communicates with our filtering pipe. The filtering component should be templatable and pluggable into any component that is bound to our `DataContainer`, but should also provide an exceptional default template.
7. Alternating row style

## Next six months (due April 15th, 2018)

1. Multi-column headers
2. Column pinning
3. Grouping
4. Export to excel
5. Combo
6. Grid-wide search
7. Mask directive (editor)
