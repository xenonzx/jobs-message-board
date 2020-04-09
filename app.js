const express = require('express');
const app =  express();
const crypto = require('crypto');
app.get('/', function(req, res){
    res.send("helloworld");
});

app.put('/message/:ID', function(req, res){
    const id = req.params.ID;
    res.send(crypto.createHash('sha1')
      .update(new Date().toDateString() + id)
      .digest('hex'));
});
app.listen(process.env.PORT || 3000, 
    () => console.log("Server is running..."));
    
    