
let bcrypt = require('bcrypt');

// mã hóa pass
let generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(12), null)
}
let ErrorMessage = function (message) {
    return `<div class="alert alert-danger alert-dismissible error-messages">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>
        <ul>
                            <li>${message}</li>
                    </ul>
    </div>`
}
let SuccessMessage = function (message) {
    return `<div class="alert alert-success alert-dismissible error-messages">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>
    <ul>
        <li>${message}!</li>
    </ul>
</div>`
}
// so sánh pass
let validPassword = function (password, Hash) {
    return bcrypt.compareSync(password, Hash)
}

let cutEmail = function (email) {
    let data = email.split('@');
    let string = '';
    let start = '';
    if (data[0].length > 7) {
        start = data[0].slice(0, 6);
    } else {
        start = data[0].slice(0, data[0].length - 3);
    }
    return string.concat(start, '***@', data[1]);
}

let cutPhone = function (phone) {
    let string = '';
    let start = phone.slice(0, 3);
    let end = phone.slice(phone.length - 2, phone.length);
    return string.concat(start, '*****', end);
}

let validateEmail = function (t) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(t)
}

let checkPhoneValid = function (phone) {
    return /^[\+]?(?:[(][0-9]{1,3}[)]|(?:84|0))[0-9]{7,10}$/im.test(phone);
}
let checkUsernameValid = function (username) {
    const usernameRegex = /^[a-z0-9A-Z_.]+$/
    return usernameRegex.test(username)
}


let phoneCrack = function (phone) {
    let data = phone.match(/^[\+]?(?:[(][0-9]{1,3}[)]|(?:84|0))/im);
    if (data) {
        return {
            region: data[0],
            phone: phone.slice(data[0].length, phone.length),
        };
    }
    return data;
}


// thêm số 0 trước dãy số (lấp đầy bằng số 0)
let numberPad = function (number, length) {
    // number: số
    // length: độ dài dãy số
    let str = '' + number
    while (str.length < length)
        str = '0' + str

    return str
}
// Lấy số từ chuỗi
let getOnlyNumberInString = function (t) {
    let e = t.match(/\d+/g);
    return e ? e.join('') : ''
}

// đổi số thành tiền
let numberWithCommas = function (number) {
    if (number) {
        let result = (number = parseInt(number)).toString().split('.');
        return result[0] = result[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            result.join('.')
    }
    return '0'
}

// kiểm tra chuỗi chống
let isEmpty = function (str) {
    return (!str || 0 === str.length)
}

let checkPasswordValidation = function (value) {
    const isWhitespace = /^(?=.*\s)/;
    if (isWhitespace.test(value)) {
        return "Mật khẩu không được chứa khoảng trắng.";
    }
    // const isContainsUppercase = /^(?=.*[A-Z])/;
    // if (!isContainsUppercase.test(value)) {
    //     return "Password must have at least one Uppercase Character.";
    // }
    // const isContainsLowercase = /^(?=.*[a-z])/;
    // if (!isContainsLowercase.test(value)) {
    //     return "Password must have at least one Lowercase Character.";
    // }
    // const isContainsNumber = /^(?=.*[0-9])/;
    // if (!isContainsNumber.test(value)) {
    //     return "Password must contain at least one Digit.";
    // }
    // const isContainsSymbol =
    //     /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
    // if (!isContainsSymbol.test(value)) {
    //     return "Password must contain at least one Special Symbol.";
    // }
    const isValidLength = /^.{6,16}$/;
    if (!isValidLength.test(value)) {
        return "Mật khẩu phải từ 6 đến 16 kí tự.";
    }
    return null;
}
let isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
function getTransId() {
    var result = '';
    var characters = 'CBEAFD0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 13; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return "T6" + result;
}

function getTransIdBuyCard() {
    var result = '';
    var characters = 'CBEAFD0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 13; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return "S6" + result;
}

function getTranidWithdraw() {
    var result = '';
    var characters = 'CBEAFD0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 13; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return "WS" + result;
}
function getCardId() {
    var result = '';
    var characters = 'CBEAFD0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 13; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return "CARDT6" + result;
}
function getContentNumber() {
    var result = '';
    var characters = '1234567890';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return "Muathe " + result;
}

function getPartnerId() {
    var result = '';
    var characters = '1234567890';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


function getRandomPass() {
    var result = '';
    var characters = '1234567890';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}
function getIpv4FromIpv6(ipv6) {
    try {
        var value = ipv6;
        var split_str = value.split(':');
        value = split_str[6] + split_str[7];
        var ip_1 = ~parseInt(value.substring(0, 2), 16) & 0xFF;
        var ip_2 = ~parseInt(value.substring(2, 4), 16) & 0xFF;
        var ip_3 = ~parseInt(value.substring(4, 6), 16) & 0xFF;
        var ip_4 = ~parseInt(value.substring(6, 8), 16) & 0xFF;
        return ip_1 + '.' + ip_2 + '.' + ip_3 + '.' + ip_4
    }
    catch {
        return ipv6
    }
}
module.exports = {
    getRandomPass: getRandomPass,
    getTransIdBuyCard: getTransIdBuyCard,
    getContentNumber: getContentNumber,
    getPartnerId: getPartnerId,
    checkPasswordValidation: checkPasswordValidation,
    generateHash: generateHash,
    validPassword: validPassword,
    isEmpty: isEmpty,
    numberWithCommas: numberWithCommas,
    getOnlyNumberInString: getOnlyNumberInString,
    numberPad: numberPad,
    validateEmail: validateEmail,
    checkPhoneValid: checkPhoneValid,
    phoneCrack: phoneCrack,
    cutEmail: cutEmail,
    cutPhone: cutPhone,
    checkUsernameValid: checkUsernameValid,
    ErrorMessage: ErrorMessage,
    SuccessMessage: SuccessMessage,
    getTransId: getTransId,
    getCardId: getCardId,
    getTranidWithdraw: getTranidWithdraw,
    isHTML: isHTML,
    getIpv4FromIpv6: getIpv4FromIpv6
}
