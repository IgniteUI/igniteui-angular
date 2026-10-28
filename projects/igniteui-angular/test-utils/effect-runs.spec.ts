import { ApplicationRef, Injector, NgZone, effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/** How many runs of an effect counted by `countEffectRuns` make the call before it stops. */
const MAX_CALLS = 3;

/**
 * Creates an effect that makes a call, lets the application settle and returns how many times
 * the effect ran. A call that reads state it then writes makes the effect run again; the effect
 * stops making the call after a few runs, so such a call fails the spec instead of hanging it.
 *
 * @param call The call the effect makes.
 * @param injector The injector the effect is created with: a component's injector gives a view
 * effect, and the default, the root injector, gives a root effect.
 * @param interaction A step made once the effect has settled, such as the user moving the focus or
 * picking an item. The runs it causes are counted too, so a call that only reads the state the step
 * changes also fails the spec.
 * @returns How many times the effect ran.
 *
 * @example
 * ```typescript
 * expect(await countEffectRuns(() => combo.select([1]))).toBe(1);
 * expect(await countEffectRuns(() => combo.open(), undefined, () => combo.dropdown.navigateNext())).toBe(1);
 * ```
 */
export async function countEffectRuns(call: () => void, injector: Injector = TestBed.inject(Injector),
    interaction?: () => unknown): Promise<number> {
    let runs = 0;
    const ref = effect(() => {
        if (++runs <= MAX_CALLS) {
            call();
        }
    }, { injector });
    await settle();
    if (interaction) {
        await interaction();
        await settle();
    }
    ref.destroy();
    return runs;
}

/** Ticks and waits until the application is stable. */
async function settle(): Promise<void> {
    // Ticks inside the zone, as the zone scheduler does: a tick started outside it lets code that
    // enters the zone during the tick start another one (NG0101). Without a zone this just ticks.
    TestBed.inject(NgZone).run(() => TestBed.tick());
    await TestBed.inject(ApplicationRef).whenStable();
}
