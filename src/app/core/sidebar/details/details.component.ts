import { Component, OnDestroy, OnInit } from "@angular/core";
import { SidebarService } from "../sidebar.service";
import { StateService } from "../../state.service";
import { Subscription } from "rxjs";
import Feature from "proximiio-js-library/lib/models/feature";
import * as Settings from "../../../../../settings";
import * as humanizeDuration from "humanize-duration";
import { TranslateService } from "@ngx-translate/core";
import { MapService } from "src/app/map/map.service";

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
  private subs: Subscription[] = [];

  constructor(
    public sidebarService: SidebarService,
    public mapService: MapService,
    public stateService: StateService,
    private translateService: TranslateService
  ) {
    this.poi = this.sidebarService.selectedEndPoi;
    this.currentLanguage = this.translateService.currentLang;
  }

  ngOnInit() {
    this.subs.push(
      this.sidebarService.getEndPointListener().subscribe((poi) => {
        this.haveRouteDetails = false;
        this.details = defaultDetails;
        this.steps = [];
        if (poi) {
          this.poi = poi;
          this.poi.properties.title =
            this.poi.properties.title_i18n &&
            this.poi.properties.title_i18n[this.currentLanguage]
              ? this.poi.properties.title_i18n[this.currentLanguage]
              : this.poi.properties.title;
          if (
            this.poi.properties.wayfinding_metadata &&
            this.poi.properties.wayfinding_metadata["1"]
          ) {
            this.details = this.poi.properties.wayfinding_metadata["1"][
              this.currentLanguage
            ]
              ? this.poi.properties.wayfinding_metadata["1"][
                  this.currentLanguage
                ]
              : this.poi.properties.wayfinding_metadata["1"].en;
          }
        }
      }),
      this.mapService.getRouteFoundListener().subscribe((found) => {
        if (found && this.stateService.state.textNavigation) {
          this.buildNavigationSteps(
            this.stateService.state.textNavigation.steps
          );
          this.distanceInMeters = this.stateService.state.routeDetails.distance
            ? this.stateService.state.routeDetails.distance
            : this.stateService.state.textNavigation.distanceMeters;
          this.distanceInMinutes = humanizeDuration(
            this.stateService.state.routeDetails.duration ?
            this.stateService.state.routeDetails.duration.realistic * 1000 :
            (this.distanceInMeters / 1000 / this.averageWalkSpeed) * 3600000,
            { delimiter: " and ", round: true, language: this.currentLanguage }
          );
          this.haveRouteDetails = true;
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

  onShowRoute() {
    this.mapService.showRouteListener.next();
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
