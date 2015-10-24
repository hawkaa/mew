module.exports = {
    entry: './Main.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'

    },
    resolve: {
        alias: {
            'underscore': __dirname + '/../underscore.min.js',
            'backbone': __dirname + '/../backbone.min.js',
            'jquery': __dirname + '/../jquery-1.10.2.min.js',
            'leaflet': __dirname + '/../leaflet.js',
            'makimarkers': __dirname + '/../Leaflet.MakiMarkers.js',
            'snakeanim': __dirname + '/../L.Polyline.SnakeAnim.js',
            'moment': __dirname + '/../moment.js'
        }
    }
}