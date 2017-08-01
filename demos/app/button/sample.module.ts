import { NgModule } from "@angular/core";
import { IgxIconModule } from "../../../src/icon/icon.component";
import { IgxDirectivesModule } from "../../../src/main";
import { ButtonsSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ButtonsSampleComponent],
    imports: [IgxDirectivesModule, IgxIconModule]
})
export class ButtonSampleModule { }
