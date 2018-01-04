import { NgModule } from "@angular/core";
import { IgxIconModule } from "../../lib/main";
import { PageHeaderComponent } from "./pageHeading.component";

@NgModule({
    declarations: [PageHeaderComponent],
    exports: [PageHeaderComponent],
    imports: [IgxIconModule]
})
export class PageHeaderModule { }
