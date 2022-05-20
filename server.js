const express = require("express");
const app = express();
app.use(express.json());

app.set('view engine','ejs');

app.use("/public", express.static(__dirname + '/public'));
app.use('/', require('./routes/main'));

const server = app.listen(3000,function(){
    console.log("Working on port 3000");
});
const io = require('socket.io')(server);
app.set('socketio', io);