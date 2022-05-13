var express = require("express");
var app = express();
app.use(express.json());

app.set('view engine','ejs');

app.use("/public", express.static(__dirname + '/public'));
app.use('/', require('./routes/main'));

app.listen(3000,function(){
    console.log("Working on port 3000");
});