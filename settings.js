var Settings = {
  token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImlzcyI6IjZhZTg5ZjRhLTU0OWItNGMzZS04MWU1LTgwZWYxOTc0NGQwMyIsInR5cGUiOiJ1c2VyIiwidXNlciI6IlByb3hpbWkuaW8gRGV2ZWxvcG1lbnQiLCJ1c2VyX2lkIjoiZjg2Y2Q5MzgtOGI0OS00ZWUwLTg1N2YtOWFiZTFkMTI4ZjE5IiwidGVuYW50X2lkIjoiNmFlODlmNGEtNTQ5Yi00YzNlLTgxZTUtODBlZjE5NzQ0ZDAzIn0.OljW2rfJfL_VJwEo4c4-NAYt5O_RmN44hWyv8IFbHIs",
  basepath: "/wayfinding-v2", // in case of change it's required to change that also at ./src/environments and ./angular.json files
  port: "6007", // in case of change it's required to change that also at ./src/environments
  proximi_api: 'https://api.proximi.fi',
  geo_version: 'v5'
};

module.exports = Settings;
