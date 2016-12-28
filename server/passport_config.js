/**
 * Created by kevrat on 16.10.2016.
 * Configuration passport
 * @param app - ref to passport
 * @return module
 */

module.exports = function(app){
    var module = {};

    var path = require('path'),
        User = require(path.resolve('server/models/user')).UserModel,
        env = require(path.resolve('etc/env')),
        debug = require('debug')('sweet_story'),
        passport = require('passport');
    app.use(passport.initialize());
    app.use(passport.session());

    VK_APP_ID = process.env.VK_APP_ID || env.vk.VK_APP_ID;
    VK_APP_SECRET = process.env.VK_APP_SECRET || env.vk.VK_APP_SECRET;

    if (!VK_APP_ID || !VK_APP_SECRET) {
        throw new Error('VK_APP_ID or VK_APP_SECRETi is null');
    };

    passport.serializeUser(function(user, done) {
        debug("serializeUser " + user.id);
        done(null, user.id);
    });

    passport.deserializeUser(function(userId, done) {
        debug("deserializeUser " + userId);
        User.findById(userId,function (err, user) {
            if(err){
                done(err);
            }
            if(!user){
                return done(err, false);
            }
            done(err, user.meta);
        })
    });
    const VKontakteStrategy = require('passport-vkontakte').Strategy;

    passport.use('vkLogIn',new VKontakteStrategy(
        {
            clientID:     VK_APP_ID,
            clientSecret: VK_APP_SECRET,
            scope: ['email'],
            profileFields: ['email'],
            passReqToCallback: true
        },
        function verify(req,accessToken, refreshToken, params, profile, done) {
            process.nextTick(function () {
                User.findOne({
                    'access_tokens.userId':params.user_id
                }, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        user = new User({
                            name: profile.displayName,
                            access_tokens:{
                                userId:params.user_id,
                                client:'vk',
                                token:params.access_token
                            }
                        });
                        user.save(function(err) {
                            if (err) debug(err);
                            return done(err, user.meta);
                        });
                    } else {
                        for(i=0;i<user.access_tokens.length;i++){
                            if(user.access_tokens[i].client === 'vk'){
                                user.access_tokens[i].token = params.access_token;
                                break;
                            }
                        }
                        user.save(function(err) {
                            if (err) debug(err);
                            return done(err, user.meta);
                        });
                    }
                });
            });
        }
    ));
    passport.use('vkSignUp',new VKontakteStrategy(
        {
            clientID:     VK_APP_ID,
            clientSecret: VK_APP_SECRET,
            scope: ['email'],
            profileFields: ['email'],
            passReqToCallback: true
        },
        function verify(req,accessToken, refreshToken, params, profile, done) {
            process.nextTick(function () {
                User.findOne({
                    'access_tokens.userId':params.user_id
                }, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        user = new User({
                            name: req.params.id,
                            access_tokens:{
                                userId:params.user_id,
                                client:'vk',
                                token:params.access_token
                            }
                        });
                        user.save(function(err) {
                            if (err) debug(err);
                            return done(err, user.meta);
                        });
                    } else {
                        return done(null,false,'user already exist');
                    }
                });
            });
        }
    ));
    return module;

}



