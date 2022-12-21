var Settings = {
  token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImlzcyI6Ijc1Njk4ZDM1LTA5MTgtNGEyYi1hOGFiLTc3YjkzYTYxOGU2MSIsInR5cGUiOiJhcHBsaWNhdGlvbiIsImFwcGxpY2F0aW9uX2lkIjoiOTdjMmUwN2YtZmJhMC00ODg5LWI2NmEtYTVjYTk4OGFhZmQwIn0.pp7VfNxUIdizamts8ivVWlycdrU3RCyh6j5vOfwqdN8",
  basepath: "/moe", // in case of change it's required to change that also at ./src/environments and ./angular.json files
  port: "6023", // in case of change it's required to change that also at ./src/environments
  proximi_api: 'https://api.proximi.fi',
  geo_version: 'v5'
};

module.exports = Settings;
