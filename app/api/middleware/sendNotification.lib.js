const sendNotification = (message, playerId) => {
    const data = { 
        app_id: process.env.APP_ID,
        contents: {'en':'transaction success, tap to look at payment receipt','id':'transaksi sukses, ketuk untuk melihat struk pembayaran'},
        priority: 10,
        url: message,
        include_player_ids: [playerId]
      };

    const headers = {
      "Content-Type": "application/json; charset=utf-8"
    };
    
    const options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    };
    
    const https = require('https');
    const req = https.request(options, function(res) {  
      res.on('data', function(data) {
        console.log("Response:");
        console.log(JSON.parse(data));
      });
    });
    
    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  };

  module.exports = sendNotification