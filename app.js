//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const day = date.getDate();
const _=require("lodash");
const dotenv=require("dotenv");
dotenv.config({path: "./config.env"});
const mongoURL=process.env.mongoURL;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongoURL);
}
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find()
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect("/");
      }
      else
        res.render("list", { listTitle: day, newListItems: foundItems });
    });
});

app.post("/", function (req, res) {

  const listName = req.body.list;
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  if (listName === day) {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName },)
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
  }

});
app.post("/delete", function (req, res) {
  const listName = req.body.listName;
  const checkedItemId = (req.body.checkbox);
  if (listName === day){
  Item.findByIdAndRemove(checkedItemId).exec();//exec is used to execute the query, without it the query will not be executed and will only be stored in a variable
    res.redirect("/");}
  else
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id: checkedItemId}}})
    .then(function(foundList){
      if(foundList)
      res.redirect("/" + listName);
    });
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function (foundList) {

      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        console.log("saved");
        res.redirect("/" + customListName);
      }
      else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
});
app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000||process.env.PORT, function () {
  console.log("Server started on port 3000");
});
