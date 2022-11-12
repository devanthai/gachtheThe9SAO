const md5 = require('md5');
const request = require('request');
PostCard = (telco, declared, code, serial, partner_id, partner_key, url,requestId) => {
    return new Promise(resolve => {
        
        var options = {
            'method': 'POST',
            'url': url,
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "telco": telco,
                "code": code,
                "serial": serial,
                "amount": declared,
                "request_id": requestId,
                "partner_id": partner_id,
                "command": "charging",
                "sign": md5(partner_key + code + "charging" + partner_id + requestId + serial + telco)
            })
        };
        request(options, async function (error, response,body) {
            if(error)
            {
                return resolve(null) 
            }
            else if (response.statusCode == 200) {
                return resolve(body) 
            }
            else {
                return resolve(null) 
            }
        })
    })
}
module.exports = PostCard