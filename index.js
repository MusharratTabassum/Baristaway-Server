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


async function run() {
    try {
        await client.connect();
        console.log('successfully connected with server!!');
        const database = client.db("BaristawayDB");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");


        //-------------------------- Product API ------------------------------//

        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        //POST API
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result)
        });
        //-------------------------- Orders API ------------------------------//


        // GET API 

        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // GET API for any specific Order

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await ordersCollection.findOne(query);
            console.log('load booking with id: ', id);
            res.send(order);
        });

        //POST API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log(order);
            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result)
        });
    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);