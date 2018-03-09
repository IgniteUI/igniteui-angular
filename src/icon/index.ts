import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IgxIconComponent } from "./icon.component";
import { IgxIconService } from "./icon.service";

@NgModule({
    declarations: [IgxIconComponent],
    exports: [IgxIconComponent],
    imports: [CommonModule],
    providers: [IgxIconService]
})
export class IgxIconModule {
    public static forRoot() {
        return {
            ngModule: IgxIconModule,
            providers: [IgxIconService]
        };
    }
}
