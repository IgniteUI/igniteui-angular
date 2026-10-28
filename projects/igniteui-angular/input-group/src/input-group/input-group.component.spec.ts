import { Component, ViewChild, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxInputGroupComponent } from './input-group.component';
import { UIInteractions } from '../../../test-utils/ui-interactions.spec';
import { IgxHintDirective, IgxInputDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from '../public_api';
import { IgxCardComponent, IgxCardContentDirective } from 'igniteui-angular/card';
import { IGX_INPUT_GROUP_TYPE, IgxInputGroupType } from './inputGroupType';
import { InputResourceStringsEN, changei18n } from 'igniteui-angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const INPUT_GROUP_CSS_CLASS = 'igx-input-group';
const INPUT_GROUP_BOX_CSS_CLASS = 'igx-input-group--box';
const INPUT_GROUP_BORDER_CSS_CLASS = 'igx-input-group--border';
const INPUT_GROUP_SEARCH_CSS_CLASS = 'igx-input-group--search';

describe('IgxInputGroup', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                InputGroupComponent,
                InputGroupBoxComponent,
                InputGroupBorderComponent,
                InputGroupSearchComponent,
                InputGroupFileComponent,
                InputGroupDisabledComponent,
                InputGroupDisabledByDefaultComponent,
                InputGroupDisabledWithoutValueComponent,
                InputGroupNestedThemeScopeComponent,
                InputGroupFormRowComponent
            ]
        }).compileComponents();
    });

    it('Initializes an input group.', async () => {
        const fixture = TestBed.createComponent(InputGroupDisabledComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        await fixture.whenStable();
        fixture.detectChanges();
        // the default type should be box
        testInputGroupType('box', igxInputGroup, inputGroupElement);
    });

    it('Initializes an input group with type box.', async () => {
        const fixture = TestBed.createComponent(InputGroupBoxComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        await fixture.whenStable();
        fixture.detectChanges();
        testInputGroupType('box', igxInputGroup, inputGroupElement);
    });

    it('Initializes an input group with type border.', async () => {
        const fixture = TestBed.createComponent(InputGroupBorderComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        await fixture.whenStable();
        fixture.detectChanges();
        testInputGroupType('border', igxInputGroup, inputGroupElement);
    });

    it('Initializes an input group with type search.', async () => {
        const fixture = TestBed.createComponent(InputGroupSearchComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        await fixture.whenStable();
        fixture.detectChanges();
        testInputGroupType('search', igxInputGroup, inputGroupElement);
    });

    it('Initializes upload file button with type=\'button\'.', () => {
        const fixture = TestBed.createComponent(InputGroupFileComponent);
        fixture.detectChanges();

        const uploadFileButton = fixture.debugElement.query(By.css('button')).nativeElement;

        expect(uploadFileButton.getAttribute('type')).toEqual('button');
    });

    it('Should respect type Token and be able to change input group type programmatically.', async () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        await fixture.whenStable();
        fixture.detectChanges();

        // a Token is passed and can be obtained
        expect(fixture.componentInstance.IGTOKEN).toBe('box');

        // type set via Token is 'box'
        testInputGroupType('box', igxInputGroup, inputGroupElement);

        // user can override Token passing other igxInputGroup types
        igxInputGroup.type = 'border';
        fixture.detectChanges();
        testInputGroupType('border', igxInputGroup, inputGroupElement);

        igxInputGroup.type = 'box';
        fixture.detectChanges();
        testInputGroupType('box', igxInputGroup, inputGroupElement);

        igxInputGroup.type = 'search';
        fixture.detectChanges();
        testInputGroupType('search', igxInputGroup, inputGroupElement);

        igxInputGroup.type = 'line';
        fixture.detectChanges();
        testInputGroupType('line', igxInputGroup, inputGroupElement);

        // Set type as null, so the Token type should be used again
        igxInputGroup.type = null;
        fixture.detectChanges();
        testInputGroupType('box', igxInputGroup, inputGroupElement);
    });

    it('disabled input should properly detect changes.', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledComponent);
        fixture.detectChanges();

        const component = fixture.componentInstance;
        const igxInputGroup = component.igxInputGroup;
        expect(igxInputGroup.disabled).toBeFalsy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeTruthy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeFalsy();
    });

    it('disabled by default should properly work.', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledByDefaultComponent);
        fixture.detectChanges();

        const component = fixture.componentInstance;
        const igxInputGroup = component.igxInputGroup;
        expect(igxInputGroup.disabled).toBeTruthy();
    });

    it('should handle disabled attribute without value', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledWithoutValueComponent);
        fixture.detectChanges();

        const component = fixture.componentInstance;
        const igxInputGroup = component.igxInputGroup;
        expect(igxInputGroup.disabled).toBeTruthy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeFalsy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeTruthy();
    });

    it('should correctly prevent default on pointer down', () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const prefix = fixture.componentInstance.prefix;
        const input = fixture.componentInstance.igxInput;
        fixture.componentInstance.suppressInputAutofocus = false;

        const pointOnPrefix = UIInteractions.getPointFromElement(prefix.nativeElement);
        const pointerEvent = UIInteractions.createPointerEvent('pointerdown', pointOnPrefix);
        const preventDefaultSpy = vi.spyOn(pointerEvent, 'preventDefault');

        Object.defineProperty(pointerEvent, 'target', { value: input.nativeElement, configurable: true });
        const inputGroupDebugElement = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

        // input group is not focused we should not prevent default on pointer down
        inputGroupDebugElement.triggerEventHandler('pointerdown', pointerEvent);
        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalledTimes(0);

        Object.defineProperty(pointerEvent, 'target', { value: prefix.nativeElement, configurable: true });

        // input group is not focused we should not prevent default on pointer down
        inputGroupDebugElement.triggerEventHandler('pointerdown', pointerEvent);
        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalledTimes(0);

        // input group is focused we should prevent default on pointer down on prefix/suffix
        inputGroup.isFocused = true;
        inputGroupDebugElement.triggerEventHandler('pointerdown', pointerEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    });

    it('should not focus input on prefix/suffix click when group is not focused and suppressInputAutofocus=true', () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const prefix = fixture.componentInstance.prefix;
        const input = fixture.componentInstance.igxInput;

        const pointerEvent = UIInteractions.getMouseEvent('click');
        Object.defineProperty(pointerEvent, 'target', { value: prefix.nativeElement });
        const inputGroupDebugElement = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

        // input group is not focused and suppressInputAutofocus is true - click on prefix/suffix should not focus the input
        fixture.componentInstance.suppressInputAutofocus = true;
        inputGroup.isFocused = false;
        fixture.detectChanges();
        inputGroupDebugElement.triggerEventHandler('click', pointerEvent);
        expect(document.activeElement).not.toEqual(input.nativeElement);

        // input group is not focused and suppressInputAutofocus is false - click on prefix/suffix should focus the input
        fixture.componentInstance.suppressInputAutofocus = false;
        inputGroup.isFocused = false;
        fixture.detectChanges();
        inputGroupDebugElement.triggerEventHandler('click', pointerEvent);
        expect(document.activeElement).toEqual(input.nativeElement);

        // input group is focused and suppressInputAutofocus is true - click on prefix/suffix should focus the input
        fixture.componentInstance.suppressInputAutofocus = true;
        inputGroup.isFocused = true;
        fixture.detectChanges();
        inputGroupDebugElement.triggerEventHandler('click', pointerEvent);
        expect(document.activeElement).toEqual(input.nativeElement);
    });

    /**
     * Regression coverage for the `getComponentTheme` fix (was reading the dead `--theme`
     * custom property; now reads `--ig-theme`, matching what `themes/_scoping.scss` emits).
     * Verifies an input-group correctly reflects the CSS-scoped `--ig-theme` in effect at
     * its own DOM position rather than the app-wide/global theme.
     */
    it('reflects the CSS-scoped --ig-theme at its own DOM position, not the global theme', async () => {
        const fixture = TestBed.createComponent(InputGroupNestedThemeScopeComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.componentInstance.rootGroup.isTypeIndigo).toBe(false);
        expect(fixture.componentInstance.indigoGroup.isTypeIndigo).toBe(true);
        expect(fixture.componentInstance.materialGroup.isTypeIndigo).toBe(false);
    });

    describe('Resource Strings', () => {
        it('should return full resource strings when partial resourceStrings are set', () => {
            const fix = TestBed.createComponent(InputGroupComponent);
            fix.detectChanges();
            const inputGroup = fix.componentInstance.igxInputGroup;

            inputGroup.resourceStrings = { igx_input_upload_button: 'Upload' };
            fix.detectChanges();

            expect(inputGroup.resourceStrings.igx_input_upload_button).toBe('Upload');
            expect(inputGroup.resourceStrings.igx_input_file_placeholder).toBe('No file chosen');
        });

        it('should update non-overridden resource strings when global i18n changes', () => {
            const fix = TestBed.createComponent(InputGroupComponent);
            fix.detectChanges();
            const inputGroup = fix.componentInstance.igxInputGroup;

            inputGroup.resourceStrings = { igx_input_upload_button: 'Custom Browse' };
            fix.detectChanges();

            try {
                changei18n({ igx_input_file_placeholder: 'Keine Datei ausgewählt' });
                fix.detectChanges();

                expect(inputGroup.resourceStrings.igx_input_upload_button).toBe('Custom Browse');
                expect(inputGroup.resourceStrings.igx_input_file_placeholder).toBe('Keine Datei ausgewählt');
            } finally {
                changei18n(InputResourceStringsEN);
            }
        });
    });

    describe('IgxInputGroup label alignment in a stretched row (#17704)', () => {
        const labelTops = (fix) => fix.debugElement.queryAll(By.css('igx-input-group'))
            .map(({ nativeElement: g }) => Math.round(g.querySelector('label').getBoundingClientRect().top - g.getBoundingClientRect().top));

        for (const container of ['div', 'card'] as const) {
            it(`keeps the neighbour's label in place when a hint appears (${container} container)`, async () => {
                const fix = TestBed.createComponent(InputGroupFormRowComponent);
                fix.componentInstance.container = container;
                fix.detectChanges();
                await fix.whenStable();
                const [userBefore] = labelTops(fix);

                fix.componentInstance.showHint = true;
                fix.detectChanges();
                await fix.whenStable();
                const [userAfter, emailAfter] = labelTops(fix);

                expect(userAfter).toBe(userBefore);
                expect(userAfter).toBe(emailAfter);
            });
        }
    });
});

