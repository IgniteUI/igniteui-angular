import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseProgressDirective } from './progressbar.component';

@Component({
    template: '',
})
class TestProgressComponent extends BaseProgressDirective {
    // Expose the protected property for testing
    public get exposedHasFraction(): boolean {
        return this.hasFraction;
    }
}

describe('BaseProgressDirective', () => {
    let fixture: ComponentFixture<TestProgressComponent>;
    let baseDirective: TestProgressComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestProgressComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestProgressComponent);
        baseDirective = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize with default values', () => {
        expect(baseDirective.indeterminate).toBe(false);
        expect(baseDirective.animationDuration).toBe(2000);
        expect(baseDirective.max).toBe(100);
        expect(baseDirective.value).toBe(0);
        expect(baseDirective.animate).toBe(true);
    });

    it('should correctly update the value within range', () => {
        baseDirective.value = 50;
        expect(baseDirective.value).toBe(50);

        // Value below range is not allowed
        baseDirective.value = -10;
        expect(baseDirective.value).toBe(0);

        // Value above range is not allowed
        baseDirective.value = 150;
        expect(baseDirective.value).toBe(100);
    });

    it('should not update value if indeterminate is true', () => {
        baseDirective.indeterminate = true;
        baseDirective.value = 50;
        expect(baseDirective.value).toBe(0);
    });

    it('should correctly calculate value in percentage', () => {
        baseDirective.value = 50;
        expect(baseDirective.valueInPercent).toBe(50);

        baseDirective.value = 25;
        baseDirective.max = 200;
        expect(baseDirective.valueInPercent).toBe(12.5);
    });

    it('should not exceed maximum or minimum value when max is updated', () => {
        baseDirective.value = 80;

        baseDirective.max = 50; // Reduce max below value
        expect(baseDirective.value).toBe(50);

        baseDirective.max = 200; // Increase max
        expect(baseDirective.value).toBe(50);
    });

    it('should correctly calculate step based on max', () => {
        expect(baseDirective.step).toBe(1); // Default step is 1% of max (100)

        baseDirective.max = 200;
        expect(baseDirective.step).toBe(2); // 1% of 200

        baseDirective.step = 10; // Custom step
        expect(baseDirective.step).toBe(10);
    });

    it('should correctly toggle animation', () => {
        baseDirective.animate = false;
        expect(baseDirective.animate).toBe(false);

        baseDirective.animate = true;
        expect(baseDirective.animate).toBe(true);
    });

    it('should correctly update host styles', () => {
        baseDirective.value = 50;
        fixture.detectChanges();

        const styles = baseDirective.hostStyles;
        expect(styles['--_progress-integer']).toBe('50');
        expect(styles['--_progress-fraction']).toBe('0');
        expect(styles['--_progress-whole']).toBe('50.00');
        expect(styles['--_transition-duration']).toBe('2000ms');
    });

    it('should correctly calculate fraction and integer values for progress', () => {
        baseDirective.value = 75.25;
        fixture.detectChanges();

        expect(baseDirective.valueInPercent).toBe(75.25);
        expect(baseDirective.exposedHasFraction).toBe(true);

        baseDirective.value = 50;
        fixture.detectChanges();

        expect(baseDirective.exposedHasFraction).toBe(false);
    });

    it('should trigger progressChanged event when value changes', () => {
        spyOn(baseDirective.progressChanged, 'emit');

        baseDirective.value = 30;
        expect(baseDirective.progressChanged.emit).toHaveBeenCalledWith({
            previousValue: 0,
            currentValue: 30,
        });

        baseDirective.value = 50;
        expect(baseDirective.progressChanged.emit).toHaveBeenCalledWith({
            previousValue: 30,
            currentValue: 50,
        });
    });

    it('should not trigger progressChanged event when value remains the same', () => {
        spyOn(baseDirective.progressChanged, 'emit');

        baseDirective.value = 0; // Default value is already 0
        expect(baseDirective.progressChanged.emit).not.toHaveBeenCalled();
    });

    it('should not trigger progressChanged event when indeterminate is true', () => {
        spyOn(baseDirective.progressChanged, 'emit');

        baseDirective.indeterminate = true;
        baseDirective.value = 30; // Attempting to change value
        expect(baseDirective.progressChanged.emit).not.toHaveBeenCalled();
    });

    it('should trigger progressChanged event after max is updated and value is adjusted', () => {
        spyOn(baseDirective.progressChanged, 'emit');

        baseDirective.value = 80;
        baseDirective.max = 50; // Value will be adjusted to 50
        expect(baseDirective.progressChanged.emit).toHaveBeenCalledWith({
            previousValue: 80,
            currentValue: 50,
        });
    });
});
