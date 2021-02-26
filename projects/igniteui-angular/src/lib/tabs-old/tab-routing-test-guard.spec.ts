import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class TabRoutingTestGuard implements CanActivate {
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if (state.url === '/view5') {
           return false;
        } else {
            return true;
        }
    }
}
