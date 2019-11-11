import { IgxDateRangeComponent } from './igx-date-range.component';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';

describe('IgxDateRangeComponent', () => {
    let component: IgxDateRangeComponent;
    let fixture: ComponentFixture<IgxDateRangeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [IgxDateRangeComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxDateRangeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
