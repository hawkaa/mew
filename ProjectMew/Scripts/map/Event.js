var Backbone = require('../backbone.min.js');
var Event = Backbone.Model.extend({
    getCoordinates: function getCoordinates() {
        return [this.get('Latitude'), this.get('Longitude')];
    }
});
module.exports = Event;