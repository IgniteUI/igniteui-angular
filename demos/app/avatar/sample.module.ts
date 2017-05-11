import { NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { AvatarSampleComponent } from "./sample.component";

@NgModule({
    imports: [IgxComponentsModule, IgxDirectivesModule],
    declarations: [AvatarSampleComponent]
})
export class AvatarSampleModule {}
