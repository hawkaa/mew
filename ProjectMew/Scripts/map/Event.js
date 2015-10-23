var Backbone = require('../backbone.min.js');
var Event = Backbone.Model.extend({
    getCoordinates: function getCoordinates() {
        return [this.get('lat'), this.get('lon')];
    }
});
module.exports = Event;