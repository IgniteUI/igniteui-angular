import {Component, ViewChild} from "@angular/core";
import {
  async,
  TestBed
} from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import {IgxCarouselComponent, IgxCarouselModule, IgxSlideComponent, ISlideEventArgs} from "./carousel.component";

function dispatchEv(element: HTMLElement, eventType: string) {
    const event = new Event(eventType);
    element.dispatchEvent(event);
}

describe("Carousel", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CarouselTestComponent],
            imports: [IgxCarouselModule]
        })
        .compileComponents();
    }));

    it("should initialize a carousel with two slides and then destroy it", () => {
        const fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;

        fixture.detectChanges();
        expect(instance.carousel).toBeDefined();
        expect(instance.carousel instanceof IgxCarouselComponent).toBe(true);
        expect(instance.carousel.slides[0] instanceof IgxSlideComponent).toBe(true);

        expect(instance.carousel.slides instanceof Array).toBe(true);
        expect(instance.carousel.loop).toBe(true);
        expect(instance.carousel.pause).toBe(true);
        expect(instance.carousel.slides.length).toEqual(2);
        expect(instance.carousel.interval).toEqual(2500);

        instance.carousel.ngOnDestroy();
        fixture.detectChanges();
        expect(instance.carousel.isDestroyed).toBe(true);

    });

    it("Carousel disabled looping", () => {
        const fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;

        fixture.detectChanges();

        const lastSlide = instance.carousel.get(1);
        const firstSlide = instance.carousel.get(0);

        instance.carousel.loop = false;
        fixture.detectChanges();
        instance.carousel.next();
        instance.carousel.next();
        fixture.detectChanges();
        expect(instance.carousel.current).toBe(lastSlide.index);

        instance.carousel.prev();
        instance.carousel.prev();
        fixture.detectChanges();
        expect(instance.carousel.current).toBe(firstSlide.index);

    });

    it("Carousel getter/setter tests", () => {
        const fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;

        fixture.detectChanges();

        instance.carousel.loop = false;
        instance.carousel.pause = false;
        instance.carousel.interval = 500;
        instance.carousel.navigation = false;

        fixture.detectChanges();

        expect(instance.carousel.loop).toBe(false);
        expect(instance.carousel.pause).toBe(false);
        expect(instance.carousel.interval).toEqual(500);
        expect(instance.carousel.navigation).toBe(false);
    });

    it("Carousel add/remove slides tests", () => {
        const fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;

        fixture.detectChanges();

        let currentSlide = instance.carousel.get(instance.carousel.current);
        instance.carousel.remove(currentSlide);

        fixture.detectChanges();
        expect(instance.carousel.slides.length).toEqual(1);

        currentSlide = instance.carousel.get(instance.carousel.current);
        instance.carousel.remove(currentSlide);

        fixture.detectChanges();
        expect(instance.carousel.slides.length).toEqual(0);

        instance.carousel.add(currentSlide);
        instance.carousel.add(currentSlide);

        fixture.detectChanges();
        expect(instance.carousel.slides.length).toEqual(2);
    });

    it("Carousel public methods", () => {
        const fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;

        fixture.detectChanges();

        instance.carousel.stop();

        fixture.detectChanges();
        expect(instance.carousel.isPlaying).toBe(false);

        instance.carousel.next();
        let currentSlide = instance.carousel.get(instance.carousel.current);

        fixture.detectChanges();
        expect(instance.carousel.get(1)).toBe(currentSlide);

        currentSlide = instance.carousel.get(0);
        instance.carousel.prev();

        fixture.detectChanges();
        expect(instance.carousel.get(0)).toBe(currentSlide);
    });

    it("Carousel emit events", () => {
        const fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        const carousel = fixture.componentInstance.carousel;

        spyOn(carousel.onSlideChanged, "emit");
        carousel.next();
        fixture.detectChanges();
        let args: ISlideEventArgs = {
            carousel,
            slide: carousel.get(carousel.current)
        };
        expect(carousel.onSlideChanged.emit).toHaveBeenCalledWith(args);

        spyOn(carousel.onSlideAdded, "emit");
        carousel.add(carousel.get(carousel.current));
        fixture.detectChanges();
        args = {
            carousel,
            slide: carousel.get(carousel.current)
        };
        expect(carousel.onSlideAdded.emit).toHaveBeenCalledWith(args);

        spyOn(carousel.onSlideRemoved, "emit");
        args = {
            carousel,
            slide: carousel.get(carousel.current)
        };
        carousel.remove(carousel.get(carousel.current));
        fixture.detectChanges();
        expect(carousel.onSlideRemoved.emit).toHaveBeenCalledWith(args);

        spyOn(carousel.onCarouselPaused, "emit");
        carousel.stop();
        fixture.detectChanges();
        expect(carousel.onCarouselPaused.emit).toHaveBeenCalledWith(carousel);

        spyOn(carousel.onCarouselPlaying, "emit");
        carousel.play();
        fixture.detectChanges();
        expect(carousel.onCarouselPlaying.emit).toHaveBeenCalledWith(carousel);
    });

    it("Carousel click handlers", () => {
        const fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let prevNav;
        let nextNav;
        let carousel;
        let carouselNative;

        carouselNative = fixture.debugElement;
        carousel = fixture.componentInstance.carousel;

        prevNav = carouselNative.query(By.css("a.igx-carousel__arrow--prev")).nativeElement;
        nextNav = carouselNative.query(By.css("a.igx-carousel__arrow--next")).nativeElement;

        spyOn(carousel, "prev");
        dispatchEv(prevNav, "click");
        fixture.detectChanges();
        expect(carousel.prev).toHaveBeenCalled();

        spyOn(carousel, "next");
        dispatchEv(nextNav, "click");
        fixture.detectChanges();
        expect(carousel.next).toHaveBeenCalled();
    });

    it("Carousel keyboard handlers", () => {
        const fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let carousel;
        let carouselNative;

        carouselNative = fixture.debugElement.query(By.css(".igx-carousel"));
        carousel = fixture.componentInstance.carousel;

        carousel.pause = true;
        fixture.detectChanges();

        spyOn(carousel, "prev");
        carouselNative.nativeElement.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}));
        fixture.detectChanges();
        expect(carousel.prev).toHaveBeenCalled();

        spyOn(carousel, "next");
        carouselNative.nativeElement.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight"}));
        fixture.detectChanges();
        expect(carousel.next).toHaveBeenCalled();
    });

    it("Carousel navigation changes visibility of arrows", () => {
        const fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let carousel;
        let carouselNative;

        carouselNative = fixture.debugElement.query(By.css(".igx-carousel"));
        carousel = fixture.componentInstance.carousel;

        // carousel.navigation = true;
        fixture.detectChanges();
        expect(carouselNative.query(By.css(".igx-carousel__arrow--prev")) === null).toBe(false);
        expect(carouselNative.query(By.css(".igx-carousel__arrow--next")) === null).toBe(false);

        carousel.navigation = false;
        fixture.detectChanges();
        expect(carouselNative.query(By.css(".igx-carousel__arrow--prev")) === null).toBe(true);
        expect(carouselNative.query(By.css(".igx-carousel__arrow--next")) === null).toBe(true);

        carousel.navigation = true;
        fixture.detectChanges();
        expect(carouselNative.query(By.css(".igx-carousel__arrow--prev")) === null).toBe(false);
        expect(carouselNative.query(By.css(".igx-carousel__arrow--next")) === null).toBe(false);
    });
});

@Component({
    template: `
        <igx-carousel #carousel [loop]="loop" [pause]="pause" [interval]="interval">
            <igx-slide></igx-slide>
            <igx-slide></igx-slide>
        </igx-carousel>
    `
})
class CarouselTestComponent {

    @ViewChild("carousel") public carousel: IgxCarouselComponent;

    public loop = true;
    public pause = true;
    public interval = 2500;
}
