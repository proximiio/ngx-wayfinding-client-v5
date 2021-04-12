import Floor from '../map/models/floor.model';
import Place from '../map/models/place.model';
import Style from '../map/models/style.model';
import { Injectable } from '@angular/core';

export interface State {
  readonly initializing: boolean;
  readonly floor: Floor;
  readonly floors: Floor[];
  readonly place: Place;
  readonly places: Place[];
  readonly style: Style;
  readonly styles: Style[];
  readonly latitude: number;
  readonly longitude: number;
  readonly loadingRoute: boolean;
  readonly options: any;
  readonly noPlaces: boolean;
  readonly defaultLocation: {
    coordinates: [number, number],
    level: number,
    isStartPoint: boolean
  };
  accessibleRoute: boolean;
}

@Injectable({providedIn: 'root'})
export class StateService {
  state: State = {
    initializing: true,
    floor: new Floor({}),
    floors: [],
    place: new Place({}),
    places: [],
    style: new Style({}),
    styles: [],
    latitude: 24.920981065391345,
    longitude: 60.15627643534694,
    loadingRoute: false,
    noPlaces: false,
    options: {
      coordinates: [0, 0],
      zoom: 19,
      pitch: 40,
      bearing: 10,
      bounds: [[0, 0], [0, 0]]
    },
    defaultLocation: {
      coordinates: [24.920981065391345, 60.15627643534694],
      level: 1,
      isStartPoint: true
    },
    accessibleRoute: false
  };
}
