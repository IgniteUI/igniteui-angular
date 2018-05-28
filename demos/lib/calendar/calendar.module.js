import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxIconModule } from "../icon";
import { IgxCalendarComponent } from "./calendar.component";
import { IgxCalendarDateDirective, IgxCalendarHeaderTemplateDirective, IgxCalendarMonthDirective, IgxCalendarSubheaderTemplateDirective, IgxCalendarYearDirective } from "./calendar.directives";
var IgxCalendarModule = (function () {
    function IgxCalendarModule() {
    }
    IgxCalendarModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [
                        IgxCalendarComponent,
                        IgxCalendarDateDirective,
                        IgxCalendarHeaderTemplateDirective,
                        IgxCalendarMonthDirective,
                        IgxCalendarYearDirective,
                        IgxCalendarSubheaderTemplateDirective
                    ],
                    exports: [
                        IgxCalendarComponent,
                        IgxCalendarDateDirective,
                        IgxCalendarHeaderTemplateDirective,
                        IgxCalendarMonthDirective,
                        IgxCalendarYearDirective,
                        IgxCalendarSubheaderTemplateDirective
                    ],
                    imports: [CommonModule, FormsModule, IgxIconModule]
                },] },
    ];
    return IgxCalendarModule;
}());
export { IgxCalendarModule };
