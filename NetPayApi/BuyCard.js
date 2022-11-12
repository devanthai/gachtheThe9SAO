const md5 = require('md5');
const request = require('request');
BuyCard = (partner_id, partner_key, url, request_id, service_code, value, qty) => {
    return new Promise(resolve => {
        var options = {
            'method': 'POST',
            'url': url,
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "partner_id": partner_id,
                "command": "buycard",
                "request_id": request_id,
                "service_code": service_code,
                "value": value,
                "qty": qty,
                "sign": md5(partner_key + partner_id + "buycard"  + request_id)
            })
        };
        request(options, async function (error, response, body) {
            if (error) {
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
module.exports = BuyCard