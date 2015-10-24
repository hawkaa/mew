var L = require('leaflet');
var Constants = require('./Constants.js');
var $ = require('jquery');
var Trip = require('./Trip.js');
var MakiMarkers = require('makimarkers');
var SnakeAnim = require('snakeanim');
var moment = require('moment');
var App = {};

App.run = function run() {

    this.setup();
    
    //this.createDummyData();


    this.trips = [];

    this.activeTrip = null;
    this.activeRouteLayer = null;
    this.activePopupsLayer = null;

    this.map = L.map('map');

    L.tileLayer('https://a.tiles.mapbox.com/v4/hawkaa.cig3wok3z26igszkwzpdc9mxs/{z}/{x}/{y}.png?access_token=' + Constants.MAPBOX_API_KEY, {
        maxZoom: 18,
        id: 'hawkaa.cig3wok3z26igszkwzpdc9mxs'
    }).addTo(this.map);

    this.map.setView([0.0, 0.0], 2);

    var that = this;
    this.loadTrips().then(function(trips) {
        $.each(trips, function () {
            var that_2 = this;
            for (var j = 0; j < this.events.length; ++j) {
                var icon = L.MakiMarkers.icon({
                    icon: "circle-stroked",
                    color: this.get('color')
                });
                var event = this.events[j];
                L.marker(event.getCoordinates(), {
                    icon: icon
                })
                .on('click', function () {
                    that.loadTrip(that_2);
                })
                .addTo(that.map);
            }
        });
    });
};

App.setupEventListeners = function setupEventListeners() {
    var that = this;
    $('#map').on('click', '.popup-image', function () {
        var cid = $(this).data('event-id');
        var event = $.grep(that.activeTrip.events, function(n, i) {
            return n.cid == cid;
        })[0].attributes;
        that.showModal(event);
    });

    $('body').on('hidden.bs.modal', '.modal', function () {
        $(this).removeData('bs.modal');
    });

    $('.new-trip-btn').on('click', function () {
        that.showInputModal();
    });


}

App.showInputModal = function showInputModal() {
    var modalContent = "<div class='modal-title'>Paste trip info in JSON-format</div>";
    modalContent += '<div class="textarea-wrapper"><textarea class="trip-input m-textarea" rows="20" cols="200"></textarea></div>';
    modalContent += '<div class="btn-wrapper"><button class="trip-input-submit m-modal-btn">Save</button></div>';
    $('.modal-content').html(modalContent);
}

App.showModal = function showModal(event) {
    var modalContent = "<div class='modal-img-wrapper'><img class='modal-img' src='" + event.ImageUrl + "' /></div>"
                        + "<div class='modal-time-and-place'>" + moment(event.DateTime).format('LL') + ", " + event.Location + "</div>"
                        + "<div class='modal-description'>" + event.Description + "</div></div>";

    $('.modal-content').html(modalContent);
    $('#test-modal').modal('show');
}

App.zoomToBounds = function zoomToBounds(bounds) {
    var ret = $.Deferred();
    var that = this;
    setTimeout(function () {
        ret.resolve();
    }, Constants.ZOOM_ANIMATION_MS);
    that.map.fitBounds(bounds, {
        padding: [250, 250]
    });
    return ret;
};

App.loadTrip = function loadTrip(trip) {
    this.activeTrip = trip;
    /* remove previous layers*/
    if (this.activePopupsLayer) {
        this.activePopupsLayer.remove();
    }
    if (this.activeRouteLayer) {
        this.activeRouteLayer.remove();
    }

    App.zoomToTrip().then(function() {
        return App.showPopups();
    });
};

App.showPopups = function showPopups() {
    var that = this;
    var layers = [];
    $.each(this.activeTrip.events, function () {
        var layer = L.popup({
                className: 'img-popup',
                closeButton: false,
                closeOnClick: false
            })
            .setLatLng(this.getCoordinates())
            .setContent('<img data-event-id="' + this.cid + '" class="popup-image" data-toggle="modal" data-target="#test-modal" src="' + this.get('ImageUrl') + '" />');
        layers.push(layer);
    });
    this.activePopupsLayer = L.layerGroup(layers);
    console.log(this.activePopupsLayer);
    this.map.addLayer(this.activePopupsLayer);
};

