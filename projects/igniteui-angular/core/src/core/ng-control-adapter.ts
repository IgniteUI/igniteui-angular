import { effect, EnvironmentInjector, Injector, untracked } from '@angular/core';
import { AbstractControl, NgControl, TouchedChangeEvent, Validators } from '@angular/forms';
import { EMPTY, filter, Observable } from 'rxjs';

/** Source of the state behind an `NgControl`. */
export type NgControlBackend = 'observable' | 'signal';

/** Whether a control took a value written through `setValue`. */
export type ValueWriteResult = 'accepted' | 'ignored';

/** Validation outcome of a control, mirroring `FormControlStatus`. */
export type ControlStatus = 'valid' | 'invalid' | 'pending' | 'disabled';

/**
 * Uniform access to the `NgControl` bound to a form control.
 *
 * Reactive and template-driven forms provide an `NgControl` backed by an
 * `AbstractControl` with observables. Signal Forms (`[formField]`) provide
 * an interop `NgControl` backed by signals, without `statusChanges`,
 * `valueChanges`, `validator` or `markAsTouched`.
 *
 * @hidden @internal
 */
export class NgControlAdapter {
    public readonly backend: NgControlBackend;

    private readonly envInjector: EnvironmentInjector;
    private sawErrors = false;

    /** Wraps `ngControl`, or returns `null` when there is none. */
    public static from(ngControl: NgControl | null, injector: Injector): NgControlAdapter | null {
        return ngControl ? new NgControlAdapter(ngControl, injector) : null;
    }

    constructor(private readonly ngControl: NgControl, injector: Injector) {
        this.envInjector = injector.get(EnvironmentInjector);
        this.backend = 'statusChanges' in ngControl ? 'observable' : 'signal';
    }

    public get disabled(): boolean {
        return !!this.ngControl.disabled;
    }

    public get valid(): boolean {
        return !!this.ngControl.valid;
    }

    public get invalid(): boolean {
        return !!this.ngControl.invalid;
    }

    public get pending(): boolean {
        return !!this.ngControl.pending;
    }

    /** Derived, not read from `status`: the Signal Forms interop throws on a status it does not know. */
    public get status(): ControlStatus {
        if (this.disabled) {
            return 'disabled';
        }

        if (this.invalid) {
            return 'invalid';
        }

        return this.pending ? 'pending' : 'valid';
    }

    public get touchedOrDirty(): boolean {
        const control = this.ngControl.control;
        return !!(control?.touched || control?.dirty);
    }

    /**
     * Signal Forms expose no rule list. A field that is required, or was ever
     * invalid or pending, is known to have rules; a rule satisfied from the
     * start stays undetected.
     */
    public get hasValidators(): boolean {
        if (this.backend === 'signal') {
            return this.required || this.sawErrors;
        }

        const control = this.ngControl.control;
        return !!(control?.validator || control?.asyncValidator);
    }

    public get required(): boolean {
        const control = this.ngControl.control;
        if (control?.hasValidator?.(Validators.required) || this.backend === 'signal') {
            return !!control?.hasValidator(Validators.required);
        }

        const validator = control?.validator;
        if (!validator) {
            return false;
        }

        // `hasValidator` misses the `[required]` directive, whose validator is merged into `validator`.
        // Probe with an empty control so `required` is detected regardless of the current value.
        // A validator that reads the value throws on the probe; treat that as not required.
        try {
            return !!validator({} as AbstractControl)?.required;
        } catch {
            return false;
        }
    }

    /**
     * Emits when validity, required, disabled, dirty or pending state changes.
     * Signal Forms `submit()` only marks fields touched, so touched changes count too
     * or the errors would never surface.
     */
    public get statusChanges(): Observable<unknown> {
        if (this.backend === 'signal') {
            return this.watch(() => {
                this.observeErrors();

                return [
                    this.ngControl.valid, this.pending, this.required,
                    this.ngControl.disabled, this.ngControl.dirty, this.ngControl.touched
                ];
            });
        }

        return this.ngControl.statusChanges!;
    }

    public get touchedChanges(): Observable<unknown> {
        if (this.backend === 'signal') {
            return this.watch(() => [this.ngControl.touched]);
        }

        return this.ngControl.control?.events.pipe(filter(e => e instanceof TouchedChangeEvent)) ?? EMPTY;
    }

    public get valueChanges(): Observable<unknown> {
        if (this.backend === 'signal') {
            return this.watch(() => [this.ngControl.value]);
        }

        return this.ngControl.valueChanges!;
    }

    /** No-op for Signal Forms: `[formField]` tracks touch through blur and `registerOnTouched`. */
    public markAsTouched(): void {
        this.ngControl.control?.markAsTouched?.();
    }

    /**
     * Signal Forms ignore the write: they read the value from the view
     * (DOM or `ControlValueAccessor`), so the caller must update that instead.
     */
    public setValue(value: unknown): ValueWriteResult {
        const control = this.ngControl.control;
        if (!control?.setValue) {
            return 'ignored';
        }

        control.setValue(value);
        return 'accepted';
    }

    /**
     * Records that the field has rules. A `[formField]` switch reuses the same interop
     * `NgControl`, so an untouched, pristine control opens a new observation window.
     */
    private observeErrors(): void {
        this.sawErrors = this.touchedOrDirty && (this.sawErrors || this.invalid || this.pending);
    }

    // Signal-backed getters are reactive, so an effect over them replaces the missing observables.
    // A root effect runs before change detection, like an observable would; a view effect would
    // run after the host bindings were checked. `untracked` allows subscribing from within another
    // effect. `toObservable` is not used: it replays and lives until the environment is destroyed.
    private watch(read: () => unknown): Observable<void> {
        return new Observable<void>(subscriber => {
            const ref = untracked(() => effect(() => {
                read();
                untracked(() => subscriber.next());
            }, { injector: this.envInjector }));

            return () => ref.destroy();
        });
    }
}
