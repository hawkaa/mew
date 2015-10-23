var L = require('../leaflet-0.7.3.min.js');
var Constants = require('./Constants.js');
var App = {};

App.run = function run() {

    this.setup();

    var map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://a.tiles.mapbox.com/v4/hawkaa.cig3wok3z26igszkwzpdc9mxs/{z}/{x}/{y}.png?access_token=' + Constants.MAPBOX_API_KEY, {
        maxZoom: 18,
        id: 'hawkaa.cig3wok3z26igszkwzpdc9mxs'
    }).addTo(map);

    map.setView([0.0, 0.0], 2);


};

App.setup = function setup() {
    L.Icon.Default.imagePath = '/Content/images';
};

module.exports = App;