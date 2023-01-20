import { Component, OnDestroy, OnInit } from "@angular/core";
import { SidebarService } from "../sidebar.service";
import { StateService } from "../../state.service";
import { Observable, Subscription } from "rxjs";
import Feature from "proximiio-js-library/lib/models/feature";
import * as Settings from "../../../../../settings";
import * as humanizeDuration from "humanize-duration";
import { TranslateService } from "@ngx-translate/core";
import { MapService } from "src/app/map/map.service";
import { FormBuilder, Validators } from "@angular/forms";
import { map, startWith, tap } from "rxjs/operators";
import * as turf from "@turf/turf";
import { FeatureCollection, Point } from "@turf/turf";

const defaultDetails =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

interface StepModel {
  bearingFromLastStep: number;
  coordinates: { coordinates: [number, number] };
  direction: string;
  distanceFromLastStep: number;
  instruction?: string[];
  isWaypoint: boolean;
  level: number;
  levelChangerId: string;
  lineStringFeatureFromLastStep: Feature;
  waypointId: string;
}

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"],
})
export class DetailsComponent implements OnInit, OnDestroy {
  sidebarOpened = false;
  poi;
  showInstructions = false;
  steps = [];
  details = defaultDetails;
  limit = 200;
  showingMore = false;
  distanceInMeters;
  distanceInMinutes;
  averageWalkSpeed = 4.5; // km/h
  haveRouteDetails = false;
  currentLanguage: string;
  options: any[] = [];
  filteredOptions: Observable<any[]>;
  startPoiForm = this.fb.group({
    startPoi: [this.stateService.state.startPoi, Validators.required],
  });
  startPoiId: string;
  parkingAmenityId =
    "75698d35-0918-4a2b-a8ab-77b93a618e61:21a6d59b-fe0d-46ff-890e-477577d592f7";
  entrancePoiId =
    "75698d35-0918-4a2b-a8ab-77b93a618e61:52c53790-2acf-4271-8a32-4b1c99b3227a";
  closestParkingFeature: Feature;
  qrCodeUrl: string;
  linkUrl: string;
  private destinationFromUrl = false;
  private subs: Subscription[] = [];

