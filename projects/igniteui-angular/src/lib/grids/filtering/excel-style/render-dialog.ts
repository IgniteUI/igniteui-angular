/* eslint-disable prefer-arrow/prefer-arrow-functions */

import { ApplicationRef, ComponentFactoryResolver, Injector, NgModuleRef } from '@angular/core';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';


export function createExcelStyleFilterComponent(
    moduleRef: NgModuleRef<any>,
    factoryResolver: ComponentFactoryResolver,
    applicationRef: ApplicationRef,
    injector: Injector
) {
    const resolver = moduleRef ? moduleRef.componentFactoryResolver : factoryResolver;
    const factory = resolver.resolveComponentFactory(IgxGridExcelStyleFilteringComponent);
    injector = moduleRef ? moduleRef.injector : injector;
    const component = factory.create(injector);
    applicationRef.attachView(component.hostView);
    return component.instance;
}
