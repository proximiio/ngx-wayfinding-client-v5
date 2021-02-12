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
  readonly defaultLocation: [number, number];
  readonly defaultLocationAsStart: boolean;
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
    latitude: 60.1669635,
    longitude: 24.9217484,
    loadingRoute: false,
    noPlaces: false,
    options: {
      coordinates: [0, 0],
      zoom: 0,
      pitch: 0,
      bearing: 0,
      bounds: [[0, 0], [0, 0]]
    },
    defaultLocation: [51.48091652702158, 25.336680584406395],
    defaultLocationAsStart: true,
    accessibleRoute: false
  };
}
