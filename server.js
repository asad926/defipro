const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const crypto = require("crypto");
const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://84.32.188.62:27017/"

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
service:"gmail",
   auth: {
        user: "jordanfisherj@gmail.com",
        pass: "Jordanz3",
     },

});

const app = express();
const path = require('path')
const port = "3001";
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
//app.use(cors())
app.options('*', cors());
//app.use(express.static(path.join(__dirname, "client")));

app.post('/api/send-code',(req,res)=>{
   const {email} = req.body;
   let to = email;
   let code = crypto.randomInt(10000, 99999);

   MongoClient.connect(url, function(err, db) {
    if (err) throw err; 
    var dbo = db.db("DefiPro_DB");   
    var data = { email:to,code:code};
    dbo.collection("user_activation").insertOne(data, function(err, res) {
      if (err) throw err;
      db.close();
  }); 
});

const mailData = { 
from: "no-reply@gmail.com", 
  to: to, 
  subject: 'Email Verification For Registration',
  text: 'Registration Passcode is '+code
}; 


transporter.sendMail(mailData, function (err, info) {
   if(err)
     console.log(err)  
   else  
     console.log(info); 
});
});

app.post('/api/signup', (req,res)=>{
  let {email,verification} = req.body
MongoClient.connect(url,function(err, db) {
  if (err) throw err;
  var dbo = db.db("DefiPro_DB");
  let code = parseInt(verification)
  var query = { email: email,code:code };
  dbo.collection("user_activation").find(query).toArray(function(err, result) {
    if (err) throw err;
     if(result.length<=0){
       console.log("Verification code not matched");
     res.json({verification:false})
}else{
  console.log("Verification code matched");
  var data = { uname:req.body.uname,email:req.body.email,password:req.body.password,wallet:req.body.wallet,contact:req.body.contact,verification_code:req.body.verification,invite_code:req.body.invitation };
    dbo.collection("users").insertOne(data, function(err, result) {
    if (err) throw err;
res.json({"msg":"user registered!!"});
    db.close();
});
}
  });
});
});

app.get('/api/show',(req,res)=>{
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("DefiPro_DB");
  dbo.collection("User").find({}).toArray(function(err, result) {
    if (err) throw err;
    
       res.json(result)
        db.close();
  });
});
})

app.post('/api/login', (req,res)=>{
 MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("DefiPro_DB");

  var query = { uname: req.body.uname,password:req.body.password };
  dbo.collection("users").find(query).toArray(function(err, result) {
    if (err) throw err;
    
     if(result.length<=0){
     res.json({authenticated:false});
}else{
res.json({authenticated:true});
}
    db.close();
  });
});
})

//app.use('/*', function (req,res){
//res.sendFile(path.join(__dirname, 'client', 'index.html'));
//});

app.listen(3001);
console.log('server is listing on 3001 port');
