import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MapService } from './map.service';
import { SidebarService } from '../core/sidebar/sidebar.service';
import { ResizedEvent } from 'angular-resize-event';
import { AuthService } from '../auth/auth.service';
import Floor from './models/floor.model';
import Place from './models/place.model';
import Style from './models/style.model';
import Feature, { FeatureCollection } from './models/feature.model';
import RoutingSource from './sources/routing_source';
import GeoJSONSource from './sources/geojson_source';
import SyntheticSource from './sources/synthetic_source';
import ClusterSource from './sources/cluster_source';
import ImageSourceManager from './sources/image_source_manager';
import Repository from './repository';
import DataSource from './sources/data_source';
import { getImageFromBase64 } from './common';
import { chevron, pulsingDot } from './icons';
import * as turf from '@turf/turf';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from '../core/notification-dialog/notification-dialog.component';
import { StateService } from '../core/state.service';
import { SettingsDialogComponent } from '../core/settings-dialog/settings-dialog.component';
import * as Proximiio from './Proximiio.js';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  map: any;
  mapLoaded = new EventEmitter<boolean>();
  currentUser;
  currentUserData;
  amenities = [];
  amenityBaseLinks: any = {};
  amenityIds: string[] = [];
  features: any = {};
  showRaster = true;
  imagesIteration = 0;
  images = {};
  objectKeys = Object.keys;
  startPoi;
  endPoi;
  hoveredPolygon = null;
  selectedPolygon = null;
  geojsonSource: GeoJSONSource = new GeoJSONSource(new FeatureCollection({}));
  syntheticSource: SyntheticSource = new SyntheticSource(new FeatureCollection({}));
  routingSource: RoutingSource = new RoutingSource();
  clusterSource: ClusterSource = new ClusterSource();
  imageSourceManager: ImageSourceManager = new ImageSourceManager();
  showStartPoint = false;
  routeFactory;
  filteredAmenities = null;

  private subs = [];

  constructor(
    private mapService: MapService,
    private authService: AuthService,
    public sidebarService: SidebarService,
    public activatedRoute: ActivatedRoute,
    public stateService: StateService,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentUserData = this.authService.getCurrentUserData();
    this.features = this.currentUserData.features;
    this.amenities = this.currentUserData.amenities;
    this.routeFactory = new Proximiio.RouteFactory(JSON.stringify(this.features.features), 'en')

    this.onPlaceSelect = this.onPlaceSelect.bind(this);
    this.onFloorSelect = this.onFloorSelect.bind(this);
    this.onMapReady = this.onMapReady.bind(this);
    this.onSourceChange = this.onSourceChange.bind(this);
    this.onSyntheticChange = this.onSyntheticChange.bind(this);
    this.onStyleChange = this.onStyleChange.bind(this);
    this.onStyleSelect = this.onStyleSelect.bind(this);
    this.onRouteUpdate = this.onRouteUpdate.bind(this);
    this.onRouteChange = this.onRouteChange.bind(this);
    this.onRouteCancel = this.onRouteCancel.bind(this);
    this.onOptionsChange = this.onOptionsChange.bind(this);

    this.updateImages();
    this.filteredAmenities = this.amenityIds;
  }

  ngOnInit() {
    this.initialize();
    this.subs.push(
      this.sidebarService.getStartPointListener().subscribe(poi => {
        this.startPoi = poi;
        if (poi && !this.endPoi) {
          this.centerOnPoi(poi);
        }
        this.generateRoute();
      }),
      this.sidebarService.getEndPointListener().subscribe(poi => {
        this.endPoi = poi;
        if (poi && (!this.startPoi)) {
          this.centerOnPoi(poi);
        }
        this.handlePolygonSelection(poi);
        this.generateRoute();
      }),
      this.sidebarService.getAccessibleOnlyToggleListener().subscribe(() => {
        this.routingSource.toggleAccessible(this.stateService.state.accessibleRoute);
        this.generateRoute();
      }),
      this.sidebarService.getSelectedPlaceListener().subscribe(place => {
        if (place) {
          this.setPlace(place);
        }
      }),
      this.sidebarService.getFloorChangeListener().subscribe(floor => {
        if (floor instanceof Floor) {
          this.onFloorSelect(floor);
        } else {
          this.onFloorChange(floor);
        }
      }),
      this.sidebarService.getAmenityToggleListener().subscribe(amenities => {
        if (!this.sidebarService.filteredShop && !this.sidebarService.filteredAmenity) {
          this.filteredAmenities = this.amenityIds;
        } else if (this.sidebarService.filteredShop && !this.sidebarService.filteredAmenity) {
          const shopIds = [
            '44010f6f-9963-4433-ad86-40b89b829c41:c693d414-4613-4c6c-95da-771e52759873',
            '44010f6f-9963-4433-ad86-40b89b829c41:d111c5e4-1a63-48b3-94de-5fa7b309daaf',
            '44010f6f-9963-4433-ad86-40b89b829c41:da5435e2-9179-4ca6-86e4-652b7e8d109b',
            '44010f6f-9963-4433-ad86-40b89b829c41:c96e80d7-6683-4ca0-bc64-b6ed3fc824e2',
            '44010f6f-9963-4433-ad86-40b89b829c41:f62dd757-4057-4015-97a0-c66d8934f7d8'
          ].filter(i => i !== this.sidebarService.filteredShop.id);
          const allOtherAmenities = this.amenityIds.filter( ( el ) => !shopIds.includes( el ) );
          this.filteredAmenities = [...allOtherAmenities];
        } else if (!this.sidebarService.filteredShop && this.sidebarService.filteredAmenity) {
          const amenityIds = [
            '44010f6f-9963-4433-ad86-40b89b829c41:e762ea14-70e2-49b7-9938-f6870f9ab18f',
            '44010f6f-9963-4433-ad86-40b89b829c41:61042c8a-87a3-40e4-afa8-3a2c3c09fbf8',
            '44010f6f-9963-4433-ad86-40b89b829c41:62c605cc-75c0-449a-987c-3bdfef2c1642',
            '44010f6f-9963-4433-ad86-40b89b829c41:57ef933b-ff2e-4db1-bc99-d21f2053abb2',
            '44010f6f-9963-4433-ad86-40b89b829c41:2cd016a5-8703-417c-af07-d49aef074ad3'
          ].filter(i => i !== this.sidebarService.filteredAmenity.id);
          const allOtherAmenities = this.amenityIds.filter( ( el ) => !amenityIds.includes( el ) );
          this.filteredAmenities = [...allOtherAmenities];
        } else {
          this.filteredAmenities = [...amenities];
        }
        this.setFilters();
        this.setState();
      })
    );
  }

  setFilters() {
    // proximiio-pois-icons, proximiio-pois-labels
    const layers = ['proximiio-pois-icons', 'proximiio-pois-labels'];
    layers.forEach(layer => {
      if (this.map.getLayer(layer)) {
        setTimeout(() => {
          const l = this.map.getLayer(layer);
          const filters = [...l.filter];
          const amenityFilter = filters.findIndex(f => f[1][1] === 'amenity');
          if (amenityFilter !== -1) {
            filters[amenityFilter] = ['match', ['get', 'amenity'], this.filteredAmenities ? this.filteredAmenities : ['undefined'], true, false];
          } else {
            filters.push(['match', ['get', 'amenity'], this.filteredAmenities ? this.filteredAmenities : ['undefined'], true, false]);
          }
          this.map.setFilter(layer, filters);
        });
      }
    });
  }

  setState() {
    const features = this.features.features.filter(f => f.properties.metadata && f.properties.metadata.polygon_id);
    for (const f of features) {
      const polygon = this.features.features.find(i => i.properties.id === f.properties.metadata.polygon_id);
      if (polygon) {
        if (this.filteredAmenities.includes(f.properties.amenity)) {
          this.map.setFeatureState({
            source: 'main',
            id: polygon.id
          }, {
            disabled: false
          });
        } else {
          this.map.setFeatureState({
            source: 'main',
            id: polygon.id
          }, {
            disabled: true
          });
        }
      }
    }
  }

  async initialize() {
    this.geojsonSource.observe(this.onSourceChange);
    this.syntheticSource.observe(this.onSyntheticChange);
    this.routingSource.observe(this.onRouteChange);
    await this.fetch();
    if (this.stateService.state.defaultLocation.isStartPoint) {
      this.setStartPoint();
    }
  }

  async cancelObservers() {
    this.geojsonSource.cancel(this.onSourceChange);
    this.syntheticSource.cancel(this.onSyntheticChange);
    this.stateService.state.style.cancel(this.onStyleChange);
  }

  async fetch() {
    const { places, style, styles } = await Repository.getPackage();
    const place = places.length > 0 ? places[0] : new Place({});
    style.center = [place.lng, place.lat];
    style.zoom = this.stateService.state.options.zoom;
    style.bearing = this.stateService.state.options.bearing;
    style.pitch = this.stateService.state.options.pitch;
    this.geojsonSource.fetch(this.features);
    this.routingSource.routing.setData(new FeatureCollection(this.features));
    this.onSourceChange();
    this.prepareStyle(style);
    this.imageSourceManager.belowLayer = style.usesPrefixes() ? 'proximiio-floors' : 'floors';
    this.imageSourceManager.initialize();
    this.stateService.state = {
      ...this.stateService.state,
      initializing: false,
      place,
      places,
      style,
      styles,
      latitude: place.lat,
      longitude: place.lng,
      noPlaces: places.length === 0
    };
    style.observe(this.onStyleChange);
  }

  prepareStyle(style: Style) {
    style.setSource('main', this.geojsonSource);
    style.setSource('synthetic', this.syntheticSource);
    style.setSource('route', this.routingSource);
    style.setSource('clusters', this.clusterSource);
    style.setLevel(this.sidebarService.defaultFloorLevel);
  }

  onRouteChange(event?: string) {
    if (event === 'loading-start') {
      this.stateService.state = {...this.stateService.state, loadingRoute: true};
      return;
    }

    if (event === 'loading-finished') {
      const routeStart = this.routingSource.route[this.routingSource.start.properties.level];
      const textNavigation = this.routeFactory.generateRoute(JSON.stringify(this.routingSource.points), JSON.stringify(this.endPoi));
      this.centerOnRoute(routeStart);
      this.stateService.state = {...this.stateService.state, loadingRoute: false, textNavigation};
      return;
    }

    if (event === 'route-undefined') {
      console.log('route not found');
      this.stateService.state = {...this.stateService.state, loadingRoute: false};
      return;
    }

    const style = this.stateService.state.style;
    style.setSource('route', this.routingSource);
    this.stateService.state = {...this.stateService.state, style};

    this.updateMapSource(this.routingSource);
  }

  onSourceChange() {
    this.stateService.state = {
      ...this.stateService.state,
      style: this.stateService.state.style
    };
    this.updateMapSource(this.geojsonSource);
    // this.routingSource.routing.setData(this.geojsonSource.collection)
    this.updateCluster();
  }

  onSyntheticChange() {
    this.stateService.state.style.setSource('synthetic', this.syntheticSource);
    this.updateMapSource(this.syntheticSource);
  }

  updateMapSource(source: DataSource) {
    const map = this.map;
    if (map) {
      const mapSource = map.getSource(source.id) as any;
      if (mapSource) {
        mapSource.setData(source.data);
      }
    }
  }

  onStyleSelect(style: Style) {
    const map = this.map;
    if (map) {
      this.prepareStyle(style);
      map.setStyle(style.json);
    }

    this.stateService.state = {...this.stateService.state, style};
  }

  onStyleChange(event?: string, data?: any) {
    const map = this.map;
    if (map) {
      if (event === 'overlay-toggled') {
        const overlay = this.stateService.state.style.overlay ? 'visible' : 'none';
        map.setLayoutProperty('main-polygon-fill', 'visibility', overlay);
        map.setLayoutProperty('main-polygon-outline', 'visibility', overlay);
      }

      if (event === 'segments-toggled') {
        const segments = this.stateService.state.style.segments ? 'visible' : 'none';
        map.setLayoutProperty('main-segment-fill', 'visibility', segments);
        map.setLayoutProperty('main-segment-outline', 'visibility', segments);
      }

      if (event === 'routable-toggled') {
        const routables = this.stateService.state.style.segments ? 'visible' : 'none';
        map.setLayoutProperty('main-routable-fill', 'visibility', routables);
        map.setLayoutProperty('main-routable-outline', 'visibility', routables);
      }

      if (event === 'cluster-toggled') {
        const clusters = this.stateService.state.style.cluster ? 'visible' : 'none';
        map.setLayoutProperty('clusters-circle', 'visibility', clusters);
      }
    }

    if (event === 'layer-update' && data) {
      const { layer, changes }: any = data;
      const layoutChanges = (changes as any[]).filter(diff => diff.kind === 'E' && diff.path[0] === 'layout');
      const paintChanges = (changes as any[]).filter(diff => diff.kind === 'E' && diff.path[0] === 'paint');
      // tslint:disable-next-line:no-shadowed-variable
      const map = this.map;
      if (map) {
        layoutChanges.forEach(change => {
          if (change.kind === 'E') {
            map.setLayoutProperty(layer.id, change.path[1], change.rhs);
          }
        });
        paintChanges.forEach(change => {
          if (change.kind === 'E') {
            map.setPaintProperty(layer.id, change.path[1], change.rhs);
          }
        });
      }
    }

    if (event === 'filter-change') {
      // tslint:disable-next-line:no-shadowed-variable
      const map = this.map;
      const layers = this.map.getStyle().layers;
      layers.forEach(layer => {
        if (map.getLayer(layer.id)) {
          map.removeLayer(layer.id);
        }
        map.addLayer(layer);
      });
    }
    // this.map.setStyle(this.stateService.state.style);
    this.stateService.state = {...this.stateService.state, style: this.stateService.state.style};
  }

  onRasterToggle(value: boolean) {
    this.imageSourceManager.enabled = value;
    const map = this.map;
    if (map) {
      this.imageSourceManager.setLevel(map, this.stateService.state.floor.level);
    }
  }

  onLoad(map) {
    this.map = map;
    this.onMapReady();
    this.mapLoaded.emit(true);
    this.map.resize();
  }

  async onMapReady() {
    // set paths visible if available
    const map = this.map;
    if (map) {
      this.stateService.state.style.togglePaths(true);
      // routing layers
      const routingLayer = map.getLayer('routing-line-completed');
      const usePrefixed = typeof routingLayer === 'undefined' && typeof map.getLayer('proximiio-routing-line-completed') !== 'undefined';
      const shopsLayer = map.getLayer('shops');

      if (usePrefixed) {
        map.moveLayer('proximiio-routing-line-completed', 'proximiio-outer_wall');
        map.moveLayer('proximiio-routing-line-remaining', 'proximiio-outer_wall');
        map.moveLayer('proximiio-paths', 'routing-line-completed');
      } else {
        if (routingLayer) {
          if (shopsLayer) {
            map.moveLayer('routing-line-completed', 'proximiio-routing-symbols');
            map.moveLayer('routing-line-remaining', 'proximiio-routing-symbols');
          }
          map.moveLayer('proximiio-paths', 'routing-line-completed');
        }
      }
      map.setMaxZoom(30);
      const decodedChevron = await getImageFromBase64(chevron);
      map.addImage('chevron_right', decodedChevron as any);
      map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
      this.updateMapSource(this.geojsonSource);
      this.updateMapSource(this.routingSource);
      this.updateCluster();
      // map.setStyle(this.stateService.state.style);
      this.imageSourceManager.setLevel(map, this.stateService.state.floor.level);
      await this.onPlaceSelect(this.stateService.state.place);
      this.handleQueryParams();
      this.setFilters();
    }
  }

  handleQueryParams() {
    // do logic with query params
    if (this.activatedRoute.snapshot.queryParams['place']) {
      const placeId = this.activatedRoute.snapshot.queryParams['place'];
      const place = this.stateService.state.places.find(f => f.id === placeId);
      if (place) {
        this.sidebarService.selectedPlaceListener.next(place);
      } else {
        this.dialog.open(NotificationDialogComponent, {
          data: {
            header: `We couldn't find place that matches id "${placeId}".`,
            message: `Try searching other id, or use navigation to find it!`,
            closeText: `Okay, got it`
          }
        });
      }
    }
    if (this.activatedRoute.snapshot.queryParams['startPoi']) {
      const startPoiId = this.activatedRoute.snapshot.queryParams['startPoi'];
      const startPoi = this.features.features.find(f => f.properties.id === startPoiId);
      if (startPoi) {
        this.sidebarService.startPointListener.next(startPoi);
      } else {
        this.dialog.open(NotificationDialogComponent, {
          data: {
            header: `We couldn't find starting point that matches id "${startPoiId}".`,
            message: `Try searching other id, or use navigation to find it!`,
            closeText: `Okay, got it`
          }
        });
      }
    }
    if (this.activatedRoute.snapshot.queryParams['endPoi']) {
      const endPoiId = this.activatedRoute.snapshot.queryParams['endPoi'];
      const endPoi = this.features.features.find(f => f.properties.id === endPoiId);
      if (endPoi) {
        this.sidebarService.onSetEndPoi(endPoi);
      } else {
        this.dialog.open(NotificationDialogComponent, {
          data: {
            header: `We couldn't find ending point that matches id "${endPoiId}".`,
            message: `Try searching other id, or use navigation to find it!`,
            closeText: `Okay, got it`
          }
        });
      }
    }
  }


  updateCluster() {
    const map = this.map;
    if (map) {
      const data = {
        type: 'FeatureCollection',
        features: this.geojsonSource.data.features
          .filter(f => f.isPoint && f.hasLevel(this.stateService.state.floor.level))
          .map(f => f.json)
      } as FeatureCollection;
      const source = map.getSource('clusters') as any;
      if (source) {
        source.setData(data);
      }
    }
  }

  setPlace(place) {
    this.onPlaceSelect(new Place(place));
  }

  async onPlaceSelect(place: Place) {
    this.stateService.state = {...this.stateService.state, place};
    const floors = await Repository.getFloors(0, place.id);
    const state: any = { floors: floors.sort((a, b) => a.level - b.level) };

    if (floors.length > 0) {
      const groundFloor = floors.find(floor => floor.level === 0);
      if (groundFloor) {
        state.floor = groundFloor;
      } else {
        state.floor = floors[0];
      }
    }

    this.stateService.state = {...this.stateService.state, ...state};

    const map = this.map;
    if (map) {
      map.flyTo({ center: [ place.lng, place.lat ], bearing: this.stateService.state.options.bearing, pitch: this.stateService.state.options.pitch });
    }
  }

  onFloorChange(way) {
    let floor;
    let nextLevel = way === 'up' ? this.stateService.state.floor.level + 1 : this.stateService.state.floor.level - 1;
    if (this.routingSource.route) {
      nextLevel = this.getUpcomingFloorNumber(way);
    }
    floor = this.stateService.state.floors.filter(f => f.level === nextLevel) ? this.stateService.state.floors.filter(f => f.level === nextLevel)[0] : this.stateService.state.floor;
    if (floor) {
      this.onFloorSelect(new Floor(floor));
    }
  }

  onFloorSelect(floor: Floor) {
    const map = this.map;
    const route = this.routingSource.route && this.routingSource.route[floor.level] ? this.routingSource.route[floor.level] : null;
    if (map) {
      this.stateService.state.style.setLevel(floor.level);
      // map.setStyle(this.stateService.state.style); // TODO throwing issue
      setTimeout(() => {
        [...this.stateService.state.style.getLayers('main'), ...this.stateService.state.style.getLayers('route')].forEach(layer => {
          if (map.getLayer(layer.id)) {
            if (layer.id === 'proximiio-levelchangers') {
            }
            map.setFilter(layer.id, layer.filter);
          }
        });
        this.imageSourceManager.setLevel(map, floor.level);
      });
      if (route) {
        const bbox = turf.bbox(route.geometry);
        map.fitBounds(bbox, { padding: 250, bearing: this.stateService.state.options.bearing, pitch: this.stateService.state.options.pitch });
      }
    }
    this.stateService.state = {...this.stateService.state, floor, style: this.stateService.state.style};
    this.updateCluster();
    this.setFilters();
  }

  generateRoute() {
    if (this.startPoi && this.endPoi) {
      this.onRouteUpdate(this.startPoi, this.endPoi);
    } else if (!this.startPoi || !this.endPoi) {
      this.onRouteCancel();
    }
  }

  onRouteUpdate(start?: Feature, finish?: Feature) {
    try {
      this.routingSource.update(start, finish);
    } catch (e) {
      console.log('catched', e);
    }
    this.stateService.state = {...this.stateService.state, style: this.stateService.state.style};
  }

  onRouteCancel() {
    if (this.map) {
      this.map.zoomTo(this.stateService.state.options.zoom);
    }
    this.routingSource.cancel();
  }

  onOptionsChange(options: any) {
    this.stateService.state = {...this.stateService.state, options};
  }

  onMyLocation() {
    if (this.map) {
      this.map.flyTo({ center: this.stateService.state.defaultLocation.coordinates, bearing: this.stateService.state.options.bearing, pitch: this.stateService.state.options.pitch });
    }
  }

  onSettings() {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '420px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const options = this.stateService.state.options;
        options.zoom = result.zoom;
        options.bearing = result.bearing;
        options.pitch = result.pitch;
        this.stateService.state = {...this.stateService.state, options};
        this.map.setZoom(result.zoom);
        this.map.setPitch(result.pitch);
        this.map.setBearing(result.bearing);

        this.stateService.state.defaultLocation.coordinates = [result.longitude, result.latitude];
        this.stateService.state.defaultLocation.level = result.level;
        if (this.stateService.state.defaultLocation.isStartPoint) {
          this.setStartPoint();
        }
      }
    });
  }

  setStartPoint() {
    this.showStartPoint = false;
    setTimeout(() => {
      const point = turf.point(this.stateService.state.defaultLocation.coordinates, { level: this.stateService.state.defaultLocation.level });
      this.sidebarService.startPointListener.next(point);
      this.showStartPoint = true;
    })
  }

  centerOnPoi(poi) {
    if (this.stateService.state.floor.level !== parseInt(poi.properties.level, 0)) {
      const floor = this.stateService.state.floors.find(f => f.level === poi.properties.level);
      this.onFloorSelect(floor);
    }
    if (this.map) {
      this.map.flyTo({ center: poi.geometry.coordinates, bearing: this.stateService.state.options.bearing, pitch: this.stateService.state.options.pitch });
    }
  }

  centerOnRoute(route: Feature) {
    if (route && route.properties) {
      if (this.stateService.state.floor.level !== parseInt(route.properties.level, 0)) {
        const floor = this.stateService.state.floors.find(f => f.level === parseInt(route.properties.level, 0));
        this.onFloorSelect(floor);
      }
      if (this.map) {
        const bbox = turf.bbox(route.geometry);
        this.map.fitBounds(bbox, { padding: 250, bearing: this.stateService.state.options.bearing, pitch: this.stateService.state.options.pitch });
      }
    }
  }

  getUpcomingFloorNumber(way: string) {
    if (this.routingSource.route) {
      const currentRouteIndex = this.routingSource.lines.findIndex(route => +route.properties.level === this.stateService.state.floor.level);
      const currentRoute = this.routingSource.lines[currentRouteIndex];
      const nextRouteIndex = way === 'up' ? currentRouteIndex + 1 : currentRouteIndex - 1;
      const nextRoute = this.routingSource.lines[nextRouteIndex];
      // return currentRouteIndex !== -1 && nextRoute ? +nextRoute.properties.level : way === 'up' ? this.stateService.state.floor.level + 1 : this.stateService.state.floor.level - 1;
      return nextRoute ? +nextRoute.properties.level : this.stateService.state.floor.level;
    }
  }

  onResized(event: ResizedEvent) {
    if (this.map) {
      this.map.resize();
    }
  }

  updateImages() {
    const amenityIds = new Set(
      this.features.features.filter(f => f.properties && f.properties.usecase === 'poi' && f.properties.amenity)
        .map(f => f.properties.amenity)
    );

    const images = {};

    amenityIds.forEach((id: string) => {
      images[id] = this.amenityBaseLinks[id];
    });

    this.amenities
      .filter(a => a.icon)
      .forEach(amenity => {
        images[amenity.id] = { uri: amenity.icon };
        this.amenityIds.push(amenity.id);
      });

    this.images = images;
    this.imagesIteration++;
  }

  onShopClick(e) {
    if (e.features.length > 0) {
      const poi = this.features.features.find(i => i.properties.id === e.features[0].properties.poi_id);
      this.sidebarService.onSetEndPoi(poi);
    }
  }

  handlePolygonSelection(poi) {
    const connectedPolygonId = poi && poi.properties.metadata ? poi.properties.metadata.polygon_id : null;
    if (this.selectedPolygon) {
      this.map.setFeatureState({
        source: 'main',
        id: this.selectedPolygon.id
      }, {
        selected: false
      });
      if (this.selectedPolygon.properties.label_id) {
        this.map.setFeatureState({
          source: 'main',
          id: this.selectedPolygon.properties.label_id
        }, {
          selected: false
        });
      }
    }
    if (connectedPolygonId) {
      this.selectedPolygon = this.features.features.find(i => i.properties.id === connectedPolygonId);
      this.map.setFeatureState({
        source: 'main',
        id: this.selectedPolygon.id
      }, {
        selected: true
      });
      if (this.selectedPolygon.properties.label_id) {
        this.map.setFeatureState({
          source: 'main',
          id: this.selectedPolygon.properties.label_id
        }, {
          selected: true
        });
      }
    }
  }

  onShopMouseEnter() {
    this.map.getCanvas().style.cursor = 'pointer';
  }

  onShopMouseMove(e) {
    if (e.features.length > 0) {
      if (this.hoveredPolygon) {
        this.map.setFeatureState({
          source: 'main',
          id: this.hoveredPolygon.id
        }, {
          hover: false
        });
        if (this.hoveredPolygon.properties.label_id) {
          this.map.setFeatureState({
            source: 'main',
            id: this.hoveredPolygon.properties.label_id
          }, {
            hover: false
          });
        }
      }
      this.hoveredPolygon = e.features[0];
      this.map.setFeatureState({
        source: 'main',
        id: this.hoveredPolygon.id
      }, {
        hover: true
      });
      if (this.hoveredPolygon.properties.label_id) {
        this.map.setFeatureState({
          source: 'main',
          id: this.hoveredPolygon.properties.label_id
        }, {
          hover: true
        });
      }
    }
  }

  onShopMouseLeave(e) {
    this.map.getCanvas().style.cursor = '';
    if (this.hoveredPolygon) {
      this.map.setFeatureState({
        source: 'main',
        id: this.hoveredPolygon.id
      }, {
        hover: false
      });
      if (this.hoveredPolygon.properties.label_id) {
        this.map.setFeatureState({
          source: 'main',
          id: this.hoveredPolygon.properties.label_id
        }, {
          hover: false
        });
      }
    }
    this.hoveredPolygon = null;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.cancelObservers();
  }

}
