import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { IgxSliderType, TickLabelsOrientation, TicksOrientation, IgxButtonDirective, IgxSliderComponent, IgxTickLabelTemplateDirective } from 'igniteui-angular';
import { defineComponents, IgcSliderComponent, IgcSliderLabelComponent } from 'igniteui-webcomponents';

defineComponents(IgcSliderComponent, IgcSliderLabelComponent);

@Component({
    selector: 'app-slider-showcase-sample',
    styleUrls: ['slider-showcase.sample.scss'],
    templateUrl: 'slider-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxSliderComponent, FormsModule, IgxTickLabelTemplateDirective, IgxButtonDirective, NgFor]
})
export class SliderShowcaseSampleComponent {
    public labelOrientaion: TickLabelsOrientation = TickLabelsOrientation.Horizontal;
    public ticksOrientation: TicksOrientation = TicksOrientation.Bottom;
    public primaryTickLabels = true;
    public secondaryTickLabels = true;
    public sliderType: IgxSliderType = IgxSliderType.SLIDER;
    public labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
}
