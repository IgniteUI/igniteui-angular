import { NgModule } from "@angular/core";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { RippleSampleComponent } from "./sample.component";

@NgModule({
    declarations: [RippleSampleComponent],
    imports: [PageHeaderModule]
})
export class RippleSampleModule { }
