/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { ReadyState, Request } from '@angular/http';
import { ReplaySubject, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
/**
 *
 * Mock Connection to represent a {\@link Connection} for tests.
 *
 * @deprecated use \@angular/common/http instead
 */
export class MockConnection {
    /**
     * @param {?} req
     */
    constructor(req) {
        this.response = /** @type {?} */ (new ReplaySubject(1).pipe(take(1)));
        this.readyState = ReadyState.Open;
        this.request = req;
    }
    /**
     * Sends a mock response to the connection. This response is the value that is emitted to the
     * {\@link EventEmitter} returned by {\@link Http}.
     *
     * ### Example
     *
     * ```
     * var connection;
     * backend.connections.subscribe(c => connection = c);
     * http.request('data.json').subscribe(res => console.log(res.text()));
     * connection.mockRespond(new Response(new ResponseOptions({ body: 'fake response' }))); //logs
     * 'fake response'
     * ```
     *
     * @param {?} res
     * @return {?}
     */
    mockRespond(res) {
        if (this.readyState === ReadyState.Done || this.readyState === ReadyState.Cancelled) {
            throw new Error('Connection has already been resolved');
        }
        this.readyState = ReadyState.Done;
        this.response.next(res);
        this.response.complete();
    }
    /**
     * Not yet implemented!
     *
     * Sends the provided {\@link Response} to the `downloadObserver` of the `Request`
     * associated with this connection.
     * @param {?} res
     * @return {?}
     */
    mockDownload(res) {
        // this.request.downloadObserver.onNext(res);
        // if (res.bytesLoaded === res.totalBytes) {
        //   this.request.downloadObserver.onCompleted();
        // }
    }
    /**
     * Emits the provided error object as an error to the {\@link Response} {\@link EventEmitter}
     * returned
     * from {\@link Http}.
     *
     * ### Example
     *
     * ```
     * var connection;
     * backend.connections.subscribe(c => connection = c);
     * http.request('data.json').subscribe(res => res, err => console.log(err)));
     * connection.mockError(new Error('error'));
     * ```
     *
     * @param {?=} err
     * @return {?}
     */
    mockError(err) {
        // Matches ResourceLoader semantics
        this.readyState = ReadyState.Done;
        this.response.error(err);
    }
}
function MockConnection_tsickle_Closure_declarations() {
    /**
     * Describes the state of the connection, based on `XMLHttpRequest.readyState`, but with
     * additional states. For example, state 5 indicates an aborted connection.
     * @type {?}
     */
    MockConnection.prototype.readyState;
    /**
     * {\@link Request} instance used to create the connection.
     * @type {?}
     */
    MockConnection.prototype.request;
    /**
     * {\@link EventEmitter} of {\@link Response}. Can be subscribed to in order to be notified when a
     * response is available.
     * @type {?}
     */
    MockConnection.prototype.response;
}
/**
 * A mock backend for testing the {\@link Http} service.
 *
 * This class can be injected in tests, and should be used to override providers
 * to other backends, such as {\@link XHRBackend}.
 *
 * ### Example
 *
 * ```
 * import {Injectable, Injector} from '\@angular/core';
 * import {async, fakeAsync, tick} from '\@angular/core/testing';
 * import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '\@angular/http';
 * import {Response, ResponseOptions} from '\@angular/http';
 * import {MockBackend, MockConnection} from '\@angular/http/testing';
 *
 * const HERO_ONE = 'HeroNrOne';
 * const HERO_TWO = 'WillBeAlwaysTheSecond';
 *
 * \@Injectable()
 * class HeroService {
 *   constructor(private http: Http) {}
 *
 *   getHeroes(): Promise<String[]> {
 *     return this.http.get('myservices.de/api/heroes')
 *         .toPromise()
 *         .then(response => response.json().data)
 *         .catch(e => this.handleError(e));
 *   }
 *
 *   private handleError(error: any): Promise<any> {
 *     console.error('An error occurred', error);
 *     return Promise.reject(error.message || error);
 *   }
 * }
 *
 * describe('MockBackend HeroService Example', () => {
 *   beforeEach(() => {
 *     this.injector = Injector.create([
 *       {provide: ConnectionBackend, useClass: MockBackend},
 *       {provide: RequestOptions, useClass: BaseRequestOptions},
 *       Http,
 *       HeroService,
 *     ]);
 *     this.heroService = this.injector.get(HeroService);
 *     this.backend = this.injector.get(ConnectionBackend) as MockBackend;
 *     this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
 *   });
 *
 *   it('getHeroes() should query current service url', () => {
 *     this.heroService.getHeroes();
 *     expect(this.lastConnection).toBeDefined('no http service connection at all?');
 *     expect(this.lastConnection.request.url).toMatch(/api\/heroes$/, 'url invalid');
 *   });
 *
 *   it('getHeroes() should return some heroes', fakeAsync(() => {
 *        let result: String[];
 *        this.heroService.getHeroes().then((heroes: String[]) => result = heroes);
 *        this.lastConnection.mockRespond(new Response(new ResponseOptions({
 *          body: JSON.stringify({data: [HERO_ONE, HERO_TWO]}),
 *        })));
 *        tick();
 *        expect(result.length).toEqual(2, 'should contain given amount of heroes');
 *        expect(result[0]).toEqual(HERO_ONE, ' HERO_ONE should be the first hero');
 *        expect(result[1]).toEqual(HERO_TWO, ' HERO_TWO should be the second hero');
 *      }));
 *
 *   it('getHeroes() while server is down', fakeAsync(() => {
 *        let result: String[];
 *        let catchedError: any;
 *        this.heroService.getHeroes()
 *            .then((heroes: String[]) => result = heroes)
 *            .catch((error: any) => catchedError = error);
 *        this.lastConnection.mockRespond(new Response(new ResponseOptions({
 *          status: 404,
 *          statusText: 'URL not Found',
 *        })));
 *        tick();
 *        expect(result).toBeUndefined();
 *        expect(catchedError).toBeDefined();
 *      }));
 * });
 * ```
 *
 * This method only exists in the mock implementation, not in real Backends.
 *
 * @deprecated use \@angular/common/http instead
 */
export class MockBackend {
    constructor() {
        this.connectionsArray = [];
        this.connections = new Subject();
        this.connections.subscribe((connection) => this.connectionsArray.push(connection));
        this.pendingConnections = new Subject();
    }
    /**
     * Checks all connections, and raises an exception if any connection has not received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     * @return {?}
     */
    verifyNoPendingRequests() {
        let /** @type {?} */ pending = 0;
        this.pendingConnections.subscribe((c) => pending++);
        if (pending > 0)
            throw new Error(`${pending} pending connections to be resolved`);
    }
    /**
     * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
     * connections, if it's expected that there are connections that have not yet received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     * @return {?}
     */
    resolveAllConnections() { this.connections.subscribe((c) => c.readyState = 4); }
    /**
     * Creates a new {\@link MockConnection}. This is equivalent to calling `new
     * MockConnection()`, except that it also will emit the new `Connection` to the `connections`
     * emitter of this `MockBackend` instance. This method will usually only be used by tests
     * against the framework itself, not by end-users.
     * @param {?} req
     * @return {?}
     */
    createConnection(req) {
        if (!req || !(req instanceof Request)) {
            throw new Error(`createConnection requires an instance of Request, got ${req}`);
        }
        const /** @type {?} */ connection = new MockConnection(req);
        this.connections.next(connection);
        return connection;
    }
}
MockBackend.decorators = [
    { type: Injectable }
];
/** @nocollapse */
MockBackend.ctorParameters = () => [];
function MockBackend_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    MockBackend.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    MockBackend.ctorParameters;
    /**
     * {\@link EventEmitter}
     * of {\@link MockConnection} instances that have been created by this backend. Can be subscribed
     * to in order to respond to connections.
     *
     * ### Example
     *
     * ```
     * import {Injector} from '\@angular/core';
     * import {fakeAsync, tick} from '\@angular/core/testing';
     * import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '\@angular/http';
     * import {Response, ResponseOptions} from '\@angular/http';
     * import {MockBackend, MockConnection} from '\@angular/http/testing';
     *
     * it('should get a response', fakeAsync(() => {
     *      let connection:
     *          MockConnection;  // this will be set when a new connection is emitted from the
     *                           // backend.
     *      let text: string;    // this will be set from mock response
     *      let injector = Injector.create([
     *        {provide: ConnectionBackend, useClass: MockBackend},
     *        {provide: RequestOptions, useClass: BaseRequestOptions},
     *        Http,
     *      ]);
     *      let backend = injector.get(ConnectionBackend);
     *      let http = injector.get(Http);
     *      backend.connections.subscribe((c: MockConnection) => connection = c);
     *      http.request('something.json').toPromise().then((res: any) => text = res.text());
     *      connection.mockRespond(new Response(new ResponseOptions({body: 'Something'})));
     *      tick();
     *      expect(text).toBe('Something');
     *    }));
     * ```
     *
     * This property only exists in the mock implementation, not in real Backends.
     * @type {?}
     */
    MockBackend.prototype.connections;
    /**
     * An array representation of `connections`. This array will be updated with each connection that
     * is created by this backend.
     *
     * This property only exists in the mock implementation, not in real Backends.
     * @type {?}
     */
    MockBackend.prototype.connectionsArray;
    /**
     * {\@link EventEmitter} of {\@link MockConnection} instances that haven't yet been resolved (i.e.
     * with a `readyState`
     * less than 4). Used internally to verify that no connections are pending via the
     * `verifyNoPendingRequests` method.
     *
     * This property only exists in the mock implementation, not in real Backends.
     * @type {?}
     */
    MockBackend.prototype.pendingConnections;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19iYWNrZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvaHR0cC90ZXN0aW5nL3NyYy9tb2NrX2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBZ0MsVUFBVSxFQUFFLE9BQU8sRUFBVyxNQUFNLGVBQWUsQ0FBQztBQUMzRixPQUFPLEVBQUMsYUFBYSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM1QyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7QUFTcEMsTUFBTTs7OztJQW9CSixZQUFZLEdBQVk7UUFDdEIsSUFBSSxDQUFDLFFBQVEscUJBQVEsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUM7UUFDeEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0tBQ3BCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpQkQsV0FBVyxDQUFDLEdBQWE7UUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEYsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1NBQ3pEO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDMUI7Ozs7Ozs7OztJQVFELFlBQVksQ0FBQyxHQUFhOzs7OztLQUt6Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0JELFNBQVMsQ0FBQyxHQUFXOztRQUVuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDMUI7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwRkQsTUFBTTtJQXVESjtRQUNFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUN0QixDQUFDLFVBQTBCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztLQUN6Qzs7Ozs7OztJQU9ELHVCQUF1QjtRQUNyQixxQkFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFpQixFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFBQyxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsT0FBTyxxQ0FBcUMsQ0FBQyxDQUFDO0tBQ25GOzs7Ozs7OztJQVFELHFCQUFxQixLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7Ozs7SUFRaEcsZ0JBQWdCLENBQUMsR0FBWTtRQUMzQixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ2pGO1FBQ0QsdUJBQU0sVUFBVSxHQUFHLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxVQUFVLENBQUM7S0FDbkI7OztZQWhHRixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb25uZWN0aW9uLCBDb25uZWN0aW9uQmFja2VuZCwgUmVhZHlTdGF0ZSwgUmVxdWVzdCwgUmVzcG9uc2V9IGZyb20gJ0Bhbmd1bGFyL2h0dHAnO1xuaW1wb3J0IHtSZXBsYXlTdWJqZWN0LCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5cbi8qKlxuICpcbiAqIE1vY2sgQ29ubmVjdGlvbiB0byByZXByZXNlbnQgYSB7QGxpbmsgQ29ubmVjdGlvbn0gZm9yIHRlc3RzLlxuICpcbiAqIEBkZXByZWNhdGVkIHVzZSBAYW5ndWxhci9jb21tb24vaHR0cCBpbnN0ZWFkXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrQ29ubmVjdGlvbiBpbXBsZW1lbnRzIENvbm5lY3Rpb24ge1xuICAvLyBUT0RPOiBOYW1lIGByZWFkeVN0YXRlYCBzaG91bGQgY2hhbmdlIHRvIGJlIG1vcmUgZ2VuZXJpYywgYW5kIHN0YXRlcyBjb3VsZCBiZSBtYWRlIHRvIGJlIG1vcmVcbiAgLy8gZGVzY3JpcHRpdmUgdGhhbiBSZXNvdXJjZUxvYWRlciBzdGF0ZXMuXG4gIC8qKlxuICAgKiBEZXNjcmliZXMgdGhlIHN0YXRlIG9mIHRoZSBjb25uZWN0aW9uLCBiYXNlZCBvbiBgWE1MSHR0cFJlcXVlc3QucmVhZHlTdGF0ZWAsIGJ1dCB3aXRoXG4gICAqIGFkZGl0aW9uYWwgc3RhdGVzLiBGb3IgZXhhbXBsZSwgc3RhdGUgNSBpbmRpY2F0ZXMgYW4gYWJvcnRlZCBjb25uZWN0aW9uLlxuICAgKi9cbiAgcmVhZHlTdGF0ZTogUmVhZHlTdGF0ZTtcblxuICAvKipcbiAgICoge0BsaW5rIFJlcXVlc3R9IGluc3RhbmNlIHVzZWQgdG8gY3JlYXRlIHRoZSBjb25uZWN0aW9uLlxuICAgKi9cbiAgcmVxdWVzdDogUmVxdWVzdDtcblxuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn0gb2Yge0BsaW5rIFJlc3BvbnNlfS4gQ2FuIGJlIHN1YnNjcmliZWQgdG8gaW4gb3JkZXIgdG8gYmUgbm90aWZpZWQgd2hlbiBhXG4gICAqIHJlc3BvbnNlIGlzIGF2YWlsYWJsZS5cbiAgICovXG4gIHJlc3BvbnNlOiBSZXBsYXlTdWJqZWN0PFJlc3BvbnNlPjtcblxuICBjb25zdHJ1Y3RvcihyZXE6IFJlcXVlc3QpIHtcbiAgICB0aGlzLnJlc3BvbnNlID0gPGFueT5uZXcgUmVwbGF5U3ViamVjdCgxKS5waXBlKHRha2UoMSkpO1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuT3BlbjtcbiAgICB0aGlzLnJlcXVlc3QgPSByZXE7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBtb2NrIHJlc3BvbnNlIHRvIHRoZSBjb25uZWN0aW9uLiBUaGlzIHJlc3BvbnNlIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIGVtaXR0ZWQgdG8gdGhlXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9IHJldHVybmVkIGJ5IHtAbGluayBIdHRwfS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBjb25uZWN0aW9uO1xuICAgKiBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IGNvbm5lY3Rpb24gPSBjKTtcbiAgICogaHR0cC5yZXF1ZXN0KCdkYXRhLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IGNvbnNvbGUubG9nKHJlcy50ZXh0KCkpKTtcbiAgICogY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2UobmV3IFJlc3BvbnNlT3B0aW9ucyh7IGJvZHk6ICdmYWtlIHJlc3BvbnNlJyB9KSkpOyAvL2xvZ3NcbiAgICogJ2Zha2UgcmVzcG9uc2UnXG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgbW9ja1Jlc3BvbmQocmVzOiBSZXNwb25zZSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGUuRG9uZSB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGUuQ2FuY2VsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gaGFzIGFscmVhZHkgYmVlbiByZXNvbHZlZCcpO1xuICAgIH1cbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLkRvbmU7XG4gICAgdGhpcy5yZXNwb25zZS5uZXh0KHJlcyk7XG4gICAgdGhpcy5yZXNwb25zZS5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdCB5ZXQgaW1wbGVtZW50ZWQhXG4gICAqXG4gICAqIFNlbmRzIHRoZSBwcm92aWRlZCB7QGxpbmsgUmVzcG9uc2V9IHRvIHRoZSBgZG93bmxvYWRPYnNlcnZlcmAgb2YgdGhlIGBSZXF1ZXN0YFxuICAgKiBhc3NvY2lhdGVkIHdpdGggdGhpcyBjb25uZWN0aW9uLlxuICAgKi9cbiAgbW9ja0Rvd25sb2FkKHJlczogUmVzcG9uc2UpIHtcbiAgICAvLyB0aGlzLnJlcXVlc3QuZG93bmxvYWRPYnNlcnZlci5vbk5leHQocmVzKTtcbiAgICAvLyBpZiAocmVzLmJ5dGVzTG9hZGVkID09PSByZXMudG90YWxCeXRlcykge1xuICAgIC8vICAgdGhpcy5yZXF1ZXN0LmRvd25sb2FkT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAvLyB9XG4gIH1cblxuICAvLyBUT0RPKGplZmZiY3Jvc3MpOiBjb25zaWRlciB1c2luZyBSZXNwb25zZSB0eXBlXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgcHJvdmlkZWQgZXJyb3Igb2JqZWN0IGFzIGFuIGVycm9yIHRvIHRoZSB7QGxpbmsgUmVzcG9uc2V9IHtAbGluayBFdmVudEVtaXR0ZXJ9XG4gICAqIHJldHVybmVkXG4gICAqIGZyb20ge0BsaW5rIEh0dHB9LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogdmFyIGNvbm5lY3Rpb247XG4gICAqIGJhY2tlbmQuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gY29ubmVjdGlvbiA9IGMpO1xuICAgKiBodHRwLnJlcXVlc3QoJ2RhdGEuanNvbicpLnN1YnNjcmliZShyZXMgPT4gcmVzLCBlcnIgPT4gY29uc29sZS5sb2coZXJyKSkpO1xuICAgKiBjb25uZWN0aW9uLm1vY2tFcnJvcihuZXcgRXJyb3IoJ2Vycm9yJykpO1xuICAgKiBgYGBcbiAgICpcbiAgICovXG4gIG1vY2tFcnJvcihlcnI/OiBFcnJvcikge1xuICAgIC8vIE1hdGNoZXMgUmVzb3VyY2VMb2FkZXIgc2VtYW50aWNzXG4gICAgdGhpcy5yZWFkeVN0YXRlID0gUmVhZHlTdGF0ZS5Eb25lO1xuICAgIHRoaXMucmVzcG9uc2UuZXJyb3IoZXJyKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbW9jayBiYWNrZW5kIGZvciB0ZXN0aW5nIHRoZSB7QGxpbmsgSHR0cH0gc2VydmljZS5cbiAqXG4gKiBUaGlzIGNsYXNzIGNhbiBiZSBpbmplY3RlZCBpbiB0ZXN0cywgYW5kIHNob3VsZCBiZSB1c2VkIHRvIG92ZXJyaWRlIHByb3ZpZGVyc1xuICogdG8gb3RoZXIgYmFja2VuZHMsIHN1Y2ggYXMge0BsaW5rIFhIUkJhY2tlbmR9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0luamVjdGFibGUsIEluamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCB7YXN5bmMsIGZha2VBc3luYywgdGlja30gZnJvbSAnQGFuZ3VsYXIvY29yZS90ZXN0aW5nJztcbiAqIGltcG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBDb25uZWN0aW9uQmFja2VuZCwgSHR0cCwgUmVxdWVzdE9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2h0dHAnO1xuICogaW1wb3J0IHtSZXNwb25zZSwgUmVzcG9uc2VPcHRpb25zfSBmcm9tICdAYW5ndWxhci9odHRwJztcbiAqIGltcG9ydCB7TW9ja0JhY2tlbmQsIE1vY2tDb25uZWN0aW9ufSBmcm9tICdAYW5ndWxhci9odHRwL3Rlc3RpbmcnO1xuICpcbiAqIGNvbnN0IEhFUk9fT05FID0gJ0hlcm9Ock9uZSc7XG4gKiBjb25zdCBIRVJPX1RXTyA9ICdXaWxsQmVBbHdheXNUaGVTZWNvbmQnO1xuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIEhlcm9TZXJ2aWNlIHtcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwKSB7fVxuICpcbiAqICAgZ2V0SGVyb2VzKCk6IFByb21pc2U8U3RyaW5nW10+IHtcbiAqICAgICByZXR1cm4gdGhpcy5odHRwLmdldCgnbXlzZXJ2aWNlcy5kZS9hcGkvaGVyb2VzJylcbiAqICAgICAgICAgLnRvUHJvbWlzZSgpXG4gKiAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKS5kYXRhKVxuICogICAgICAgICAuY2F0Y2goZSA9PiB0aGlzLmhhbmRsZUVycm9yKGUpKTtcbiAqICAgfVxuICpcbiAqICAgcHJpdmF0ZSBoYW5kbGVFcnJvcihlcnJvcjogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAqICAgICBjb25zb2xlLmVycm9yKCdBbiBlcnJvciBvY2N1cnJlZCcsIGVycm9yKTtcbiAqICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBkZXNjcmliZSgnTW9ja0JhY2tlbmQgSGVyb1NlcnZpY2UgRXhhbXBsZScsICgpID0+IHtcbiAqICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gKiAgICAgdGhpcy5pbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZShbXG4gKiAgICAgICB7cHJvdmlkZTogQ29ubmVjdGlvbkJhY2tlbmQsIHVzZUNsYXNzOiBNb2NrQmFja2VuZH0sXG4gKiAgICAgICB7cHJvdmlkZTogUmVxdWVzdE9wdGlvbnMsIHVzZUNsYXNzOiBCYXNlUmVxdWVzdE9wdGlvbnN9LFxuICogICAgICAgSHR0cCxcbiAqICAgICAgIEhlcm9TZXJ2aWNlLFxuICogICAgIF0pO1xuICogICAgIHRoaXMuaGVyb1NlcnZpY2UgPSB0aGlzLmluamVjdG9yLmdldChIZXJvU2VydmljZSk7XG4gKiAgICAgdGhpcy5iYWNrZW5kID0gdGhpcy5pbmplY3Rvci5nZXQoQ29ubmVjdGlvbkJhY2tlbmQpIGFzIE1vY2tCYWNrZW5kO1xuICogICAgIHRoaXMuYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoKGNvbm5lY3Rpb246IGFueSkgPT4gdGhpcy5sYXN0Q29ubmVjdGlvbiA9IGNvbm5lY3Rpb24pO1xuICogICB9KTtcbiAqXG4gKiAgIGl0KCdnZXRIZXJvZXMoKSBzaG91bGQgcXVlcnkgY3VycmVudCBzZXJ2aWNlIHVybCcsICgpID0+IHtcbiAqICAgICB0aGlzLmhlcm9TZXJ2aWNlLmdldEhlcm9lcygpO1xuICogICAgIGV4cGVjdCh0aGlzLmxhc3RDb25uZWN0aW9uKS50b0JlRGVmaW5lZCgnbm8gaHR0cCBzZXJ2aWNlIGNvbm5lY3Rpb24gYXQgYWxsPycpO1xuICogICAgIGV4cGVjdCh0aGlzLmxhc3RDb25uZWN0aW9uLnJlcXVlc3QudXJsKS50b01hdGNoKC9hcGlcXC9oZXJvZXMkLywgJ3VybCBpbnZhbGlkJyk7XG4gKiAgIH0pO1xuICpcbiAqICAgaXQoJ2dldEhlcm9lcygpIHNob3VsZCByZXR1cm4gc29tZSBoZXJvZXMnLCBmYWtlQXN5bmMoKCkgPT4ge1xuICogICAgICAgIGxldCByZXN1bHQ6IFN0cmluZ1tdO1xuICogICAgICAgIHRoaXMuaGVyb1NlcnZpY2UuZ2V0SGVyb2VzKCkudGhlbigoaGVyb2VzOiBTdHJpbmdbXSkgPT4gcmVzdWx0ID0gaGVyb2VzKTtcbiAqICAgICAgICB0aGlzLmxhc3RDb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZShuZXcgUmVzcG9uc2VPcHRpb25zKHtcbiAqICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtkYXRhOiBbSEVST19PTkUsIEhFUk9fVFdPXX0pLFxuICogICAgICAgIH0pKSk7XG4gKiAgICAgICAgdGljaygpO1xuICogICAgICAgIGV4cGVjdChyZXN1bHQubGVuZ3RoKS50b0VxdWFsKDIsICdzaG91bGQgY29udGFpbiBnaXZlbiBhbW91bnQgb2YgaGVyb2VzJyk7XG4gKiAgICAgICAgZXhwZWN0KHJlc3VsdFswXSkudG9FcXVhbChIRVJPX09ORSwgJyBIRVJPX09ORSBzaG91bGQgYmUgdGhlIGZpcnN0IGhlcm8nKTtcbiAqICAgICAgICBleHBlY3QocmVzdWx0WzFdKS50b0VxdWFsKEhFUk9fVFdPLCAnIEhFUk9fVFdPIHNob3VsZCBiZSB0aGUgc2Vjb25kIGhlcm8nKTtcbiAqICAgICAgfSkpO1xuICpcbiAqICAgaXQoJ2dldEhlcm9lcygpIHdoaWxlIHNlcnZlciBpcyBkb3duJywgZmFrZUFzeW5jKCgpID0+IHtcbiAqICAgICAgICBsZXQgcmVzdWx0OiBTdHJpbmdbXTtcbiAqICAgICAgICBsZXQgY2F0Y2hlZEVycm9yOiBhbnk7XG4gKiAgICAgICAgdGhpcy5oZXJvU2VydmljZS5nZXRIZXJvZXMoKVxuICogICAgICAgICAgICAudGhlbigoaGVyb2VzOiBTdHJpbmdbXSkgPT4gcmVzdWx0ID0gaGVyb2VzKVxuICogICAgICAgICAgICAuY2F0Y2goKGVycm9yOiBhbnkpID0+IGNhdGNoZWRFcnJvciA9IGVycm9yKTtcbiAqICAgICAgICB0aGlzLmxhc3RDb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZShuZXcgUmVzcG9uc2VPcHRpb25zKHtcbiAqICAgICAgICAgIHN0YXR1czogNDA0LFxuICogICAgICAgICAgc3RhdHVzVGV4dDogJ1VSTCBub3QgRm91bmQnLFxuICogICAgICAgIH0pKSk7XG4gKiAgICAgICAgdGljaygpO1xuICogICAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAqICAgICAgICBleHBlY3QoY2F0Y2hlZEVycm9yKS50b0JlRGVmaW5lZCgpO1xuICogICAgICB9KSk7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAqXG4gKiBAZGVwcmVjYXRlZCB1c2UgQGFuZ3VsYXIvY29tbW9uL2h0dHAgaW5zdGVhZFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja0JhY2tlbmQgaW1wbGVtZW50cyBDb25uZWN0aW9uQmFja2VuZCB7XG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfVxuICAgKiBvZiB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259IGluc3RhbmNlcyB0aGF0IGhhdmUgYmVlbiBjcmVhdGVkIGJ5IHRoaXMgYmFja2VuZC4gQ2FuIGJlIHN1YnNjcmliZWRcbiAgICogdG8gaW4gb3JkZXIgdG8gcmVzcG9uZCB0byBjb25uZWN0aW9ucy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICAgKiBpbXBvcnQge2Zha2VBc3luYywgdGlja30gZnJvbSAnQGFuZ3VsYXIvY29yZS90ZXN0aW5nJztcbiAgICogaW1wb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIENvbm5lY3Rpb25CYWNrZW5kLCBIdHRwLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gICAqIGltcG9ydCB7UmVzcG9uc2UsIFJlc3BvbnNlT3B0aW9uc30gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gICAqIGltcG9ydCB7TW9ja0JhY2tlbmQsIE1vY2tDb25uZWN0aW9ufSBmcm9tICdAYW5ndWxhci9odHRwL3Rlc3RpbmcnO1xuICAgKlxuICAgKiBpdCgnc2hvdWxkIGdldCBhIHJlc3BvbnNlJywgZmFrZUFzeW5jKCgpID0+IHtcbiAgICogICAgICBsZXQgY29ubmVjdGlvbjpcbiAgICogICAgICAgICAgTW9ja0Nvbm5lY3Rpb247ICAvLyB0aGlzIHdpbGwgYmUgc2V0IHdoZW4gYSBuZXcgY29ubmVjdGlvbiBpcyBlbWl0dGVkIGZyb20gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmFja2VuZC5cbiAgICogICAgICBsZXQgdGV4dDogc3RyaW5nOyAgICAvLyB0aGlzIHdpbGwgYmUgc2V0IGZyb20gbW9jayByZXNwb25zZVxuICAgKiAgICAgIGxldCBpbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZShbXG4gICAqICAgICAgICB7cHJvdmlkZTogQ29ubmVjdGlvbkJhY2tlbmQsIHVzZUNsYXNzOiBNb2NrQmFja2VuZH0sXG4gICAqICAgICAgICB7cHJvdmlkZTogUmVxdWVzdE9wdGlvbnMsIHVzZUNsYXNzOiBCYXNlUmVxdWVzdE9wdGlvbnN9LFxuICAgKiAgICAgICAgSHR0cCxcbiAgICogICAgICBdKTtcbiAgICogICAgICBsZXQgYmFja2VuZCA9IGluamVjdG9yLmdldChDb25uZWN0aW9uQmFja2VuZCk7XG4gICAqICAgICAgbGV0IGh0dHAgPSBpbmplY3Rvci5nZXQoSHR0cCk7XG4gICAqICAgICAgYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoKGM6IE1vY2tDb25uZWN0aW9uKSA9PiBjb25uZWN0aW9uID0gYyk7XG4gICAqICAgICAgaHR0cC5yZXF1ZXN0KCdzb21ldGhpbmcuanNvbicpLnRvUHJvbWlzZSgpLnRoZW4oKHJlczogYW55KSA9PiB0ZXh0ID0gcmVzLnRleHQoKSk7XG4gICAqICAgICAgY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2UobmV3IFJlc3BvbnNlT3B0aW9ucyh7Ym9keTogJ1NvbWV0aGluZyd9KSkpO1xuICAgKiAgICAgIHRpY2soKTtcbiAgICogICAgICBleHBlY3QodGV4dCkudG9CZSgnU29tZXRoaW5nJyk7XG4gICAqICAgIH0pKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgY29ubmVjdGlvbnM6IGFueTsgIC8vPE1vY2tDb25uZWN0aW9uPlxuXG4gIC8qKlxuICAgKiBBbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiBgY29ubmVjdGlvbnNgLiBUaGlzIGFycmF5IHdpbGwgYmUgdXBkYXRlZCB3aXRoIGVhY2ggY29ubmVjdGlvbiB0aGF0XG4gICAqIGlzIGNyZWF0ZWQgYnkgdGhpcyBiYWNrZW5kLlxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIGNvbm5lY3Rpb25zQXJyYXk6IE1vY2tDb25uZWN0aW9uW107XG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSBvZiB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259IGluc3RhbmNlcyB0aGF0IGhhdmVuJ3QgeWV0IGJlZW4gcmVzb2x2ZWQgKGkuZS5cbiAgICogd2l0aCBhIGByZWFkeVN0YXRlYFxuICAgKiBsZXNzIHRoYW4gNCkuIFVzZWQgaW50ZXJuYWxseSB0byB2ZXJpZnkgdGhhdCBubyBjb25uZWN0aW9ucyBhcmUgcGVuZGluZyB2aWEgdGhlXG4gICAqIGB2ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0c2AgbWV0aG9kLlxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHBlbmRpbmdDb25uZWN0aW9uczogYW55OyAgLy8gU3ViamVjdDxNb2NrQ29ubmVjdGlvbj5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uc0FycmF5ID0gW107XG4gICAgdGhpcy5jb25uZWN0aW9ucyA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5jb25uZWN0aW9ucy5zdWJzY3JpYmUoXG4gICAgICAgIChjb25uZWN0aW9uOiBNb2NrQ29ubmVjdGlvbikgPT4gdGhpcy5jb25uZWN0aW9uc0FycmF5LnB1c2goY29ubmVjdGlvbikpO1xuICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgYWxsIGNvbm5lY3Rpb25zLCBhbmQgcmFpc2VzIGFuIGV4Y2VwdGlvbiBpZiBhbnkgY29ubmVjdGlvbiBoYXMgbm90IHJlY2VpdmVkIGEgcmVzcG9uc2UuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHZlcmlmeU5vUGVuZGluZ1JlcXVlc3RzKCkge1xuICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICB0aGlzLnBlbmRpbmdDb25uZWN0aW9ucy5zdWJzY3JpYmUoKGM6IE1vY2tDb25uZWN0aW9uKSA9PiBwZW5kaW5nKyspO1xuICAgIGlmIChwZW5kaW5nID4gMCkgdGhyb3cgbmV3IEVycm9yKGAke3BlbmRpbmd9IHBlbmRpbmcgY29ubmVjdGlvbnMgdG8gYmUgcmVzb2x2ZWRgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW4gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGB2ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0c2AgdG8gcmVzb2x2ZSBhbnkgbm90LXlldC1yZXNvbHZlXG4gICAqIGNvbm5lY3Rpb25zLCBpZiBpdCdzIGV4cGVjdGVkIHRoYXQgdGhlcmUgYXJlIGNvbm5lY3Rpb25zIHRoYXQgaGF2ZSBub3QgeWV0IHJlY2VpdmVkIGEgcmVzcG9uc2UuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHJlc29sdmVBbGxDb25uZWN0aW9ucygpIHsgdGhpcy5jb25uZWN0aW9ucy5zdWJzY3JpYmUoKGM6IE1vY2tDb25uZWN0aW9uKSA9PiBjLnJlYWR5U3RhdGUgPSA0KTsgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHtAbGluayBNb2NrQ29ubmVjdGlvbn0uIFRoaXMgaXMgZXF1aXZhbGVudCB0byBjYWxsaW5nIGBuZXdcbiAgICogTW9ja0Nvbm5lY3Rpb24oKWAsIGV4Y2VwdCB0aGF0IGl0IGFsc28gd2lsbCBlbWl0IHRoZSBuZXcgYENvbm5lY3Rpb25gIHRvIHRoZSBgY29ubmVjdGlvbnNgXG4gICAqIGVtaXR0ZXIgb2YgdGhpcyBgTW9ja0JhY2tlbmRgIGluc3RhbmNlLiBUaGlzIG1ldGhvZCB3aWxsIHVzdWFsbHkgb25seSBiZSB1c2VkIGJ5IHRlc3RzXG4gICAqIGFnYWluc3QgdGhlIGZyYW1ld29yayBpdHNlbGYsIG5vdCBieSBlbmQtdXNlcnMuXG4gICAqL1xuICBjcmVhdGVDb25uZWN0aW9uKHJlcTogUmVxdWVzdCk6IE1vY2tDb25uZWN0aW9uIHtcbiAgICBpZiAoIXJlcSB8fCAhKHJlcSBpbnN0YW5jZW9mIFJlcXVlc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGNyZWF0ZUNvbm5lY3Rpb24gcmVxdWlyZXMgYW4gaW5zdGFuY2Ugb2YgUmVxdWVzdCwgZ290ICR7cmVxfWApO1xuICAgIH1cbiAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IE1vY2tDb25uZWN0aW9uKHJlcSk7XG4gICAgdGhpcy5jb25uZWN0aW9ucy5uZXh0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG59XG4iXX0=