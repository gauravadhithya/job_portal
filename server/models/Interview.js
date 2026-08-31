const mongoose=require('mongoose');

const interview=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,

    },
    skills:{
        type:[String],
        default:[],
    },
    education:{
        type:String,

    },
    experience:{
        type:String,
    },
    resume:{
        type:String,
    }
},{timestamps:true});

modules.exports = mongoose.model('Interview',interview);