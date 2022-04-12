const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const PORT = 5000
const { createUser, login, logout, deposit, withdraw, transfer, getUserBalance, getUsers } = require('./db')

app.use(cors())
app.use(express.json())

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', '*');
    
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Origin');
    
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})

app.post('/user/create', (req, res) => {
    const email = req.query.email
    const name = req.query.name
    const password = req.query.password
    const userRole = req.query.role

    try {
        createUser(email, password, name, userRole)
    } catch(error) {
        res.sendStatus(500)
    }

    res.sendStatus(200)
})

app.post('/user/login', (req, res) => {
    const email = req.query.email
    const password = req.query.password

    try {
        login(email, password)
    } catch(error) {
        res.sendStatus(500)
    }

    res.sendStatus(200)
})

app.post('/user/logout', (req, res) => {
    const email = req.query.email

    try {
        logout(email)
    } catch(error) {
        res.sendStatus(500)
    }

    res.sendStatus(200)
})

app.post('/bank/deposit', (req, res) => {
    const email = req.query.email
    const depositAmount = req.query.depositAmount

    try {
        deposit(email, depositAmount)
    } catch(error) {
        res.sendStatus(500)
    }

    res.sendStatus(200)
})

app.post('/bank/withdraw', (req, res) => {
    const email = req.query.email
    const withdrawAmount = req.query.withdrawAmount

    try {
        withdraw(email, withdrawAmount)
    } catch(error) {
        res.sendStatus(500)
    }

    res.sendStatus(200)
})

app.post('/bank/transfer', async (req, res) => {
    const ownerEmail = req.query.ownerEmail;
    const recipientEmail = req.query.recipientEmail;
    const amount = req.query.amount;

    try {
        await transfer(ownerEmail, recipientEmail, amount)
    } catch(error) {
        res.sendStatus(500)
    }

    res.sendStatus(200)
})

app.get('/bank/balance', async (req, res) => {
    const email = req.query.email
    let balance = -1
    try {
        balance = await getUserBalance(email)
    } catch(error) {
        //res.sendStatus(500)
    }

    res.json({ balance })
})

app.get('/bank/users', async (req, res) => {
    let users = []
    try {
        users = await getUsers()
    } catch(error) {
        res.sendStatus(500)
    }

    res.json({ users })
})

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../', 'build')));
    app.get('/*', (req, res) => {
      res.sendFile(path.join(__dirname, '../', 'build/index.html'), err => res.status(500).send(process.cwd() + '   --' + 'UHSDA: ' + err));
    })
  }