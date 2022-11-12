const request = require('request');
async function CheckRecaptcha(rscaptcha, ip) {
    var secretKey = "6LeL2OQcAAAAAI-Tj9IxbAOscmCd41peUCR8fTSl";
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + rscaptcha + "&remoteip=" + ip;
    return new Promise(resolve => {
        try {
            request(verificationUrl, function (error, response, body) {
                body = JSON.parse(body);
                if (body.success !== undefined && !body.success) {
                    return resolve("false")
                }
                else {
                    return resolve("true")
                }
            })
        }
        catch {
            return resolve("false")
        }
    });
}

module.exports = { CheckRecaptcha }