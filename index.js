const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.yrcmf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const bikesCollection = client.db('happy_bikers').collection('bikes');

        /*** adding new bikes ***/
        app.post('/bikes', async (req, res) => {
            const bikes = req.body;
            const result = await bikesCollection.insertOne(bikes);
            res.send(bikes);
        })

        /*** getting all bikes from server to client ***/
        app.get('/bikes', async (req, res) => {
            const query = {};
            const cursor = bikesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        /*** getting bikes added by the spacipic user ***/
        app.get('/my-items', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = bikesCollection.find(query);
            const myItems = await cursor.toArray();
            res.send(myItems);
        })

        /*** getting a single bike from server to client by id ***/
        app.get('/updateItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bikesCollection.findOne(query);
            res.send(result);
        })

        /*** update bikes information ***/
        app.put('/updateItem/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const updatedBikeInfo = {
                $set: {
                    quantity: updatedProduct.updatedQuantity
                }
            }
            const result = await bikesCollection.updateOne(
                filter,
                updatedBikeInfo,
                options
            );
            res.send(result);
        })

        /*** delete bikes for all user ***/
        app.delete('/deleteItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bikesCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Happy Bikers server is running");
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});