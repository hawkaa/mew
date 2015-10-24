var Backbone = require('backbone');
var Event = require('./Event.js');
var Trip = Backbone.Model.extend({
    constructor: function constructor(attributes, options) {
        Backbone.Model.prototype.constructor.call(this, attributes, options);
        var events = attributes.Events;
        delete attributes.Events;
        this.events = [];
        for (var i = 0; i < events.length; ++i) {
            this.events.push(new Event(events[i]));
        }

    }
});

module.exports = Trip;