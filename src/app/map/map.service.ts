import { Injectable } from '@angular/core';
import { Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class MapService {
  public mapReady = false;
  public routeFoundListener = new Subject<boolean>();
  public showRouteListener = new Subject();
  public mapReadyListener = new Subject<boolean>();
  public resetViewListener = new Subject<boolean>();

  constructor() {}
  getRouteFoundListener() {
    return this.routeFoundListener.asObservable();
  }

  getMapReadyListener() {
    return this.mapReadyListener.asObservable();
  }

  getShowRouteListener() {
    return this.showRouteListener.asObservable();
  }

  getResetViewListener() {
    return this.resetViewListener.asObservable();
  }
}
