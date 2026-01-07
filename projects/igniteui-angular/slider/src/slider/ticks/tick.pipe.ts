import { Pipe, PipeTransform } from '@angular/core';

/**
 * @hidden
 */
@Pipe({
    name: 'spreadTickLabels',
    standalone: true
})
export class IgxTickLabelsPipe implements PipeTransform {


    public transform(labels: Array<string | number | boolean | null | undefined>, secondaryTicks: number) {
        if (!labels) {
            return;
        }

        const result = [];
        labels.forEach(item => {
            result.push(item);
            for (let i = 0; i < secondaryTicks; i++) {
                result.push('');
            }
        });

        return result;
    }
}
