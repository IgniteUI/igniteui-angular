import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GridType } from '../common/grid.interface';

@Injectable()
export class IgxGridValidationService {
    public grid: GridType;
    private _validityStates = new Map<any,FormGroup>();

    public createFormGroupForRecord(rowId, data) {
        let formGroup = this._validityStates.get(rowId);
        if (!formGroup) {
            formGroup = new FormGroup({});
            for (const col of this.grid.columns) {
                const field = col.field;
                const control = new FormControl(data ? data[field] : undefined, { updateOn: this.grid.validationTrigger });
                control.addValidators(col.validators);
                formGroup.addControl(field, control);
            }
            this.grid.onFormGroupCreate.emit(formGroup);
            this.addRecordState(rowId, formGroup);
        }
        return formGroup;
    }

    public getFormGroup(id: any) {
        return this._validityStates.get(id);
    }

    public getFormControl(rowId: any, columnKey: string) {
        const formControl = this.getFormGroup(rowId);
        return formControl.get(columnKey);
    }

    public addRecordState(rowId: any, form: FormGroup ) {
        this._validityStates.set(rowId, form);
    }

    public getInvalidStates() {
        //todo
        this._validityStates.forEach(x => {
        });
    }

}