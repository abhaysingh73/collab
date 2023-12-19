const { MongoClient } = require("mongodb");
module.exports.getData = async (data) => {
    const uri = "mongodb+srv://abhay73986:5PiSzXE0sxHQZR8r@cluster0.yrueoz6.mongodb.net/mydb";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();
    const db = client.db("test");
    const result = db.collection("messages");
    let messages;
    if (!data.to) {
        messages = await result.findOne({ "user": data.user });
    } else {
        messages = await result.findOne({ "user": data.user, "to": data.to });
    }
    return messages;
}

module.exports.updateData = async (newChat) => {
    const uri = "mongodb+srv://abhay73986:5PiSzXE0sxHQZR8r@cluster0.yrueoz6.mongodb.net/mydb";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();
    const db = client.db("test");
    const messages = db.collection("messages");
    const senderMessage = await messages.findOne({ "user": newChat.user });
    const receiverMessage = await messages.findOne({ "user": newChat.to });
    let result;
    if (senderMessage) {
        if (senderMessage.to[newChat.to]) {
            senderMessage.to[newChat.to].push(newChat.message);
        } else {
            senderMessage.to[newChat.to] = [];
            senderMessage.to[newChat.to].push(newChat.message);
        }
        result = await messages.updateOne({ "user": newChat.user }, { $set: { to: senderMessage.to } });//updating sender

    } else {

        var schema = {
            "user": newChat.user,
            "to": {
                [newChat.to]: [
                    newChat.message
                ]
            },
            "modified_on": newChat.modified_on
        }
        result = await messages.insertOne(schema);
    }

    let result2;
    newChat.message.direction = "in";
    if (receiverMessage) {
        if (receiverMessage.to[newChat.user]) {
            receiverMessage.to[newChat.user].push(newChat.message);
        } else {
            receiverMessage.to[newChat.user] = [];
            receiverMessage.to[newChat.user].push(newChat.message);
        }
        result2 = await messages.updateOne({ "user": newChat.to }, { $set: { to: receiverMessage.to } });//updating receiver

    } else {
        result2 = await messages.insertOne(newChat);
    }

    client.close();
    return result;
}

module.exports.signup = async (req) => {
    const uri = "mongodb+srv://abhay73986:5PiSzXE0sxHQZR8r@cluster0.yrueoz6.mongodb.net/test";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();
    const db = client.db("test");
    const users = db.collection("users");
    const user = await users.find({ "username": req.username }).toArray();
    if (user.length > 0) {
        return "user already exists"
    } else {
        const newuser = await users.insertOne(req);
        client.close();
        return "done";
    }
}

module.exports.findUser = async (req) => {
    try {
        console.log("findUser - " + JSON.stringify(req));
        const uri = "mongodb+srv://abhay73986:5PiSzXE0sxHQZR8r@cluster0.yrueoz6.mongodb.net/test";
        const client = new MongoClient(uri, { useNewUrlParser: true });
        await client.connect();
        console.log("connected to db");
        const db = client.db("test");
        const users = db.collection("users");
        const user = await users.find({ "username": req.username, "password": req.psw }).toArray();
        if (user.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log("findUser exception - " + err);
    }
}
module.exports.findAllUser = async (req) => {
    const uri = "mongodb+srv://abhay73986:5PiSzXE0sxHQZR8r@cluster0.yrueoz6.mongodb.net/test";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();
    const db = client.db("test");
    const users = db.collection("users");
    const user = await users.find({}, { "_id": 0, password: 0 }).toArray();
    return user;
}
