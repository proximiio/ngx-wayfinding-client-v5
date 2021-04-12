var Settings = {
  token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImlzcyI6IjNmNzYzNmI3LTMxZDQtNDRjYS1hNmY0LTA4ODRmMmVmNjYwYyIsInR5cGUiOiJhcHBsaWNhdGlvbiIsImFwcGxpY2F0aW9uX2lkIjoiOGJiNmU4MDYtNDc3Yi00ZmM1LWE0M2QtOTc0ODA3NDhiYTg5In0.PoUF1-vS8DaEv8gHzWigkXqNT7uodzWj5ID2PzKQrtg",
  basepath: "/ewq", // in case of change it's required to change that also at ./src/environments and ./angular.json files
  port: "6008", // in case of change it's required to change that also at ./src/environments
  proximi_api: 'https://api.proximi.fi',
  geo_version: 'v5',
  ewq_api: 'https://api.eees.fi/v1/lbs/ean',
  ewq_apikey: 'c37b006c5516f25fbe39035a8f964af0d0c4089c3e4f2dd742502469782d6a67',
};

module.exports = Settings;
