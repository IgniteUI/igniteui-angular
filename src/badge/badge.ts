import {
    NgModule,
    Directive,
    Component,
    ElementRef,
    Renderer,
    OnInit,
    Input,
    Output,
    ViewChild,
    HostBinding
} from '@angular/core';
import { CommonModule } from "@angular/common";

export enum Type { DEFAULT, INFO, SUCCESS, WARNING, ERROR }
export enum Position { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT }

@Component({
    selector: 'ig-badge',
    moduleId: module.id,
    templateUrl: 'badge.html'
})
export class Badge {
    private _type: string = "";
    private _value: string;
    private _iconBdg: string;
    private _position;
    public TypeEnum = Type;
    public PositionEnum = Position;

    get type(): string {
        return this._type === undefined ? "default" : this._type;
    }

    @Input("type")
    set type(value: string) {
        var sizeType = this.TypeEnum[value.toUpperCase()];

        if (sizeType === undefined) {
            this._type = "default";
        } else {
            this._type = value.toLowerCase();
        }
    }

    get position(): string {
        return this._position === undefined ? "bottom-right" : this._position;
    }

    @Input("position")
    set position(value: string) {
        var positionType = this.PositionEnum[value.replace("-","_").toUpperCase()];

        if (positionType === undefined) {
            this._position = "bottom-right";
        } else {
            this._position = value.toLowerCase();
        }
    }

    get value(): string {
        return this._value === undefined ? "?" : this._value;
    }

    @Input("value")
    set value(value: string) {
        if (value === undefined) {
            this._value = "-";
        } else {
            this._value = value;
        }
    }

    @Input("icon")
    public get iconBdg(): string {
        return this._iconBdg;
    }

    public set iconBdg(value: string) {
        this._iconBdg = value;
    }

    setClasses() {
        var classes = {};

        switch (this.TypeEnum[this._type.toUpperCase()]) {
            case Type.DEFAULT:
                classes = {
                    "ig-badge__circle--default": true
                };
                break;
            case Type.INFO:
                classes = {
                    "ig-badge__circle--info": true
                };
                break;
            case Type.SUCCESS:
                classes = {
                    "ig-badge__circle--success": true
                };
                break;
            case Type.WARNING:
                classes = {
                    "ig-badge__circle--warning": true
                };
                break;
            case Type.ERROR:
                classes = {
                    "ig-badge__circle--error": true
                };
                break;
        }

        return classes;
    }

    setPosition() {
        var className = {};

        switch (this.PositionEnum[this.position.replace("-","_").toUpperCase()]) {
            case Position.BOTTOM_LEFT:
                className = {
                    "ig-badge__position--bottom-left": true
                };
                break;
            case Position.BOTTOM_RIGHT:
                className = {
                    "ig-badge__position--bottom-right": true
                };
                break;
            case Position.TOP_LEFT:
                className = {
                    "ig-badge__position--top-left": true
                };
                break;
            case Position.TOP_RIGHT:
                className = {
                    "ig-badge__position--top-right": true
                };
                break;
        }

        return className;
    }
}

@NgModule({
    declarations: [Badge],
    imports: [CommonModule],
    exports: [Badge]
})
export class BadgeModule {
}