import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AmenityToggleModel } from '../amenity-toggle.model';
import { AuthService } from '../../auth/auth.service';
import { isPointWithinRadius } from 'geolib';
import Floor from '../../map/models/floor.model';
import { StateService } from '../state.service';
import Feature from '../../map/models/feature.model';

@Injectable({providedIn: 'root'})
export class SidebarService {
  public currentUser;
  public config;
  public currentUserData;
  public selectedPlace;
  public defaultFloorLevel = 0;
  public features;
  public filteredFeatures;
  public amenities;
  public onlyAccessible;
  public selectedEndPoi;
  public endPointLabel = 'Etsi kartalta';
  public startPointLabel = 'Where are you now?';
  public placeSelectorLabel = 'Pick up a place';
  public filteredShop = null;
  public filteredAmenity = null;
  public filteredArray: string[] = [];
  public sidebarStatus = new Subject<boolean>();
  public startPointListener = new Subject<any>();
  public endPointListener = new Subject<any>();
  public selectedPlaceListener = new Subject<any>();
  public accessibleOnlyToggleListener = new Subject<boolean>();
  public amenityToggleListener = new Subject<any>();
  public floorChangeListener = new Subject<string | any>();

  constructor(
    private stateService: StateService,
    private authService: AuthService
  ) {}

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

  getAmenityToggleListener() {
    return this.amenityToggleListener.asObservable();
  }

  getFloorChangeListener() {
    return this.floorChangeListener.asObservable();
  }

  onSetEndPoi(poi) {
    this.selectedEndPoi = this.features.features.find(f => f.id === poi?.id);
    this.endPointListener.next(this.selectedEndPoi);
  }

  onAccessibleRouteToggle() {
    this.stateService.state.accessibleRoute = !this.stateService.state.accessibleRoute;
    this.accessibleOnlyToggleListener.next();
  }

  onAmenityToggle(category: string, amenityId: string) {
    if (category === 'shop') {
      this.filteredShop = this.filteredShop === amenityId ? null : amenityId;
    } else if (category === 'amenities') {
      this.filteredAmenity = this.filteredAmenity === amenityId ? null : amenityId;
    }
    /*this.filteredArray = [this.filteredShop ? this.filteredShop.id : 'undefined', this.filteredAmenity ? this.filteredAmenity.id : 'undefined2'];
    this.amenityToggleListener.next(this.filteredArray);*/
    this.amenityToggleListener.next({category, amenityId});
  }

  get sortedPOIs() {
    this.currentUser = this.authService.getCurrentUser();
    this.config = this.authService.getCurrentUserConfig();
    this.currentUserData = this.authService.getCurrentUserData();
    this.selectedPlace = this.currentUserData.defaultPlace;
    this.features = this.currentUserData.features;
    this.filteredFeatures = [...this.currentUserData.features.features];
    this.amenities = this.currentUserData.amenities;
    this.onlyAccessible = this.config.accessible_only ? this.config.accessible_only : false;

    return this.filteredFeatures
      .filter(feature => feature.properties.usecase === 'poi')
      .sort((a, b) => a.properties.title > b.properties.title ? -1 : 1)
      .sort((a, b) => a.properties.level > b.properties.level ? 1 : -1)
      .map(item => {
        const isInside = isPointWithinRadius(
          {lat: item.geometry.coordinates[1], lng: item.geometry.coordinates[0]},
          {lat: this.selectedPlace.location.lat, lng: this.selectedPlace.location.lng},
          10000
        );
        return {
          ...item,
          icon: this.amenities.filter(amenity => amenity.id === item.properties.amenity)[0] ? this.amenities.filter(amenity => amenity.id === item.properties.amenity)[0].icon : '',
          category: this.amenities.filter(amenity => amenity.id === item.properties.amenity)[0] ? this.amenities.filter(amenity => amenity.id === item.properties.amenity)[0].title : '',
          search_query: item.properties.title + ' ' + item.properties.level,
          coordinates: item.geometry.coordinates,
          isInside
        };
      })
      .filter(item => item.isInside);
  }
}
