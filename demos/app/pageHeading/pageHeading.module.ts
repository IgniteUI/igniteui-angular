import { NgModule } from "@angular/core";
import { IgxDirectivesModule, IgxIconModule, NavigationToggle } from "../../../src/main";
import { PageHeaderComponent } from "./pageHeading.component";

@NgModule({
    declarations: [PageHeaderComponent, NavigationToggle],
    exports: [PageHeaderComponent],
    imports: [IgxDirectivesModule, IgxIconModule]
})
export class PageHeaderModule { }
