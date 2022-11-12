const NodeRSA = require('node-rsa');
const path = require('path');
const fs = require('fs');
GiaiMa = (mahoa) => {
    try {
        const privateKey = fs.readFileSync(path.resolve("./NetPayApi/private.key"), "utf8");
        const key = new NodeRSA(privateKey);
        key.setOptions({ encryptionScheme: 'pkcs1' });
        const buffer = Buffer.from(mahoa, "base64");
        const decrypted = key.decrypt(buffer, 'utf8');
        return decrypted
    }
    catch (error) {
        console.log(error)
        return mahoa
    }
}
module.exports = GiaiMa