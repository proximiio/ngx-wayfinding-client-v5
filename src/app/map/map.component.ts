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
        /*this.endPoi = poi;
        if (poi && (!this.startPoi)) {
          this.centerOnPoi(poi);
        }
        this.handlePolygonSelection(poi);
        this.generateRoute();*/
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
          }
        });

        this.map.getMapboxInstance().addControl(new mapboxgl.NavigationControl({
          showZoom: false
        }));

        this.map.getRouteFoundListener().subscribe(res => {
          this.stateService.state = {...this.stateService.state, textNavigation: res.TBTNav};
        });

        this.map.getPlaceSelectListener().subscribe(res => {
          const mapState = this.map.state;
          this.stateService.state = {...this.stateService.state, place: mapState.place, floors: mapState.floors, floor: mapState.floor};
        })

        this.map.getFloorSelectListener().subscribe(res => {
          const mapState = this.map.state;
          this.stateService.state = {...this.stateService.state, place: mapState.place, floors: mapState.floors, floor: mapState.floor};
        })
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
