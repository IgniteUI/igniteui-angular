import { NgModule } from "@angular/core";
import { IgxDirectivesModule, IgxIconModule} from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ButtonsSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ButtonsSampleComponent],
    imports: [IgxDirectivesModule, IgxIconModule, PageHeaderModule]
})
export class ButtonSampleModule { }
