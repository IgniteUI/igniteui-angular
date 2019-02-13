import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxNavigationDrawerComponent } from './navigation-drawer.component';
import {
    IgxNavDrawerItemDirective,
    IgxNavDrawerMiniTemplateDirective,
    IgxNavDrawerTemplateDirective
} from './navigation-drawer.directives';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxNavigationDrawerComponent,
        IgxNavDrawerItemDirective,
        IgxNavDrawerMiniTemplateDirective,
        IgxNavDrawerTemplateDirective
    ],
    exports: [
        IgxNavigationDrawerComponent,
        IgxNavDrawerItemDirective,
        IgxNavDrawerMiniTemplateDirective,
        IgxNavDrawerTemplateDirective
    ],
    imports: [CommonModule]
})
export class IgxNavigationDrawerModule {}
