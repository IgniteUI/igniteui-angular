import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { isFromArrowKeyControl, usesArrowKeys } from 'igniteui-angular/core';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IgxButtonDirective } from 'igniteui-angular/directives';
import { IgxInputDirective, IgxInputGroupComponent } from 'igniteui-angular/input-group';
import { IgxRadioComponent } from 'igniteui-angular/radio';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
import { IgxSliderComponent } from 'igniteui-angular/slider';
import { IgxSwitchComponent } from 'igniteui-angular/switch';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Arrow key controls', () => {
    let fixture: ComponentFixture<ArrowKeyControlsHostComponent>;
    let host: HTMLElement;

    const byId = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
    /** The element that takes the focus in the component with `id`, or the element itself. */
    const focusable = (id: string) =>
        byId(id).querySelector<HTMLElement>('input, [role="slider"]') ?? byId(id);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [NoopAnimationsModule, ArrowKeyControlsHostComponent] });
        fixture = TestBed.createComponent(ArrowKeyControlsHostComponent);
        fixture.detectChanges();
        host = fixture.nativeElement;
    });

    describe('usesArrowKeys', () => {
        it('should be true for the Ignite UI controls that use the arrow keys', () => {
            for (const id of ['input-group', 'combo', 'select', 'slider', 'radio']) {
                expect(usesArrowKeys(focusable(id)), id).toBe(true);
            }
        });

        it('should be false for the Ignite UI controls that do not use the arrow keys', () => {
            for (const id of ['checkbox', 'switch', 'button']) {
                expect(usesArrowKeys(focusable(id)), id).toBe(false);
            }
        });

        it('should be true for text-like inputs, textarea, select and editable content', () => {
            for (const type of ['text', 'search', 'email', 'url', 'tel', 'password', 'number', 'date', 'time', 'range']) {
                const input = document.createElement('input');
                input.type = type;
                expect(usesArrowKeys(input), type).toBe(true);
            }
            expect(usesArrowKeys(document.createElement('textarea'))).toBe(true);
            expect(usesArrowKeys(document.createElement('select'))).toBe(true);
            expect(usesArrowKeys(byId('editable'))).toBe(true);
        });

        it('should be false for inputs that do not use the arrow keys', () => {
            for (const type of ['checkbox', 'button', 'submit', 'reset', 'file', 'color', 'hidden']) {
                const input = document.createElement('input');
                input.type = type;
                expect(usesArrowKeys(input), type).toBe(false);
            }
        });

        it('should be true for the roles of widgets that use the arrow keys, by their first role', () => {
            const element = document.createElement('div');
            const roles = ['textbox', 'searchbox', 'combobox', 'slider', 'spinbutton', 'listbox', 'radiogroup',
                'radio', 'menu', 'menubar', 'tablist', 'toolbar', 'tree', 'treegrid', 'grid'];

            for (const role of roles) {
                element.setAttribute('role', role);
                expect(usesArrowKeys(element), role).toBe(true);
            }

            element.setAttribute('role', 'button slider');
            expect(usesArrowKeys(element)).toBe(false);
            element.setAttribute('role', 'option');
            expect(usesArrowKeys(element)).toBe(false);
        });
    });

    describe('isFromArrowKeyControl', () => {
        /** Presses ArrowDown on `target` and checks the event in a listener on the scope, during the dispatch. */
        const fromArrowKeyControl = (target: Element) => {
            const scope = byId('scope');
            let result: boolean | undefined;
            scope.addEventListener('keydown', (event) => (result = isFromArrowKeyControl(event, scope)), { once: true });
            target.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'ArrowDown', bubbles: true, cancelable: true, composed: true
            }));
            return result;
        };

        it('should be true for a key from a control that uses the arrow keys', () => {
            expect(fromArrowKeyControl(byId('scoped-input'))).toBe(true);
        });

        it('should be true for a key from inside a widget that uses the arrow keys', () => {
            expect(fromArrowKeyControl(byId('in-listbox'))).toBe(true);
        });

        it('should skip the elements that the caller ignores', () => {
            const scope = byId('scope');
            const listbox = byId('in-listbox').closest('[role="listbox"]')!;
            let result: boolean | undefined;
            scope.addEventListener('keydown', (event) => (result = isFromArrowKeyControl(event, scope, (element) => element === listbox)), { once: true });
            byId('in-listbox').dispatchEvent(new KeyboardEvent('keydown', {
                key: 'ArrowDown', bubbles: true, cancelable: true, composed: true
            }));

            expect(result).toBe(false);
        });

        it('should be false for a key from an element that does not use them', () => {
            expect(fromArrowKeyControl(byId('scoped-button'))).toBe(false);
        });

        it('should not look past the scope, nor at the scope itself', () => {
            const scope = byId('scope');

            // The scope is inside an element with the grid role.
            expect(byId('outer-grid').contains(scope)).toBe(true);
            expect(fromArrowKeyControl(byId('scoped-button'))).toBe(false);

            scope.setAttribute('role', 'listbox');
            expect(fromArrowKeyControl(scope)).toBe(false);
        });

        it('should find a control in a shadow root', () => {
            const shadowHost = byId('shadow-host');
            const shadow = shadowHost.attachShadow({ mode: 'open' });
            shadow.innerHTML = '<input />';

            expect(fromArrowKeyControl(shadow.querySelector('input')!)).toBe(true);
        });
    });
});

@Component({
    template: `
        <igx-input-group id="input-group"><input igxInput /></igx-input-group>
        <igx-combo id="combo" [data]="[]"></igx-combo>
        <igx-select id="select"><igx-select-item value="a">A</igx-select-item></igx-select>
        <igx-slider id="slider"></igx-slider>
        <igx-radio id="radio" name="choice" value="a">Radio</igx-radio>
        <igx-checkbox id="checkbox">Checkbox</igx-checkbox>
        <igx-switch id="switch">Switch</igx-switch>
        <button id="button" igxButton>Button</button>
        <div id="editable" contenteditable="true"></div>

        <div id="outer-grid" role="grid">
            <div id="scope">
                <input id="scoped-input" />
                <button id="scoped-button">Button</button>
                <div role="listbox"><div id="in-listbox" tabindex="-1"></div></div>
                <div id="shadow-host"></div>
            </div>
        </div>
    `,
    imports: [
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxComboComponent,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxSliderComponent,
        IgxRadioComponent,
        IgxCheckboxComponent,
        IgxSwitchComponent,
        IgxButtonDirective
    ]
})
class ArrowKeyControlsHostComponent {}
