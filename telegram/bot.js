const TelegramBot = require('node-telegram-bot-api');
const token = '5368042260:AAGGRVioC19aQ9Azl1AyYDHbYvDpQilEAak';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(chatId)
    
});
bot.on("polling_error", (data)=>{
    
});



module.exports = bot
