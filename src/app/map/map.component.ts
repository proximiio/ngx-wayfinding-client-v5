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
            // if map is loaded, the poi is not null in listener event and destination is not set from url, center the map, set the floor level to poi
            this.map
              .getMapboxInstance()
              .flyTo({ center: poi.geometry.coordinates, zoom: 19 });
            this.map.setFloorByLevel(poi.properties.level);
            // handle polygon selection, only required when polygons are enabled
            this.map.handlePolygonSelection(poi);
          } else if (!poi) {
            // otherwise cancel route if it's rendered and return me to default location
            this.map.cancelRoute();
            // this.onMyLocation();
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
        const destination = this.endPoi
          ? this.endPoi
          : this.stateService.state.textNavigation.destination;
        if (destination) {
          // if we have destination point selected, redraw the route based on accessible status
          this.map.findRouteByIds(
            destination.id,
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
            if (
              res.category === "amenities" &&
              this.stateService.state.kioskMode
            ) {
              this.map.cancelRoute();
              this.onMyLocation();
            }
          } else {
            // set amenity filter otherwise
            this.map.setAmenityFilter(res.amenityId, res.category);
            if (
              res.category === "amenities" &&
              this.stateService.state.kioskMode
            ) {
              this.map.findRouteToNearestFeature(res.amenityId);
            }
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
        }),
      this.sidebarService.getRouteToClosestAmenityListener().subscribe(() => {
        if (this.map) {
          this.map.findRouteToNearestFeature(
            this.sidebarService.activeListItem.id,
            this.startPoiId
          );
        }
      })
    );
    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.mapPadding = { top: 0, bottom: 100, left: 0, right: 0 };
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
          defaultPolygonColor: "#202020", // optional, default: '#dbd7e8', default color of the polygons
          hoverPolygonColor: "#da291c", // optional, default: '#a58dfa', hover color of the polygons
          selectedPolygonColor: "#da291c", // optional, default: '#6945ed', selected color of the polygons
          defaultLabelColor: "#fff", // optional, default: '#6945ed', default color of the polygon labels
          defaultPolygonHeight: 1.5, // optional, default: 3, default polygon height in meters
          hoverPolygonHeight: 3, // optional, default: 3, hover polygon height in meters
          selectedPolygonHeight: 4, // optional, default: 3, selected polygon height in meters
          removeOriginalPolygonsLayer: true,
          minZoom: 15,
        },
        blockFeatureClickWhileRouting: true,
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

        // if kiosk is found use it's settings to initiate the map
        if (this.kiosk) {
          const kioskPoi = this.kiosk.poiId
            ? this.stateService.state.allFeatures.features.find(
                (i) => i.id === this.kiosk.poiId
              )
            : null;
          this.stateService.state.options.bearing = this.kiosk.bearing;
          this.stateService.state.options.pitch = this.kiosk.pitch;
          this.stateService.state.defaultLocation.coordinates = kioskPoi
            ? kioskPoi.geometry.coordinates
            : [this.kiosk.longitude, this.kiosk.latitude];
          this.stateService.state.defaultLocation.level = kioskPoi
            ? kioskPoi.properties.level
            : this.kiosk.level;

          if (this.kiosk.bounds) {
            this.map.getMapboxInstance().setMaxBounds(this.kiosk.bounds);
          }

          this.map.setKiosk(
            this.stateService.state.defaultLocation.coordinates[1],
            this.stateService.state.defaultLocation.coordinates[0],
            this.stateService.state.defaultLocation.level
          );
        }

        this.hideAmenityFeatures();

        // set amenity category group 'shop', those have to be set in shop-picker component afterwards
        this.map.setAmenitiesCategory("shop", [
          "75698d35-0918-4a2b-a8ab-77b93a618e61:935570c1-cd4e-4c70-8e9d-87e63a0e061b",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:2ee8fe09-6b1f-4ff7-999b-fd6c53802b04",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:04dd218a-adf1-4947-866d-b679badb895a",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:576270da-2592-439f-9082-74f198c8bf6c",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:15120502-00af-47e6-b9ec-53fc35d042c8",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:76f90c15-b759-43b4-aa96-457568adbfd4",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:fe68247a-5c8c-427f-b276-b94b1c39e5da",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:ed0c8e0b-f28b-462b-bd24-3e1f9d1720f1",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:4987b765-0c5e-4bcb-979b-fdbe2adb7979",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:9f3ec695-2fe2-44a6-8390-547d50487f0c",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:105ffbf7-a639-443c-ad48-36239fb822dd",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:79f78a36-2f7b-442c-989a-48a83d76d422",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:e23ab7ec-7a87-4f17-be9a-a5f579d49ee1",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:875d9cfb-8289-4307-9c1c-34b4f52198cb",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:028b17c6-2f82-4ce1-af3d-9fc9ca061972",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:bda780fb-0f4a-4e76-b74c-a11f1975f1b5",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:6e75e80a-583b-4302-b410-f03f2431dc47",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:cad88ce9-92d8-4137-ae61-82ac1fb5cf22",
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
      if (this.sidebarService.filteredAmenity) {
        this.sidebarService.onAmenityToggle(
          "amenities",
          this.sidebarService.filteredAmenity
        );
        this.sidebarService.showClosestAmenityPicker = false;
        this.sidebarService.activeListItem = null;
      }
      this.map.refetch();
    }
  }

  hideAmenityFeatures() {
    const amenitiesToHide = [
      "75698d35-0918-4a2b-a8ab-77b93a618e61:c302b098-4c76-4a70-ae7c-5a0349e86fda",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:632f91c3-ce20-4466-b5f5-96da4e0905bc",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:69d2e19b-fb17-4cd6-966f-1f86f4930122",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:28d180c2-1d18-4b07-bf4d-3646314b7c80",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:ee26e3bc-4911-4843-803b-d109e6f57742",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:109fe182-045f-4db7-bfd8-fd2937a5fc87",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:b87bc5ce-def9-4a62-a78a-a38b7ac787a6",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:53590614-9aa0-4afa-8b8b-cfa3136b316e",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:022da10b-611a-4933-9929-4c4a9e2151f6",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:39a12b78-31a1-4d54-92b9-b117e6d7ab38",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:d812b45f-5257-4a50-ac08-1e2b4d269116",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:7c7a6e4d-9a5c-44d6-b9ac-298d606ce126",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:d460413e-857a-4d91-b5dd-43ca0937228b",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:091f4137-6ca6-436c-ab04-20a5e964568f",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:276391e6-6dfa-413a-8e6a-3276bfa673d0",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:15b182b8-9307-4185-8403-37858c557c63",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:a5286ad2-527f-4bfd-a1c1-3cb13161fe69",
      "75698d35-0918-4a2b-a8ab-77b93a618e61:1b20689d-8db3-41bf-b42e-6a4c69a06c71",
    ];

    const mainSource = this.map.getMapboxInstance().getSource("main") as any;
    if (mainSource) {
      const features = mainSource._data.features.map((feature) => {
        if (amenitiesToHide.includes(feature.properties.amenity)) {
          feature.properties.hideIcon = "hide";
        }
        return feature;
      });
      const data = {
        type: "FeatureCollection",
        features,
      };
      mainSource.setData(data);
    }

    const layers = [
      "proximiio-pois-icons",
      "pois-icons",
      "poi-custom-icons",
      "proximiio-pois-labels",
      "pois-labels",
    ];
    layers.forEach((layer) => {
      if (this.map.getMapboxInstance().getLayer(layer)) {
        const l = this.map.getMapboxInstance().getLayer(layer) as any;
        const filters = [...l.filter];

        filters.push(["!=", ["get", "hideIcon"], "hide"]);

        this.map.state.style.getLayer(layer).filter = filters;
        this.map.getMapboxInstance().setFilter(layer, filters);
      }
    });
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
