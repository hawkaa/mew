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
    this.markers = [];

    this.map = L.map('map');

    L.tileLayer('https://a.tiles.mapbox.com/v4/hawkaa.cig3wok3z26igszkwzpdc9mxs/{z}/{x}/{y}.png?access_token=' + Constants.MAPBOX_API_KEY, {
        maxZoom: 18,
        id: 'hawkaa.cig3wok3z26igszkwzpdc9mxs'
    }).addTo(this.map);

    this.map.setView([0.0, 0.0], 2);
    this.reloadTrips();
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

    $('body').on('click', '.trip-input-submit', function () {
        var data = $('.trip-input').val();
        $.ajax({
            url: '/Trip/Create/',
            type: 'POST',
            data: data
        }).then(function() {
            that.reloadTrips();
        });
    });
}

App.reloadTrips = function reloadTrips() {
    var that = this;
    for (var i = 0; i < that.markers.length; ++i) {
        that.markers[i].remove();
    }
    that.markers = [];

    this.loadTrips().then(function(trips) {
        $.each(trips, function () {
            var that_2 = this;
            for (var j = 0; j < this.events.length; ++j) {
                var icon = L.MakiMarkers.icon({
                    icon: "circle-stroked",
                    color: this.get('color')
                });
                var event = this.events[j];
                var marker = L.marker(event.getCoordinates(), {
                    icon: icon
                })
                .on('click', function () {
                    that.loadTrip(that_2);
                })
                .addTo(that.map);
                that.markers.push(marker);
            }
        });
    });
};

App.showInputModal = function showInputModal() {
    var modalContent = "<div class='modal-title'>Paste trip info in JSON-format</div>";
    modalContent += '<div class="textarea-wrapper"><textarea class="trip-input m-textarea" rows="20" cols="200"></textarea></div>';
    modalContent += '<div class="btn-wrapper"><button data-dismiss="modal" class="trip-input-submit m-modal-btn">Save</button></div>';
    $('.modal-content').html(modalContent);
}

App.showModal = function showModal(event) {
    var modalContent = "<div class='modal-img-wrapper'><img class='modal-img' src='" + event.ImageUrl + "' /></div>"
                        + "<div class='modal-time-and-place'>" + moment(event.DateTime).format('LL') + ", " + event.Location + "</div>"
                        + "<div class='modal-description'>" + event.Description + "</div></div>";

    $('.modal-content').html(modalContent);
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
module.exports = App;