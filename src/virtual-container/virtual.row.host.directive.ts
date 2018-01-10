import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[virtual-row-host]',
})
export class VirtualRowHost { 
  constructor(public viewContainerRef: ViewContainerRef) { }
}