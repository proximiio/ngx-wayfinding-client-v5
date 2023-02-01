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
  bounds?: [[number, number], [number, number]];
  poiId?: string;
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
    coordinates: [number, number] | any[];
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
      zoom: 18,
      pitch: 40,
      bearing: 10,
    },
    defaultLocation: {
      coordinates: [55.20090240716519, 25.11959496138134], // longitude, latitude
      level: 0,
    },
    textNavigation: null,
    accessibleRoute: false,
    kioskMode: false,
    kiosks: [
      {
        name: "kiosk",
        latitude: 25.11839772802756,
        longitude: 55.20227480783245,
        level: 0,
        pitch: 40,
        bearing: 10,
        poiId:
          "75698d35-0918-4a2b-a8ab-77b93a618e61:6a4d5a0d-3d74-4c51-a8d2-bf4292541181",
      },
    ],
    startPoiId:
      "75698d35-0918-4a2b-a8ab-77b93a618e61:52c53790-2acf-4271-8a32-4b1c99b3227a", // default start point for routes
    startPoi: null,
  };
}
