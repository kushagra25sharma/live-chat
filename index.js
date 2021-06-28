const express = require("express");
const app = express();
const server = require("http").Server(app);
// creating server by this way help us to reuse the server instance to run socket.io
// we can also do this by app.listen as it also gives server instance
// the main difference is that here we are creating server on our own on the other hand
// express creates the server for us when we use app.listen
const io = require("socket.io")(server);// we want socket.io to work on this server
const { v4: uuidV4 } = require("uuid"); // creates a link to newly created room


app.set("view engine", "ejs");// settin EJS as templating engine. EJS looks into view folder
// template engine enable us to use static template files and loads the value of variables on runtime
app.use(express.static('public'));// static files will be stored in public folder

app.get("/", (req, res) => { // whenever a user lands on "/" uuid will create a new link and redirects the user to that link 
	res.redirect(`/${uuidV4()}`); // so that they can have their own room 
});

app.get("/:room", (req, res) => { // room will contains a param which will be provided by uuid when we first land on "/" url
	res.render('room', { roomId: req.params.room });
});

// whenever someone connects to server we will set up an event listner that will fire a callback 
// function. The parameter of that function will be the socket instance that is made after we connect to the server
// if 10 clients make connection with the browser they will each have a socket
io.on("connection", (socket) => {
	// when everything is set up (we have user) on the frontend we call this "join-room" function 
	socket.on("join-room", (roomId, userId) => {
	    //console.log(roomId, userId);
		// joining new connection to the room with roomId
		// it makes the matching socket instances join the same room
		socket.join(roomId); 

		// sending a broadcast msg to everyone(except us) present in the room that a new member has joined 
		socket.broadcast.to(roomId).emit("user-connected", userId);

		socket.on("disconnect", () => {
	
			socket.broadcast.to(roomId).emit("user-disconnected", userId);
		});
	});
})

server.listen(5000 || process.env.PORT);