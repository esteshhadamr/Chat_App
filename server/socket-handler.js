/**
 * Create socket.io server as global.
 */
io = require('socket.io')();

const auth = require('./middlewares/auth');

const Message = require('./models/message');
const User = require('./models/user');

const users = {};

/*   Add auth middleware to socket.io server  */
io.use(auth.socket);


/* Handle new connections */
io.on('connection', socket => {
    onSocketConnected(socket);
    socket.on('message', data => onMessage(socket, data));
    socket.on('typing', receiver => onTyping(socket, receiver));
    socket.on('seen', sender => onSeen(socket, sender));
    initialData(socket);
    socket.on('disconnect', () => onSocketDisconnected(socket));
});

// Handle new connection event
const onSocketConnected = socket => {
    console.log('New client connected: ' + socket.id);
    socket.join(socket.user.id);
    users[socket.user.id] = true;
    io.emit('user_status', {
        [socket.user.id]: true
    })
};


// Handle socket disconnection.
const onSocketDisconnected = socket => {
    let room = io.sockets.adapter.rooms[socket.user.id];
    if (!room || room.length < 1) {
        let lastSeen = new Date().getTime();
        users[socket.user.id] = lastSeen;
        io.emit('user_status', {
            [socket.user.id]: lastSeen
        });
    }
    console.log('Client disconnected: ' + socket.user.username);
};

/* Handle user-to-user message event */
const onMessage = (socket, data) => {
    let sender = socket.user.id;
    let receiver = data.receiver;
    let message = {
        sender: sender, receiver: receiver, content: data.content, date: new Date().getTime()
    };
    Message.create(message);
    socket.to(receiver).to(sender).emit('message', message);
};

/* Handle typing message event */
const onTyping = (socket, receiver) => {
    let sender = socket.user.id;
    socket.to(receiver).emit('typing', sender);
};

/* Handle message seen event */
const onSeen = (socket, sender) => {
    let receiver = socket.user.id;
    Message.updateMany({ sender, receiver, seen: false }, { seen: true }, { multi: true }).exec();
};

/* Get all user messages */
const getMessages = userId => {
    let where = [
        { sender: userId }, { receiver: userId }
    ];
    return Message.find().or(where);
};

/* Get all users except the connected user */
const getUsers = userId => {
    let where = {
        _id: { $ne: userId }
    };
    return User.find(where).select('-password');
};

/* Initialize user data after connection */
const initialData = socket => {
    let user = socket.user;
    let messages = [];
    getMessages(user.id)
        .then(data => {
            messages = data;
            return getUsers(user.id);
        })
        .then(contacts => {
            socket.emit('data', user, contacts, messages, users);
        })
        .catch(() => socket.disconnect());
};
