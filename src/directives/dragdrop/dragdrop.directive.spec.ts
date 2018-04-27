import { Component, DebugElement } from "@angular/core";
import { async, discardPeriodicTasks, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { IgxAvatarComponent, IgxAvatarModule } from "../../avatar/avatar.component";
import { IgxDragDropModule, RestrictDrag } from "./dragdrop.directive";

describe("IgxDrag", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DragableElementComponent,
                HorizontalDragComponent,
                VerticalDragComponent
            ],
            imports: [
                FormsModule,
                IgxAvatarModule,
                IgxDragDropModule
            ]
        })
        .compileComponents();
    }));

    it("Define a draggable element.", fakeAsync(() => {
        const fixture = TestBed.createComponent(DragableElementComponent);
        fixture.detectChanges();

        const avatar = fixture.debugElement.query(By.css(".igx-avatar--rounded"));
        const div = fixture.debugElement.query(By.css(".igx-avatar__initials"));

        expect(div.nativeElement.getBoundingClientRect().top).toBe(0);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(0);

        simulateMouseEvent("mousedown", avatar.nativeElement, 50, 50);
        tick();

        simulateMouseEvent("mousemove", avatar.nativeElement, 250, 250);
        tick();

        simulateMouseEvent("mouseup", avatar.nativeElement, 250, 250);
        tick();
        fixture.detectChanges();

        expect(div.nativeElement.getBoundingClientRect().top).toBe(200);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(200);

        discardPeriodicTasks();
    }));

    it("Restrict draggable area.", fakeAsync(() => {
        const fixture = TestBed.createComponent(DragableElementComponent);
        fixture.detectChanges();

        const avatar = fixture.debugElement.query(By.css(".igx-avatar--rounded"));
        const div = fixture.debugElement.query(By.css(".igx-avatar__initials"));

        expect(div.nativeElement.getBoundingClientRect().top).toBe(0);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(0);

        simulateMouseEvent("mousedown", avatar.nativeElement, 50, 50);
        tick();

        simulateMouseEvent("mousemove", avatar.nativeElement, 600, 600);
        tick();

        simulateMouseEvent("mouseup", avatar.nativeElement, 600, 600);
        tick();
        fixture.detectChanges();

        expect(div.nativeElement.getBoundingClientRect().top).toBe(400);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(400);

        simulateMouseEvent("mousedown", avatar.nativeElement, 350, 350);
        tick();

        simulateMouseEvent("mousemove", avatar.nativeElement, 0, 0);
        tick();

        simulateMouseEvent("mouseup", avatar.nativeElement, 0, 0);
        tick();
        fixture.detectChanges();

        expect(div.nativeElement.getBoundingClientRect().top).toBe(50);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(50);

        discardPeriodicTasks();
    }));

    it("Allow horizontal drag only.", fakeAsync(() => {
        const fixture = TestBed.createComponent(HorizontalDragComponent);
        fixture.detectChanges();

        const avatar = fixture.debugElement.query(By.css(".igx-avatar--rounded"));
        const div = fixture.debugElement.query(By.css(".igx-avatar__initials"));

        expect(div.nativeElement.getBoundingClientRect().top).toBe(0);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(0);

        simulateMouseEvent("mousedown", avatar.nativeElement, 50, 50);
        tick();

        simulateMouseEvent("mousemove", avatar.nativeElement, 600, 600);
        tick();

        simulateMouseEvent("mouseup", avatar.nativeElement, 600, 600);
        tick();
        fixture.detectChanges();

        expect(div.nativeElement.getBoundingClientRect().top).toBe(0);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(550);

        simulateMouseEvent("mousedown", avatar.nativeElement, 600, 50);
        tick();

        simulateMouseEvent("mousemove", avatar.nativeElement, 200, 200);
        tick();

        simulateMouseEvent("mouseup", avatar.nativeElement, 200, 200);
        tick();
        fixture.detectChanges();

        expect(div.nativeElement.getBoundingClientRect().top).toBe(0);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(150);

        discardPeriodicTasks();
    }));

    it("Allow vertical drag only.", fakeAsync(() => {
        const fixture = TestBed.createComponent(VerticalDragComponent);
        fixture.detectChanges();

        const avatar = fixture.debugElement.query(By.css(".igx-avatar--rounded"));
        const div = fixture.debugElement.query(By.css(".igx-avatar__initials"));

        expect(div.nativeElement.getBoundingClientRect().top).toBe(0);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(0);

        simulateMouseEvent("mousedown", avatar.nativeElement, 50, 50);
        tick();

        simulateMouseEvent("mousemove", avatar.nativeElement, 400, 400);
        tick();

        simulateMouseEvent("mouseup", avatar.nativeElement, 400, 400);
        tick();
        fixture.detectChanges();

        expect(div.nativeElement.getBoundingClientRect().top).toBe(350);
        expect(div.nativeElement.getBoundingClientRect().left).toBe(0);

        discardPeriodicTasks();
    }));
});

function simulateMouseEvent(eventName: string, element, x, y) {
    const options: MouseEventInit = {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
    };

    return new Promise((resolve, reject) => {
        element.dispatchEvent(new MouseEvent(eventName, options));
        resolve();
    });
}

@Component({
    template: `
    <igx-avatar #avatar igxDrag
                [restrictHDragMax]="restrictHDragMax"
                [restrictHDragMin]="restrictHDragMin"
                [restrictVDragMax]="restrictVDragMax"
                [restrictVDragMin]="restrictVDragMin"
                initials="AZ"
                [roundShape]="'true'"
                bgColor="#ADBDBB"
                size="large">
    </igx-avatar>
    `
})
export class DragableElementComponent {

    public restrictHDragMax = 400;
    public restrictHDragMin = 50;
    public restrictVDragMax = 400;
    public restrictVDragMin = 50;
}

@Component({
    template: `
    <igx-avatar #avatar igxDrag
                [restrictDrag]="dragDirection"
                initials="AZ"
                [roundShape]="'true'"
                bgColor="#ADBDBB"
                size="large">
    </igx-avatar>
    `
})
export class HorizontalDragComponent {

    public dragDirection: RestrictDrag = RestrictDrag.HORIZONTALLY;
}

@Component({
    template: `
    <igx-avatar #avatar igxDrag
                [restrictDrag]="dragDirection"
                initials="AZ"
                [roundShape]="'true'"
                bgColor="#ADBDBB"
                size="large">
    </igx-avatar>
    `
})
export class VerticalDragComponent {

    public dragDirection: RestrictDrag = RestrictDrag.VERTICALLY;
}
