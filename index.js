/**
 * Created by kevrat on 15.09.2016.
 */
var app = require('express')(),
    debug = require('debug')('sweet_story'),
    server = require('http').createServer(app),
    flash = require('connect-flash')(),
    passport_config = require("./server/passport_config"),
    routes = require("./server/routes"),
    db = require("./server/db/database")(app,passport_config,routes,server);

debug('booting');

server.listen(process.env.PORT || 5000, function() {
    debug( server.address() );
    debug('server up and running at %s port', process.env.PORT || 5000);
});
