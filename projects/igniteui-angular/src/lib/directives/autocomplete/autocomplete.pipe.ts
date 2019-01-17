import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class IgxAutocompletePipe implements PipeTransform {
    public transform(collection: any[], condition = this.defaultCondition, term) {
        return collection.filter(item => condition(item, term));
    }
    defaultCondition(value, term) {
        return value.toLowerCase().startsWith(term.toLowerCase());
    }
}
