const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const mySecret = process.env['MONGO_URI'];
const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration:{
    type: Number,
    required: true
  },
  date:{
    type: Date,
    required: true
  }
});
const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true
  }
});

mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });
let User = mongoose.model('User',userSchema);
let Exercise = mongoose.model('Exercise',exerciseSchema);

app.post('/api/users',async (req,res)=>{
  let user = new User(req.body);
  await user.save();
  res.json({username:user.username,_id:user._id});
})

app.post('/api/users/:_id/exercises',async (req,res)=>{
  if(req.body.date==undefined) 
  req.body.date = new Date().toISOString();
  let user = await User.findById(req.params._id);
  req.body.username = user.username;
  let exercise = new Exercise(req.body);
  await exercise.save();
  res.json({username:exercise.username,
  description:exercise.description,
  duration:exercise.duration,
  date:new Date(exercise.date).toDateString(),
  _id:req.params._id
  });
})

app.get('/api/users', async (req,res) =>{
  let p = await User.find({});
  res.send(p);
});
app.get('/api/users/:_id/logs',async (req,res) =>{
  let fro = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;
  let user = await User.findById(req.params._id);
  let p = Exercise.find({username:user.username},{_id:0,description:1,duration:1,date:1});
  if(limit!=undefined)p.limit(limit);
  p = await p.exec();
  p=p.map(obj=>{return {description:obj.description,duration:obj.duration,date:new Date(obj.date).toDateString()};});
  let obj={
    username:user.username,
    count:p.length,
    _id:req.params._id,
    log:p
  }
  console.log(obj);
  res.json(obj);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
