import { HostBinding, Input } from '@angular/core';
import { DisplayDensity } from './utils';

export abstract class IgxDensityEnabledComponent {
    private _displayDensity = DisplayDensity.comfortable;

    @HostBinding('attr.class')
    get hostClass(): string {
        switch (this._displayDensity) {
            case DisplayDensity.cosy:
                return this.hostClassPrefix + '--cosy';
            case DisplayDensity.compact:
                return this.hostClassPrefix + '--compact';
            default:
                return this.hostClassPrefix;
        }
    }

    protected abstract get hostClassPrefix(): string;

    @Input()
    public get displayDensity(): DisplayDensity | string {
        return this._displayDensity;
    }

    public set displayDensity(val: DisplayDensity | string) {
        switch (val) {
            case 'compact':
                this._displayDensity = DisplayDensity.compact;
                break;
            case 'cosy':
                this._displayDensity = DisplayDensity.cosy;
                break;
            case 'comfortable':
            default:
                this._displayDensity = DisplayDensity.comfortable;
        }
    }

    get defaultRowHeight(): number {
        switch (this._displayDensity) {
            case DisplayDensity.compact:
                return 32;
            case DisplayDensity.cosy:
                return 40;
            case DisplayDensity.comfortable:
            default:
                return 50;
        }
    }
}
