import { Injectable, Optional } from '@angular/core';
import { PlatformUtil } from '../../../igniteui-angular/src/lib/core/utils';
import { IgxIconService } from '../../../igniteui-angular/src/lib/icon/icon.service';
import { IconMeta } from '../../../igniteui-angular/src/lib/icon/public_api';


export interface SvgIcon {
    svg: string;
    title?: string;
}

export type Collection<T, U> = Map<T, U>;

export enum ActionType {
    SyncState = 0,
    RegisterIcon = 1,
    UpdateIconReference = 2,
}

export interface BroadcastIconsChangeMessage {
    actionType: ActionType;
    collections?: Collection<string, Map<string, SvgIcon>>;
    references?: Collection<string, Map<string, IconMeta>>;
}

/** @hidden @internal **/
@Injectable()
export class IgxIconBroadcastService {
    private iconBroadcastChannel: BroadcastChannel | null;

    constructor(
        protected _iconService: IgxIconService,
        @Optional() private _platformUtil: PlatformUtil
    ) {
        if (this._platformUtil?.isBrowser) {
            this.create();

            globalThis.addEventListener('pageshow', () => this.create())
            globalThis.addEventListener('pagehide', () => this.dispose())
        }
    }

    public handleEvent({ data }: MessageEvent<BroadcastIconsChangeMessage>) {
        const { actionType, collections, references } = data;

        if (actionType === ActionType.SyncState || ActionType.RegisterIcon) {
            this.updateIconsFromCollection(collections);
        }

        if (actionType === ActionType.SyncState || ActionType.UpdateIconReference) {
            this.updateRefsFromCollection(references);
        }
    }

    private create() {
        if (!this.iconBroadcastChannel) {
            this.iconBroadcastChannel = new BroadcastChannel('ignite-ui-icon-channel');
            this.iconBroadcastChannel.addEventListener('message', this);

            // sync state
            this.iconBroadcastChannel.postMessage({
                actionType: ActionType.SyncState
            })
        }
    }

    private dispose() {
        if (this.iconBroadcastChannel) {
            this.iconBroadcastChannel.removeEventListener('message', this);
            this.iconBroadcastChannel.close();
            this.iconBroadcastChannel = null;
        }
    }

    private updateIconsFromCollection(collections: Collection<string, Map<string, SvgIcon>>) {
        if (!collections) return;
        const collectionKeys = collections.keys();
        for (const collectionKey of collectionKeys) {
            const collection = collections.get(collectionKey);
            for (const iconKey of collection.keys()) {
                const value = collection.get(iconKey).svg;
                this._iconService.addSvgIconFromText(iconKey, value, collectionKey);
            }
        }
    }

    private updateRefsFromCollection(collections: Collection<string, Map<string, any>>) {
        if (!collections) return;
        const collectionKeys = collections.keys();
        for (const collectionKey of collectionKeys) {
            const collection = collections.get(collectionKey);
            for (const iconKey of collection.keys()) {
                const collectionName = collection.get(iconKey).collection;
                const iconName = collection.get(iconKey).name;
                this._iconService.setIconRef(iconKey, 'default', {
                    family: collectionName,
                    name: iconName
                });
            }
        }
    }

}
