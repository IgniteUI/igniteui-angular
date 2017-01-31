import { NgModule, Directive, Component, ElementRef, Renderer, OnInit, Input,
        Output, ViewChild, HostBinding
} from '@angular/core';
import { CommonModule } from "@angular/common";

export enum Type { DEFAULT, INFO, SUCCESS, WARNING, ERROR }
export enum Position { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT }

@Component({
    selector: 'igx-badge',
    moduleId: module.id,
    templateUrl: 'badge.component.html'
})
export class IgxBadge {
    private _type: string = "";
    private _value: string;
    private _iconBdg: string;
    private _position;
    public TypeEnum = Type;
    public PositionEnum = Position;

    @Input()
    get type(): string {
        return this._type === undefined ? "default" : this._type;
    }


    set type(value: string) {
        var sizeType = this.TypeEnum[value.toUpperCase()];

        if (sizeType === undefined) {
            this._type = "default";
        } else {
            this._type = value.toLowerCase();
        }
    }

    @Input()
    get position(): string {
        return this._position === undefined ? "top-right" : this._position;
    }


    set position(value: string) {
        var positionType = this.PositionEnum[value.replace("-","_").toUpperCase()];

        if (positionType === undefined) {
            this._position = "top-right";
        } else {
            this._position = value.toLowerCase();
        }
    }

    @Input()
    get value(): string {
        return this._value === undefined ? "?" : this._value;
    }


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

    get roleDescription() {
        var message;

        if (this._iconBdg){
            message = this._type + " type badge with icon type " + this._iconBdg;
        } else if (this._value) {
            message = this._type + " badge type with value " + this._value;
        } else {
            message = this._type + " badge type without value";
        }

        return message;
    }

    setClasses() {
        var classes = {};

        switch (this.TypeEnum[this._type.toUpperCase()]) {
            case Type.DEFAULT:
                classes = {
                    "igx-badge__circle--default": true
                };
                break;
            case Type.INFO:
                classes = {
                    "igx-badge__circle--info": true
                };
                break;
            case Type.SUCCESS:
                classes = {
                    "igx-badge__circle--success": true
                };
                break;
            case Type.WARNING:
                classes = {
                    "igx-badge__circle--warning": true
                };
                break;
            case Type.ERROR:
                classes = {
                    "igx-badge__circle--error": true
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
                    "igx-badge--bottom-left": true
                };
                break;
            case Position.BOTTOM_RIGHT:
                className = {
                    "igx-badge--bottom-right": true
                };
                break;
            case Position.TOP_LEFT:
                className = {
                    "igx-badge--top-left": true
                };
                break;
            case Position.TOP_RIGHT:
                className = {
                    "igx-badge--top-right": true
                };
                break;
        }

        return className;
    }
}

@NgModule({
    declarations: [IgxBadge],
    imports: [CommonModule],
    exports: [IgxBadge]
})
export class IgxBadgeModule {
}