import { NgModule } from "@angular/core";
import { AvatarSampleComponent } from "./sample.component";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";

@NgModule({
    imports: [IgxComponentsModule, IgxDirectivesModule],
    declarations: [AvatarSampleComponent]
})
export class AvatarSampleModule {}