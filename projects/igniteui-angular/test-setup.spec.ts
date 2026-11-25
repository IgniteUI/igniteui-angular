import { TestBed } from '@angular/core/testing';
import { INPUT_DEBOUNCE_TIME, INPUT_DEBOUNCE_TIME_DEFAULT } from 'igniteui-angular/grids/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { SCROLL_THROTTLE_TIME_MULTIPLIER } from './grids/grid/src/grid-base.directive';

describe('Spec timing defaults (test-setup.ts)', () => {
    it('should provide no filter-row debounce and no scroll throttling', () => {
        expect(TestBed.inject(INPUT_DEBOUNCE_TIME)).toBe(0);
        expect(TestBed.inject(SCROLL_THROTTLE_TIME_MULTIPLIER)).toBe(0);
    });

    describe('with spec-level providers', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [{ provide: INPUT_DEBOUNCE_TIME, useValue: INPUT_DEBOUNCE_TIME_DEFAULT }]
            });
        });

        it('should let the spec override the defaults', () => {
            expect(TestBed.inject(INPUT_DEBOUNCE_TIME)).toBe(INPUT_DEBOUNCE_TIME_DEFAULT);
        });
    });
});
