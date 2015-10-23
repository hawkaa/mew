var Backbone = require('backbone');
var Event = require('./Event.js');
var Trip = Backbone.Model.extend({
    constructor: function constructor(attributes, options) {
        var events = attributes.events;
        delete attributes.events;
        this.events = [];
        for (var i = 0; i < events.length; ++i) {
            this.events.push(new Event(events[i]));
        }

    }
});

module.exports = Trip;