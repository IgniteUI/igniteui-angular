# Roadmap - Ignite UI for Angular

## Next three months (due April 15th, 2018)

1. Expanding Ignite UI CLI views and templates with Ignite UI for Angular
1.1. Adding component views like App Host, Tabs, List
1.2. Updating the default project look
1.3. Move the project navigation inside an App Host
2. Grid Multi-column Headers [issue](https://github.com/IgniteUI/igniteui-angular/issues/488)
3. Collapsible Column Groups with state templating (collapsed state column can be templated)
4. Column pinning
5. Grouping
6. Export to excel
7. Combo
8. Mask directive (editor)
9. Operations UI - column chooser

## Next three months (due January 15th, 2018)

1. Row objects - 1st sprint (by November 20th, 2017) [issue](https://github.com/IgniteUI/igniteui-angular/issues/479)  
	In order to implement virtualization in the Grid, we would need a row object to be abstracted. 
2. Cell objects - 2nd sprint (by December 11th, 2017) [issue](https://github.com/IgniteUI/igniteui-angular/issues/480)  
3. Virtualization - research 1st sprint [issue](https://github.com/IgniteUI/igniteui-angular/issues/482)  
	We need a virtual container as an extension/feature of the `DataContainer`. Virtualization would behave similar to how the controls operate with the `Paging` pipe. There would be a mechanism for components to request the `DataContainer` to skip `n` records and return `k` records. Then the control takes care of rendering those `k` records in a container, which we call `virtual DOM container`. The side of the `virtual DOM container` will be fixed, and there should be no difference for the component whether the records are available in memory, or should be requested from a remote service. This is, in fact, a generalization of the `Paging` feature, where with paging the skip is performed on a multiple of `k` and `k` is fixed and controlled by the developer.
4. Grid Row virtualization - after row objects and virtualization are implemented
5. Grid Column virtualization - after row objects and column component refactoring are done  
	This feature enables Grid columns to be virtualized. The feature splits records into parts, and only a certain part of the record is rendered.
6. Data Operations UI (by December 31st, 2017) [issue](https://github.com/IgniteUI/igniteui-angular/issues/486)  
	We need a data oprations UI component, which communicates with our filtering, sorting, and other data opration pipes. The data operations component should be templatable and pluggable into any component that is bound to our `DataContainer`, but should also provide an exceptional default template.
7. Alternating row style  
8. **[DONE]** Ignite UI CLI integration [issue](https://github.com/IgniteUI/ignite-ui-cli/issues/53)  
    Ignite UI CLI will also provide Ignite UI for Angular templates, views, and components integration. All features of the CLI will be accessible in the context of Ignite UI for Angular, as well as the full Ignite UI product suite.  

# Previous Milestones

## Milestone 1 (by January 15th, 2018)
