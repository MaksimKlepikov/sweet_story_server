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

        bestScore: {
            type: Number,
            default: 0,
        },
        // friends: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User'
        // }],
        level: {
            type: Number,
            default: 0,
        },
        progress:[
            {
                _id : false,
                name: {
                    type: String,
                    unique: true,
                },
                done: {
                    type: Number,
                    default: 0,
                },
            }
        ],
        updateDate: {
            type: Date,
            default: Date.now,
            required: true
        },
    });

User.virtual('userId')
    .get(function () {
        return this.id;
    });

User.virtual('data')
    .get(function () {
        return {
            id: this.id,
            name: this.name,
            bestScore: this.bestScore,
            level: this.level,
            progress: this.progress,
            updateDate: this.updateDate,
        }
    });

User.virtual('meta')
    .get(function () {
        return {
            id: this.id,
            name: this.name,
            bestScore: this.bestScore,
            level: this.level,
            updateDate: this.updateDate,
        }
    });

module.exports.UserModel = mongoose.model('User', User);