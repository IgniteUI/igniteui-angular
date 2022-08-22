import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GridType, IFieldValidationState, IRecordValidationState } from '../common/grid.interface';

@Injectable()
export class IgxGridValidationService {
    public grid: GridType;
    private _validityStates = new Map<any,FormGroup>();

    /**
     * @hidden
     * @internal
     */
    public create(rowId, data) {
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
            this.add(rowId, formGroup);
        }
        return formGroup;
    }

    /**
     * @hidden
     * @internal
     */
    public getFormGroup(id: any) {
        return this._validityStates.get(id);
    }

    /**
     * @hidden
     * @internal
     */
    public getFormControl(rowId: any, columnKey: string) {
        const formControl = this.getFormGroup(rowId);
        return formControl.get(columnKey);
    }

    /**
     * @hidden
     * @internal
     */
    public add(rowId: any, form: FormGroup ) {
        this._validityStates.set(rowId, form);
    }

    public getValidity() : IRecordValidationState[] {
        const states: IRecordValidationState[] = [];
        this._validityStates.forEach((formGroup, key) => {
            const state: IFieldValidationState[] = [];
            for (const col of this.grid.columns) {
                const control = formGroup.get(col.field);
                if (control) {
                    state.push({field: col.field, valid: control.valid, errors: control.errors })
                }
            }
            states.push({id: key, valid: formGroup.valid, state: state });
        });
        return states;
    }

    public getInvalid(): IRecordValidationState[] {
        const validity = this.getValidity();
        return validity.filter(x => !x.valid);
    }

    /**
     * @hidden
     * @internal
     */
    public update(rowId:any, rowData: any) {
        const rowGroup = this.getFormGroup(rowId);
        for (const col of this.grid.columns) {
            const control = rowGroup.get(col.field);
            if (control) {
                control.setValue(rowData[col.field]);
            }
        }
    }

    public clear(rowId?: any) {
        if (rowId) {
            this._validityStates.delete(rowId);
        } else {
            this._validityStates.clear();
        }
    }

}