var L = require('leaflet');
var Constants = require('./Constants.js');
var $ = require('jquery');
var Trip = require('./Trip.js');
var MakiMarkers = require('makimarkers');
var SnakeAnim = require('snakeanim');
var App = {};

App.run = function run() {

    this.setup();

    this.trips = [];

    this.activeTrip = null;
    this.activeRouteLayer = null;

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
                    color: trip.get('color')
                });
                var event = trip.events[j];
                L.marker(event.getCoordinates(), {
                    icon: icon
                })
                .on('click', function () {
                    that.zoomToTrip(trip);
                })
                .addTo(that.map);
            
            }
        }
    });

};

App.zoomToBounds = function zoomToBounds(bounds) {
    var ret = $.Deferred();
    var that = this;
    setTimeout(function () {
        that.map.fitBounds(bounds);
        ret.resolve();
    }, Constants.ZOOM_ANIMATION_MS);
    return ret;
};

App.zoomToTrip = function zoomToTrip(trip) {

    this.activeTrip = trip;
    if (this.activeRouteLayer) {
        this.activeRouteLayer.remove();
    }

    var polyLines = [];
    var bounds = L.latLngBounds(trip.events[0].getCoordinates(), trip.events[0].getCoordinates());
    for (var i = 1; i < trip.events.length; ++i) {
        bounds.extend(trip.events[i].getCoordinates());
        polyLines.push(L.polyline(
            [trip.events[i - 1].getCoordinates(), trip.events[i].getCoordinates()],
            {
                color: trip.get('color'),
                snakingSpeed: 1000
            }
        ));
    }
    this.activeRouteLayer = L.layerGroup(polyLines, {
        snakingPause: 200
    });

    var that = this;
    this.zoomToBounds(bounds).then(function() {
        that.activeRouteLayer.addTo(that.map).snakeIn();
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
        var color = 0;
        for (var i = 0; i < data.length; ++i) {
            /* define color of trip */
            data[i].color = Constants.COLORS[color];
            color = (color + 1) % Constants.COLORS.length;
            trips.push(new Trip(data[i]));
        }
        def.resolve(trips);
    });
    return def;
};

module.exports = App;