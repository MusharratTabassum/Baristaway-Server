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
        const reviewsCollection = database.collection("reviews");
        const usersCollection = database.collection("users");


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

        //Update API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedField = {
                $set: {
                    status: updatedOrder.status
                },
            };
            const result = await ordersCollection.updateOne(filter, updatedField, options)
            console.log('order status is updated', id)
            res.json(result)
        })

        // DELETE API 
        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });


        //-------------------------- Review API ------------------------------//

        // GET API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const allReviews = await cursor.toArray();
            res.send(allReviews);
        });


        //POST API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log(review);
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result)
        });

        //-------------------users API----------------------//

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }

        })


    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);