const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

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

        app.get('/bikes', async (req, res) => {
            const query = {};
            const cursor = bikesCollection.find(query);
            const result = await cursor.toArray();
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