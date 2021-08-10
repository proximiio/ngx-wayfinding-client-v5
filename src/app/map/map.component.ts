import { Component, OnDestroy, OnInit } from '@angular/core';
import Proximiio from 'proximiio-js-library'
import * as Settings from '../../../settings';
import * as mapboxgl from 'mapbox-gl';
import { StateService } from '../core/state.service';
import { SettingsDialogComponent } from '../core/settings-dialog/settings-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SidebarService } from '../core/sidebar/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  private map;
  private endPoi;
  private subs: Subscription[] = [];

  constructor(
    private sidebarService: SidebarService,
    private stateService: StateService,
    private dialog: MatDialog
  ) {
    this.subs.push(
      this.sidebarService.getEndPointListener().subscribe(poi => {
        this.endPoi = poi;
        if (this.map) {
          if (poi) {
            this.map.findRouteByIds(poi.id, null, this.stateService.state.accessibleRoute);
          } else {
            this.map.cancelRoute();
            this.onMyLocation();
          }
        }
      }),
      this.sidebarService.getFloorChangeListener().subscribe(floor => {
        if (floor.id) {
          this.map.setFloorById(floor.id);
        } else {
          this.map.setFloorByWay(floor);
        }
      }),
      this.sidebarService.getAccessibleOnlyToggleListener().subscribe(() => {
        if (this.endPoi) {
          this.map.findRouteByIds(this.endPoi.id, null, this.stateService.state.accessibleRoute);
        }
      }),
      this.sidebarService.getAmenityToggleListener().subscribe(res => {
        if (res) {
          if ((res.category === 'shop' && !this.sidebarService.filteredShop) || (res.category === 'amenities' && !this.sidebarService.filteredAmenity)) {
            this.map.removeAmenityFilter(res.amenityId, res.category);
          } else {
            this.map.setAmenityFilter(res.amenityId, res.category);
          }
        }
      })
    )
  }

  ngOnInit() {
    Proximiio.Auth.loginWithToken(Settings.token)
      .then(() => {
        this.map = new Proximiio.Map({
          allowNewFeatureModal: false,
          mapboxOptions: {
            zoom: this.stateService.state.options.zoom,
            pitch: this.stateService.state.options.pitch,
            bearing: this.stateService.state.options.bearing
          },
          isKiosk: true,
          kioskSettings: {
            coordinates: this.stateService.state.defaultLocation.coordinates,
            level: this.stateService.state.defaultLocation.level
          },
          initPolygons: true
        });

        this.map.getMapboxInstance().addControl(new mapboxgl.NavigationControl({
          showZoom: false
        }));

        this.map.getRouteFoundListener().subscribe(res => {
          this.stateService.state = {...this.stateService.state, textNavigation: res.TBTNav};
        });

        this.map.getPolygonClickListener().subscribe(poi => {
          this.sidebarService.onSetEndPoi(poi);
        });

        this.map.getPlaceSelectListener().subscribe(res => {
          const mapState = this.map.state;
          this.stateService.state = {...this.stateService.state, place: mapState.place, floors: mapState.floors, floor: mapState.floor};
        })

        this.map.getFloorSelectListener().subscribe(res => {
          const mapState = this.map.state;
          this.stateService.state = {...this.stateService.state, place: mapState.place, floors: mapState.floors, floor: mapState.floor};
        })

        this.map.setAmenitiesCategory('shop', [
          '44010f6f-9963-4433-ad86-40b89b829c41:c693d414-4613-4c6c-95da-771e52759873',
          '44010f6f-9963-4433-ad86-40b89b829c41:d111c5e4-1a63-48b3-94de-5fa7b309daaf',
          '44010f6f-9963-4433-ad86-40b89b829c41:da5435e2-9179-4ca6-86e4-652b7e8d109b',
          '44010f6f-9963-4433-ad86-40b89b829c41:c96e80d7-6683-4ca0-bc64-b6ed3fc824e2',
          '44010f6f-9963-4433-ad86-40b89b829c41:f62dd757-4057-4015-97a0-c66d8934f7d8'
        ]);

        this.map.setAmenitiesCategory('amenities', [
          '44010f6f-9963-4433-ad86-40b89b829c41:e762ea14-70e2-49b7-9938-f6870f9ab18f',
          '44010f6f-9963-4433-ad86-40b89b829c41:61042c8a-87a3-40e4-afa8-3a2c3c09fbf8',
          '44010f6f-9963-4433-ad86-40b89b829c41:62c605cc-75c0-449a-987c-3bdfef2c1642',
          '44010f6f-9963-4433-ad86-40b89b829c41:57ef933b-ff2e-4db1-bc99-d21f2053abb2',
          '44010f6f-9963-4433-ad86-40b89b829c41:2cd016a5-8703-417c-af07-d49aef074ad3'
        ]);
      });
  }

  onMyLocation() {
    if (this.map) {
      this.map.getMapboxInstance().flyTo({ center: this.stateService.state.defaultLocation.coordinates, bearing: this.stateService.state.options.bearing, pitch: this.stateService.state.options.pitch, zoom: this.stateService.state.options.zoom });
    }
  }

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
