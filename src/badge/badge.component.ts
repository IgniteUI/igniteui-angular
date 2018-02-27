import { CommonModule } from "@angular/common";
import { Component, HostBinding, Input, NgModule } from "@angular/core";
import { IgxIconModule } from "../icon/icon.component";

export enum Type {
    DEFAULT = "default",
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error"
}

@Component({
    selector: "igx-badge",
    templateUrl: "badge.component.html"
})
export class IgxBadgeComponent {

    @Input()
    public type: string | Type = "default";

    @Input()
    public value = "";

    @Input()
    public icon: string;

    @HostBinding("attr.role")
    public role = "status";

    @HostBinding("class.igx-badge")
    public cssClass = "igx-badge";

    @HostBinding("attr.aria-label")
    public label = "badge";

    get roleDescription() {
        let message;

        // tslint:disable-next-line:prefer-conditional-expression
        if (this.icon) {
            message = this.type + " type badge with icon type " + this.icon;
        } else if (this.value) {
            message = this.type + " badge type with value " + this.value;
        } else {
            message = this.type + " badge type without value";
        }

        return message;
    }

    public setClasses() {
        let classes = {};

        switch (Type[this.type.toUpperCase()]) {
            case Type.DEFAULT:
                classes = {
                    [`${this.cssClass}__circle--default`]: true
                };
                break;
            case Type.INFO:
                classes = {
                    [`${this.cssClass}__circle--info`]: true
                };
                break;
            case Type.SUCCESS:
                classes = {
                    [`${this.cssClass}__circle--success`]: true
                };
                break;
            case Type.WARNING:
                classes = {
                    [`${this.cssClass}__circle--warning`]: true
                };
                break;
            case Type.ERROR:
                classes = {
                    [`${this.cssClass}__circle--error`]: true
                };
                break;
        }

        return classes;
    }

}

@NgModule({
    declarations: [IgxBadgeComponent],
    exports: [IgxBadgeComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxBadgeModule {
}
