import { effect, EnvironmentInjector, Injector, untracked } from '@angular/core';
import { AbstractControl, NgControl, TouchedChangeEvent, Validators } from '@angular/forms';
import { filter, Observable } from 'rxjs';

/** Source of the state behind an `NgControl`. */
export type NgControlBackend = 'observable' | 'signal';

/** Whether a control took a value written through `setValue`. */
export type ValueWriteResult = 'accepted' | 'ignored';

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

    public get touchedOrDirty(): boolean {
        const control = this.ngControl.control;
        return !!(control?.touched || control?.dirty);
    }

    /** Signal Forms expose no validator list, only `required` and the current errors. */
    public get hasValidators(): boolean {
        if (this.backend === 'signal') {
            return this.required || this.invalid;
        }

        const control = this.ngControl.control;
        return !!(control?.validator || control?.asyncValidator);
    }

    public get required(): boolean {
        if (this.backend === 'signal') {
            return !!this.ngControl.control?.hasValidator(Validators.required);
        }

        const validator = this.ngControl.control?.validator;
        if (!validator) {
            return false;
        }

        // Probe with an empty control so `required` is detected regardless of the current value.
        return !!validator({} as AbstractControl)?.required;
    }

    /**
     * Emits when validity, disabled, dirty or pending state changes.
     * Signal Forms `submit()` only marks fields touched, so touched changes count too
     * or the errors would never surface.
     */
    public get statusChanges(): Observable<unknown> {
        if (this.backend === 'signal') {
            return this.watch(() => [
                this.ngControl.valid, this.ngControl.invalid, this.ngControl.pending,
                this.ngControl.disabled, this.ngControl.dirty, this.ngControl.touched
            ]);
        }

        return this.ngControl.statusChanges!;
    }

    public get touchedChanges(): Observable<unknown> {
        if (this.backend === 'signal') {
            return this.watch(() => [this.ngControl.touched]);
        }

        return this.ngControl.control!.events.pipe(filter(e => e instanceof TouchedChangeEvent));
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

    // Signal-backed getters are reactive, so an effect over them replaces the missing observables.
    // A root effect runs before change detection, like an observable would; a view effect would
    // run after the host bindings were checked. `untracked` allows subscribing from within another
    // effect. `toObservable` is not used: it replays and lives until the environment is destroyed.
    private watch(read: () => unknown[]): Observable<void> {
        return new Observable<void>(subscriber => {
            const ref = untracked(() => effect(() => {
                read();
                untracked(() => subscriber.next());
            }, { injector: this.envInjector }));

            return () => ref.destroy();
        });
    }
}
