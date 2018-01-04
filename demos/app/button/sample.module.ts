import { NgModule } from "@angular/core";
import { IgxIconModule} from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ButtonsSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ButtonsSampleComponent],
    imports: [IgxIconModule, PageHeaderModule]
})
export class ButtonSampleModule { }
