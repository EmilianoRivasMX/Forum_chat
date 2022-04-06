var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var Message = mongoose.model('Message',{
  name : String,
  message : String
})

var dbUrl = "mongodb+srv://Emiliano:ERL123@cluster0.1kyy0.mongodb.net/ChatDB?retryWrites=true&w=majority"

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log("\nMessage Saved");

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit("message", req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log("error",error);
  }
  finally{
    console.log("Message Posted\n")
  }

})


io.on("connection", () =>{
  console.log("A user is connected . . .")
})

mongoose.connect(dbUrl, (error) => {
  console.log("Connected to MongoDB With", error, "errors");
})

var server = http.listen(3000, () => {
  console.log("\nServer is running on port: ", server.address().port);
  console.log(`http://localhost:${server.address().port} \n`);
});