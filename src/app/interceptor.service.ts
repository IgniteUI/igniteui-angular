import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TestInterceptorClass implements HttpInterceptor {
    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const clone = req.clone({
            headers: req.headers.set('Bearer', 'Testing interceptors for lazy loaded modules that inject services utilizing HttpClient.')
        });
        return next.handle(clone);
    }
}
