import { AfterContentInit, Component, ContentChild, Input, TemplateRef } from "@angular/core";
import { DataType } from "../data-operations/data-util";
import { FilteringCondition } from "../main";
import {
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective
} from "./grid.common";

@Component({
    moduleId: module.id,
    selector: "igx-column",
    template: ``
})
export class IgxColumnComponent implements AfterContentInit {

    @Input() public field: string;
    @Input() public header: string = "";
    @Input() public sortable: boolean = false;
    @Input() public editable: boolean = false;
    @Input() public filtering: boolean = false;
    @Input() public hidden: boolean = false;
    @Input() public movable: boolean = false;
    @Input() public width: string;
    @Input() public index: number;
    @Input() public filteringCondition: Function = FilteringCondition.string.contains;
    @Input() public filteringIgnoreCase: boolean = true;
    @Input() public dataType: DataType = DataType.String;
    @ContentChild(IgxCellTemplateDirective) protected cellTemplate: IgxCellTemplateDirective;
    @ContentChild(IgxCellHeaderTemplateDirective) protected headTemplate: IgxCellHeaderTemplateDirective;
    @ContentChild(IgxCellFooterTemplateDirective) protected footTemplate: IgxCellFooterTemplateDirective;

    public bodyTemplate: TemplateRef<any>;
    public headerTemplate: TemplateRef<any>;
    public footerTemplate: TemplateRef<any>;

    public ngAfterContentInit(): void {
        if (this.cellTemplate) {
            this.bodyTemplate = this.cellTemplate.template;
        }
        if (this.headTemplate) {
            this.headerTemplate = this.headTemplate.template;
        }
        if (this.footTemplate) {
            this.footerTemplate = this.footTemplate.template;
        }
    }
}
