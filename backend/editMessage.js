const express = require('express');
const router = express.Router();
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { wss } = require('./index'); // Import WebSocket Server

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

router.put('/edit/:id', async (req, res) => {
  try {
    const { text } = req.body;
    const messageId = req.params.id;
    
    // Extract JWT from cookies
    const token = req.cookies?.token;


    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    let userData;
    try {
      userData = jwt.verify(token, jwtSecret);
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    console.log("Message ID:", messageId);

    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    console.log("User ID from token:", userData.userId);
console.log("Message sender ID:", message.sender.toString());

console.log("JWT token:", token);

    
    // Ensure only the sender can edit the message
    if (message.sender.toString() !== userData.userId.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
    
    message.text = text;
    message.edited = true;
    await message.save();
    

    if (wss && wss.clients) { 
        [...wss.clients].forEach(c => console.log("WebSocket Client:", c.userId));
      }

    // Notify users via WebSocket
    [...wss.clients]
      .filter(c => c.userId === message.sender.toString() || c.userId === message.recipient.toString())
      .forEach(c => c.send(JSON.stringify({
        type: 'messageEdited',
        message: message,
      })));
    
    res.json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
});

module.exports = router;
