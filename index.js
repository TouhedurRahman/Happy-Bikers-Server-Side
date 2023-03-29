const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.yrcmf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Unauthorized Access');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'forbidden acces' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const bikesCollection = client.db('happy_bikers').collection('bikes');
        const openionsCollection = client.db('happy_bikers').collection('openions');
        const usersCollection = client.db('happy_bikers').collection('users');

        /*** adding new users ***/
        app.post('/users', async (req, res) => {
            const user = req.body;
            const email = { email: user.email };
            const resgisteredEmail = await usersCollection.findOne(email);

            if (!resgisteredEmail) {
                const result = await usersCollection.insertOne(user);
                res.send(result);
            } else {
                res.status(400).send('Email already exists');
            }
        })

        /*** adding jwt token when login and register ***/
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1hr' })
                return res.send({ accessToken: token })
            }
            console.log(user);
            res.status(403).send({ accessToken: '' });
        })

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
        app.get('/my-items', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = bikesCollection.find(query);
                const myItems = await cursor.toArray();
                res.send(myItems);
            } else {
                return res.status(403).send({ message: 'forbidden access' })
            }
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

        /*** adding users openion ***/
        app.post('/openions', async (req, res) => {
            const openion = req.body;
            const result = await openionsCollection.insertOne(openion);
            res.send(openion);
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