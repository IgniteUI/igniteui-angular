import { IPositionStrategy } from './IPositionStrategy';
import { BaseFitPositionStrategy } from './base-fit-position-strategy';
import { Size, HorizontalAlignment, VerticalAlignment, PositionSettings } from '../utilities';

export class ElasticPositionStrategy extends BaseFitPositionStrategy implements IPositionStrategy {
    fitHorizontal(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect, minSize: Size) {
    }

    fitVertical(element: HTMLElement, settings: PositionSettings, innerRect: ClientRect, outerRect: ClientRect, minSize: Size) {
        }
    }
}
