var express=require("express");
var bodyParser=require("body-parser");

const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Jacopo:Mongoloide@atlascluster.ulvx08n.mongodb.net/test.orders");
var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
    console.log("connection succeeded");
})

var app=express()


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/orderform.html', function(req,res){
    var type1 = req.body.wedding;
    var type2 = req.body.corporate;
    var type3 = req.body.social;
    var type4 = req.body.other;
    var data =req.body.data;
    var time = req.body.time;
    var place =req.body.place;
    var guests = req.body.guests;
    var format1 = req.body.buffet;
    var format2 = req.body.alacarte;
    var format1 = req.body.buffet;
    var dish1 = req.body.apetizer1;
    var dish2 = req.body.apetizer2;
    var dish3 = req.body.maincourse1;
    var dish4 = req.body.maincourse2;

    var apetizer = {
        "1": dish1,
        "2":dish2,
    }

    var maindishes = {
        "1": dish3,
        "2":dish4,
    }
    db.collection('details').insertOne(data,function(err, collection){
        if (err) throw err;
        console.log("Record inserted Successfully");

    });

    return res.redirect('order_success.html');
})


app.get('/',function(req,res){
    res.set({
        'Access-control-Allow-Origin': '*'
    });
    return res.redirect('homepage.html');
}).listen(3000)


console.log("server listening at port 3000");
