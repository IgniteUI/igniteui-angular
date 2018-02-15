import { NgModule } from "@angular/core";
import { IgxButtonModule, IgxIconModule, IgxRippleModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ButtonsSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ButtonsSampleComponent],
    imports: [IgxButtonModule, IgxIconModule, IgxRippleModule, PageHeaderModule]
})
export class ButtonSampleModule { }
