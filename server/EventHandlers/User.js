/**
 * Created by kevrat on 20.11.2016.
 */
var debug = require('debug')('sweet_story');
var path = require('path');
var io = require('socket.io')
var UserModel = require(path.resolve('server/models/user')).UserModel;
var Session = require(path.resolve('server/models/session')).SessionModel;
/**
 * Event handler for user
 * @param app - ref to app
 * @param socket - ref to socket
 * @constructor
 */
var User = function (app, socket) {

    this.app = app;
    this.socket = socket;

    this.handler = {
        getRecords: getRecords.bind(this),
        getUsersMeta: getUsersMeta.bind(this),
        getUser: getUser.bind(this),
        addUser: addUser.bind(this),
        deleteUser: deleteUser.bind(this),
        getProgress: getProgress.bind(this),
        updateProgress: updateProgress.bind(this),
        updateProgressOnHill: updateProgressOnHill.bind(this),
        updateLevel: updateLevel.bind(this),
        updateBestScore: updateBestScore.bind(this),
        // logout: logout.bind(this)
    };
}

// Events

function getRecords(callback) {
    UserModel.find()
        .select("-access_tokens -level -progress -updateDate")
        .sort('-bestScore')
        .exec(function(err, users) {
            callback(users || []);
    });
};
/**
 * Get user meta information (see user schema)
 * @param callback
 */
function getUsersMeta(callback) {
    UserModel.findById(this.socket.request.user.id, function (err, user) {
        if(err) console.log(err);
        callback(user.UsersMeta);
    });
};
/**
 * Get user data (see user schema)
 * @param callback
 */
function getUser(callback) {
    UserModel.findById(this.socket.request.user.id, function (err, user) {
        if(err) console.log(err);
        callback(user.data);
    });
};
/**
 * Add user to db
 * @param name
 */
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
/**
 * Delete user from db
 * @param name
 */
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
/**
 * Get user progress (see user schema)
 * @param callback
 */
function getProgress(callback) {
    UserModel.findById(this.socket.request.user.id, function (err, user) {
        if(err) console.log(err);
        callback(user.progress);
    });
};
/**
 * Update user progress
 * @param progress
 * @param callback
 */
function updateProgress(progress, callback) {
    UserModel.findById(this.socket.request.user.id, function (err, user) {
        if(err) console.log(err);
        if(user.progress.length>0){
            user.progress.forEach(function (hill, index) {
                if(progress[index].done>hill.done){
                    hill.done = progress[index].done
                }
            });
        }
        else{
            user.progress = progress
        }

        user.updateDate = Date.now();
        user.save(function (err) {
            if (err) console.log(err);
            callback(user.updateDate, err);
        })

    });
};
/**
 * Update user progress on hill
 * @param progressOnHill
 * @param callback
 */
function updateProgressOnHill(progressOnHill, callback) {
    UserModel.findById(this.socket.request.user.id, function (err, user) {
        if(err) console.log(err);
        user.progress.forEach(function (hill, index) {
            if(progressOnHill.name===hill.name){
                hill.done = progressOnHill.done
                return
            }
        });
        user.updateDate = Date.now();
        user.save(function (err) {
            if (err) console.log(err);
            callback(user.updateDate, err);
        })

    });
};
/**
 * Update user level
 * @param level
 * @param callback
 */
function updateLevel(level, callback) {
    UserModel.findById(this.socket.request.user.id, function (err, user) {
        if(err) console.log(err);
        user.level=level

        user.updateDate = Date.now();
        user.save(function (err) {
            if (err) console.log(err);
            callback(user.updateDate, err);
        })

    });
};
/**
 * Update user best score
 * @param bestScore
 * @param callback
 */
function updateBestScore(bestScore, callback) {
    UserModel.findById(this.socket.request.user.id, function (err, user) {
        if(err) console.log(err);
        user.bestScore=bestScore

        user.updateDate = Date.now();
        user.save(function (err) {
            if (err) console.log(err);
            callback(user.updateDate, err);
        })

    });
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