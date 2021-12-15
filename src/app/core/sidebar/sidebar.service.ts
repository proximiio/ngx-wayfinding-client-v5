import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { isPointWithinRadius } from 'geolib';
import { StateService } from '../state.service';

@Injectable({providedIn: 'root'})
export class SidebarService {
  public selectedEndPoi;
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
    private stateService: StateService
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
    this.selectedEndPoi = this.stateService.state.allFeatures.features.find(f => f.id === poi?.id);
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
    this.amenityToggleListener.next({category, amenityId});
  }

  get sortedPOIs() {
    return this.stateService.state.allFeatures.features
      .filter(feature => feature.properties.usecase === 'poi')
      .sort((a, b) => a.properties.title > b.properties.title ? -1 : 1)
      .sort((a, b) => a.properties.level > b.properties.level ? 1 : -1)
      .map(item => {
        const isInside = isPointWithinRadius(
          {lat: item.geometry.coordinates[1], lng: item.geometry.coordinates[0]},
          {lat: this.stateService.state.place.location.lat, lng: this.stateService.state.place.location.lng},
          10000
        );
        return {
          ...item,
          icon: this.stateService.state.amenities.filter(amenity => amenity.id === item.properties.amenity)[0] ? this.stateService.state.amenities.filter(amenity => amenity.id === item.properties.amenity)[0].icon : '',
          category: this.stateService.state.amenities.filter(amenity => amenity.id === item.properties.amenity)[0] ? this.stateService.state.amenities.filter(amenity => amenity.id === item.properties.amenity)[0].title : '',
          search_query: item.properties.title + ' ' + item.properties.level,
          coordinates: item.geometry.coordinates,
          isInside
        };
      })
      .filter(item => item.isInside);
  }
}
