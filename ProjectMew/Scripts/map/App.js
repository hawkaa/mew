var L = require('../leaflet-0.7.3.min.js');
var Constants = require('./Constants.js');
var $ = require('jquery');
var Trip = require('./Trip.js');
var MakiMarkers = require('makimarkers');
var App = {};

App.run = function run() {

    this.setup();

    this.trips = [];

    this.map = L.map('map');

    L.tileLayer('https://a.tiles.mapbox.com/v4/hawkaa.cig3wok3z26igszkwzpdc9mxs/{z}/{x}/{y}.png?access_token=' + Constants.MAPBOX_API_KEY, {
        maxZoom: 18,
        id: 'hawkaa.cig3wok3z26igszkwzpdc9mxs'
    }).addTo(this.map);

    this.map.setView([0.0, 0.0], 2);

    var that = this;
    this.loadTrips().then(function(trips) {
        for (var i = 0; i < trips.length; ++i) {
            var trip = trips[i];
            for (var j = 0; j < trip.events.length; ++j) {
                var icon = L.MakiMarkers.icon({
                    icon: "circle-stroked",
                    color: "#F15054",
                });
                var event = trip.events[j];
                L.marker(event.getCoordinates(), {
                    icon: icon
                }).addTo(that.map);
            }
        }
    });

};

App.setup = function setup() {
    L.Icon.Default.imagePath = '/Content/images';
};

App.loadTrips = function loadTrips() {
    var def = $.Deferred();
    $.ajax({
        url: Constants.TRIP_API,
        type: 'GET',
        dataType: 'json'
    })
    .done(function (data) {
        var trips = [];
        for (var i = 0; i < data.length; ++i) {
            trips.push(new Trip(data[i]));
        }
        def.resolve(trips);
    });
    return def;
};

module.exports = App;