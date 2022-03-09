const express = require('express');
const { MongoClient, Collection } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send("BaristaOnWay server is running")
})

app.listen(port, () => {
    console.log("Running port on ", port);
})

//Database Authentication and Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.agixt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const collection = client.db("BaristaWay").collection("devices");
    // perform actions on the collection object
    client.close();
});