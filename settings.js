var Settings = {
  token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImlzcyI6IjQ0MDEwZjZmLTk5NjMtNDQzMy1hZDg2LTQwYjg5YjgyOWM0MSIsInR5cGUiOiJ1c2VyIiwidXNlciI6IkRlbW8gV2F5ZmluZGluZyIsInVzZXJfaWQiOiI1ZTBkNDVlMy0wMjVmLTRiMzItYmUwNy0wYzk0MjUxYmQ1NzMiLCJ0ZW5hbnRfaWQiOiI0NDAxMGY2Zi05OTYzLTQ0MzMtYWQ4Ni00MGI4OWI4MjljNDEifQ.reaAdK4uUqvGcDghQTmXtbsHR4mX9Hcinwwg4_uqwfQ",
  basepath: "/wayfinding", // in case of change it's required to change that also at ./src/environments and ./angular.json files
  port: "6001", // in case of change it's required to change that also at ./src/environments
  proximi_api: 'https://api.proximi.fi',
  geo_version: 'v5'
};

module.exports = Settings;
