import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'svg'
})
export class SvgPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}
  transform(markup: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  }

}
