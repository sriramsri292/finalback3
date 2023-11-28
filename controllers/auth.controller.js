const AuthRouter=require("express").Router();
const UserModel = require("../models/users.model");
const { comparePasswords } =require("../authentication/auth.js");
var mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const multer = require('multer');
const fileUpload = require('express-fileupload')




AuthRouter.post('/forgotpassword', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (user) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      user.password = hashedPassword;
      const result = await user.save();

      if (result && result._id) {
        return res.status(200).json({
          message: "Password updated successfully!",
          success:true,
          data: result,
        });
      } else {
        return res.status(401).json({
          message: "Alas! Error updating the password.",
          success:false,
        });
      }
    } else {
      return res.status(404).json({
        message: "User not found with the provided email.",
        success:false,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err,
    });
  }
});

module.exports = AuthRouter;



AuthRouter.post("/signin", async (req, res, next) => {
    const { email, password } = req.body;
    UserModel.findOne({ email: email })
      .then(async (cursor) => {
        if (cursor && cursor._id) {
          const isMatching = await comparePasswords(password, cursor.password);
          if (isMatching) {
            
            return res.status(200).json({
              success: true,
            
              message: "Login Successful!!",
            });
          } else {
            return res.status(200).json({
              success: false,
              message: "Email or Password is wrong, Try Again!!",
            });
          }
        } else {
          return res.status(200).json({
            success: false,
            message:
              "Account Does not Exists, Please create your account to continue!!",
          });
        }
      })
      .catch((err) => {
        return res.status(401).json({
          success: false,
          message: "Error Fetching Users Data!!!",
          error: err,
        });
      });
  });






  AuthRouter.post("/signup", (req, res, next) => {
    const data = req.body;
    console.log(data);
    bcrypt.hash(req.body.password, saltRounds).then(function (hash) 
    {
      if (hash) {
        const User = new UserModel({ ...data, password: hash });
        User.save()
          .then((result) => {
            if (result && result._id) {
              return res.status(200).json({
                message: "User Created Successfully!!",
                success: true,
                data: result,
              });
            }
          })
          .catch((err) => {
            console.error("Error creating user:", err);
            return res.status(401).json({
                message: "Alas! Error Creating User!!",
                error: err.message,  // Log the error message
            });
        });
        
      } else {
        return res.status(400).json({
          message: "Password is not in required format",
        });
      }
    });
  });


  AuthRouter.post("/updateprofile", async (req, res, next) => {
    const { email, username, dob, about,city,passion } = req.body;
  
    try {
      console.log("Received request to update profile:", { email, username, dob, about });
  
      const user = await UserModel.findOne({ email });
  
      if (user) {
        user.userName = username;
        user.dob = dob;
        user.about = about;
        user.city=city;
        user.passion=passion;
  
        const result = await user.save();
  
        if (result && result._id) {
          console.log("Profile updated successfully:", result);
          return res.status(200).json({
            message: "Profile updated successfully!",
            success: true,
            data: result,
          });
        } else {
          console.log("Error updating profile:", result);
          return res.status(401).json({
            message: "Alas! Error updating the profile.",
            success: false,
          });
        }
      } else {
        console.log("User not found with the provided email:", email);
        return res.status(404).json({
          message: "User not found with the provided email.",
          success: false,
        });
      }
    } catch (err) {
      console.error("Internal server error:", err);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  });
  




 AuthRouter.post("/followreq",async (req,res,next)=>
 {
  const {email,userName}=req.body;
  try{
    console.log("Received request to update profile:", {email,userName });
  
      
      const receiver=await UserModel.findOne({userName});
      const sender = await UserModel.findOne({ email });
      console.log("Sender:", sender);
          console.log("Receiver:", receiver);

      if (sender && receiver) {
     
        if (!receiver.followers.includes(sender._id)) {
     
          receiver.followers.push(sender._id);
          await receiver.save();
      
          // Check if the receiver is not already in the following array of the sender
          if (!sender.following.includes(receiver._id)) {
            // If not, add the receiver to the following array of the sender
            sender.following.push(receiver._id);
            await sender.save();
      
            // Create a follow notification for the receiver
            receiver.notifications.push({
              type: "follow",
              sender: sender._id,
              message: `${sender.userName} started following you.`,
            });
            await receiver.save();
      
            return res.status(200).json({
              message: 'Follow request accepted successfully',
              success: true,
            });
          } else {
            return res.status(400).json({
              message: 'You are already following this user',
              success: false,
            });
          }
        } else {
          return res.status(400).json({
            message: 'You are already following this user',
            success: false,
          });
        }
      } else {
        return res.status(404).json({
          message: 'Sender or receiver user not found',
          success: false,
        });
      }
  }catch (err) {
      console.error("Internal server error:", err);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }

 });


 
  
  module.exports=AuthRouter;