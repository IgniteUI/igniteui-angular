import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionType, BroadcastIconsChangeMessage, IgxIconBroadcastService, SvgIcon, } from './icon.broadcast.service';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { IconMeta, IgxIconService } from 'igniteui-angular';
import { wait } from 'igniteui-angular/test-utils/ui-interactions.spec';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Icon broadcast service', () => {
    let fixture: ComponentFixture<BroadcastServiceComponent>;
    let broadcastChannel: BroadcastChannel;
    let events: BroadcastIconsChangeMessage[] = [];
    const buildIcon =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [],
            providers: [IgxIconBroadcastService]
        })
            .compileComponents();
    });

    beforeEach(() => {
        broadcastChannel = new BroadcastChannel("ignite-ui-icon-channel");
        broadcastChannel.onmessage = (e: MessageEvent<BroadcastIconsChangeMessage>) => {
            events.push(e.data);
        }
        fixture = TestBed.createComponent(BroadcastServiceComponent);
    });

    afterEach(() => {
        events = [];
        broadcastChannel.close();
    });

    describe('Broadcast Events', () => {
        it('should correctly process event of icons registering on channel.', async () => {
            // simulate a new icon being registered on channel
            const icons: Map<string, Map<string, SvgIcon>> = new Map();
            const icon: Map<string, SvgIcon> = new Map();
            icon.set("customIcon", { svg: buildIcon });
            icons.set("customCollection", icon);
            const message: BroadcastIconsChangeMessage = {
                actionType: ActionType.RegisterIcon,
                collections: icons
            };
            broadcastChannel.postMessage(message);
            fixture.detectChanges();
            await wait(50);
            fixture.detectChanges();
            const iconService = fixture.componentInstance.iconService;
            const svg = iconService.getSvgIcon("customIcon", "customCollection");
            expect(svg).not.toBeUndefined();
        });

        it('should correctly process event of setting an icon reference on channel.', async () => {
            const refs: Map<string, Map<string, IconMeta>> = new Map();
            const ref: Map<string, IconMeta> = new Map();
            ref.set("customIcon", { name: "customNameOfIcon", collection: "customCollection" } as any);
            refs.set("customCollection", ref);
            const message: BroadcastIconsChangeMessage = {
                actionType: ActionType.UpdateIconReference,
                references: refs
            };
            broadcastChannel.postMessage(message);
            fixture.detectChanges();
            await wait(50);
            fixture.detectChanges();

            const iconService = fixture.componentInstance.iconService;
            const serviceRef = iconService.getIconRef("customIcon", "default");
            expect(serviceRef.family).toBe("customCollection");
            expect(serviceRef.name).toBe("customNameOfIcon");
        });

        it('should send a request to sync state from any peer already on the channel on init.', async () => {
            await wait(50);
            expect(events.length).toBe(1);
            expect(events[0].actionType).toBe(ActionType.SyncState);
        });

        it('should correctly process event of synching full state of icons on channel.', async () => {
            const icons: Map<string, Map<string, SvgIcon>> = new Map();
            const icon: Map<string, SvgIcon> = new Map()
            icon.set("customIcon", { svg: buildIcon });
            icons.set("customCollection", icon);
            const refs: Map<string, Map<string, IconMeta>> = new Map();
            const ref: Map<string, IconMeta> = new Map()
            ref.set("customIcon", { name: "customIcon", family: "customCollection" });
            refs.set("customCollection", ref);
            const message: BroadcastIconsChangeMessage = {
                actionType: ActionType.SyncState,
                collections: icons,
                references: refs
            };
            broadcastChannel.postMessage(message);
            await wait(50);
            const iconService = fixture.componentInstance.iconService;
            const svg = iconService.getSvgIcon("customIcon", "customCollection");
            expect(svg).not.toBeUndefined();
            const serviceRef = iconService.getIconRef("customIcon", "customCollection");
            expect(serviceRef.family).toBe("customCollection");
            expect(serviceRef.name).toBe("customIcon");
        });

        it('should ignore messages without collections or references.', async () => {
            const iconService = fixture.componentInstance.iconService;
            const addSvgSpy = vi.spyOn(iconService, 'addSvgIconFromText');
            const setRefSpy = vi.spyOn(iconService, 'setIconRef');

            broadcastChannel.postMessage({ actionType: ActionType.SyncState });
            await wait(50);

            expect(addSvgSpy).not.toHaveBeenCalled();
            expect(setRefSpy).not.toHaveBeenCalled();
        });
    });

    describe('Page lifecycle', () => {
        it('should close the channel on pagehide and re-create it on pageshow.', async () => {
            const iconService = fixture.componentInstance.iconService;
            await wait(50);
            expect(events.length).toBe(1);

            globalThis.dispatchEvent(new Event('pagehide'));
            const icon: Map<string, SvgIcon> = new Map([["hiddenIcon", { svg: buildIcon }]]);
            broadcastChannel.postMessage({
                actionType: ActionType.RegisterIcon,
                collections: new Map([["hiddenCollection", icon]])
            });
            await wait(50);
            expect(iconService.getSvgIcon("hiddenIcon", "hiddenCollection")).toBeUndefined();

            // hiding again with an already closed channel is a no-op
            expect(() => globalThis.dispatchEvent(new Event('pagehide'))).not.toThrow();

            globalThis.dispatchEvent(new Event('pageshow'));
            await wait(50);
            // re-created channel requests state sync again
            // (services from previous tests listen to the global page events as well)
            expect(events.length).toBeGreaterThan(1);
            expect(events.every(e => e.actionType === ActionType.SyncState)).toBe(true);

            broadcastChannel.postMessage({
                actionType: ActionType.RegisterIcon,
                collections: new Map([["shownCollection", icon]])
            });
            await wait(50);
            expect(iconService.getSvgIcon("hiddenIcon", "shownCollection")).not.toBeUndefined();
        });
    });
});

@Component({
    template: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [IgxIconBroadcastService, IgxIconService]
})
export class BroadcastServiceComponent {
    public iconBroadcast = inject(IgxIconBroadcastService);
    public iconService = inject(IgxIconService);
}
