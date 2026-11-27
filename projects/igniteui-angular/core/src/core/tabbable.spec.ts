import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTabbableElements, isTabbable } from 'igniteui-angular/core';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxInputDirective, IgxInputGroupComponent } from 'igniteui-angular/input-group';
import { IgxRadioComponent } from 'igniteui-angular/radio';
import { IgxSwitchComponent } from 'igniteui-angular/switch';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Tabbable elements', () => {
    let fixture: ComponentFixture<TabbableHostComponent>;
    let host: HTMLElement;

    const byId = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
    /** The id of the component that renders each tabbable element, or of the element itself. */
    const ids = (elements: HTMLElement[]) =>
        elements.map((element) => (element.closest('igx-checkbox, igx-switch, igx-radio, igx-input-group') ?? element).id);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TabbableHostComponent] });
        fixture = TestBed.createComponent(TabbableHostComponent);
        fixture.detectChanges();
        host = fixture.nativeElement;
    });

    describe('getTabbableElements', () => {
        it('should return the controls of the Ignite UI components in document order', () => {
            expect(ids(getTabbableElements(byId('controls')))).toEqual([
                'button',
                'icon-button',
                'checkbox',
                'switch',
                'radio',
                'input'
            ]);
        });

        it('should return the native input of a checkbox, not its host', () => {
            const [input] = getTabbableElements(byId('checkbox-wrapper'));

            expect(input).toBeInstanceOf(HTMLInputElement);
            expect(input.closest('igx-checkbox')!.id).toBe('checkbox-only');
        });

        it('should leave out disabled, inert, hidden and negative tabindex controls', () => {
            expect(ids(getTabbableElements(byId('excluded')))).toEqual(['kept']);
        });

        it('should not return the root itself', () => {
            const root = byId('controls');
            root.tabIndex = 0;

            expect(getTabbableElements(root)).not.toContain(root);
        });
    });

    describe('isTabbable', () => {
        it('should follow an explicit tabindex', () => {
            expect(isTabbable(byId('tabindex-zero'))).toBe(true);
            expect(isTabbable(byId('tabindex-negative'))).toBe(false);
        });

        it('should take only the editing host of a contenteditable region', () => {
            expect(isTabbable(byId('editing-host'))).toBe(true);
            expect(isTabbable(byId('editable-child'))).toBe(false);
        });

        it('should leave out a hidden input', () => {
            expect(isTabbable(byId('hidden-input'))).toBe(false);
        });
    });
});

@Component({
    template: `
        <div id="controls">
            <button id="button" igxButton="flat">Text</button>
            <button id="icon-button" igxIconButton="flat">i</button>
            <igx-checkbox id="checkbox">Checkbox</igx-checkbox>
            <igx-switch id="switch">Switch</igx-switch>
            <igx-radio id="radio" name="choice" value="a">Radio</igx-radio>
            <igx-input-group id="input"><input igxInput /></igx-input-group>
            <span>Text</span>
        </div>

        <div id="checkbox-wrapper">
            <igx-checkbox id="checkbox-only">Only</igx-checkbox>
        </div>

        <div id="excluded">
            <igx-checkbox id="disabled" [disabled]="true">Disabled</igx-checkbox>
            <igx-checkbox id="inert" inert>Inert</igx-checkbox>
            <div aria-hidden="true"><button id="aria-hidden">Hidden</button></div>
            <button id="display-none" style="display: none">None</button>
            <igx-checkbox id="negative" [tabindex]="-1">Negative</igx-checkbox>
            <button id="kept">Kept</button>
        </div>

        <div id="tabindex-zero" tabindex="0"></div>
        <button id="tabindex-negative" tabindex="-1"></button>
        <div id="editing-host" contenteditable="true"><span id="editable-child" contenteditable="true"></span></div>
        <input id="hidden-input" type="hidden" />
    `,
    imports: [
        IgxButtonDirective,
        IgxIconButtonDirective,
        IgxCheckboxComponent,
        IgxSwitchComponent,
        IgxRadioComponent,
        IgxInputGroupComponent,
        IgxInputDirective
    ]
})
class TabbableHostComponent {}
