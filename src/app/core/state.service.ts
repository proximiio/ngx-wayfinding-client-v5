import { Injectable } from '@angular/core';
import { FloorModel } from 'proximiio-js-library/lib/models/floor';
import { PlaceModel } from 'proximiio-js-library/lib/models/place';
import StyleModel from 'proximiio-js-library/lib/models/style';
import { FeatureCollection } from 'proximiio-js-library/lib/models/feature';
import { AmenityModel } from 'proximiio-js-library/lib/models/amenity';

export interface State {
  readonly initializing: boolean;
  readonly floor: FloorModel;
  readonly floors: FloorModel[];
  readonly place: PlaceModel;
  readonly places: PlaceModel[];
  readonly style: StyleModel;
  readonly styles: StyleModel[];
  readonly allFeatures: FeatureCollection;
  readonly amenities: AmenityModel[];
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
    floor: new FloorModel({}),
    floors: [],
    place: new PlaceModel({}),
    places: [],
    style: new StyleModel({}),
    styles: [],
    allFeatures: new FeatureCollection({}),
    amenities: [],
    loadingRoute: false,
    noPlaces: false,
    options: {
      zoom: 19,
      pitch: 40,
      bearing: 10,
    },
    defaultLocation: {
      coordinates: [0, 0], // longitude, latitude
      level: 0
    },
    textNavigation: null,
    accessibleRoute: false
  };
}
