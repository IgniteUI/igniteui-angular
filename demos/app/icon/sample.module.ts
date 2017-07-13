import { NgModule } from "@angular/core";
import { IgxIconModule } from "../../../src/main";
import { IconSampleComponent } from "./sample.component";
import { IgxDatePickerModule } from "../../../src/date-picker/date-picker.component"

@NgModule({
    declarations: [IconSampleComponent],
    imports: [IgxIconModule, IgxDatePickerModule]
})
export class IconSampleModule {}
