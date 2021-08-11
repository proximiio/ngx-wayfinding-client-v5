import { Component, OnInit } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import Fingerprint2 from 'fingerprintjs2';
import ahoy from 'ahoy.js';
import { environment } from '../environments/environment';
import * as Settings from '../../settings';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoading = false;
  theme$ = 'custom-theme';
  fingerprint;
  sendAnalytics = true;

  constructor(
    overlayContainer: OverlayContainer
  ) {
    overlayContainer.getContainerElement().classList.add(this.theme$);
  }

  ngOnInit(): void {
    this.startAhoyTracking();
  }

  startAhoyTracking() {
    if (this.sendAnalytics) {
      const options = {
        excludes: {
          canvas: true,
          webgl: true
        }
      };
      Fingerprint2.get(options, (fingerprint) => {
        this.fingerprint = fingerprint;
        ahoy.configure({
          urlPrefix: '',
          visitsUrl: `${environment.ahoyUrl}/ahoy/visits`,
          eventsUrl: `${environment.ahoyUrl}/ahoy/events`,
          page: null,
          platform: 'Web',
          useBeacon: true,
          startOnReady: true,
          trackVisits: true,
          cookies: true,
          cookieDomain: null,
          headers: {'Authorization': `Bearer ${Settings.token}`},
          visitParams: {fingerprint: fingerprint},
          withCredentials: false
        });
        ahoy.trackAll();
      });
    }
  }
}
