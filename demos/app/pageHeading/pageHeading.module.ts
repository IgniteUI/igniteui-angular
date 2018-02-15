import { NgModule } from "@angular/core";
import { IgxIconModule, IgxToggleModule } from "../../lib/main";
import { PageHeaderComponent } from "./pageHeading.component";

@NgModule({
    declarations: [PageHeaderComponent],
    exports: [PageHeaderComponent],
    imports: [IgxIconModule, IgxToggleModule]
})
export class PageHeaderModule { }
