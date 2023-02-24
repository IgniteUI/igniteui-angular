import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IgxSelectModule } from '../select/public_api';






import {
    IgxPageNavigationComponent,
    IgxPageSizeSelectorComponent,
    IgxPaginatorComponent,
    IgxPaginatorTemplateDirective
} from './paginator.component';
import { IgxPaginatorDirective } from './paginator-interfaces';

export * from './paginator.component';

@NgModule({
    exports: [
        IgxPaginatorComponent,
        IgxPageNavigationComponent,
        IgxPageSizeSelectorComponent,
        IgxPaginatorTemplateDirective,
        IgxPaginatorDirective
    ],
    imports: [
    CommonModule,
    FormsModule,
    IgxSelectModule,
    IgxPaginatorComponent,
    IgxPageNavigationComponent,
    IgxPageSizeSelectorComponent,
    IgxPaginatorTemplateDirective,
    IgxPaginatorDirective
]
})
export class IgxPaginatorModule { }
