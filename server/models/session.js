/**
 * Created by kevrat on 15.12.2016.
 */

var mongoose = require('mongoose');
/**
 * Session schema
 */
var Session = new Schema({
});
module.exports.SessionModel = mongoose.model('Session', Session);