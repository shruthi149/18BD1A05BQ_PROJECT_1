var express=require("express");
var app=express();


var middleware=require("./middleware");
var server=require("./server");
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
const MongoClient=require('mongodb').MongoClient;

const url='mongodb://127.0.0.1:27017';
const dbName='hospitalInventory';
let db;
MongoClient.connect(url,(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName)
    console.log(`Connected to database:${url}`);
    console.log(`Database : ${dbName}`);
});

//reading hospital details

app.get('/hospitaldetails',middleware.checkToken,function(req,res){
    console.log("Fetching details form hospital collection");
    db.collection('hospital').find().toArray(function(err,result){
        if(err) console.log(err);
        res.json(result);
    })
});

//reading ventilator details

app.get('/ventilatordetails',middleware.checkToken,function(req,res){
    console.log("Fetching details form ventilator collection");
    db.collection('ventilators').find().toArray(function(err,result){
        if(err) console.log(err);
        res.json(result);
    })
});

//search ventilators by status

app.post('/searchventilators',middleware.checkToken, (req,res) => {
    console.log("search ventilator by status")
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('ventilators')
    .find({"status":status}).toArray().then(result=>res.json(result));
});

//search ventilators by name
app.post('/searchventilatorsbyname',middleware.checkToken, (req,res) => {
    var name=req.query.name;
    console.log(name);
    var ventilatordetails=db.collection('ventilators')
    .find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});

//search hospital by name

app.post('/searchospitals',middleware.checkToken,function(req,res){
    console.log("search hospital by name");
    var name=req.query.name;
    var query={"name":name};
    console.log(name);
    db.collection('hospital').find(query).toArray().then(result => res.json(result));
});

//update ventilator details

app.put('/updateventilatorsdetails',middleware.checkToken,function(req,res){
    console.log("Update ventilator details");
    var vid=req.query.vid;
    var status=req.query.status;
    console.log(vid+" "+status);
    var query1={"vid":vid};
    var query2={$set:{"status":status}};
    db.collection('ventilators').updateOne(query1,query2,function(err,result){
        if(err) console.log("update Unsuccessful");
        res.json("1 document updated");
        //res.json(result);
    });
});

//adding a ventilator

app.post('/addventilators',middleware.checkToken,function(req,res){
    console.log("Adding a ventilator to the ventilatorInfo");
    var hid=req.query.hid;
    var vid=req.query.vid;
    var status=req.query.status;
    var name=req.query.name;
    console.log(hid+" "+vid+" "+status+" "+name);
    var query={"hid":hid,"vid":vid,"status":status,"name":name};
    db.collection('ventilators').insertOne(query,function(err,result){
        if(err) console.log("record not inserted");
        res.json("ventilator added");
        //res.json(result);
    });
});

//delete ventilators by vid

app.delete('/deleteventilators',middleware.checkToken,function(req,res){
    console.log("deleting a ventilator by Vid");
    var vid=req.query.vid;
    console.log(vid);
    var q1={"vid":vid};
    db.collection('ventilators').deleteOne(q1,function(err,result){
        if(err) console.log("error in deleting the document");
        res.json("ventilator deleted");
    });
});
app.listen(1100);