import { Component, OnDestroy, OnInit } from "@angular/core";
import Proximiio from "proximiio-js-library";
import * as Settings from "../../../settings";
import * as mapboxgl from "mapbox-gl";
import { KioskModel, StateService } from "../core/state.service";
import { SettingsDialogComponent } from "../core/settings-dialog/settings-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { SidebarService } from "../core/sidebar/sidebar.service";
import { Subscription } from "rxjs";
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from "@angular/cdk/layout";
import { PaddingOptions } from "mapbox-gl";
import { TranslateService } from "@ngx-translate/core";
import { MapService } from "./map.service";
import Feature from "proximiio-js-library/lib/models/feature";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit, OnDestroy {
  public mapLoaded = false;
  private destinationFromUrl = false;
  private mapPadding: PaddingOptions = {
    top: 250,
    bottom: 250,
    left: 500,
    right: 250,
  };
  private map;
  private startPoiId: string;
  private endPoi;
  private kiosk: KioskModel;
  private destinationParam: string;
  private placeParam: string;
  private subs: Subscription[] = [];

  constructor(
    private mapService: MapService,
    private sidebarService: SidebarService,
    private stateService: StateService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private translateService: TranslateService
  ) {
    const urlParams = new URLSearchParams(window.location.search);
    this.destinationParam = urlParams.get("destinationFeature"); // in case you change url param name in urlParams option of map constuctor, change that too
    this.placeParam = urlParams.get("defaultPlace");

    // if there is a destination defined in url params, we need to handle poi selection to show details component
    if (this.destinationParam) {
      this.destinationFromUrl = true;
    }

    // find kiosk by url param in stateService
    this.kiosk = this.stateService.state.kiosks.find(
      (i) => i.name === urlParams.get("kiosk")
    );

    // if kiosk is found use it's settings to initiate the map
    if (this.kiosk) {
      this.stateService.state.options.bearing = this.kiosk.bearing;
      this.stateService.state.options.pitch = this.kiosk.pitch;
      this.stateService.state.defaultLocation.coordinates = [
        this.kiosk.longitude,
        this.kiosk.latitude,
      ];
      this.stateService.state.defaultLocation.level = this.kiosk.level;
    }

    this.subs.push(
      // we subscribe for start point listener events here
      this.sidebarService.getStartPointListener().subscribe((poi) => {
        if (this.mapLoaded) {
          this.map.getMapboxInstance().resize();
        }
        this.setStartPoi(poi);
      }),
      // we subscribe for end point listener events here
      this.sidebarService.getEndPointListener().subscribe((poi) => {
        this.endPoi = poi;
        if (this.map) {
          if (poi && !this.destinationFromUrl) {
            // if map is loaded, the poi is not null in listener event and destination is not set from url, center the map, set the floor level to poi and set the feature highlight
            this.map
              .getMapboxInstance()
              .flyTo({ center: poi.geometry.coordinates, zoom: 19 });
            this.map.setFloorByLevel(poi.properties.level);
            this.map.setFeaturesHighlight([poi.id], "#9200c7", 46, 0.4);
            // handle polygon selection, only required when polygons are enabled
            this.map.handlePolygonSelection(poi);
          } else if (!poi) {
            // otherwise cancel route if it's rendered, remove highlight and return me to default location
            this.map.cancelRoute();
            this.map.setFeaturesHighlight([]);
            this.onMyLocation();
          }
        }
      }),
      // we subscribe for floor change listener events here
      this.sidebarService.getFloorChangeListener().subscribe((floor) => {
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
          this.map.findRouteByIds(
            this.endPoi.id,
            this.stateService.state.kioskMode ? null : this.startPoiId,
            this.stateService.state.accessibleRoute
          );
        }
      }),
      // we subscribe for amenity toggle listener events here
      this.sidebarService.getAmenityToggleListener().subscribe((res) => {
        if (res) {
          if (
            (res.category === "shop" && !this.sidebarService.filteredShop) ||
            (res.category === "amenities" &&
              !this.sidebarService.filteredAmenity)
          ) {
            // remove amenity filter if there is no value set for defined category
            this.map.removeAmenityFilter(res.amenityId, res.category);
          } else {
            // set amenity filter otherwise
            this.map.setAmenityFilter(res.amenityId, res.category);
          }
        }
      }),
      // subscribe to show route listener and show route based on that
      this.mapService.getShowRouteListener().subscribe(() => {
        this.onShowRoute();
      }),
      // reset view after idle time is reached, this is set in app.component.ts
      this.mapService.getResetViewListener().subscribe(() => {
        this.onResetView();
      }),
      // subscribe to feature center listener
      this.sidebarService
        .getCenterToFeatureListener()
        .subscribe((feature: Feature) => {
          if (this.map) {
            this.map.centerToFeature(feature.id);
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
    Proximiio.Auth.loginWithToken(Settings.token).then(() => {
      // when authenticated create a map instance with provided constuctor options, check out library readme https://github.com/proximiio/proximiio-js-library#map-component
      this.map = new Proximiio.Map({
        // you can define any of the mapbox options in there, we are retrieving those from state service
        mapboxOptions: {
          zoom: this.stateService.state.options.zoom,
          pitch: this.stateService.state.options.pitch,
          bearing: this.stateService.state.options.bearing,
        },
        defaultPlaceId: "e905bda5-4900-48f5-a6b0-d8e39c05050f", // if you have more than 1 place in your account, it's a good idea to define defaultPlaceId for the map, otherwise the first one will be picked up
        isKiosk: this.stateService.state.kioskMode, // if enabled starting point for routing will be based on values defined in kioskSettings, if disabled findRoute methods will expect start point to be send.
        kioskSettings: {
          coordinates: this.stateService.state.defaultLocation.coordinates as [
            number,
            number
          ],
          level: this.stateService.state.defaultLocation.level,
        },
        fitBoundsPadding: this.mapPadding, // setting the padding option to use for zooming into the bounds when route is drawn,
        handleUrlParams: true, // enable handling url params, this way you can load map with predefined route generated
        language: this.translateService.currentLang, // init with predefined language setting
        // useGpsLocation: true, // if enabled your location will be detected with geolocation API and used as a starting point for routing
        // geolocationControlOptions: {
        //   autoTrigger: true, // if enabled map will automatically enable geolocation
        //   autoLocate: false, // if enabled map will automatically focus on user location
        //   position: 'bottom-right', //  position on the map to which the control will be added.
        // },
        showLevelDirectionIcon: true, // if enabled arrow icon will be shown at the levelchanger indicating direction of level change along the found route
        animatedRoute: true,
        initPolygons: true,
        polygonsOptions: {
          defaultPolygonColor: "#dbd7e8", // optional, default: '#dbd7e8', default color of the polygons
          hoverPolygonColor: "#202020", // optional, default: '#a58dfa', hover color of the polygons
          selectedPolygonColor: "#da291c", // optional, default: '#6945ed', selected color of the polygons
          defaultPolygonHeight: 1.5, // optional, default: 3, default polygon height in meters
          hoverPolygonHeight: 3, // optional, default: 3, hover polygon height in meters
          selectedPolygonHeight: 4, // optional, default: 3, selected polygon height in meters
          removeOriginalPolygonsLayer: true,
        },
      });

      // subscribing to map ready listener
      this.map.getMapReadyListener().subscribe((ready) => {
        this.mapService.mapReadyListener.next(true);
        this.mapLoaded = true;
        this.mapService.mapReady = true;
        // this.onMyLocation(); // center to default location, if needed comment this out

        // setting mapbox navigationControl buttons
        this.map.getMapboxInstance().addControl(
          new mapboxgl.NavigationControl({
            showZoom: false,
          })
        );

        if (this.kiosk?.bounds) {
          this.map.getMapboxInstance().setMaxBounds(this.kiosk.bounds);
        }

        // set amenity category group 'shop', those have to be set in shop-picker component afterwards
        this.map.setAmenitiesCategory("shop", [
          "75698d35-0918-4a2b-a8ab-77b93a618e61:ab9f7580-06fa-4f0f-bb63-7e8206238acc",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:2d4df5f8-0cc5-442d-a346-411f5ae75bc6",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:50f207f0-8346-4125-9470-358023fbe5c5",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:5c1229eb-4125-4bf5-a005-8c6851d51787",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:53c8a23f-04c7-4ece-8f52-10c30a6f0167",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:1b20689d-8db3-41bf-b42e-6a4c69a06c71",
        ]);

        // set amenity category group 'amenities', those have to be set in amenity-picker component afterwards
        this.map.setAmenitiesCategory("amenities", [
          "75698d35-0918-4a2b-a8ab-77b93a618e61:2a5b339e-30da-4186-9749-06906731b8c9",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:3574e57c-1ecf-47d5-b8f3-b9de1c39cf1b",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:8001844d-c059-4644-9275-6b3e66e8dd3c",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:9c925821-744a-41c4-92cb-0342ab4c2ef9",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:e835e573-36a6-47e2-9687-4ac05c6cd717",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:e284a98b-f0b8-4bdc-9945-04219d3ef857",
        ]);

        if (this.destinationFromUrl) {
          const defaultPlace = this.placeParam
            ? this.stateService.state.places.find(
                (p) => p.id === this.placeParam || p.name === this.placeParam
              )
            : this.stateService.state.place;
          const destinationFeature =
            this.stateService.state.allFeatures.features.find(
              (f) =>
                f.properties.title &&
                f.properties.place_id === defaultPlace.id &&
                (f.id === this.destinationParam ||
                  f.properties.id === this.destinationParam ||
                  f.properties.title === this.destinationParam)
            );
          this.sidebarService.onSetEndPoi(destinationFeature);
          this.map.handlePolygonSelection(destinationFeature);
        }
      });

      // when route will be found, write turn by turn navigation response into state service so it will be accessible from details component
      this.map.getRouteFoundListener().subscribe((res) => {
        this.stateService.state = {
          ...this.stateService.state,
          textNavigation: res.TBTNav,
        };

        // send route found event to map service
        this.mapService.routeFoundListener.next(true);

        // if destination is defined in url params and route is found, set destination in the app
        if (this.destinationFromUrl) {
          this.sidebarService.onSetEndPoi(res.end);
          setTimeout(() => {
            this.map.centerToRoute();
          }, 1000);
          this.destinationFromUrl = false; // must be set to false to enable rerouting by search/click
        }

        // set features highlight
        this.map.setFeaturesHighlight([res.start.id, res.end.id], "#000", 70);
      });

      // set destination point for routing based on click event and cancel previous route if generated
      this.map.getPolygonClickListener().subscribe((poi) => {
        if (this.map.state.textNavigation) {
          this.map.cancelRoute();
        }
        this.sidebarService.onSetEndPoi(poi);
      });

      // subscribe to map place selection listener, this always run once at map initiation and upon map.setPlace method call
      this.map.getPlaceSelectListener().subscribe((res) => {
        // capture the map state (this includes all important data of the map), and store those in application stateService, this one is super important as this will fill our state with initial data to be used elsewhere through the app
        const mapState = this.map.state;
        this.stateService.state = {
          ...this.stateService.state,
          place: mapState.place,
          floors: mapState.floors,
          floor: mapState.floor,
          allFeatures: mapState.allFeatures,
          amenities: mapState.amenities,
        };
      });

      // subscribe to map floor selection listener, this always run once at map initiation and upon map.setFloor method call
      this.map.getFloorSelectListener().subscribe((res) => {
        // capture the map state (this includes all important data of the map), and store those in application stateService
        const mapState = this.map.state;
        this.stateService.state = {
          ...this.stateService.state,
          place: mapState.place,
          floors: mapState.floors,
          floor: mapState.floor,
          allFeatures: mapState.allFeatures,
          amenities: mapState.amenities,
        };
      });
    });
  }

  // set different start point handling function
  setStartPoi(poi) {
    if (!this.stateService.state.kioskMode) {
      // assign selected poi
      const startPoi = poi;
      this.startPoiId = poi.id;

      // centerize map
      this.map.getMapboxInstance().flyTo({
        center: startPoi.geometry.coordinates,
        bearing: this.stateService.state.options.bearing,
        pitch: this.stateService.state.options.pitch,
        zoom: this.stateService.state.options.zoom,
      });

      // set to start point floor
      this.map.setFloorByLevel(startPoi.properties.level);
      // if we also have an endpoint generate route
      if (this.endPoi) {
        this.map.findRouteByIds(
          this.endPoi.id,
          this.startPoiId,
          this.stateService.state.accessibleRoute
        );
      }
    }
  }

  // this method will centerize the map to default location
  onMyLocation() {
    if (this.map) {
      this.map.getMapboxInstance().flyTo({
        center: this.stateService.state.defaultLocation.coordinates,
        bearing: this.stateService.state.options.bearing,
        pitch: this.stateService.state.options.pitch,
        zoom: this.stateService.state.options.zoom,
      });
      this.map.setFloorByLevel(this.stateService.state.defaultLocation.level);
    }
  }

  // you can define kiosk settings with this modal dialog, it's not persistent setting
  onSettings() {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: "420px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.map) {
        this.stateService.state.options = {
          zoom: result.zoom,
          bearing: result.bearing,
          pitch: result.pitch,
        };
        this.stateService.state.defaultLocation = {
          coordinates: [result.longitude, result.latitude],
          level: result.level,
        };
        this.map.getMapboxInstance().flyTo({
          center: [result.longitude, result.latitude],
          bearing: result.bearing,
          pitch: result.pitch,
          zoom: result.zoom,
        });
        this.map.setKiosk(result.latitude, result.longitude, result.level);
      }
    });
  }

  onShowRoute() {
    if (this.map) {
      this.map.findRouteByIds(
        this.endPoi.id,
        this.stateService.state.kioskMode ? null : this.startPoiId,
        this.stateService.state.accessibleRoute
      );
    }
  }

  onResetView() {
    if (this.map) {
      this.sidebarService.onSetEndPoi(null);
      this.map.refetch();
    }
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
