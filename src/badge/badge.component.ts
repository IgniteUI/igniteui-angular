import { CommonModule } from "@angular/common";
import { Component, ElementRef, Input, NgModule } from "@angular/core";
import { IgxIconModule } from "../icon/icon.component";

export enum Type { DEFAULT, INFO, SUCCESS, WARNING, ERROR }
export enum Position { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT }

@Component({
    selector: "igx-badge",
    templateUrl: "badge.component.html"
})
export class IgxBadge {
    public typeEnum = Type;
    public positionEnum = Position;
    private _type: string = "";
    private _value: string;
    private _iconBdg: string;
    private _position;

    @Input()
    get type(): string {
        return this._type === undefined ? "default" : this._type;
    }

    set type(value: string) {
        const sizeType = this.typeEnum[value.toUpperCase()];
        this._type = sizeType === undefined ? "default" : value.toLowerCase();
    }

    @Input()
    get position(): string {
        return this._position === undefined ? "top-right" : this._position;
    }

    set position(value: string) {
        const positionType = this.positionEnum[value.replace("-", "_").toUpperCase()];
        this._position = positionType === undefined ? "top-right" : value.toLowerCase();
    }

    @Input()
    get value(): string {
        return this._value === undefined ? "?" : this._value;
    }

    set value(value: string) {
        this._value = value === undefined ? "-" : value;
    }

    @Input("icon")
    public get iconBdg(): string {
        return this._iconBdg;
    }

    public set iconBdg(value: string) {
        this._iconBdg = value;
    }

    get roleDescription() {
        let message;

        // tslint:disable-next-line:prefer-conditional-expression
        if (this._iconBdg) {
            message = this._type + " type badge with icon type " + this._iconBdg;
        } else if (this._value) {
            message = this._type + " badge type with value " + this._value;
        } else {
            message = this._type + " badge type without value";
        }

        return message;
    }

    public setClasses() {
        let classes = {};

        switch (this.typeEnum[this._type.toUpperCase()]) {
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

    public setPosition() {
        let className = {};

        switch (this.positionEnum[this.position.replace("-", "_").toUpperCase()]) {
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
    exports: [IgxBadge],
    imports: [CommonModule, IgxIconModule]
})
export class IgxBadgeModule {
}
