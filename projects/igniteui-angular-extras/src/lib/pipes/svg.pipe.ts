import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'svg',
})
export class SvgPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  public transform(markup: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  }
}
