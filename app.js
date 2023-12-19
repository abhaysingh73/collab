const express = require("express");
const http = require("http");
const app = new express();
const session = require('express-session');
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);
const { getData, updateData, signup, findUser, findAllUser } = require("./db");
var messages;
app.set("view engine", "ejs");
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static("./public"));

app.use(session({
    secret: 'abc',
    resave: false,
    saveUninitialized: true
}));

io.on('connection', async (socket) => {
    console.log(`user connected ${socket.id}`);

    // Check if the user is already logged in
    // if (!socket.handshake?.session?.user) {
    //     // For simplicity, you can create a basic login route
    //     socket.emit('loginRequired');
    //     return;
    // }
    socket.on('getData', async (data) => {
        messages = await getData(data);
        socket.emit(`chatHistory`, messages);
    });
    // socket.emit(`chatHistory`, messages);
    socket.on('updateChat', async (data) => {
        var updatedData = data;
        await updateData(data.content);
        // var updatemessages = await getData();
        io.emit('updatedChat',updatedData);
    });

    // Broadcast that a new user has joined
    // io.emit('userJoined', socket.handshake.session.user);

    // Emit list of currently active users
    const activeUsers = Object.keys(io.sockets.sockets).map(socketId => io.sockets.sockets[socketId].handshake.session.user);
    io.emit('activeUsers', activeUsers);
});

async function getMessages() {

}
getMessages();
app.get("/", (req, res) => {
    res.render("login.ejs");
})
app.get("/login/:username", (req, res) => {
    // Set the user in the session
    req.session.user = req.params.username;
    res.render("index.ejs");
});
app.post("/login", async (req, res) => {
    // Set the user in the session
    if (req.body.username && req.body.psw) {
        const userExists = await findUser(req.body);
        if (userExists) {
            req.session.user = req.body.username;
            res.redirect("/chat");
        } else {
            res.redirect("/signup");
        }
    } else {
        res.send("LOGIN FAILED")
    }
});
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
})
app.post('/signup', async (req, res) => {
    if (req.body.username && req.body.password) {
        let signingUp = await signup(req.body);
        if (signingUp === "done") {
            return res.json({ "Status": "SUCCESS", "Msg": "Done" });
        }
        res.json({ "Status": "FAIL", "Msg": signingUp });
    } else {
        res.json({ "Status": "FAIL", "Msg": "Invalid Request" });
    }
})
app.get("/chat", (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
        return;
    }
    res.render("index.ejs")
});
app.get("/session", (req, res) => {
    res.json({user:req.session.user});
});
app.get("/userList", async(req,res)=>{
    var userList = await findAllUser();
    res.json(userList);
})
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});