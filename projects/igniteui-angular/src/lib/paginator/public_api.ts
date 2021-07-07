import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IgxSelectModule } from '../select/public_api';
import { IgxIconModule } from '../icon/public_api';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxInputGroupModule } from '../input-group/public_api';

import { IgxPageSizeSelectorComponent } from './page_size_selector.component';
import { IgxPageNavigationComponent } from './pager.component';
import { IgxPaginatorComponent, IgxPaginatorTemplateDirective } from './paginator.component';

export * from './page_size_selector.component';
export * from './pager.component';
export * from './paginator.component';

@NgModule({
    declarations: [
        IgxPaginatorComponent,
        IgxPageNavigationComponent,
        IgxPageSizeSelectorComponent,
        IgxPaginatorTemplateDirective
    ],
    exports: [
        IgxPaginatorComponent,
        IgxPageNavigationComponent,
        IgxPageSizeSelectorComponent,
        IgxPaginatorTemplateDirective
    ],
    imports: [
        CommonModule,
        FormsModule,
        IgxButtonModule,
        IgxIconModule,
        IgxInputGroupModule,
        IgxRippleModule,
        IgxSelectModule
    ]
})
export class IgxPaginatorModule { }
