# Proximi.io Wayfinding Client

This is [Proximi.io](https://proximi.io/) wayfinding client demo application powered with Angular 11.

As first step after cloning this repository please run

```
npm install
```

to install all dependencies, this is required only for the first time.

In case of any issues, please try to run `npm install` with `--production` flag.

```
npm install --production
```

## Getting Started

We strongly recommend to using the latest version of **Node.js**.

As first, it's required to fill the `token` variable in `settings.js` file with yours proximi.io token. Without it, application would not be able to log in.

In the same file you can also change `port` and `basepath` variables but it's necessary to do subsequently changes to `./src/environments` files and `./angular.json` file on line with 'baseHref' property. These steps are completely optional.

as next run [development](#Development-server) server with this command

```
ng serve
```

In case everything went well, demo app should automatically open in a browser window.

### Folder Structure

The list of important files and folders and for what they are used to.

```
dist // the builded app folder
src // app source folder
  ./app
    ./core
      /.settings-dialog // dialog modal component, used for kiosk settings
      /.sidebar // sidebar component
        ./amenity-picker // amenity picker component, commented out as default, you can enable it in case you will set amenity category in map component
          amenity-picker.component.ts // you have to set your own data here, based on amenity category set in map component
        ./details // details component will be shown after route will be rendered, it's showing some destination point details
        ./floor-picker // floor picker component is used to toogle the floor number
        ./search // search component is used to pick point from map poi features, will be used as a destination point for a route
        /.shop-picker // same as for amenity picker component in case you want to initiate multiple amenity categories
          shop-picker.component.ts // same as for amenity picker component in case you want to initiate multiple amenity categories
        sidebar.component.html // sidebar components are initiated from there, the amenity-picker and shop-picker are commented out here
        sidebar.service.ts // event handling from sidebar components, check out comments for more info
        ...
      state.service.ts // service for storing/fetching data
      ...
    /.map
      map.component.html // map component html file, map container and few more elements are sitting there
      map.component.ts // all the magic around the map happens here, check out comments
      ...
  ./assets // nothing important here, you can store there custom images you want to use there
  ./environments // only required to change there something in case port or basepath has been changed
  ./styles // little bit of styling
    _variables.scss // there are only two variables for 'default-color' and for 'accent-color', defining text colors, buttons etc.
  ./themes // nothing important here
  ./vendor // nothing important here
```

### Map Initiation

The whole demo app is strongly dependent on [Proximi.io JS Library](https://github.com/proximiio/proximiio-js-library#proximiio-js-library), so it's definitely a good idea to take a look into it's documentation before you touch anything and always be sure you are on latest version.

We initiate map in map component located at `./src/app/map/map.component.ts`, as default it's pretty straightforward as you don't need to provide any arguments and just call

```
const map = new Proximiio.Map({});
```

in our demo, we are using kiosk behavior so our initiation looks like this

```
const map = new Proximiio.Map({
  mapboxOptions: {
    zoom: this.stateService.state.options.zoom,
    pitch: this.stateService.state.options.pitch,
    bearing: this.stateService.state.options.bearing
  },
  defaultPlaceId: 'place-id',
  isKiosk: true,
  kioskSettings: {
    coordinates: this.stateService.state.defaultLocation.coordinates,
    level: this.stateService.state.defaultLocation.level
  },
  fitBoundsPadding: this.mapPadding
});
```
So what you need to do to make demo working like it's intended is
1. Set `defaultPlaceId` in case your account have more than one place
2. In file `./src/app/core/state.service.ts` set `defaultLocation` coordinates and level for starting point on map

And that's it, now after clicking on the poi/searching for it in search bar, should generate the route and display the details component.

There's a lot of place for a customizations so definitely check documentation of [Proximi.io JS Library - Map Component](https://github.com/proximiio/proximiio-js-library#map-component), to learn all the methods and listeners you can use.

For example, if you don't want the kiosk behavior, just set that to false and for finding route methods you just have to provide also the start point data `map.findRouteByIds('idTo', 'idFrom')` and it should be working.

### Retrieving Map State

There might me cases and in the demo we are actually using this approach too, when you will want/need to get an actual data used by map. For that purposes you can retrieve the map state like this.

```
const map = new Proximiio.Map({});
map.getPlaceSelectListener().subscribe(ready => {
  const state = map.state;
});
```

In map state you can find currently selected place and floor, also the list of the floors for the selected place and list of the features on the map. In many cases that could be useful, in the demo app we are filling those data to our app-wide state service, so we have access to those data through the whole app.

### Customizations

There is not much for the styling overall, but it's possible to change color variables in `./src/styles/_variables.scss` file, those are used for some texts and buttons.

You can also play with different methods and listeners of [Proximi.io JS Library - Map Component](https://github.com/proximiio/proximiio-js-library#map-component).

In the end you can change whatever you want in `./src/app` folder as long you know what are you doing.

Mainly be careful with the `*.component.ts`, `*.service.ts` and other angular core files like `*.module.ts` etc. It's not necessary to change there anything unless again you know what you are doing.

## Long Story Short

1. Clone the repo
2. Run `npm install`
3. Fill the `token` variable in `.settings.js` with your token
4. Run development server with `ng serve`
5. Set `defaultPlaceId` in `Proximiio.Map` constuctor at `./src/app/map/map.component.ts`, by your place id
6. In file `./src/app/core/state.service.ts` set `defaultLocation` coordinates and level for starting point on map
7. Build the app with `ng build --prod` after you are satisfied with your changes
8. You can deploy

## Running Production Server

After you are finished with the changes, please [rebuild](#Build) the application by running

```
ng build --prod
```

To run production server with node.js run

```
node server.js
```

After that with default settings, wayfinding app should be available at `http://localhost:6001/wayfinding`.

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/wayfinding`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
