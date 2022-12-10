"use strict";

// Dependencies
const crypto = require("crypto")
const hqc = require("hqc")

// Main
class DiffieQuantum {
    load(){
        return new Promise(async(resolve)=>{
            this.keyPair = await hqc.keyPair()
            this.server = crypto.createDiffieHellman(1000)
            this.serverPrime = this.server.getPrime()
            this.serverClient = crypto.createDiffieHellman(this.serverPrime)
            this.serverClient.generateKeys()

            resolve()
        })
    }

    getPublicHQCKey(){
        return `${this.keyPair.publicKey.toString()}|${this.serverPrime.toString("hex")}|${this.serverClient.getPublicKey().toString("hex")}`
    }

    ServerGetSecret(cyphertext, cPublicKey){
        return new Promise(async(resolve)=>{
            const hqcKey = await hqc.decrypt(Uint8Array.from(cyphertext.split(",").map(x=>parseInt(x,10))), this.keyPair.privateKey)
            const dhmKey = this.serverClient.computeSecret(Buffer.from(cPublicKey, "hex"))

            resolve(Buffer.from(dhmKey.toString("hex") + Buffer.from(hqcKey.toString(), "utf8").toString("hex")))
        })
    }

    clientGetSecret(client, publicKey){
        return new Promise(async(resolve)=>{
            const { cyphertext, secret } = await hqc.encrypt(Uint8Array.from(publicKey.split("|")[0].split(",").map(x=>parseInt(x,10))))
            const dhmKey = client.computeSecret(Buffer.from(publicKey.split("|")[2], "hex"))

            resolve({ cyphertext: cyphertext, secret: Buffer.from(dhmKey.toString("hex") + Buffer.from(secret.toString(), "utf8").toString("hex")) })
        })
    }
}

module.exports = DiffieQuantum