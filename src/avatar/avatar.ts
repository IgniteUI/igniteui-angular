import {
    NgModule,
    Component,
    ElementRef,
    Renderer,
    OnInit,
    Input,
    Output,
} from '@angular/core';
import { CommonModule } from "@angular/common";

@Component({
    selector: 'ig-avatar',
    moduleId: module.id,
    templateUrl: 'avatar.html',
})

export class Avatar {
    @Input() hasLabel: boolean = false;
    @Input() text: string;
    @Input() source: string;
    public imageSource: string = '';

    constructor(public element_ref: ElementRef, private renderer: Renderer) {
        this._addEventListeners(renderer);

        if(element_ref.nativeElement.text !== null){

        }
    }

    private _addEventListeners(renderer: Renderer) {

    }
}

@NgModule({
    declarations: [Avatar],
    imports: [CommonModule],
    exports: [Avatar]
})
export class AvatarModule {
}