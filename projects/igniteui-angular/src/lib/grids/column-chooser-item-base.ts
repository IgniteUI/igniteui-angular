import { EventEmitter, Input, Output } from '@angular/core';
import { IBaseEventArgs } from '../core/utils';

export interface IValueChangedEventArgs extends IBaseEventArgs {
    oldValue: any;
    newValue: any;
}

/**
 *@hidden
 */
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

/** @hidden */
export class ColumnChooserItemBase extends ItemPropertyValueChanged {
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
    public indentation = 30;

    @Input()
    public container: any;

    constructor(public prop: string) {
        super(prop);
    }

    get name() {
        return (this.column) ? ((this.column.header) ? this.column.header : this.column.field) : '';
    }

    get level() {
        return this.column.level;
    }

    get calcIndent() {
        return this.indentation * this.level;
    }
}
