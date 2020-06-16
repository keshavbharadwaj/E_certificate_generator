var mongoose = require('mongoose');

const certificateSchema=mongoose.Schema({
    data: Object
});

module.exports=mongoose.model("certificates",certificateSchema);