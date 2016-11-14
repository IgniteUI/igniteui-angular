import { NgModule } from "@angular/core";
import { IgxDirectivesModule } from "../../../src/main";
import { ButtonsSampleComponent } from "./sample.component";

@NgModule({
    imports: [IgxDirectivesModule],
    declarations: [ButtonsSampleComponent]
})
export class ButtonSampleModule {}