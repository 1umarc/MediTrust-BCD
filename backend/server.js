require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const { uploadToIPFS } = require("./pinata/ipfs");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

/**
 * Upload file to IPFS
 */
app.post("/api/ipfs/upload", upload.single("file"), async (request, response) => { // Multer gives req.file.buffer and req.file.originalname

    try {
        const cid = await uploadToIPFS
        (
            request.file.buffer,
            request.file.originalname
        ); // params filled here for ipfs.js

        response.json({ cid });

    } 
    catch (error) 
    {
        console.error("Upload error: ", error);

        response.status(500).json
        ({
            error: "IPFS upload failed"
        });
    }
});

app.listen(5000, () =>
{
  console.log("Backend running on http://localhost:5000");
});