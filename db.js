const { MongoClient } = require("mongodb");
const connectionString = '"mongodb+srv://nathan:Hamptonej1!@nathan.igthh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"'

let db

MongoClient.connect(connectionString, { useNewUrlParser: true }, (err, client) => {
    if (err) return console.log(err)
  
    // Storing a reference to the database so you can use it later
    db = client.db('banking-application-backend')

    db.listCollections({name: 'users'})
    .next(function(err, collinfo) {
        if (!collinfo) {
            db.createCollection('users')
        }
    });
    console.log(`Connected MongoDB: ${connectionString}`)
})

function createUser(email, password, name, role) {
    db.collection('users').find({ email }).toArray((error, result) => {
        if (error) {
            return
        }

        if (result.length === 0) {
            db.collection('users').insertOne({
                email,
                password,
                name,
                role,
                balance: 0,
                authenticated: false,
            })
            return
        }

        return
    })
}


function login(email, password) {
    db.collection('users').findOneAndUpdate({ email, password }, {$set: {authenticated: true}}, (err, doc) => {
        if (doc.lastErrorObject.updatedExisting != true) {
            return
        }
    })
}

function logout(email) {
    db.collection('users').findOneAndUpdate({ email }, {$set: {authenticated: false}}, (err, doc) => {
        if (doc.lastErrorObject.updatedExisting != true) {
            return
        }
    })
}

function deposit(email, depositAmount) {
    db.collection('users').find({ email }).toArray((error, result) => {
        if (error) {
            //do something if error
            return
        }

        if (result.length === 0) {
            return
        }

        const user = result[0]
        const oldBalance = user.balance

        db.collection('users').findOneAndUpdate({ email}, {$set: {balance: (Number(oldBalance) + Number(depositAmount)) }}, (err, doc) => {
            if (doc.lastErrorObject.updatedExisting != true) {
                return
            }
        })

    })
}

function withdraw(email, withdrawAmount) {
    db.collection('users').find({ email }).toArray((error, result) => {
        if (error) {
            return
        }

        if (result.length === 0) {
            return
        }

        const user = result[0]
        const oldBalance = user.balance

        db.collection('users').findOneAndUpdate({ email}, {$set: {balance: (Number(oldBalance) - Number(withdrawAmount)) }}, (err, doc) => {
            if (doc.lastErrorObject.updatedExisting != true) {
                return
            }
        })

    })
}

async function transfer(ownerEmail, recipientEmail, amount) {
    const ownerDoc = await db.collection('users').findOne({ email: ownerEmail })
    const recipientDoc = await db.collection('users').findOne({email: recipientEmail })

    const oldOwnerBalance = ownerDoc.balance
    const oldRecipientBalance = recipientDoc.balance

    await db.collection('users').findOneAndUpdate({ email: ownerEmail }, {$set: {balance: (Number(oldOwnerBalance) - Number(amount)) }}, (err, doc) => {
        if (doc.lastErrorObject.updatedExisting != true) {
            return
        }
    })

    await db.collection('users').findOneAndUpdate({ email: recipientEmail }, {$set: {balance: (Number(oldRecipientBalance) + Number(amount)) }}, (err, doc) => {
        if (doc.lastErrorObject.updatedExisting != true) {
            return
        }
    })
}

async function getUsers() {
    return new Promise((resolve, reject) => {
        db.collection('users').find().toArray((err, result) => {
            resolve(result)
        })
    })
}

async function getUserBalance(email) {
    const ownerDoc = await db.collection('users').findOne({ email })
    return ownerDoc.balance
}

module.exports = { createUser, login, logout, deposit, withdraw, transfer, getUsers, getUserBalance }