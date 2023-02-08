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
        animationLooping: false,
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
          "75698d35-0918-4a2b-a8ab-77b93a618e61:c302b098-4c76-4a70-ae7c-5a0349e86fda",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:02c3ff3a-f21e-4acc-a193-33f4eec3c80e",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:d266e799-49a5-49c7-a37a-0426feaabb13",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:2c71be41-704d-4389-b78a-d7b9cc53dff5",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:9fdc16b9-6d74-41e2-8453-197a28242906",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:762bcc6b-34f4-43c2-9c5a-0c8748d0656b",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:a134605e-fe37-4845-92d0-2cf09333b04e",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:0fa149b7-aa6f-42ac-8c8d-7ceae2a96266",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:8a12fbd5-ebb5-4d95-b9e1-3acd28443c9d",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:0a7e293f-750c-499a-8308-91bc253612ef",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:318ed8dc-72ac-4bd6-bb07-22842a9dbe46",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:f480f5f2-f5b7-4944-9e3d-c4baf78e490e",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:07348f3c-6b80-4e7b-a48d-935ae3ef71f8",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:cfd608b1-fe61-4bea-92db-82a848452a45",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:b156c461-815a-4b31-b99d-9a49c75d6783",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:34a40a9b-a4a0-4977-8270-96b04e137fa4",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:f7779ed1-af05-4fa7-b01a-abbd5d9a301d",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:d45449cb-1fa9-473f-a1d5-b7c2077b1cf5",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:69d2e19b-fb17-4cd6-966f-1f86f4930122",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:43b3fe55-f30e-4e5c-a0d5-b17994b45425",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:28d180c2-1d18-4b07-bf4d-3646314b7c80",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:ee26e3bc-4911-4843-803b-d109e6f57742",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:4d0ebef8-e0aa-411e-b386-0f038725a609",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:9b579881-7911-4950-9146-504f270ccbed",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:03a45c5d-fb77-43bb-81e2-c6a61868aae8",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:109fe182-045f-4db7-bfd8-fd2937a5fc87",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:b87bc5ce-def9-4a62-a78a-a38b7ac787a6",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:93d07ff1-c0ab-4152-b9e0-a662990cfa47",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:ecf63da4-81af-45bf-9450-80eadcc395a5",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:5e8bc3fa-26f4-4665-8d40-24dce81fd1f8",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:53590614-9aa0-4afa-8b8b-cfa3136b316e",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:94390ef9-225b-4f64-ab7a-f17c97bd1326",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:2bd51ef9-dbc5-4381-8d33-f3de329d6e8c",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:c401b23f-4686-4f0f-9dfe-549040cfd795",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:414ad1ea-aec5-4154-b993-0b6a1f0cae36",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:022da10b-611a-4933-9929-4c4a9e2151f6",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:a4a01be9-70cf-4a32-9b15-b693214009aa",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:fe08a39f-701d-4655-80f9-8906517f2f3f",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:c078687b-c3df-4add-9b30-c0ac4e0af53a",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:309fd758-72c7-4e4a-8516-fbc4c17da024",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:39a12b78-31a1-4d54-92b9-b117e6d7ab38",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:6f4db4db-5c96-4414-a3da-bbc79a23e773",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:abf57b7c-7216-4ade-bd30-e035bd2caa91",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:7d693561-a427-49e3-9a64-b3a687653407",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:d812b45f-5257-4a50-ac08-1e2b4d269116",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:dd55ddd1-bff7-4897-8b54-ea31cda687ae",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:1b4e2f00-15d3-4d44-8b44-586150ccbcb0",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:93e2af3a-af5f-4e33-b8be-e9d0612afb36",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:7c7a6e4d-9a5c-44d6-b9ac-298d606ce126",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:d460413e-857a-4d91-b5dd-43ca0937228b",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:091f4137-6ca6-436c-ab04-20a5e964568f",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:4add7c35-f7bd-4f96-b268-5eddef2b126b",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:62bba064-81e3-4d87-a5a7-2d0300d2a105",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:d122b55f-2a31-460e-8976-ccc946f08e57",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:5d6f205c-1195-44ac-bdcd-a4bfc79614fc",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:6e11302a-65df-4497-81dc-d7572486f911",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:276391e6-6dfa-413a-8e6a-3276bfa673d0",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:89df401a-e85b-4c17-8132-9011eefc9175",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:8d72b125-1575-40f8-82cf-0359a84bc8db",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:15b182b8-9307-4185-8403-37858c557c63",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:a5286ad2-527f-4bfd-a1c1-3cb13161fe69",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:9e6c9897-d430-4961-9de9-282bebc347c3",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:1b20689d-8db3-41bf-b42e-6a4c69a06c71",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:bb16e44a-d380-4e95-b9f3-67d5807d01d7",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:61ee55cc-c1e1-49ba-9379-b62df3c7f88e",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:84b627cb-3ffd-4bb8-803a-a4c165fcd368",
          "75698d35-0918-4a2b-a8ab-77b93a618e61:271c99fe-7532-4c0a-88b3-7da9bf019564",
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
      "75698d35-0918-4a2b-a8ab-77b93a618e61:cd0d9abe-7461-4018-9615-7b665e46c9eb",
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
      "proximiio-pois-labels",
      "pois-icons",
      "pois-labels",
      "poi-custom-icons",
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
