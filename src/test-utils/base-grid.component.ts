import { Component, Input, ViewChild } from "@angular/core";
import { IgxGridComponent } from "../grid/grid.component";
import { GridComponentFactory } from "./grid-component-factory";

@Component({
    template: `${ this.template }`
})
export class BaseGridComponent {

    public data = [];
    @Input() template = "";

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    constructor(data: any[]) {
        this.data = data;
        this.template = GridComponentFactory.templateBase;
    }
}
