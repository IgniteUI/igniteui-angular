import {
    NgModule,
    Component,
    ElementRef,
    Renderer,
    OnInit,
    Input,
    Output,
} from '@angular/core';


@Component({
    selector: 'ig-avatar',
    moduleId: module.id,
    templateUrl: 'avatar.html',
})

export class Avatar {
    @Input() hasLabel: boolean = false;
    public text: string = '';

    constructor(public element_ref: ElementRef, private renderer: Renderer) {
        this._addEventListeners(renderer);

        if(element_ref.nativeElement.text !== null){
            this.hasLabel = true;
            this.text = element_ref.nativeElement.text;
        }
    }

    private _addEventListeners(renderer: Renderer) {

    }
}

@NgModule({
    declarations: [Avatar],
    exports: [Avatar]
})
export class AvatarModule {
}