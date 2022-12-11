(async()=>{
    "use strict";

    // Dependencies
    const simpleAES256 = require("simple-aes-256")
    const DiffieQuantum = require("../index")
    const request = require("request-async")
    const crypto = require("crypto")
    
    // Variables
    const DifQuantum = new DiffieQuantum()
    
    // Main
    var publicKey = await request("http://localhost:8080/pk") // Get the server public key
    publicKey = JSON.parse(publicKey.body).data

    const client = crypto.createDiffieHellman(Buffer.from(publicKey.split(".")[1], "hex")) // The public key that DiffieQuantum gives is separated into 3 parts using | and first is the HQC public key, second the DH prime number and lastly the server DH public key
    client.generateKeys()

    const secret = await DifQuantum.clientGetSecret(client, publicKey) // Get the secret key from the client(This)
    const encryptedData = simpleAES256.encrypt(secret.secret, "Awesome!").toString("hex")

    // cPublicKey stands for Client Public Key
    const response = await request.post("http://localhost:8080/test", {
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({ cyphertext: secret.cyphertext.toString(), cPublicKey: client.getPublicKey().toString("hex"), data: encryptedData })
    })

    console.log(response.body)
})()