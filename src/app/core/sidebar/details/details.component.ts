import { Component, OnDestroy, OnInit } from "@angular/core";
import { SidebarService } from "../sidebar.service";
import { StateService } from "../../state.service";
import { Observable, Subscription } from "rxjs";
import Feature from "proximiio-js-library/lib/models/feature";
import * as Settings from "../../../../../settings";
import * as humanizeDuration from "humanize-duration";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { MapService } from "src/app/map/map.service";
import { map, startWith, tap } from "rxjs/operators";
import * as turf from "@turf/turf";
import { FeatureCollection, Point } from "@turf/turf";
import { FloorModel } from "proximiio-js-library/lib/models/floor";

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
  destinationLevel?: number;
  stepsUntil?: StepModel[];
  totalDistance?: number;
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
  startPoiId: string;
  parkingAmenityId = this.stateService.state.parkingAmenityId;
  entrancePoiId = this.stateService.state.entranceFeatureId;
  closestParkingFeature: Feature;
  qrCodeUrl: string;
  linkUrl: string;
  routeType: "accessible" | "fastest";
  currentStep = 0;
  private destinationFromUrl = false;
  private subs: Subscription[] = [];

  constructor(
    private sidebarService: SidebarService,
    public mapService: MapService,
    public stateService: StateService,
    private translateService: TranslateService
  ) {
    const urlParams = new URLSearchParams(window.location.search);
    const destinationParam = urlParams.get("destinationFeature");

    this.poi = this.sidebarService.selectedEndPoi;
    this.routeType =
      this.stateService.state.accessibleRoute === true
        ? "accessible"
        : "fastest";

    if (destinationParam) {
      this.destinationFromUrl = true;
    }
  }

  ngOnInit() {
    this.subs.push(
      this.sidebarService.getEndPointListener().subscribe((poi) => {
        /*this.haveRouteDetails = this.stateService.state.kioskMode
          ? this.destinationFromUrl
          : false;
        this.mapService.showingRoute = this.haveRouteDetails;*/
        this.details = defaultDetails;
        this.linkUrl = null;
        this.steps =
          this.stateService.state.kioskMode && this.destinationFromUrl
            ? this.steps
            : [];
        if (poi) {
          this.definePoi(poi);
        } else {
          this.haveRouteDetails = false;
          this.mapService.showingRoute = this.haveRouteDetails;
          this.currentStep = 0;
        }
        this.destinationFromUrl = false;
      }),
      this.sidebarService.getAccessibleOnlyToggleListener().subscribe(() => {
        setTimeout(() => {
          this.currentStep = 0;
          this.routeType =
            this.stateService.state.accessibleRoute === true
              ? "accessible"
              : "fastest";
        });
      }),
      this.sidebarService.getStepChangeListener().subscribe((step) => {
        this.currentStep = step;
      }),
      this.mapService.getRouteFoundListener().subscribe((found) => {
        if (found && this.stateService.state.textNavigation) {
          if (!this.poi) {
            this.definePoi(this.stateService.state.textNavigation.destination);
          }
          this.buildNavigationSteps(
            this.stateService.state.textNavigation.steps
          );
          this.distanceInMeters = this.stateService.state.routeDetails.distance
            ? this.stateService.state.routeDetails.distance
            : this.stateService.state.textNavigation.distanceMeters;
          this.distanceInMinutes = humanizeDuration(
            this.stateService.state.routeDetails.duration.realistic * 1000,
            {
              delimiter: ` ${this.translateService.instant("and")} `,
              round: true,
              language: this.currentLanguage,
            }
          );
          this.haveRouteDetails = true;
          this.mapService.showingRoute = this.haveRouteDetails;
          this.generateQrCode(
            this.sidebarService.selectedEndPoi,
            this.sidebarService.selectedStartPoi
          );
        }
      }),
      this.mapService.getMapReadyListener().subscribe((ready) => {
        if (ready) {
          this.setStartPoi();
        }
      }),
      this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
        this.currentLanguage = event.lang;
        if (this.poi) {
          this.definePoi(this.poi);
          this.distanceInMinutes = humanizeDuration(
            this.stateService.state.routeDetails.duration.realistic * 1000,
            { delimiter: " and ", round: true, language: this.currentLanguage }
          );
          this.buildNavigationSteps(
            this.stateService.state.textNavigation.steps
          );
        }
      })
    );
  }

  onDetailsClose() {
    //this.startPoiId = null;
    //this.setStartPoi();
    this.sidebarService.onSetStartPoi(null);
    this.sidebarService.onSetEndPoi(null);
    this.poi = null;
    this.details = defaultDetails;
    if (this.sidebarService.filteredAmenity) {
      this.sidebarService.onAmenityToggle(
        "amenities",
        this.sidebarService.filteredAmenity
      );
      this.sidebarService.showClosestAmenityPicker = false;
      this.sidebarService.activeListItem = null;
    }
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
    let previousIndex = 0;
    this.steps = steps
      .filter((i, index, array) => {
        // Get the first part of the direction string
        const direction = i.direction.split("_")[0];
        // Check if the current step is a level changer and has a valid direction or is finish
        if (
          (i.levelChangerId && (direction === "UP" || direction === "DOWN")) ||
          i.direction === "FINISH"
        ) {
          i.stepsUntil = array.slice(previousIndex, index);
          previousIndex = index + 1;
          return i;
        }
      })
      .map((step) => {
        const direction = step.direction.split("_")[0]
          ? step.direction.split("_")[0]
          : step.direction;
        const levelChangerType = step.direction.split("_")[1];
        const destinationFloor = this.stateService.state.floors.filter(
          (f) => f.level === step.destinationLevel
        )
          ? this.stateService.state.floors.filter(
              (f) => f.level === step.destinationLevel
            )[0]
          : this.stateService.state.floor;

        const stepsUntilDistance = step.stepsUntil.reduce(
          (total, item) => total + item.distanceFromLastStep,
          0
        );
        const totalDistance = step.distanceFromLastStep + stepsUntilDistance;

        let description;
        if (direction === "FINISH") {
          description =
            this.currentLanguage === "fi"
              ? `${this.translateService.instant("you-will-arrive")} ${
                  totalDistance | 0
                }m ${this.translateService.instant("in")}.`
              : `${this.translateService.instant("in")} ${
                  totalDistance | 0
                }m ${this.translateService.instant("you-will-arrive")}.`;
        } else {
          description = `${this.translateService.instant("go")} ${
            totalDistance | 0
          }m ${this.translateService.instant(
            "and-take-the"
          )} ${this.translateService.instant(
            levelChangerType
          )} ${this.translateService.instant(
            direction
          )} ${this.translateService.instant("TO_FLOOR")} ${
            destinationFloor.name
              ? this.getFloorName(destinationFloor)
              : step.destinationLevel
          }.`;
        }

        return {
          totalDistance,
          description,
          destinationFloor,
          ...step,
        };
      });
  }

  onNextStep() {
    const lastStepIndex = this.steps.length - 1;

    if (this.currentStep !== lastStepIndex) {
      // const step = this.steps[this.currentStep];
      // this.sidebarService.floorChangeListener.next(step.destinationFloor);
      this.currentStep++;
      this.sidebarService.stepChangeListener.next(this.currentStep);
    } else {
      /*const firstStep = this.stateService.state.textNavigation.steps[0];
      const startFloor = this.stateService.state.floors.find(
        (floor) => floor.level === firstStep.level
      );
      this.sidebarService.floorChangeListener.next(startFloor);*/
      this.currentStep = 0;
      this.sidebarService.stepChangeListener.next(this.currentStep);
    }
  }

  setStartPoi() {
    if (!this.stateService.state.kioskMode) {
      const startPoi = this.sidebarService.sortedPOIs.find(
        (i) => i.id === this.stateService.state.startPoiId
      );
      if (startPoi) {
        this.stateService.state = { ...this.stateService.state, startPoi };
        this.stateService.state.defaultLocation.coordinates =
          startPoi.coordinates;
        this.stateService.state.defaultLocation.level =
          startPoi.properties.level;
        this.sidebarService.onSetStartPoi(startPoi);
      }
    }
  }

  onShowRoute() {
    this.mapService.showRouteListener.next();
  }

  definePoi(poi) {
    this.poi = poi;
    if (!this.poi.properties._dynamic) this.poi.properties._dynamic = {};
    if (!this.poi.geometry.type) this.poi.geometry.type = "Point";
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
      this.details = this.poi.properties.description_i18n[this.currentLanguage]
        ? this.poi.properties.description_i18n[this.currentLanguage]
        : this.poi.properties.description_i18n.en;
    }
    this.getClosestParking();
    this.getUrl();
    if (this.stateService.state.textNavigation?.steps) {
      this.buildNavigationSteps(this.stateService.state.textNavigation.steps);
    }
  }

  getClosestParking() {
    let sameLevelParking = {
      type: "FeatureCollection",
      features: this.stateService.state.allFeatures.features.filter(
        (i) =>
          i.properties.amenity === this.parkingAmenityId &&
          i.geometry.type === "Point" &&
          i.properties.level === this.poi.properties.level
      ),
    } as FeatureCollection<Point, { [name: string]: any }>;
    let allLevelParking = {
      type: "FeatureCollection",
      features: this.stateService.state.allFeatures.features.filter(
        (i) =>
          i.properties.amenity === this.parkingAmenityId &&
          i.geometry.type === "Point"
      ),
    } as FeatureCollection<Point, { [name: string]: any }>;
    if (this.stateService.state.defaultPlaceId) {
      sameLevelParking.features = sameLevelParking.features.filter(
        (i) => i.properties.place_id === this.stateService.state.defaultPlaceId
      );
      allLevelParking.features = allLevelParking.features.filter(
        (i) => i.properties.place_id === this.stateService.state.defaultPlaceId
      );
    }
    const targetPoint = turf.point(this.poi.geometry.coordinates);
    if (allLevelParking.features.length > 0) {
      this.closestParkingFeature = turf.nearestPoint(
        targetPoint,
        sameLevelParking.features.length > 0
          ? sameLevelParking
          : allLevelParking
      ) as Feature;
      this.closestParkingFeature.properties.title =
        this.closestParkingFeature.properties.title_i18n &&
        this.closestParkingFeature.properties.title_i18n[this.currentLanguage]
          ? this.closestParkingFeature.properties.title_i18n[
              this.currentLanguage
            ]
          : this.closestParkingFeature.properties.title;
    }
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
    const url =
      typeof this.poi.properties.url === "undefined"
        ? typeof this.poi.properties.metadata !== "undefined"
          ? this.poi.properties.metadata.url
          : "yolo"
        : this.poi.properties.url;
    if (url) {
      let protocol = url.startsWith("http://") ? 1 : 0;
      if (protocol === 0) protocol = url.startsWith("https://") ? 2 : 0;
      this.linkUrl = protocol === 0 ? `http://${url}` : url;
    }
  }

  getFloorName(floor: FloorModel) {
    return this.sidebarService.getFloorName(floor, this.currentLanguage);
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
