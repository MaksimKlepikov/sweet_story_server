/**
 * Created by kevrat on 06.10.2016.
 * Database
 * @param app - ref to app
 * @param passport_config - ref to passport_config module
 * @param routes - ref to server routes
 * @param server - ref to server
 */
module.exports = function(app,passport_config,routes,server){
    var config = require("./config"),
        debug = require('debug')('sweet_story'),
        mongoose = require("mongoose");


    var connectionString = process.env.DEBUG === "true" ?
        config.debug.database.connectionString :
        config.database.connectionString;

    mongoose.Promise = global.Promise;//off warnings about promise
    mongoose.connect(connectionString);

    mongoose.connection.on("connected", function() {
        debug("Connected to " + connectionString);
        var session = require('express-session');
        var MongoStore = require('connect-mongo')(session);
        var store = new MongoStore({ mongooseConnection: mongoose.connection }); // connect-mongo session store
        app.use(session({
            secret: 'alohomora',
            name: 'sweet_story',
            key: 'sweet_story',
            store: store,
            proxy: true,
            resave: true,
            saveUninitialized: true,
            unset: 'destroy'
        }));
        passport_config(app);
        routes(app,server,store);
    });

    mongoose.connection.on("error", function(error) {
        debug("Connection to " + connectionString + " failed:" + error);
    });

    mongoose.connection.on("disconnected", function() {
        debug("Disconnected from " + connectionString);
    });

    process.on("SIGINT", function() {
        mongoose.connection.close(function() {
            debug("Disconnected from " + connectionString + " through app termination");
            process.exit(0);
        });
    });
}
