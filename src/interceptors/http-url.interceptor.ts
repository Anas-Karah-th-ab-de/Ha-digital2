import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpUrlInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let apiReq = req;

    // Check if the request is for the specific domain and should be converted to HTTP
    if (req.url.includes('kmapp.prestigepromotion.de')) {
      const httpUrl = req.url.replace('https://kmapp.prestigepromotion.de', 'http://kmapp.prestigepromotion.de');
      apiReq = req.clone({ url: httpUrl });
    }

    return next.handle(apiReq);
  }
}
