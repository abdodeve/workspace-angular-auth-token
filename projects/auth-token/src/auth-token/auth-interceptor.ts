import { Injectable, Inject } from "@angular/core";
import {
  tap,
  mergeMap,
  flatMap,
  map,
  switchMap,
  catchError
} from "rxjs/operators";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { Observable, from, throwError, BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

// import { environment } from "./../../environments/environment";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private environment;
  private refreshEndpoint: string;
  private token;
  private refreshToken;

  constructor(
    private http: HttpClient,
    @Inject("environment")
    environment
  ) {
    this.environment = environment;
    this.refreshEndpoint = this.environment["refreshtoken-endpoint"];
    this.token = localStorage.getItem("access-token");
    this.refreshToken = localStorage.getItem("refresh-token");
  }
  //function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (this.token) {
            // Add token to header
            request = request.clone({
              headers: request.headers.set(
                "Authorization",
                "Bearer " + this.token
              )
            });
            // Refresh Token AND Retry
            return this.refreshTokenAndRetry(request, next);
          } else {
            console.warn("Token doesn't exist !", "Bearer " + this.token);
            return next.handle(request);
          }
        }
      })
    );
  }

  /**
   * refreshToken
   * Refresh the token after expiration
   * @param token
   * @param request
   * @param next
   */
  refreshTokenAndRetry(request: HttpRequest<any>, next: HttpHandler) {
    return this.http.post(this.refreshEndpoint, {}).pipe(
      switchMap((response: any) => {
        console.log("response", response);
        localStorage.setItem("access-token", response["access-token"]);
        localStorage.setItem("refresh-token", response["refresh-token"]);
        request = request.clone({
          headers: request.headers.set(
            "Authorization",
            "Bearer " + response["refresh-token"]
          )
        });
        return next.handle(request);
      })
    );
  }
}
