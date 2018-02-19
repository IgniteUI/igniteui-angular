import { NgModule } from "@angular/core";
import { IgxButtonModule, IgxIconModule, IgxToggleModule } from "../../lib/main";
import { PageHeaderComponent } from "./pageHeading.component";

@NgModule({
    declarations: [PageHeaderComponent],
    exports: [PageHeaderComponent],
    imports: [IgxButtonModule, IgxIconModule, IgxToggleModule]
})
export class PageHeaderModule { }
