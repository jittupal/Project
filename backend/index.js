const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
const ws = require('ws');
const fs = require('fs');

dotenv.config();
mongoose.set('strictQuery', true);

const mongoURI = process.env.MONGODB_URL || 'mongodb://localhost:27017/';

mongoose.connect(mongoURI, (err) => {
  if (err) throw err;
  console.log('Connected to MongoDB successfully!');
});
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject('no token');
    }
  });

}

app.get('/test', (req,res) => {
  res.json('test ok');
});

app.get('/messages/:userId', async (req,res) => {
  const {userId} = req.params;
  console.log("UserID: ", req.params)
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender:{$in:[userId,ourUserId]},
    recipient:{$in:[userId,ourUserId]},
  }).sort({createdAt: 1});
  res.json(messages);
});

app.get('/people', async (req,res) => {
  const users = await User.find({}, {'_id':1, username:1, email:1}); // Added email field
  res.json(users);
});

app.get('/profile', (req,res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json('no token');
  }
});

app.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // Accepts either email or username

  try {
    const foundUser = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }], // Allow login via email or username
    });

    if (!foundUser) {
      return res.status(400).json({ error: 'User not found' });
    }

    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (!passOk) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Destructure username properly
    const { username } = foundUser;

    jwt.sign({ userId: foundUser._id, username }, jwtSecret, {}, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err);
        return res.status(500).json({ error: 'Token generation failed' });
      }

      res.cookie('token', token, { sameSite: 'none', secure: true }).json({
        id: foundUser._id,
        username: foundUser.username, // Return username for frontend
      });
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/messages/:id', async (req, res) => {
  let { id } = req.params;

  console.log("message id: ", id)

  try {
    // Ensure id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    // Convert to ObjectId before querying
    id = new mongoose.Types.ObjectId(id);

    const deletedMessage = await Message.findByIdAndDelete(id);
    
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Notify sender & recipient via WebSocket
    [...wss.clients]
      .filter(c => c.userId === deletedMessage.sender.toString() || c.userId === deletedMessage.recipient.toString())
      .forEach(c => c.send(JSON.stringify({
        type: 'messageDeleted',
        messageId: id.toString(),
      })));

    console.log(`Message ${id} deleted successfully`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, bcryptSalt);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/logout', (req,res) => {
  res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body; // Ensure email is included

  try {
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email already in use' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

    // Create the user with all required fields
    const createdUser = await User.create({
      username,
      email, // ✅ Fixed: Email is now included in user creation
      password: hashedPassword,
    });

    // Generate JWT token
    jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err);
        return res.status(500).json({ error: 'Token generation failed' });
      }
      res.cookie('token', token, { sameSite: 'none', secure: true })
        .status(201).json({
          id: createdUser._id,
          username: createdUser.username,
          email: createdUser.email, // Return email for frontend use
        });
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const server = app.listen(4040);

const wss = new ws.WebSocketServer({server});



wss.on('connection', (connection, req) => {

  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
      }));
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });

    // Extract and verify JWT from cookies
    try {
      const cookies = req.headers.cookie;
      if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.trim().startsWith('token='));
        if (tokenCookieString) {
          const token = tokenCookieString.split('=')[1];
          if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
              if (err) {
                console.error('JWT Verification Failed:', err.message);
                connection.terminate(); // Close connection if token is invalid
                return;
              }
              const { userId, username } = userData;
              connection.userId = userId;
              connection.username = username;
              console.log(`User connected: ${username} (${userId})`);
            });
          }
        }
      } else {
        console.error('No token found in cookies');
        connection.terminate();
      }
    } catch (error) {
      console.error('Error in WebSocket Authentication:', error.message);
      connection.terminate();
    }

  connection.on('message', async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file, typing } = messageData;

    // New Typing Indicator Feature
    if (typing !== undefined) {
      [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({
          typing,
          sender: connection.userId,
        })));
    } 
    // Existing message handling
    else if (recipient && (text || file)) {
      let filename = null;
      if (file) {
        console.log('size', file.data.length);
        const parts = file.name.split('.');
        const ext = parts[parts.length - 1];
        filename = Date.now() + '.' + ext;
        const path = __dirname + '/uploads/' + filename;
        const bufferData = Buffer.from(file.data.split(',')[1], 'base64');
        fs.writeFile(path, bufferData, () => {
          console.log('file saved:' + path);
        });
      }
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });
      console.log('created message');
      [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({
          text,
          sender: connection.userId,
          recipient,
          file: file ? filename : null,
          _id: messageDoc._id,
        })));
    }
  });



  // notify everyone about online people (when someone connects)
  notifyAboutOnlinePeople();
});