  constructor(
    public sidebarService: SidebarService,
    public mapService: MapService,
    public stateService: StateService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {
    const urlParams = new URLSearchParams(window.location.search);
    const destinationParam = urlParams.get("destinationFeature");

    this.poi = this.sidebarService.selectedEndPoi;
    this.currentLanguage = this.translateService.currentLang;

    if (destinationParam) {
      this.destinationFromUrl = true;
    }
  }

  ngOnInit() {
    this.subs.push(
      this.sidebarService.getEndPointListener().subscribe((poi) => {
        // this.haveRouteDetails = this.destinationFromUrl;
        this.details = defaultDetails;
        this.linkUrl = null;
        // this.steps = this.destinationFromUrl ? this.steps : [];
        if (poi) {
          this.poi = poi;
          this.poi.properties.title =
            this.poi.properties.title_i18n &&
            this.poi.properties.title_i18n[this.currentLanguage]
              ? this.poi.properties.title_i18n[this.currentLanguage]
              : this.poi.properties.title;
          this.poi.properties._dynamic.floor = this.poi.properties.floor_id
            ? this.stateService.state.floors.find(
                (i) => i.id === this.poi.properties.floor_id
              )
            : null;
          if (this.poi.properties.description_i18n) {
            this.details = this.poi.properties.description_i18n[
              this.currentLanguage
            ]
              ? this.poi.properties.description_i18n[this.currentLanguage]
              : this.poi.properties.description_i18n.en;
          }
          this.getClosestParking();
          this.getUrl();
        }
        this.destinationFromUrl = false;
      }),
      this.mapService.getRouteFoundListener().subscribe((found) => {
        if (found && this.stateService.state.textNavigation) {
          this.buildNavigationSteps(
            this.stateService.state.textNavigation.steps
          );
          this.distanceInMeters =
            this.stateService.state.textNavigation.distanceMeters;
          this.distanceInMinutes = humanizeDuration(
            (this.distanceInMeters / 1000 / this.averageWalkSpeed) * 3600000,
            { delimiter: " and ", round: true, language: this.currentLanguage }
          );
          this.haveRouteDetails = true;
          this.generateQrCode(
            this.sidebarService.selectedEndPoi,
            this.sidebarService.selectedStartPoi
          );
        }
      }),
      this.mapService.getMapReadyListener().subscribe((ready) => {
        if (ready) {
          this.filteredOptions = this.startPoiForm
            .get("startPoi")
            .valueChanges.pipe(
              startWith(""),
              map((value) =>
                typeof value === "string" ? value : value.properties.title
              ),
              map((title) =>
                title ? this._filter(title) : this.options.slice()
              )
            );
          this.options = this.sidebarService.sortedPOIs;
          this.setStartPoi();
        }
      })
    );
  }

  onDetailsClose() {
    this.sidebarService.onSetEndPoi(null);
    this.details = defaultDetails;
  }

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  toggleAccessibleRoute() {
    this.sidebarService.onAccessibleRouteToggle();
  }

  getImageUrl() {
    return `https://api.proximi.fi/v5/geo/${this.poi.properties.images[0]}?token=${Settings.token}`;
  }

  getOpenHours() {
    const d = new Date();
    const weekDay = d.getDay();

    if (
      this.poi.properties.metadata &&
      this.poi.properties.metadata.openHours &&
      this.poi.properties.metadata.openHours[weekDay].en
    ) {
      return this.poi.properties.metadata.openHours[weekDay][
        this.currentLanguage
      ]
        ? this.poi.properties.metadata.openHours[weekDay][this.currentLanguage]
        : this.poi.properties.metadata.openHours[weekDay].en;
    } else {
      return this.translateService.instant("noOpenHours");
    }
  }

  buildNavigationSteps(steps: StepModel[]) {
    steps = steps.filter((i) => i.instruction);
    this.steps = steps.map((step: StepModel) => {
      let directionIcon;
      let stepIcon;
      switch (step.direction) {
        case "LEFT": {
          directionIcon = "arrow-left";
          stepIcon = "shoe-prints";
          break;
        }
        case "SLIGHT_LEFT": {
          directionIcon = "arrow-left";
          stepIcon = "shoe-prints";
          break;
        }
        case "RIGHT": {
          directionIcon = "arrow-right";
          stepIcon = "shoe-prints";
          break;
        }
        case "SLIGHT_RIGHT": {
          directionIcon = "arrow-right";
          stepIcon = "shoe-prints";
          break;
        }
        case "UP_ESCALATOR": {
          directionIcon = "arrow-up";
          stepIcon = "caret-square-up";
          break;
        }
        case "DOWN_ESCALATOR": {
          directionIcon = "arrow-up";
          stepIcon = "caret-square-down";
          break;
        }
        case "FINISH": {
          directionIcon = "arrow-up";
          stepIcon = "pennant";
          break;
        }
        default: {
          directionIcon = "compass";
          stepIcon = "shoe-prints";
          break;
        }
      }
      return {
        description: step.instruction.join(""),
        directionIcon: ["fal", directionIcon],
        stepIcon: ["fal", stepIcon],
      };
    });
  }

  onStartPoiSelect(e) {
    this.startPoiId = e.option.value.id;
    this.stateService.state = {
      ...this.stateService.state,
      startPoiId: this.startPoiId,
    };
    this.setStartPoi();
  }

  setStartPoi() {
    if (!this.stateService.state.kioskMode) {
      const startPoi = this.sidebarService.sortedPOIs.find(
        (i) => i.id === this.stateService.state.startPoiId
      );
      if (startPoi) {
        this.startPoiForm.get("startPoi").setValue(startPoi);
        this.stateService.state = { ...this.stateService.state, startPoi };
        this.stateService.state.defaultLocation.coordinates =
          startPoi.coordinates;
        this.stateService.state.defaultLocation.level =
          startPoi.properties.level;
        this.sidebarService.onSetStartPoi(startPoi);
      }
    }
  }

  displayFn(poi: any): string {
    return poi && poi.properties && poi.properties.title
      ? `${poi.properties.title} - Floor: ${poi.properties.level}`
      : "";
  }

  private _filter(title: string): any[] {
    const filterValue = title.toLowerCase();

    return this.options.filter((option) =>
      option.properties.title.toLowerCase().includes(filterValue)
    );
  }

  onShowRoute() {
    this.mapService.showRouteListener.next();
  }

  getClosestParking() {
    const featureCollection = {
      type: "FeatureCollection",
      features: this.stateService.state.allFeatures.features.filter(
        (i) =>
          i.properties.amenity === this.parkingAmenityId &&
          i.geometry.type === "Point"
      ),
    } as FeatureCollection<Point, { [name: string]: any }>;
    this.closestParkingFeature = turf.nearestPoint(
      this.poi,
      featureCollection
    ) as Feature;
    this.closestParkingFeature.properties.title =
      this.closestParkingFeature.properties.title_i18n &&
      this.closestParkingFeature.properties.title_i18n[this.currentLanguage]
        ? this.closestParkingFeature.properties.title_i18n[this.currentLanguage]
        : this.closestParkingFeature.properties.title;
  }

  onRouteFromParking() {
    this.sidebarService.onSetStartPoi(this.closestParkingFeature);
  }

  onRouteFromEntrance() {
    this.sidebarService.onSetStartPoi(
      this.stateService.state.allFeatures.features.find(
        (i) => i.id === this.entrancePoiId
      )
    );
  }

  onOtherRoute() {
    this.sidebarService.showRoutePicker = true;
  }

  onCenterToParking() {
    this.sidebarService.centerToFeatureListener.next(
      this.closestParkingFeature
    );
  }

  generateQrCode(destination: Feature, start?: Feature) {
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    if (!start && destination) {
      urlParams.set("destinationFeature", destination.properties.id);
    }
    if (destination && start) {
      urlParams.set("destinationFeature", destination.properties.id);
      urlParams.set("startFeature", start.properties.id);
    }
    this.qrCodeUrl = url.href;
  }

  getUrl() {
    const url = this.poi.properties.metadata.url;
    if (url) {
      let protocol = url.startsWith("http://") ? 1 : 0;
      if (protocol === 0) protocol = url.startsWith("https://") ? 2 : 0;
      this.linkUrl = protocol === 0 ? `http://${url}` : url;
    }
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
