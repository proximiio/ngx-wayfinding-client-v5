import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const AUTH_URL = environment.authUrl;

@Injectable({providedIn: 'root'})
export class SidebarService {
  public appDrawer: any;
  public sidenavMode = 'side';
  public sidebarStatus = new Subject<boolean>();
  public startPointListener = new Subject<any>();
  public endPointListener = new Subject<any>();
  public selectedPlaceListener = new Subject<any>();
  public accessibleOnlyToggleListener = new Subject<boolean>();

  constructor(
    private http: HttpClient
  ) {}

  public closeSidebar() {
    this.appDrawer.close();
    this.sidebarStatus.next(this.appDrawer.opened);
  }

  public openSidebar() {
    this.appDrawer.open();
    this.sidebarStatus.next(this.appDrawer.opened);
  }

  public toggleSidebar() {
    this.appDrawer.toggle();
    this.sidebarStatus.next(this.appDrawer.opened);
  }

  public ewqSearch(ean: string) {
    const params = new HttpParams().append('ean', ean);
    return this.http.get(
      AUTH_URL + '/ewqSearch',
      { params }
    )
  }

  getSidebarStatusListener() {
    return this.sidebarStatus.asObservable();
  }

  getStartPointListener() {
    return this.startPointListener.asObservable();
  }

  getEndPointListener() {
    return this.endPointListener.asObservable();
  }

  getSelectedPlaceListener() {
    return this.selectedPlaceListener.asObservable();
  }

  getAccessibleOnlyToggleListener() {
    return this.accessibleOnlyToggleListener.asObservable();
  }
}
