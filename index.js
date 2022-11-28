const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');
require('dotenv').config();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

//user and password
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.stfbiry.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//jwt 
function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

async function run(){
    try{
      const categoriesCollection = client.db('old-furniture').collection('categories');
      const productCollection = client.db('old-furniture').collection('resaleProducts');
      const usersCollection = client.db('old-furniture').collection('allUsers');
      const bookingsCollection = client.db('old-furniture').collection('booking');
      
  
      const verifyAdmin = async (req, res, next) => {
          const decodedEmail = req.decoded.email;
          const query = { email: decodedEmail };
          const user = await usersCollection.findOne(query);
  
          if (user?.role !== 'admin') {
              return res.status(403).send({ message: 'forbidden access' })
          }
          next();
      }
      const verifyBuyer = async (req, res, next) => {
          const decodedEmail = req.decoded.email;
          const query = { email: decodedEmail };
          const user = await usersCollection.findOne(query);
  
          if (user?.role !== 'buyer') {
              return res.status(403).send({ message: 'forbidden access' })
          }
          next();
      }
      const verifySeller = async (req, res, next) => {
          const decodedEmail = req.decoded.email;
          const query = { email: decodedEmail };
          const user = await usersCollection.findOne(query);
  
          if (user?.role !== 'seller') {
              return res.status(403).send({ message: 'forbidden access' })
          }
          next();
      }
  
      app.get('/categories', async(req,res)=>{
          const query = {}
          const cursor = categoriesCollection.find(query);
          const categories = await cursor.toArray();
          res.send(categories);
      })
      app.get('/categories/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const category = await categoriesCollection.findOne(query);
          res.send(category);
          });
          app.get('/products', async(req,res)=>{
              const query = {}
              const cursor = productCollection.find(query);
              const categories = await cursor.toArray();
              res.send(categories);
          })
          app.post('/products', async(req,res)=>{
              const product = req.body;
              const result = await productCollection.insertOne(product);
              res.send(result);
          })
          app.get('/users', async (req, res) => {
              const query = {};
              const users = await usersCollection.find(query).toArray();
              res.send(users);
          });
          app.get('/jwt', async (req, res) => {
              const email = req.query.email;
              const query = { email: email };
              const user = await usersCollection.findOne(query);
              if (user) {
                  const token = jwt.sign({ email }, process.env.ACCESS_TOKEN)
                  return res.send({ accessToken: token });
              }
              res.status(403).send({ accessToken: '' })
          });
      
          
          
  
    }
    finally{
  
    }
  }
  run().catch(e=> console.log(e))
  
  
  app.get('/', async (req, res) => {
      res.send('old furniture server is running');
  })
  
  app.listen(port, () => {console.log(`old furniture Bin running on ${port}`);
  })
  
