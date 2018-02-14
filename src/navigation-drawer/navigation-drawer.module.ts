import { NgModule } from "@angular/core";
import { IgxNavigationDrawerComponent } from "./navigation-drawer.component";
import { IgxNavDrawerItemDirective } from "./navigation-drawer.directives";

@NgModule({
    declarations: [IgxNavigationDrawerComponent, IgxNavDrawerItemDirective],
    exports: [IgxNavigationDrawerComponent, IgxNavDrawerItemDirective]
})
export class IgxNavigationDrawerModule {}
