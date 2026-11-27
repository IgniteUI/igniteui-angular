import { Component, Directive, PLATFORM_ID, inject, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IgxSingleTabStopService } from 'igniteui-angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

describe('IgxSingleTabStopService', () => {
    let fixture: ComponentFixture<SingleTabStopHostComponent>;
    let host: HTMLElement;

    const byId = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
    const focusedId = () => (document.activeElement as HTMLElement | null)?.id;
    const tab = () => userEvent.keyboard('{Tab}');
    const shiftTab = () => userEvent.keyboard('{Shift>}{Tab}{/Shift}');

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SingleTabStopHostComponent] });
        fixture = TestBed.createComponent(SingleTabStopHostComponent);
        fixture.detectChanges();
        host = fixture.nativeElement;
        document.body.append(host);
    });

    afterEach(() => {
        host.remove();
    });

    describe('Entering', () => {
        it('should move the focus to the tab stop when Tab enters from before', async () => {
            byId('before').focus();

            await tab();

            expect(focusedId()).toBe('row-1');
        });

        it('should move the focus to the tab stop when Shift+Tab enters from after', async () => {
            byId('after').focus();

            await shiftTab();

            expect(focusedId()).toBe('row-1');
        });

        it('should keep the focus where Tab lands without a tab stop', async () => {
            fixture.componentInstance.tabStopId.set(null);
            fixture.detectChanges();
            byId('before').focus();

            await tab();

            expect(focusedId()).toBe('action-0');
        });

        it('should keep the focus on a control that is clicked', async () => {
            await userEvent.click(byId('action-0'));

            expect(focusedId()).toBe('action-0');
        });

        it('should keep the focus on a control that the app focuses', () => {
            byId('before').focus();

            byId('action-2').focus();

            expect(focusedId()).toBe('action-2');
        });
    });

    describe('Leaving', () => {
        it('should leave forward with Tab from the tab stop', async () => {
            byId('row-1').focus();

            await tab();

            expect(focusedId()).toBe('after');
        });

        it('should leave forward with Tab from a control', async () => {
            byId('action-0').focus();

            await tab();

            expect(focusedId()).toBe('after');
        });

        it('should leave forward with Tab from an input', async () => {
            byId('input-1').focus();

            await tab();

            expect(focusedId()).toBe('after');
        });

        it('should leave backward with Shift+Tab from the tab stop', async () => {
            byId('row-1').focus();

            await shiftTab();

            expect(focusedId()).toBe('before');
        });

        it('should leave backward with Shift+Tab from a control', async () => {
            byId('action-2').focus();

            await shiftTab();

            expect(focusedId()).toBe('before');
        });

        it('should leave a Tab that an inner element handled', async () => {
            const field = byId('input-1');
            field.addEventListener('keydown', (event) => event.key === 'Tab' && event.preventDefault());
            field.focus();

            await tab();

            expect(focusedId()).toBe('input-1');
        });
    });

    describe('Host as the tab stop', () => {
        beforeEach(() => {
            fixture.componentInstance.tabStopId.set('composite');
            fixture.detectChanges();
            byId('composite').tabIndex = 0;
        });

        it('should enter on the host from both sides', async () => {
            byId('before').focus();
            await tab();
            expect(focusedId()).toBe('composite');

            byId('after').focus();
            await shiftTab();
            expect(focusedId()).toBe('composite');
        });

        it('should leave from the host in both directions', async () => {
            byId('composite').focus();
            await tab();
            expect(focusedId()).toBe('after');

            byId('composite').focus();
            await shiftTab();
            expect(focusedId()).toBe('before');
        });

        it('should leave backward past the host with Shift+Tab from a control', async () => {
            byId('action-1').focus();

            await shiftTab();

            expect(focusedId()).toBe('before');
        });
    });

    it('should report that it is leaving while it moves the focus on its way out', async () => {
        const service = fixture.debugElement.query((node) => node.nativeElement.id === 'composite')
            .injector.get(IgxSingleTabStopService);
        const seen: boolean[] = [];
        byId('composite').addEventListener('focusin', () => seen.push(service.leaving));
        byId('action-1').focus();

        await shiftTab();

        expect(seen).toEqual([false, true]);
        expect(service.leaving).toBe(false);
    });

    it('should leave the Tab key to the browser while when returns false', async () => {
        fixture.componentInstance.enabled.set(false);
        fixture.detectChanges();

        byId('row-1').focus();
        await tab();
        expect(focusedId()).toBe('action-1');

        byId('before').focus();
        await tab();
        expect(focusedId()).toBe('action-0');
    });

    it('should throw when configure is called a second time', () => {
        const service = fixture.debugElement.query((node) => node.nativeElement.id === 'composite')
            .injector.get(IgxSingleTabStopService);

        expect(() => service.configure({ tabStop: () => null })).toThrow(/configure\(\) was already called/);
    });

    describe('Server platform', () => {
        it('should not add listeners outside the browser', () => {
            TestBed.resetTestingModule();
            const addListener = vi.spyOn(document, 'addEventListener');
            TestBed.configureTestingModule({
                imports: [SingleTabStopHostComponent],
                providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
            });

            TestBed.createComponent(SingleTabStopHostComponent).detectChanges();

            expect(addListener).not.toHaveBeenCalledWith('keydown', expect.anything(), expect.anything());
            addListener.mockRestore();
        });
    });
});

@Directive({
    selector: '[igxTestSingleTabStop]',
    providers: [IgxSingleTabStopService]
})
class SingleTabStopDirective {
    public readonly tabStopId = input<string | null>(null);
    public readonly enabled = input(true);

    constructor() {
        const host = inject(IgxSingleTabStopService);
        host.configure({
            when: () => this.enabled(),
            tabStop: () => {
                const id = this.tabStopId();
                return id ? document.getElementById(id) : null;
            }
        });
    }
}

@Component({
    template: `
        <button id="before">Before</button>
        <div id="composite" igxTestSingleTabStop [tabStopId]="tabStopId()" [enabled]="enabled()">
            <div id="row-0" tabindex="-1"><button id="action-0">Action 0</button></div>
            <div id="row-1" tabindex="0"><button id="action-1">Action 1</button><input id="input-1" /></div>
            <div id="row-2" tabindex="-1"><button id="action-2">Action 2</button></div>
        </div>
        <button id="after">After</button>
    `,
    imports: [SingleTabStopDirective]
})
class SingleTabStopHostComponent {
    public readonly tabStopId = signal<string | null>('row-1');
    public readonly enabled = signal(true);
}