App.zoomToTrip = function zoomToTrip() {
    var trip = this.activeTrip;
    var ret = $.Deferred();

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
    }).on('snakeend', function() {
        ret.resolve();
    });

    var that = this;
    this.zoomToBounds(bounds).then(function() {
        that.activeRouteLayer.addTo(that.map).snakeIn();
    });
    return ret;
};

App.setup = function setup() {
    moment.lang('no');
    L.Icon.Default.imagePath = '/Content/images';
    this.setupEventListeners();
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

App.createDummyData = function createDummyData() {
    $.ajax({
        url: '/Trip/Create/',
        type: 'POST',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(
            {
            Title: "London med Marte",
            Events: [
                {
                    Location: "Big Ben",
                    DateTime: "2014-06-01T00:00:00.000Z",
                    Longitude: -0.126236,
                    Latitude: 51.500152,
                    Description: "Her er et bilde av Big Ben",
                    ImageUrl: "http://cdn.londonandpartners.com/visit/london-organisations/big-ben/63602-640x360-bigben_tilt_640.jpg"
                },
                {
                    Location: "Tower of London",
                    DateTime: "2014-06-02T00:00:00.000Z",
                    Longitude: -0.076188,
                    Latitude: 51.507937,
                    Description: "Her er et bilde av Tower of London",
                    ImageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Tower_of_London_White_Tower.jpg"
                }
            ]
        })
    });
    $.ajax({
        url: '/Trip/Create/',
        type: 'POST',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            Title: "Tur til Japan og Thailand med Datateknikk",
            Events: [
                {
                    Location: "Tokyo",
                    DateTime: "2013-04-01T00:00:00.000Z",
                    Longitude: 139.69,
                    Latitude: 35.68,
                    Description: "Her ser du Thea og meg i Tokyo.",
                    ImageUrl: "http://i.imgur.com/Mm0jjtR.jpg"
                },
                {
                    Location: "Kyoto",
                    DateTime: "2013-04-10T00:00:00.000Z",
                    Longitude: 135.75,
                    Latitude: 35.02,
                    Description: "På vei opp til templene.",
                    ImageUrl: "http://i.imgur.com/p6oG4sy.jpg"
                },
                {
                    Location: "Koh Samui",
                    DateTime: "2013-04-15T00:00:00.000Z",
                    Longitude: 100.01359290,
                    Latitude: 9.51201680,
                    Description: "Koselig bilde fra Koh Samui",
                    ImageUrl: "http://i.imgur.com/FEQMih5.jpg"
                }
            ]
        })
    });
    $.ajax({
        url: '/Trip/Create/',
        type: 'POST',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            Title: "Utvekslingsopphold i USA",
            Events: [
                {
                    Location: "Malibu Beach",
                    DateTime: "2014-08-01T00:00:00.000Z",
                    Longitude: -118.6884200,
                    Latitude: 34.0327900	,
                    Description: "Måtte teste temperaturen på vannet",
                    ImageUrl: "http://i.imgur.com/hdc9W0c.jpg"
                },
                {
                    Location: "Golden Gate",
                    DateTime: "2014-08-02T00:00:00.000Z",
                    Longitude: -122.475,
                    Latitude: 37.807,
                    Description: "Vakre golden gate. Denne gangen var det ikke tåke.",
                    ImageUrl: "http://i.imgur.com/keJGiI9.jpg"
                },
                {
                    Location: "Mount Rushmore",
                    DateTime: "2014-08-03T00:00:00.000Z",
                    Longitude: -103.38183449999997,
                    Latitude: 43.9685522,
                    Description: "Måtte hilse på presidentene.",
                    ImageUrl: "http://i.imgur.com/N0FVgvY.jpg"
                  },
                  {
                    Location: "Minneapolis",
                    DateTime: "2014-08-04T00:00:00.000Z",
                    Longitude: -93.2650108,
                    Latitude: 44.977753,
                    Description: "Tilbake i Minneapolis med mange gode venner.",
                    ImageUrl: "http://i.imgur.com/8GRKntQ.jpg"
                  }
            ]
        })
    });
};
module.exports = App;