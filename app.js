//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require('mongoose');
require('dotenv').config();
const _ = require('lodash');
const date = require(__dirname + "/date.js");
mongoose.connect(process.env.MONGO_URL);

const itemSchema= new mongoose.Schema({
  item:String
});
const Item = mongoose.model("Item",itemSchema);
const item1= new Item({
  item:"welcom to todolist"
});
const item2= new Item({
  item:"Click + button to add todolist"
});

const item3= new Item({
  item:"welcom to todolist"
});

const arr=[item1,item2,item3];



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

app.get("/", function(req, res) {

//const day = date.getDate();
 Item.find({},function(err, founditems){
     if (founditems.length ===0) {
      Item.insertMany(arr,function(err){
        if(err){
          console.log(err);
        }
        else
        {
          console.log("insert");
        }
      });
      res.redirect("/");
     }
     else
      res.render("list", {listTitle: "Today", newListItems: founditems});
 });
  
});
const listschema=new mongoose.Schema({
  name:String,
  listitem:[itemSchema]
})
app.post("/", function(req, res){
  const itemname = req.body.newItem;
  const customlistName=req.body.list;
  const newitem=new Item({
      item:itemname
  });
  if(customlistName==="Today"){
    newitem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:customlistName},function(err,foundList){
      foundList.listitem.push(newitem);
      foundList.save();
      res.redirect("/" + customlistName);
    });
  }
  
});


const List= mongoose.model("List",listschema);
//List.insertMany(arr,)
app.get("/:customlist", function(req,res){
    const listname=_.capitalize(req.params.customlist) ;
    List.findOne({name:listname},function(err,foundList){
    
      if(!foundList){
        const newlist=new List({
          name:listname,
          listitem:arr
        });
        newlist.save();
        res.redirect("/" + listname);
      }
      else {
        res.render("list", {listTitle:foundList.name, newListItems: foundList.listitem});
       // console.log("list not exist");
      }

    })
    
});
app.post("/delete", function(req,res){
  const findid=req.body.checkbox;
  const Dlistname=req.body.listname;
  //console.log(Dlistname);
  if(Dlistname ==="Today"){
    Item.findByIdAndRemove({_id:findid},function(err){
      res.redirect("/");
    });
  }
else {
  List.findOneAndUpdate({name:Dlistname},{$pull:{listitem:{_id:findid}}}, function(err,foundList){
      if(!err){
        res.redirect("/" + Dlistname);
      }
  })
}
 
});
app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
//app.listen(port);
app.listen(port, function() {
  console.log("Server started Successfully");
});
