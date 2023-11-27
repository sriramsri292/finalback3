const express=require('express');
const app_server=express();
const cors = require('cors');
app_server.use(cors({ origin: '*' }));
app_server .use(express.json());
app_server.use("/users",  require("./controllers/users.controller"));
app_server.use("/auth",require("./controllers/auth.controller"));
module.exports=app_server;
