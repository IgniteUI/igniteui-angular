import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IgxIconComponent } from "./icon.component";
import { IgxIconService } from "./icon.service";
var IgxIconModule = (function () {
    function IgxIconModule() {
    }
    IgxIconModule.forRoot = function () {
        return {
            ngModule: IgxIconModule,
            providers: [IgxIconService]
        };
    };
    IgxIconModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxIconComponent],
                    exports: [IgxIconComponent],
                    imports: [CommonModule],
                    providers: [IgxIconService]
                },] },
    ];
    return IgxIconModule;
}());
export { IgxIconModule };
