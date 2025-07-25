import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { columnFieldPath, resolveNestedPath } from '../../core/utils';
import type { ColumnType, GridType, IFieldValidationState, IGridFormGroupCreatedEventArgs, IRecordValidationState, ValidationStatus } from '../common/grid.interface';

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
    public get valid(): boolean {
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
                this.addFormControl(formGroup, data, col);
            }
            const args: IGridFormGroupCreatedEventArgs = {
                formGroup,
                owner: this.grid
            };
            this.grid.formGroupCreated.emit(args);
            formGroup.patchValue(data);
            this.add(rowId, formGroup);
        } else {
            // reset to pristine.
            for (const col of this.grid.columns) {
                const formControl = formGroup.get(col.field);
                if (formControl) {
                    formControl.markAsPristine();
                } else {
                    this.addFormControl(formGroup, data, col);
                }
            }
        }

        return formGroup;
    }

    /**
    * @hidden
    * @internal
    */
    private addFormControl(formGroup: FormGroup, data: any, column: ColumnType) {
        const value = resolveNestedPath(data || {}, columnFieldPath(column.field));
        const control = new FormControl(value, { updateOn: this.grid.validationTrigger });
        control.addValidators(column.validators);
        formGroup.addControl(column.field, control);
        control.setValue(value);
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
     Wraps the provided path into an array. This way FormGroup.get will return proper result.
     Otherwise, if the path is a string (e.g. 'address.street'), FormGroup.get will treat it as there is a nested structure
     and will look for control with a name of 'address' which returns undefined.
     */
    private getFormControlPath(path: string): (string)[] {
        return [path];
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
        const path = this.getFormControlPath(columnKey);
        return formControl?.get(path);
    }

    /**
     * @hidden
     * @internal
     */
    public add(rowId: any, form: FormGroup) {
        this._validityStates.set(rowId, form);
    }

    /**
     * Checks the validity of the native ngControl
     */
    public isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
        const path = this.getFormControlPath(fieldName);
        return formGroup.get(path)?.invalid && formGroup.get(path)?.touched;
    }

    /**
     * Checks the validity of the native ngControl after edit
     */
    public isFieldValidAfterEdit(formGroup: FormGroup, fieldName: string): boolean {
        const path = this.getFormControlPath(fieldName);
        return !formGroup.get(path)?.invalid && formGroup.get(path)?.dirty;
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
                const path = this.getFormControlPath(col.field);
                const control = formGroup.get(path);
                if (control) {
                    state.push({ field: col.field, status: control.status as ValidationStatus, errors: control.errors })
                }
            }
            states.push({ key: key, status: formGroup.status as ValidationStatus, fields: state, errors: formGroup.errors });
        });
        return states;
    }

    /**
     * Returns all invalid record states.
     */
    public getInvalid(): IRecordValidationState[] {
        const validity = this.getValidity();
        return validity.filter(x => x.status === 'INVALID');
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
            const path = this.getFormControlPath(key);
            const control = rowGroup?.get(path);
            if (control && control.value !== rowData[key]) {
                control.setValue(rowData[key], { emitEvent: false });
            }
        }

        this.updateStatus();
    }

    /**
     * @hidden
     * @internal
     * Update validity based on new data.
     */
    public updateAll(newData: any) {
        if (!newData || this._validityStates.size === 0) return;
        for (const rec of newData) {
            const rowId = rec[this.grid.primaryKey] || rec;
            if (this.getFormGroup(rowId)) {
                const recAggregatedData = this.grid.transactions.getAggregatedValue(rowId, true) || rec;
                this.update(rowId, recAggregatedData);
            }
        }
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
            const path = this.getFormControlPath(currField);
            rowGroup?.get(path)?.markAsTouched();
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
