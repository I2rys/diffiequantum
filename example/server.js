(async()=>{
    "use strict";

    // Dependencies
    const simpleAES256 = require("simple-aes-256")
    const bodyParser = require("body-parser")
    const DiffieQuantum = require("../index")
    const express = require("express")
    
    // Variables
    const web = express()
    const port = process.env.PORT || 8080
    
    const DifQuantum = new DiffieQuantum()
    
    /// Configurations
    // Express
    web.use(bodyParser.json({ limit: "50mb" }))

    // Main
    await DifQuantum.load() // Load the stuff
    
    web.get("/pk", (req, res)=>{
        res.json({
            status: "success",
            data: DifQuantum.getPublicKey() // Get DiffieQuantum public key
        })
    })

    web.post("/test", async(req, res)=>{
        const secret = await DifQuantum.ServerGetSecret(req.body.cyphertext, req.body.cPublicKey) // Get the secret key from the server(This)
        const decryptedData = simpleAES256.decrypt(secret, Buffer.from(req.body.data, "hex")).toString()

        res.send(decryptedData)
    })
    
    web.listen(port, ()=>console.log(`Website is running. Port: ${port}`))
})()