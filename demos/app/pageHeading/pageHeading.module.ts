import { NgModule } from "@angular/core";
import { IgxDirectivesModule, IgxIconModule, IgxNavigationModule } from "../../lib/main";
import { PageHeaderComponent } from "./pageHeading.component";

@NgModule({
    declarations: [PageHeaderComponent],
    exports: [PageHeaderComponent],
    imports: [IgxDirectivesModule, IgxIconModule, IgxNavigationModule]
})
export class PageHeaderModule { }
