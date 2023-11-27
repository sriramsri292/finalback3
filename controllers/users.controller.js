const UserRouter = require("express").Router();
const UserModel = require("../models/users.model");
var mongoose = require("mongoose");
const multer = require('multer');

UserRouter.get('/',(req,res,next)=>
{
  UserModel.find().then((cursor)=>
  {
    if(cursor.length>0)
    {
      return res.status(200).json({
        data:cursor,
        meassage:"success"
       })
       
    }
   else{
    return res.status(200).json({
      data:[],
      meassage:"success"
     })
   }

  }).catch((err)=>
  {
    return res.status(401).json({
      message:"error"
    })
  });
})

const fs = require('fs');

UserRouter.get('/users', async (req, res, next) => {
  try {
    const users = await UserModel.find();

    // Convert profile images to data URLs
    const usersWithProfileImages = users.map(user => {
      const profileImage = {
        data: user.profileImage.toString('base64'),
        contentType: 'image/jpeg', // Set the correct content type based on your image format
      };

      return {
        ...user._doc,
        profileImage, // Add the data URL to the user object
      };
    });

    if (usersWithProfileImages.length > 0) {
      return res.status(200).json({
        data: usersWithProfileImages,
        message: "success",
      });
    } else {
      return res.status(200).json({
        data: [],
        message: "success",
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      message: "error",
    });
  }
});






UserRouter.post("/create", (req, res, next) => {
    const data = req.body;
    console.log(data);
  
    const User = new UserModel(data);
    User.save()
      .then((result) => {
        if (result && result._id) {
          return res.status(200).json({
            message: "User created",
            data: result, 
          });
        } else {
          return res.status(400).json({
            message: "User not created",
          });
        }
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({
          message: "Internal server error",
        });
      });
  });

  UserRouter.post('/profile', async (req, res, next) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({
        message: "Email parameter is missing in the request body",
      });
    }
  
    try {
      const user = await UserModel.findOne({ email });
  
      if (user) {
        // Convert image data to base64
        const profileImage = {
          data: user.profileImage.data.toString('base64'),
          contentType: user.profileImage.contentType,
        };
  
        const postImages = user.postImages.map((post) => ({
          data: post.data.toString('base64'),
          contentType: post.contentType,
          _id: post._id, // include other necessary fields
        }));
  
        return res.status(200).json({
          data: {
            ...user._doc,
            profileImage,
            postImages,
          },
          message: "Success",
        });
      } else {
        return res.status(200).json({
          data: null,
          message: "User not found",
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  });
  


  UserRouter.post("/follow", async (req, res, next) => {
    const { email } = req.body;
    try {
      console.log("Received request to update profile:", { email });
      const user = await UserModel.findOne({ email });
      
      if (user) {
        const followingArray = user.following || [];
        
        console.log(followingArray);
        res.json({ following: followingArray });
      } else {
        // Handle the case where the user with the given email is not found
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  UserRouter.post("/notify", async (req, res, next) => {
    const { email } = req.body;
    try {
      console.log("Received request from notify :", { email });
      const user = await UserModel.findOne({ email });
      
      if (user) {
        let followingArray = user.notifications || [];
        
        // Get the last 3 notifications
        const recentNotifications = followingArray.slice(-3);
        
        console.log(recentNotifications);
        res.json({ notifications: recentNotifications });
      } else {
        // Handle the case where the user with the given email is not found
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  UserRouter.post('/message', async (req, res) => {
    const { senderEmail, receiverUsername, text } = req.body;
    console.log("Received request from notify :", { senderEmail, receiverUsername, text });
  
    try {
      // Find the sender user
      const sender = await UserModel.findOne({ email: senderEmail });
  
      // Check if the sender exists
      if (!sender) {
        return res.status(400).json({ error: 'Invalid sender email' });
      }
  
      // Find the receiver user
      const receiver = await UserModel.findOne({ userName: receiverUsername });
  
      // Check if the receiver exists
      if (!receiver) {
        return res.status(400).json({ error: 'Invalid receiver username' });
      }
  
      // Check if the sender is following the receiver
      if (!sender.following.includes(receiver._id)) {
        return res.status(401).json({ message: "You cannot message this person as you are not following them" });
      }
  
      // Create a unique chat ID based on sender and receiver IDs
      const chatId = `${sender._id}_${receiver._id}`;
  
      // Store the message in the sender's messages array
      sender.messages.push({
        chatId,
        text,
        sender: sender._id,
      });
  
      // Save the sender user
      await sender.save();
  
      // Send a notification to the receiver
      const notificationMessage = `${sender.firstName} sent you a message: ${text}`;
      receiver.notifications.push({
        type: 'message',
        sender: sender._id,
        message: notificationMessage,
      });
  
      // Save the receiver user
      await receiver.save();
  
      res.json({ success: true, message: "Successfully done the job" });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const Joi = require('joi');

UserRouter.post('/conversations', async (req, res) => {
    try {
        // Validate request payload using Joi
        const schema = Joi.object({
            chatIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}_[0-9a-fA-F]{24}$/)),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: 'Invalid request payload', details: error.details.map(detail => detail.message) });
        }

        const { chatIds } = req.body;

        // Fetch conversations for each chatId
        const conversations = await Promise.all(
            chatIds.map(async (chatId) => {
                // Extract senderId and receiverId from chatId
                const [senderId, receiverId] = chatId.split('_');

                // Fetch sender and receiver details
                const sender = await getUserDetails(senderId);
                const receiver = await getUserDetails(receiverId);

                // Fetch messages for the chatId from both sender and receiver
                const senderMessages = await getMessages(senderId, chatId);
                const receiverMessages = await getMessages(receiverId, chatId);

                const allMessages = [...senderMessages, ...receiverMessages];

                // Sort messages by timestamp or any other criteria if needed
                allMessages.sort((a, b) => a.timestamp - b.timestamp);

                // Convert profile images to data URLs
                const senderProfileImage = convertImageToDataURL(sender.profileImage);
                const receiverProfileImage = convertImageToDataURL(receiver.profileImage);

                return {
                    chatId,
                    sender: { _id: sender._id, userName: sender.userName, profileImage: senderProfileImage },
                    receiver: { _id: receiver._id, userName: receiver.userName, profileImage: receiverProfileImage },
                    messages: allMessages,
                };
            })
        );

        res.json({ success: true, conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
function convertImageToDataURL(imageBuffer) {
  if (imageBuffer) {
      return {
          data: imageBuffer.toString('base64'),
          contentType: 'image/jpeg', // Set the correct content type based on your image format
      };
  } else {
      console.error('Image data is missing.');
      return null;
  }
}

async function getUserDetails(userId) {
    // Fetch user details using userId (You might need to replace this with your actual implementation)
    const user = await UserModel.findById(userId);
    return user;
}

async function getMessages(userId, chatId) {
  // Fetch messages for the userId and chatId (You might need to replace this with your actual implementation)
  const user = await UserModel.findById(userId);
  const reversedChatId = chatId.split('_').reverse().join('_');
  const messages = user.messages.filter((message) => {
      // Check if the message belongs to the chatId for the current user
      return message.chatId === chatId || message.chatId === reversedChatId;
  });
  return messages;
}


  
  
  
  
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });


// Add this function to your server-side code
const bufferToBase64 = (buffer) => {
  return Buffer.from(buffer).toString('base64');
};

UserRouter.post('/upload', upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'postImage', maxCount: 10 }]), async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists based on the email
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update profileImage if present in the request
    if (req.files['profileImage'] && req.files['profileImage'][0]) {
      const profileImage = {
        data: req.files['profileImage'][0].buffer,
        contentType: req.files['profileImage'][0].mimetype,
        base64: bufferToBase64(req.files['profileImage'][0].buffer),
      };
      existingUser.profileImage = profileImage;
    }

    // Update postImages if present in the request
    if (req.files['postImage'] && req.files['postImage'].length > 0) {
      const newPostImages = req.files['postImage'].map((file) => ({
        data: file.buffer,
        contentType: file.mimetype,
        base64: bufferToBase64(file.buffer),
      }));

      // Use $push to add new post images to the existing array
      existingUser.postImages = existingUser.postImages.concat(newPostImages);
    }

    // Save the user document
    await existingUser.save();

    res.json({success:true, message: 'Images saved successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});


  






  
module.exports = UserRouter;


