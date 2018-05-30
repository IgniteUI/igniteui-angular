import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { IgxColumnHidingComponent } from './column-hiding.component';

export interface IValueChangedEventArgs {
    oldValue: any;
    newValue: any;
}

export abstract class ItemPropertyValueChanged {
    private _object: any;
    private _propName: string;

    get object() {
        return this._object;
    }

    set object(value) {
        if (value) {
            this._object = value;
        }
    }

    @Input()
    get value() {
        return (this.object) ? this.object[this._propName] : null;
    }

    set value(value) {
        this.onValueChanged(value);
    }

    @Output()
    public valueChanged = new EventEmitter<IValueChangedEventArgs>();

    constructor(propName: string) {
        this._propName = propName;
    }

    protected onValueChanged(value) {
        const currentValue = this.value;
        if (value !== currentValue) {
            this.object[this._propName] = value;
            this.valueChanged.emit({ oldValue: currentValue, newValue: value });
        }
    }
}

export class ColumnItemBase extends ItemPropertyValueChanged {
    @Input()
    get column() {
        return this.object;
    }

    set column(value) {
        if (value) {
            this.object = value;
        }
    }

    @Input()
    public container: any;

    constructor(public prop: string) {
        super(prop);
    }

    get name() {
        return (this.column) ? ((this.column.header) ? this.column.header : this.column.field) : '';
    }
}

export interface IColumnVisibilityChangedEventArgs {
    column: any;
    newValue: boolean;
}

@Directive({
    selector: '[igxColumnHidingItem]'
})
export class IgxColumnHidingItemDirective extends ColumnItemBase {

    constructor() {
        super('hidden');
    }

    get disableHiding() {
        return this.column.disableHiding;
    }
}
