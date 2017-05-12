import { NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { AvatarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [AvatarSampleComponent],
    imports: [IgxComponentsModule, IgxDirectivesModule]
})
export class AvatarSampleModule {}