@Component({
    template: `
        <ng-template #fields>
            <igx-input-group>
                <label igxLabel>Username</label>
                <input igxInput value="john" />
            </igx-input-group>
            <igx-input-group>
                <label igxLabel>Email</label>
                <input igxInput value="not-an-email" />
                @if (showHint) {
                    <igx-hint>Please enter a valid email address</igx-hint>
                }
            </igx-input-group>
        </ng-template>
        @if (container === 'div') {
            <div class="form-row"><ng-container *ngTemplateOutlet="fields" /></div>
        } @else {
            <igx-card>
                <igx-card-content class="form-row"><ng-container *ngTemplateOutlet="fields" /></igx-card-content>
            </igx-card>
        }`,
    styles: `.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 600px; }`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputGroupComponent, IgxInputDirective, IgxLabelDirective, IgxHintDirective, IgxCardComponent, IgxCardContentDirective, NgTemplateOutlet]
})
class InputGroupFormRowComponent {
    public container: 'div' | 'card' = 'div';
    public showHint = false;
}

@Component({
    template: `<igx-input-group #rootGroup><input igxInput/></igx-input-group>
        <div style="--ig-theme: indigo">
            <igx-input-group #indigoGroup><input igxInput/></igx-input-group>
            <div style="--ig-theme: material">
                <igx-input-group #materialGroup><input igxInput/></igx-input-group>
            </div>
        </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputGroupComponent, IgxInputDirective]
})
class InputGroupNestedThemeScopeComponent {
    @ViewChild('rootGroup', { static: true }) public rootGroup: IgxInputGroupComponent;
    @ViewChild('indigoGroup', { static: true }) public indigoGroup: IgxInputGroupComponent;
    @ViewChild('materialGroup', { static: true }) public materialGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup [suppressInputAutofocus]="suppressInputAutofocus">
                    <igx-prefix>PREFIX</igx-prefix>
                    <igx-suffix>SUFFIX</igx-suffix>
                    <input #igxInput igxInput />
                </igx-input-group>`,
    providers: [{ provide: IGX_INPUT_GROUP_TYPE, useValue: 'box' }],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputGroupComponent, IgxInputDirective, IgxPrefixDirective, IgxSuffixDirective]
})
class InputGroupComponent {
    public IGTOKEN = inject<IgxInputGroupType>(IGX_INPUT_GROUP_TYPE);

