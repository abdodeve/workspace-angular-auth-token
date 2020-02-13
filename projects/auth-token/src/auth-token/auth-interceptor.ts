import { Injectable, Inject } from "@angular/core";
import { tap } from "rxjs/operators";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { Observable, from } from "rxjs";
// import { environment } from "./../../environments/environment";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private environment;
  constructor(
    @Inject("environment")
    environment
  ) {
    this.environment = environment;
  }
  //function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let tokenNameLocalstorage = this.environment["token-name-localstorage"];
    let tokenNameHeader = this.environment["token-name-header"];
    let token = localStorage.getItem(tokenNameLocalstorage);

    //how to update the request Parameters
    const updatedRequest = request.clone({
      headers: request.headers.set(tokenNameHeader, token)
    });
    console.log("updatedRequest :", updatedRequest);
    //const updatedRequest = request.clone();
    //logging the updated Parameters to browser's console
    console.log("Before making api call : ", updatedRequest);
    return next.handle(request).pipe(
      tap(
        event => {
          //logging the http response to browser's console in case of a success
          if (event instanceof HttpResponse) {
            console.log("api call success :", event);
          }
        },
        error => {
          console.error(error);
          if (error.status === 401) {
            if (error.error.message == "Token is exp") {
              //TODO: Token refreshing
            } else {
              //TODO:
              //Logout from account or do some other stuff
            }
          }
          return Observable.throw(error);
        }
      )
    );
  }
}
