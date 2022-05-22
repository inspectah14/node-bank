import express from "express";
import session from "express-session";
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const port = 3000;
const app = express();
const saltRounds = 10;

const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const db = client.db('bank');
const usersCollection = db.collection('users');

app.use(express.json());
app.use(express.static('public'));

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "shhhh, very secret",
  cookie: {
    maxAge: 5 * 60 * 1000
  }
}));

app.post('/api/login', async (req, res) => {
  const user = await usersCollection.findOne({ user: req.body.user });
  if(user){
    const passMatch = await bcrypt.compare(req.body.pass, user.pass)
    if (user && passMatch) {
    req.session.user = user;
    res.json({
      user: user.user
    });
  } 
    else { 
      res.status(401).json({ error: 'Unauthorized'});
    }
  }

  else{
    res.status(401).json({ error: 'user does not exist'});
  }
});

app.post('/api/users', async (req, res) => {
  const hash = await bcrypt.hash(req.body.pass, saltRounds);
  
  await usersCollection.insertOne({
    user: req.body.user,
    pass: hash,
    account: {
      accName: req.body.account.accName,
      accBalance: Number(req.body.account.accBalance)
    }
  });
  
  res.json({
    success: true,
    user: req.body.user
  });

});

app.put('/api/users/:id', async (req, res) => {
  let user = await usersCollection.findOne({ _id: ObjectId(req.params.id) });
  user = {
    ...user,
    ...req.body,
    account: {
      accName: req.body.account.accName,
      accBalance: Number(req.body.account.accBalance)
    }
  };
  await usersCollection.updateOne({ _id: ObjectId(req.params.id) }, { $set: user });
  res.json({
    success: true,
    user
  });
});

app.get('/api/loggedin', (req, res) => {
  if(req.session.user) {
    res.json({
      user: req.session.user
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ loggedin: false });
  });
});

app.get("/api/users", async (req, res) => {
  if(req.session.user) {
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  }
});

app.delete('/api/users/:id', async (req, res) => {
  await usersCollection.deleteOne( { _id: ObjectId(req.params.id) } );
  const users = await usersCollection.find({}).toArray();
  res.json(users);
});

app.listen(port, () => console.log(`Listening on port ${port}`));