import { NgModule } from "@angular/core";
import { IgxButtonModule, IgxIconModule } from "../../lib/main";
import { PageHeaderComponent } from "./pageHeading.component";

@NgModule({
    declarations: [PageHeaderComponent],
    exports: [PageHeaderComponent],
    imports: [IgxButtonModule, IgxIconModule]
})
export class PageHeaderModule { }
