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
  options: {
    zoom: number,
    pitch: number,
    bearing: number
  };
  readonly noPlaces: boolean;
  defaultLocation: {
    coordinates: [number, number],
    level: number
  };
  readonly textNavigation: any;
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
      zoom: 19,
      pitch: 40,
      bearing: 10,
    },
    defaultLocation: {
      coordinates: [51.48091652702158, 25.336680584406395],
      level: 0
    },
    textNavigation: null,
    accessibleRoute: false
  };
}
