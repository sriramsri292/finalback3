const mongoose = require("mongoose");
const { Schema } = mongoose;


const UserSchema = new Schema({
  firstName: {
    type: String,
   
  },
  lastName: String,
  name: String,
  dob: Date,
  email: String,
  phoneNumber: String,
  gender: String,
  age: Number,
  about:String,
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  notifications: [
    {
      type: { type: String }, // "follow", "like", etc.
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: String,
      createdAt: {
        type: Date,
        default: new Date().toString(),
      },
    },
  ],
  messages: [
    {
      chatId: String, // Assuming you have a way to identify chats
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: {
        type: Date,
        default: new Date().toString(),
      },
    },
  ],
  passion:String,
  city: String,
  password: {
    type: String,
    
  },
  profileImage: {
    data: Buffer,
    contentType: String,
},
postImages: [
    {
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true },
    }
],

  addressDetails: {
    addressLine1: String,
    addressLine2: String,
   
    state: String,
    pinCode: Number,
  },
  createdAt: {
    type: Date,
    default: new Date().toString(),
  },
  updatedAt: {
    type: Date,
    default: new Date().toString(),
  },
});

module.exports = mongoose.model("users", UserSchema);