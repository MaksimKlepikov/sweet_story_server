/**
 * Created by kevrat on 06.10.2016.
 */
var mongoose = require('mongoose');
Schema = mongoose.Schema,

    User = new Schema({
        name: {
            type: String,
            unique: true,
            index: true
        },

        access_tokens: [{
            userId: {
                type: String,
                required: true
            },
            client: {
                type: String,
                required: true
            },
            token: {
                type: String,
                unique: true,
                required: true
            },
            created: {
                type: Date,
                default: Date.now,
                required: true
            },
        }],

        money: {
            type: Number,
            default: 0,
        },
        friends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        level: {
            type: Number,
            default: 0,
        },
    });

User.virtual('userId')
    .get(function () {
        return this.id;
    });
User.virtual('meta')
    .get(function () {
        return {
            id: this._id,
            name: this.name,
            money: this.money,
            level: this.level
        }
    });

module.exports.UserModel = mongoose.model('User', User);