    @ViewChild('igxInputGroup', { static: true })
    public igxInputGroup: IgxInputGroupComponent;
    @ViewChild('igxInput', { read: IgxInputDirective, static: true })
    public igxInput: IgxInputDirective;
    @ViewChild(IgxPrefixDirective, { read: ElementRef })
    public prefix: ElementRef;
    @ViewChild(IgxSuffixDirective, { read: ElementRef })
    public suffix: ElementRef;
    public suppressInputAutofocus = false;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="box">
                    <input igxInput />
                </igx-input-group>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputGroupComponent, IgxInputDirective]
})
class InputGroupBoxComponent {
    @ViewChild('igxInputGroup', { static: true })
    public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="border">
                    <input igxInput />
                </igx-input-group>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputGroupComponent, IgxInputDirective]
})
class InputGroupBorderComponent {
    @ViewChild('igxInputGroup', { static: true })
    public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="search">
                    <input igxInput />
                </igx-input-group>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputDirective, IgxInputGroupComponent]
})
class InputGroupSearchComponent {
    @ViewChild('igxInputGroup', { static: true })
    public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group>
                    <input igxInput type="file" multiple />
                </igx-input-group>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputGroupComponent, IgxInputDirective]
})
class InputGroupFileComponent {
}

const testInputGroupType = (type: IgxInputGroupType, component: IgxInputGroupComponent, nativeElement: HTMLInputElement) => {
    let isLine = false;
    let isBorder = false;
    let isBox = false;
    let isSearch = false;

    switch (type) {
        case 'line':
            isLine = true;
            break;
        case 'border':
            isBorder = true;
            break;
        case 'box':
            isBox = true;
            break;
        case 'search':
            isSearch = true;
            break;
        default: break;
    }

    expect(nativeElement.classList.contains(INPUT_GROUP_BOX_CSS_CLASS)).toBe(isBox);
    expect(nativeElement.classList.contains(INPUT_GROUP_BORDER_CSS_CLASS)).toBe(isBorder);
    expect(nativeElement.classList.contains(INPUT_GROUP_SEARCH_CSS_CLASS)).toBe(isSearch);

    expect(component.isTypeLine).toBe(isLine);
    expect(component.isTypeBorder).toBe(isBorder);
    expect(component.isTypeBox).toBe(isBox);
    expect(component.isTypeSearch).toBe(isSearch);
};

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <input igxInput [disabled]="disabled"/>
                </igx-input-group>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputGroupComponent, IgxInputDirective]
})
class InputGroupDisabledComponent {
    @ViewChild('igxInputGroup', { static: true })
    public igxInputGroup: IgxInputGroupComponent;

    public disabled = false;

    public changeDisableState() {
        this.disabled = !this.disabled;
    }
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <input igxInput disabled/>
                </igx-input-group>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputGroupComponent, IgxInputDirective]
})
class InputGroupDisabledWithoutValueComponent {
    @ViewChild('igxInputGroup')
    public igxInputGroup: IgxInputGroupComponent;

    @ViewChild(IgxInputDirective)
    public inputDir: IgxInputDirective;

    public changeDisableState() {
        this.inputDir.disabled = !this.inputDir.disabled;
    }
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <input igxInput [disabled]="disabled"/>
                </igx-input-group>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxInputGroupComponent, IgxInputDirective]
})
class InputGroupDisabledByDefaultComponent {
    @ViewChild('igxInputGroup', { static: true })
    public igxInputGroup: IgxInputGroupComponent;

    public disabled = true;
}
