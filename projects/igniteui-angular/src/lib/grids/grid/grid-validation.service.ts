import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GridType, IFieldValidationState, IRecordValidationState, Validity } from '../common/grid.interface';

@Injectable()
export class IgxGridValidationService {
    /**
     * @hidden
     * @internal
     */
    public grid: GridType;
    private _validityStates = new Map<any, FormGroup>();
    private _valid = true;


    /** Gets whether state is valid.
    */
    public get valid() : boolean {
        return this._valid;
    }

    public set valid(value: boolean) {
        this._valid = value;
    }

    /**
     * @hidden
     * @internal
     */
    public create(rowId, data) {
        let formGroup = this.getFormGroup(rowId);
        if (!formGroup) {
            formGroup = new FormGroup({});
            for (const col of this.grid.columns) {
                const field = col.field;
                const control = new FormControl(data ? data[field] : undefined, { updateOn: this.grid.validationTrigger });
                control.addValidators(col.validators);
                formGroup.addControl(field, control);
            }
            this.grid.formGroupCreated.emit(formGroup);
            this.add(rowId, formGroup);
        } else {
            // reset to pristine.
            for (const col of this.grid.columns) {
                const formControl = formGroup.get(col.field);
                formControl.markAsPristine();
            }
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
    public add(rowId: any, form: FormGroup) {
        this._validityStates.set(rowId, form);
    }

    /**
     * @hidden
     * @internal
     */
    private getValidity(): IRecordValidationState[] {
        const states: IRecordValidationState[] = [];
        this._validityStates.forEach((formGroup, key) => {
            const state: IFieldValidationState[] = [];
            for (const col of this.grid.columns) {
                const control = formGroup.get(col.field);
                if (control) {
                    state.push({ field: col.field, valid: control.valid, errors: control.errors })
                }
            }
            states.push({ id: key, valid: formGroup.valid, state: state });
        });
        return states;
    }

    /** Returns all invalid record states.
    * @returns Array of IRecordValidationState.
    */
    public getInvalid(): IRecordValidationState[] {
        const validity = this.getValidity();
        return validity.filter(x => !x.valid);
    }

    /**
     * @hidden
     * @internal
     */
    public update(rowId: any, rowData: any) {
        if (!rowData) return;
        const keys = Object.keys(rowData);
        const rowGroup = this.getFormGroup(rowId);
        for (const key of keys) {
            const control = rowGroup?.get(key);
            if (control) {
                control.setValue(rowData[key], { emitEvent: false });
            }
        }

        this.updateStatus();
    }

    /**
     * @hidden
     * @internal
     */
    public markAsTouched(rowId: any) {
        const rowGroup = this.getFormGroup(rowId);
        rowGroup.markAsTouched();
        for (const col of this.grid.columns) {
            const field = col.field;
            const control = rowGroup?.get(field);
            control.markAsTouched();
        }
    }

    /**
     * @hidden
     * @internal
     */
    private updateStatus() {
        const currentValid = this.valid;
        this.valid = this.getInvalid().length === 0;
        if (this.valid !== currentValid) {
            this.grid.validationStatusChange.emit(this.valid ? Validity.Valid : Validity.Invalid);
        }
    }

    /** Clears validity state by id or clears all states if no id is passed.
     * @param id The id of the record for which to clear state.
     * @returns Array of IRecordValidationState.
    */
    public clear(rowId?: any) {
        if (rowId) {
            this._validityStates.delete(rowId);
        } else {
            this._validityStates.clear();
        }
        this.updateStatus();
        (this.grid as any).markForCheck();
    }

}