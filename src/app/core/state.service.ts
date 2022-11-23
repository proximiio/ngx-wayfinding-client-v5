import { Injectable } from "@angular/core";
import { FloorModel } from "proximiio-js-library/lib/models/floor";
import { PlaceModel } from "proximiio-js-library/lib/models/place";
import StyleModel from "proximiio-js-library/lib/models/style";
import { FeatureCollection } from "proximiio-js-library/lib/models/feature";
import { AmenityModel } from "proximiio-js-library/lib/models/amenity";

export interface KioskModel {
  name: string;
  latitude: number;
  longitude: number;
  level: number;
  pitch: number;
  bearing: number;
  bounds: [[number, number], [number, number]];
}

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
    zoom: number;
    pitch: number;
    bearing: number;
  };
  readonly noPlaces: boolean;
  defaultLocation: {
    coordinates: [number, number] | any[],
    level: number;
  };
  readonly textNavigation: any;
  accessibleRoute: boolean;
  kioskMode: boolean;
  kiosks?: KioskModel[];
  startPoiId: string;
  startPoi: any;
}

@Injectable({ providedIn: "root" })
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
      coordinates: [51.48091652702158, 25.336680584406395], // longitude, latitude
      level: 0,
    },
    textNavigation: null,
    accessibleRoute: false,
    kioskMode: false,
    kiosks: [
      {
        name: "kiosk1",
        latitude: 25.33766469,
        longitude: 51.4814541,
        level: 0,
        pitch: 0,
        bearing: 179.2,
        bounds: [
          [51.478472777, 25.336273415],
          [51.482695283, 25.338782543],
        ],
      },
      {
        name: "kiosk2",
        latitude: 25.33687709,
        longitude: 51.4814541,
        level: 2,
        pitch: 0,
        bearing: -91.2,
        bounds: [
          [51.479646637, 25.335341258],
          [51.482528207, 25.339278794],
        ],
      },
    ],
    startPoiId:
      "44010f6f-9963-4433-ad86-40b89b829c41:f6ea1437-e372-4348-9b96-b1304c8a8952", // default start point for routes
    startPoi: null,
  };
}
