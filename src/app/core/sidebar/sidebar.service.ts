import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { isPointWithinRadius } from "geolib";
import { StateService } from "../state.service";
import { AmenityToggleModel } from "../amenity-toggle.model";
import Feature from "proximiio-js-library/lib/models/feature";

@Injectable({ providedIn: "root" })
export class SidebarService {
  public selectedStartPoi;
  public selectedEndPoi;
  public showRoutePicker = false;
  public showClosestAmenityPicker = false;
  public filteredShop = null; // used to store value from shop-picker component via onAmenityToggle method
  public filteredAmenity = null; // used to store value from amenity-picker component via onAmenityToggle method
  public startPointListener = new Subject<any>();
  public endPointListener = new Subject<any>();
  public accessibleOnlyToggleListener = new Subject<boolean>();
  public amenityToggleListener = new Subject<any>();
  public floorChangeListener = new Subject<string | any>();
  public centerToFeatureListener = new Subject<Feature>();
  public routeToClosestAmenityListener = new Subject<any>();
  public activeListItem: AmenityToggleModel;

  constructor(private stateService: StateService) {}

  getStartPointListener() {
    return this.startPointListener.asObservable();
  }

  getEndPointListener() {
    return this.endPointListener.asObservable();
  }

  getAccessibleOnlyToggleListener() {
    return this.accessibleOnlyToggleListener.asObservable();
  }

  getAmenityToggleListener() {
    return this.amenityToggleListener.asObservable();
  }

  getFloorChangeListener() {
    return this.floorChangeListener.asObservable();
  }

  getCenterToFeatureListener() {
    return this.centerToFeatureListener.asObservable();
  }

  getRouteToClosestAmenityListener() {
    return this.routeToClosestAmenityListener.asObservable();
  }

  // pick up the start point and fire up listener to find route
  onSetStartPoi(poi) {
    this.selectedStartPoi = this.stateService.state.allFeatures.features.find(
      (f) => f.id === poi?.id
    );
    this.startPointListener.next(this.selectedStartPoi);
  }

  // pick up the destination point and fire up listener to find route
  onSetEndPoi(poi) {
    this.selectedEndPoi = this.stateService.state.allFeatures.features.find(
      (f) => f.id === poi?.id
    );
    this.endPointListener.next(this.selectedEndPoi);
  }

  // toggle accessibleRoute and fire up listener to check the route
  onAccessibleRouteToggle() {
    this.stateService.state.accessibleRoute =
      !this.stateService.state.accessibleRoute;
    this.accessibleOnlyToggleListener.next();
  }

  // method responsible for filtering in categories set by setAmenityCategory method
  onAmenityToggle(category: string, amenityId: string | string[]) {
    if (category === "shop") {
      this.filteredShop = this.filteredShop === amenityId ? null : amenityId;
    } else if (category === "amenities") {
      this.filteredAmenity =
        this.filteredAmenity === amenityId ? null : amenityId;
    }
    this.amenityToggleListener.next({ category, amenityId });
  }

  onRouteToClosestAmenity() {
    this.routeToClosestAmenityListener.next();
  }

  // return all pois from map features based on some radius of current place location
  get sortedPOIs() {
    return this.stateService.state.allFeatures.features
      .filter(
        (feature) =>
          feature.properties.usecase === "poi" ||
          feature.properties.type === "poi"
      )
      .sort((a, b) => (a.properties.title > b.properties.title ? -1 : 1))
      .sort((a, b) => (a.properties.level > b.properties.level ? 1 : -1))
      .map((item) => {
        const isInside = isPointWithinRadius(
          {
            lat: item.geometry.coordinates[1],
            lng: item.geometry.coordinates[0],
          },
          {
            lat: this.stateService.state.place.location.lat,
            lng: this.stateService.state.place.location.lng,
          },
          10000
        );
        return {
          ...item,
          icon: this.stateService.state.amenities.filter(
            (amenity) => amenity.id === item.properties.amenity
          )[0]
            ? this.stateService.state.amenities.filter(
                (amenity) => amenity.id === item.properties.amenity
              )[0].icon
            : "",
          category: this.stateService.state.amenities.filter(
            (amenity) => amenity.id === item.properties.amenity
          )[0]
            ? this.stateService.state.amenities.filter(
                (amenity) => amenity.id === item.properties.amenity
              )[0].title
            : "",
          search_query: item.properties.title + " " + item.properties.level,
          coordinates: item.geometry.coordinates,
          isInside,
        };
      })
      .filter((item) => item.isInside);
  }
}
