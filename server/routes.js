/**
 * Created by kevrat on 16.10.2016.
 * Server routes
 * @param app - ref to app
 * @param server - ref to server
 * @param store - ref to mongo store
 */
module.exports = function (app, server, store) {
    var path = require('path'),
        passportSocketIo = require("passport.socketio"),
        io = require('socket.io')(server),
        passport = require('passport'),
        debug = require('debug')('sweet_story'),
        bodyParser = require('body-parser'),
        cookieParser = require('cookie-parser');
    var EventHandlers = {};
    EventHandlers.User = require(path.resolve('server/EventHandlers/User'));

    app.use(cookieParser());
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
    io.use(passportSocketIo.authorize({
        key: 'sweet_story',       // the name of the cookie where express/connect stores its session_id
        secret: 'alohomora',    // the session_secret to parse the cookie
        store: store,        // we NEED to use a sessionstore. no memorystore please
        success: onAuthorizeSuccess,  // *optional* callback on success - read more below
        fail: onAuthorizeFail,     // *optional* callback on fail/error - read more below
    }));

    function onAuthorizeSuccess(data, accept) {
        debug('successful connection to socket.io ');
        accept();
    }

    function onAuthorizeFail(data, message, error, accept) {
        // if(error)
        //     throw new Error(message);
        debug('failed connection to socket.io:', message);
        accept(null, false);
    }

    ensureAuthenticated = function (req, res, next) {
        if (req.isAuthenticated()) {
            debug('is auth');
            return next();
        }
        debug('not auth');
        res.redirect('/successfulLogIn')
    };
    io.on('connection', function (socket) {
        debug('new connection');
        socket.on('disconnect', function () {
            debug('user disconnected')
        });
        if (socket.request.user.logged_in) {
            socket.emit('succes login', socket.request.user);
        }
        else {
            socket.emit('failed login', socket.request.user);
        }

        var eventHandlers = {
            User: new EventHandlers.User(app, socket)
        };
        // Bind events to handlers
        for (var category in eventHandlers) {
            var handler = eventHandlers[category].handler;
            for (var event in handler) {
                socket.on(event, handler[event]);
            }
        }
    });
    app.get('/auth/vk/callback/logIn', function (req, res, next) {
        passport.authenticate(
            'vkLogIn',
            {callbackURL: '/auth/vk/callback/logIn'},
            function (err, user, message) {
                debug(message);
                if (err) {
                    return res.redirect('/logInError');
                }
                else {
                    if (message === 'user not found') {
                        return res.redirect('/userNotFound');
                    }
                    debug('/successfulLogIn');
                    req.logIn(user, function(err) {
                        if (err) {
                            return res.redirect('/logInError');
                        }
                        return res.redirect('/successfulLogIn');
                    });
                }
            }
        )(req, res, next);
    });
    app.get('/auth/vk/callback/signUp/:id', function (req, res, next) {
        passport.authenticate(
            'vkSignUp',
            {callbackURL: '/auth/vk/callback/signUp/' + req.params.id},
            function (err, user, message) {
                debug(message);
                if (err) {
                    return res.redirect('/signUpError');
                }
                else {
                    if (message === 'user already exist') {
                        return res.redirect('/userAlreadyExist');
                    }
                    debug('/successfulSignUp');
                    return res.redirect('/successfulSignUp');
                }
            }
        )(req, res, next);
    });
    app.get('/logout', function (req, res) {
        req.session.destroy(function (err) {
            res.redirect('/');
        });
    });
    app.get('/', function (req, res) {
        res.send('hello world');
    });
    app.get('/userAlreadyExist', function (req, res) {
        res.sendFile(path.resolve('public/backToApp.html'));
    });
    app.get('/logInError', function (req, res) {
        res.sendFile(path.resolve('public/backToApp.html'));
    });
    app.get('/signUpError', function (req, res) {
        res.sendFile(path.resolve('public/backToApp.html'));
    });
    app.get('/userNotFound', function (req, res) {
        res.sendFile(path.resolve('public/backToApp.html'));
    });

    app.get('/successfulLogIn', function (req, res) {
        res.sendFile(path.resolve('public/backToApp.html'));
    });
    app.get('/successfulSignUp', function (req, res) {
        res.sendFile(path.resolve('public/backToApp.html'));
    });
    app.get('/auth/vk/logIn', function (req, res, next) {
        passport.authenticate(
            'vkLogIn',
            {failureFlash: true, callbackURL: '/auth/vk/callback/logIn'}
        )(req, res, next);
    });
    app.get('/auth/vk/signUp/:id', function (req, res, next) {
        passport.authenticate(
            'vkSignUp',
            {failureFlash: true, callbackURL: '/auth/vk/callback/signUp/' + req.params.id}
        )(req, res, next);
    });
};