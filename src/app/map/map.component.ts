import { Component, OnDestroy, OnInit } from '@angular/core';
import Proximiio from 'proximiio-js-library'
import * as Settings from '../../../settings';
import * as mapboxgl from 'mapbox-gl';
import { StateService } from '../core/state.service';
import { SettingsDialogComponent } from '../core/settings-dialog/settings-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SidebarService } from '../core/sidebar/sidebar.service';
import { Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { PaddingOptions } from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  public mapLoaded = false;
  private mapPadding: PaddingOptions = { top: 250, bottom:250, left: 500, right: 250 };
  private map;
  private endPoi;
  private subs: Subscription[] = [];

  constructor(
    private sidebarService: SidebarService,
    private stateService: StateService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {
    this.subs.push(
      // we subscribe for end point listener events here
      this.sidebarService.getEndPointListener().subscribe(poi => {
        this.endPoi = poi;
        if (this.map) {
          if (poi) {
            // if map is loaded and the poi is not null in listener event, tell map to find a route
            this.map.findRouteByIds(poi.id, null, this.stateService.state.accessibleRoute);
          } else {
            // otherwise cancel route if it's rendered and return me to default location
            this.map.cancelRoute();
            this.onMyLocation();
          }
        }
      }),
      // we subscribe for floor change listener events here
      this.sidebarService.getFloorChangeListener().subscribe(floor => {
        if (floor.id) {
          // if floor is an object and have id set the floor by it
          this.map.setFloorById(floor.id);
        } else {
          // otherwise floor is set by way in string from 'up' | 'down'
          this.map.setFloorByWay(floor);
        }
      }),
      // we subscribe for accessible route listener events here
      this.sidebarService.getAccessibleOnlyToggleListener().subscribe(() => {
        if (this.endPoi) {
          // if we have destination point selected, redraw the route based on accessible status
          this.map.findRouteByIds(this.endPoi.id, null, this.stateService.state.accessibleRoute);
        }
      }),
      // we subscribe for amenity toggle listener events here
      this.sidebarService.getAmenityToggleListener().subscribe(res => {
        if (res) {
          if ((res.category === 'shop' && !this.sidebarService.filteredShop) || (res.category === 'amenities' && !this.sidebarService.filteredAmenity)) {
            // remove amenity filter if there is no value set for defined category
            this.map.removeAmenityFilter(res.amenityId, res.category);
            if (res.category === 'amenities') {
              this.map.cancelRoute();
              this.onMyLocation();
            }
          } else {
            // set amenity filter otherwise
            this.map.setAmenityFilter(res.amenityId, res.category);
            if (res.category === 'amenities') {
              this.map.findRouteToNearestFeature(res.amenityId);
            }
          }
        }
      })
    );
    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.mapPadding = { top: 50, bottom: 300, left: 50, right: 50 };
          if (this.map) this.map.setBoundsPadding(this.mapPadding);
        } else {
          this.mapPadding = { top: 250, bottom: 250, left: 450, right: 250 };
          if (this.map) this.map.setBoundsPadding(this.mapPadding);
        }
      });
  }

  ngOnInit() {
    // Proximiio.js library authentification is done here
    Proximiio.Auth.loginWithToken(Settings.token)
      .then(() => {
        // when authenticated create a map instance with provided constuctor options, check out library readme https://github.com/proximiio/proximiio-js-library#map-component
        this.map = new Proximiio.Map({
          // you can define any of the mapbox options in there, we are retrieving those from state service
          mapboxOptions: {
            zoom: this.stateService.state.options.zoom,
            pitch: this.stateService.state.options.pitch,
            bearing: this.stateService.state.options.bearing
          },
          defaultPlaceId: 'place-id', // if you have more than 1 place in your account, it's a good idea to define defaultPlaceId for the map, otherwise the first one will be picked up
          isKiosk: true, // if enabled starting point for routing will be based on values defined in kioskSettings, if disabled findRoute methods will expect start point to be send.
          kioskSettings: {
            coordinates: this.stateService.state.defaultLocation.coordinates,
            level: this.stateService.state.defaultLocation.level
          },
          initPolygons: true,
          showLevelDirectionIcon: true,
          animatedRoute: true,
          fitBoundsPadding: this.mapPadding, // setting the padding option to use for zooming into the bounds when route is drawn,
          handleUrlParams: true // enable handling url params, this way you can load map with predefined route generated
        });

        // subscribing to map ready listener
        this.map.getMapReadyListener().subscribe(ready => {

          // little bit of hacking
          setTimeout(() => {
            this.mapLoaded = true;
          }, 1000);

          // little bit of hacking
          setTimeout(() => {
            this.map.getMapboxInstance().resize();
            // this.onMyLocation(); // center to default location, if needed comment this out
          }, 1000);

          // setting mapbox navigationControl buttons
          this.map.getMapboxInstance().addControl(new mapboxgl.NavigationControl({
            showZoom: false
          }));


          // set amenity category group 'shop', those have to be set in shop-picker component afterwards
          this.map.setAmenitiesCategory('shop', [
            '44010f6f-9963-4433-ad86-40b89b829c41:c693d414-4613-4c6c-95da-771e52759873',
            '44010f6f-9963-4433-ad86-40b89b829c41:d111c5e4-1a63-48b3-94de-5fa7b309daaf',
            '44010f6f-9963-4433-ad86-40b89b829c41:da5435e2-9179-4ca6-86e4-652b7e8d109b',
            '44010f6f-9963-4433-ad86-40b89b829c41:c96e80d7-6683-4ca0-bc64-b6ed3fc824e2',
            '44010f6f-9963-4433-ad86-40b89b829c41:f62dd757-4057-4015-97a0-c66d8934f7d8'
          ]);

          // set amenity category group 'amenities', those have to be set in amenity-picker component afterwards
          this.map.setAmenitiesCategory('amenities', [
            '44010f6f-9963-4433-ad86-40b89b829c41:e762ea14-70e2-49b7-9938-f6870f9ab18f',
            '44010f6f-9963-4433-ad86-40b89b829c41:61042c8a-87a3-40e4-afa8-3a2c3c09fbf8',
            '44010f6f-9963-4433-ad86-40b89b829c41:62c605cc-75c0-449a-987c-3bdfef2c1642',
            '44010f6f-9963-4433-ad86-40b89b829c41:57ef933b-ff2e-4db1-bc99-d21f2053abb2',
            '44010f6f-9963-4433-ad86-40b89b829c41:2cd016a5-8703-417c-af07-d49aef074ad3'
          ]);

        });

        // when route will be found, write turn by turn navigation response into state service so it will be accessible from details component
        this.map.getRouteFoundListener().subscribe(res => {
          this.stateService.state = {...this.stateService.state, textNavigation: res.TBTNav};
        });

        // set destination point for routing based on click event
        this.map.getPoiClickListener().subscribe(poi => {
          this.sidebarService.onSetEndPoi(poi);
        });

        // subscribe to map place selection listener, this always run once at map initiation and upon map.setPlace method call
        this.map.getPlaceSelectListener().subscribe(res => {
          // capture the map state (this includes all important data of the map), and store those in application stateService, this one is super important as this will fill our state with initial data to be used elsewhere through the app
          const mapState = this.map.state;
          this.stateService.state = {...this.stateService.state, place: mapState.place, floors: mapState.floors, floor: mapState.floor, allFeatures: mapState.allFeatures, amenities: mapState.amenities};
        })

        // subscribe to map floor selection listener, this always run once at map initiation and upon map.setFloor method call
        this.map.getFloorSelectListener().subscribe(res => {
          // capture the map state (this includes all important data of the map), and store those in application stateService
          const mapState = this.map.state;
          this.stateService.state = {...this.stateService.state, place: mapState.place, floors: mapState.floors, floor: mapState.floor, allFeatures: mapState.allFeatures, amenities: mapState.amenities};
        })
      });
  }

  // this method will centerize the map to default location
  onMyLocation() {
    if (this.map) {
      this.map.getMapboxInstance().flyTo({ center: this.stateService.state.defaultLocation.coordinates, bearing: this.stateService.state.options.bearing, pitch: this.stateService.state.options.pitch, zoom: this.stateService.state.options.zoom });
    }
  }

  // you can define kiosk settings with this modal dialog, it's not persistent setting
  onSettings() {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '420px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.map) {
        this.stateService.state.options = {
          zoom: result.zoom,
          bearing: result.bearing,
          pitch: result.pitch
        };
        this.stateService.state.defaultLocation = {
          coordinates: [result.longitude, result.latitude],
          level: result.level
        };
        this.map.getMapboxInstance().flyTo({ center: [result.longitude, result.latitude], bearing: result.bearing, pitch: result.pitch, zoom: result.zoom });
        this.map.setKiosk(result.latitude, result.longitude, result.level)
      }
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
