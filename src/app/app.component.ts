import { Component, OnInit } from "@angular/core";
import { OverlayContainer } from "@angular/cdk/overlay";
import Fingerprint2 from "fingerprintjs2";
import ahoy from "ahoy.js";
import { environment } from "../environments/environment";
import * as Settings from "../../settings";
import { TranslateService } from "@ngx-translate/core";
import { MapService } from "./map/map.service";
import { StateService } from "./core/state.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  isLoading = false;
  theme$ = "custom-theme";
  fingerprint;
  sendAnalytics = true;

  constructor(
    overlayContainer: OverlayContainer,
    public translate: TranslateService,
    private mapService: MapService,
    private stateService: StateService
  ) {
    const urlParams = new URLSearchParams(window.location.search);

    overlayContainer.getContainerElement().classList.add(this.theme$);

    this.stateService.state.kioskMode = !!urlParams.get("kiosk");

    let langFromUrl = window.document.URL.split("/").pop();
    if (
      langFromUrl !== "en" &&
      langFromUrl !== "fi" &&
      langFromUrl !== "ar" &&
      langFromUrl !== "it"
    ) {
      langFromUrl = urlParams.get("lang");
    }
    translate.addLangs(["en", "fi", "ar", "it"]);
    translate.setDefaultLang(langFromUrl ? langFromUrl : "en");
    translate.use(langFromUrl ? langFromUrl : "en");
  }

  ngOnInit(): void {
    this.startAhoyTracking();
    if (this.stateService.state.kioskMode) {
      this.idleTime();
    }
  }

  idleTime() {
    let t;

    const resetView = () => {
      this.mapService.resetViewListener.next(true);
    };

    const resetTimer = () => {
      clearTimeout(t);
      t = setTimeout(resetView, 1 * 60000); // 1 minute
    };

    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer; // catches touchscreen presses as well
    window.ontouchstart = resetTimer; // catches touchscreen swipes as well
    window.ontouchmove = resetTimer; // required by some devices
    window.onclick = resetTimer; // catches touchpad clicks as well
    window.onkeydown = resetTimer;
    window.addEventListener("scroll", resetTimer, true); // improved; see comments
  }

  startAhoyTracking() {
    if (this.sendAnalytics) {
      const options = {
        excludes: {
          canvas: true,
          webgl: true,
        },
      };
      Fingerprint2.get(options, (fingerprint) => {
        this.fingerprint = fingerprint;
        ahoy.configure({
          urlPrefix: "",
          visitsUrl: `${environment.ahoyUrl}/ahoy/visits`,
          eventsUrl: `${environment.ahoyUrl}/ahoy/events`,
          page: null,
          platform: "Web",
          useBeacon: true,
          startOnReady: true,
          trackVisits: true,
          cookies: true,
          cookieDomain: null,
          headers: { Authorization: `Bearer ${Settings.token}` },
          visitParams: { fingerprint: fingerprint },
          withCredentials: false,
        });
        ahoy.trackAll();
      });
    }
  }
}
