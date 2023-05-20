const express = require("express");
const app = espress();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb+srv://lorenzobernardi2:Lorenzo@cluster0.vmlxnd9.mongodb.net/convivioDB")

//dataschema

const noteSchema ={




}

const Note = mongoose.model("Note", noteSchema);

app.

app.get("/", function (req, res){
    res.sendFile(__dirname + "/orders.html")

})

//app.post


app.listen(3000, function (){
    console.log("server running on 3000");
}


