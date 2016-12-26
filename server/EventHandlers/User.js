/**
 * Created by kevrat on 20.11.2016.
 */
var debug = require('debug')('sweet_story');
var path = require('path');
var io = require('socket.io')
var UserModel = require(path.resolve('server/models/user')).UserModel;
var Session = require(path.resolve('server/models/session')).SessionModel;
var User = function (app, socket) {

    this.app = app;
    this.socket = socket;

    this.handler = {
        getUsers: getUsers.bind(this),
        getUsersMeta: getUsersMeta.bind(this),
        getUser: getUser.bind(this),
        addUser: addUser.bind(this),
        deleteUser: deleteUser.bind(this),
        // logout: logout.bind(this)
    };
}

// Events

function getUsers(callback) {
    callback(this.socket.request.user.Users || []);
};
function getUsersMeta(callback) {
    UserModel.findById(this.socket.request.user.id, function (err, user) {
        if(err) console.log(err);
        callback(user.UsersMeta);
    });
};
function getUser(callback) {
    UserModel.findById(this.socket.request.user.id, function (err, user) {
        if(err) console.log(err);
        callback(user.meta);
    });
};
function addUser(name) {
    self = this;
    UserModel.findByIdAndUpdate(
        this.socket.request.user.id,
        {$push: {"Users": {name:name}}},
        {safe: true, upsert: false, new : true},
        function(err, user) {
            if(err)console.log(err);
            self.socket.emit('updateUser', user.UsersMeta);
        }
    );
};
function deleteUser(name) {
    self = this;
    UserModel.findByIdAndUpdate(
        this.socket.request.user.id,
        {$pull: {"Users": {name:name}}},
        {safe: true, upsert: false, new : true},
        function(err, user) {
            if(err)console.log(err);
            self.socket.emit('updateUser', user.UsersMeta);
        }
    );
};
// function logout() {
//     debug("user logout");
//     Session.findOneAndRemove({
//         'session.passport.user':this.socket.request.user.id
//     }, null, function () {
//         console.log('session removed');
//
//     })
// };

module.exports = User;