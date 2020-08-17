import { Component, ElementRef, Input, ViewChild, Injectable, OnInit, AfterViewInit } from "@angular/core"
import { IgxGridComponent, IgxTreeGridComponent, IgxTreeGridRowComponent } from 'igniteui-angular'

@Component({
    selector: `add-row-component`,
    templateUrl: `add-row.component.html`,
    styleUrls: [`add-row.component.scss`]
})
export class AddRowComponent implements AfterViewInit {
    public _id;
    public _crudService;
    @Input()
    public set crudService(value) {
        this._crudService = value;
    }
    public get crudService() {
        return this._crudService;
    }

    @Input()
    public set gridID(value) {
        this._id = value;
    }
    public get gridID() {
        return this._id;
    }

    @ViewChild('row', { read: IgxTreeGridRowComponent}) public row: IgxTreeGridRowComponent;
    constructor() {
    }
    ngAfterViewInit(){
        this.row.crudService = this._crudService;
    }
}
