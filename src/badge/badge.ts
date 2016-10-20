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

@Component({
    selector: 'ig-badge',
    moduleId: module.id,
    templateUrl: 'badge.html'
})
export class Badge {
    private _type: string = "";
    private _value: string;
    private _iconBdg: string;
    public TypeEnum = Type;

    get type() : string{
        return this._type === undefined ? "default" : this._type;
    }

    @Input("type")
    set type(value: string){
        var sizeType = this.TypeEnum[value.toUpperCase()];

        if(sizeType === undefined){
            this._type = "default";
        } else {
            this._type = value.toLowerCase();
        }
    }

    get value() : string{
        return this._value === undefined ? "-" : this._value;
    }

    @Input("value")
    set value(value: string){
        if(value === undefined){
            this._value = "-";
        } else {
            this._value = value;
        }
    }

    @Input("iconBdg")
    public get iconBdg(): string {
        return this._iconBdg;
    }

    public set iconBdg(value: string) {
        this._iconBdg = value;
    }

    setClasses() {
        var classes = {};

        switch(this.TypeEnum[this._type.toUpperCase()]){
            case Type.DEFAULT:
                classes =  {
                    "ig-badge--default": true
                };
                break;
            case Type.INFO:
                classes =  {
                    "ig-badge--info": true
                };
                break;
            case Type.SUCCESS:
                classes =  {
                    "ig-badge--success": true
                };
                break;
            case Type.WARNING:
                classes =  {
                    "ig-badge--warning": true
                };
                break;
            case Type.ERROR:
                classes =  {
                    "ig-badge--error": true
                };
                break;
        }

        return classes;
    }
}

@NgModule({
    declarations: [Badge],
    imports: [CommonModule],
    exports: [Badge]
})
export class BadgeModule {
}