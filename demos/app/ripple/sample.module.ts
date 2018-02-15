import { NgModule } from "@angular/core";
import { IgxRippleModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { RippleSampleComponent } from "./sample.component";

@NgModule({
    declarations: [RippleSampleComponent],
    imports: [PageHeaderModule, IgxRippleModule]
})
export class RippleSampleModule { }
