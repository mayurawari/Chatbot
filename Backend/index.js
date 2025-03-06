import express from "express";
import { config } from "dotenv";
config();
import cors from "cors";
import Botroute from "./src/routes/BotRoute.js";

const server=express();
server.use(express.json());
server.use(cors());
const port=process.env.PORT || 8080

server.use("/api", Botroute);

server.get("/",(req,res)=>{
    try {
        res.send("this is home route");
    } catch (error) {
        console.log(error);
    }
})
server.listen(port,()=>{
    try {
        console.log(`server is running on ${port}`);
    } catch (error) {
        console.log(error);
    }
})





