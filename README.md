# Proximi.io Wayfinding Client

This is [Proximi.io](https://proximi.io/) wayfinding client application powered with Angular 8.

As first step please run

```
npm install
```

to install all dependencies, this is required only for the first time after cloning this source.

In case of any issues, please try to run `npm install` with `--production` flag.

```
npm install --production
```

## Running production environment & settings

We strongly recommend to using the latest version of **Node.js**.

As first, it's required to fill the `token` variable in `settings.js` file with yours proximi.io master token. Without it, application would not be able to log in.

In the same file you can also change `port` and `basepath` variables but it's necessary to do subsequently changes to `./src/environments` files and `./angular.json` file on line 26 (a.k.a 'baseHref' property). These steps are completely optional.

To run production server with node.js run
```
node server.js
```

After that with default settings, wayfinding app should be available at `http://localhost:6001/wayfinding`.

## Routing via URL query params

You can use url query params to load map with predefined route, all you need to do is define place (not required for single place account), startPoi and endPoi params.

##### Place param:
Use place id to define a place, this is not required for single place accounts.
```
http://localhost:6001/wayfinding/map?place=placeId
```

##### Start poi param:
Use poi id to define a start point.
```
http://localhost:6001/wayfinding/map?place=placeId&startPoi=startPoiId
```

##### End poi param:
Use poi id to define an end point.
```
http://localhost:6001/wayfinding/map?place=placeId&startPoi=startPoiId&endPoi=endPoiId
```

With those set up the map should be loaded with already generated route.

## Development server

For development process it's necessary to keep production server running as it's also serving the authentication.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/wayfinding`. The app will automatically reload if you change any of the source files.

## Customizations

You can change whatever you want in `./src/app` folder as long you know what are you doing.

Mainly be careful with the `*.component.ts`, `*.service.ts` and other angular core files like `*.module.ts` etc. It's not necessary to change there anything unless again you know what you are doing.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
