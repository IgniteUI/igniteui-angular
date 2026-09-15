import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class RoutingTestGuard {
  public canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (state.url === '/view5') {
            return false;
        } else {
            return true;
        }
    }
}
