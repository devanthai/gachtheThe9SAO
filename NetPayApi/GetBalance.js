const md5 = require('md5');
const request = require('request');
GetBalance = async (partner_id, partner_key, url) => {
    return new Promise(resolve => {
        var options = {
            'method': 'POST',
            'url': url,
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "partner_id": partner_id,
                "command": "getbalance",
                "sign": md5(partner_key + partner_id + "getbalance")
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
module.exports = GetBalance