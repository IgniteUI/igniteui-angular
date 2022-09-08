import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { resolveNestedPath } from '../../core/utils';
import { GridType, IFieldValidationState, IGridFormGroupCreatedEventArgs, IRecordValidationState } from '../common/grid.interface';

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

    /**
     * @hidden
     * @internal
     */
    public create(rowId, data) {
        let formGroup = this.getFormGroup(rowId);
        if (!formGroup) {
            formGroup = new FormGroup({});
            for (const col of this.grid.columns) {
                const value = resolveNestedPath(data || {}, col.field);
                const field = this.getFieldKey(col.field);
                const control = new FormControl(value, { updateOn: this.grid.validationTrigger });
                control.addValidators(col.validators);
                formGroup.addControl(field, control);
            }
            const args: IGridFormGroupCreatedEventArgs = {
                formGroup,
                owner: this.grid
            };
            this.grid.formGroupCreated.emit(args);
            this.add(rowId, formGroup);
        } else {
            // reset to pristine.
            for (const col of this.grid.columns) {
                const formControl = formGroup.get(col.field);
                if (formControl) {
                    formControl.markAsPristine();
                }
            }
        }

        return formGroup;
    }

    /**
     * @hidden
     * @internal
     */
    private getFieldKey(path: string) {
        const parts = path?.split('.') ?? [];
        return parts.join('_');
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
        const field = this.getFieldKey(columnKey);
        return formControl?.get(field);
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
                const colKey = this.getFieldKey(col.field);
                const control = formGroup.get(colKey);
                if (control) {
                    state.push({ field: colKey, valid: control.valid, errors: control.errors })
                }
            }
            states.push({ key: key, valid: formGroup.valid, cells: state, errors: formGroup.errors });
        });
        return states;
    }

    /**
     * Returns all invalid record states.
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
            const colKey = this.getFieldKey(key);
            const control = rowGroup?.get(colKey);
            if (control) {
                control.setValue(rowData[key], { emitEvent: false });
            }
        }

        this.updateStatus();
    }

    /** Marks the associated record or field as touched.
     * @param key The id of the record that will be marked as touched.
     * @param field Optional. The field from the record that will be marked as touched. If not provided all fields will be touched.
    */
    public markAsTouched(key: any, field?: string) {
        const rowGroup = this.getFormGroup(key);
        if (!rowGroup) return;
        rowGroup.markAsTouched();
        const fields = field ? [field] : this.grid.columns.map(x => x.field);
        for (const currField of fields) {
            const colKey = this.getFieldKey(currField);
            rowGroup?.get(colKey)?.markAsTouched();
        }
    }

    /**
     * @hidden
     * @internal
     */
    private updateStatus() {
        const currentValid = this.valid;
        this._valid = this.getInvalid().length === 0;
        if (this.valid !== currentValid) {
            this.grid.validationStatusChange.emit({ status: this.valid ? 'VALID' : 'INVALID', owner: this.grid });
        }
    }

    /** Clears validation state by key or all states if none is provided.
     * @param key Optional. The key of the record for which to clear state.
    */
    public clear(key?: any) {
        if (key !== undefined) {
            this._validityStates.delete(key);
        } else {
            this._validityStates.clear();
        }
        this.updateStatus();
    }

}
