const convert = (str) => {
    return Buffer.from(str, "hex").toString('utf8')
}


console.log(convert("454e4249454e20313233343536"))

