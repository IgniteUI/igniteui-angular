import { CommonModule } from "@angular/common";
import { Component, HostBinding, Input, NgModule } from "@angular/core";
import { IgxIconModule } from "../icon";

export enum Type {
    DEFAULT = "default",
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error"
}
/**
 * **IgniteUI Angular Badge** - [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/badge.html)  
 * This component is used to decorate avatars, navigation menus, or other components in the 
 * application when visual notification is needed. They are usually designed as icons with a predefined 
 * style to communicate information, success, warnings, or errors.
 * 
 * Here's a basic example placing a badge over an avatar:
 * ```html
 * <igx-avatar icon="person" roundShape="true" size="small">
 *   <igx-badge icon="check" type="success" class="badge-style"/>
 * </igx-avatar>
 * ```
 * Css is used to position the badge within the parent container:
 * ```css
 * .badge-style {
 *   position: absolute;
 *   bottom: -6px;
 *   right:-50px;
 * }
 * ```
 */
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
