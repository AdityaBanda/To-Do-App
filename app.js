//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const _ = require("lodash")
// XXX:

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-banda:pass1234@cluster0.bc0uv.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
  name: String
};


const Item = mongoose.model('Item', itemSchema);

const football = new Item({
  name : "Football"
});

const coding = new Item({
  name : "coding"
});

const blogging = new Item({
  name : "blogging"
});

const defaultItems = [football,coding,blogging];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model('List', listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err,founditems){
    if(founditems.length === 0){
      Item.insertMany(defaultItems,function(err){
         if (err){
          console.log(err)
         } else{
          console.log("successfully saved default items to DB")
        }
       });
       res.redirect("/");
    } else {
       res.render("list", {listTitle: "Today", newListItems: founditems});
      }
    });

  });


  app.get("/:customListName",function(req,res){
      const customListName = _.capitalize(req.params.customListName);

      List.findOne({name:customListName },function(err,foundList){
        if(err){
          console.log(err);
        } else {
          if ( !foundList) {
            const list = new List({
              name: customListName,
              items: defaultItems
            });

          list.save();
          res.redirect("/" + customListName);
          } else{
            res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
          }
        }
      });




    });



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name : itemName
  });

    if ( listName === "Today"){
      newItem.save();
      res.redirect("/");
    } else {
      List.findOne({name:listName }, function(err,foundList){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+ listName);

      });

    }



});



app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName  = req.body.listName;


  if ( listName === "Today"){

    Item.findByIdAndRemove(checkedItemId,function(err){

      if(err){
        console.log(err)
      } else {
        console.log("item deleted from database")
      }
        res.redirect("/");

    })

  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId }}}, function(err,foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });

  }



});





app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server started successfully");
});
