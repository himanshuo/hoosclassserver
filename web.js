var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());

 var sendEmail = function(res)
{
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('9a0Rrcoz5EJLvaQTkeHVnA');
console.log("worked");
var template_name = "HoosClass";
var template_content = [{
        "name": "HoosClass",
        "content": "example content"
    }];
var message = {
    "html": "<p>Example HTML content</p>",
    "text": "Example text content",
    "subject": "example subject",
    "from_email": "ho2es@virginia.edu",
    "from_name": "Example Name",
    "to": [{
            "email": "ho2es@virginia.edu",
            "name": "fake email name",
            "type": "to"
        }],
    "important": true,
    "track_opens": null
};
var async = false;
var ip_pool = "Main Pool";
var send_at = "example send_at";
mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message}, function(result) {
    console.log(result);
    /*
    [{
            "email": "recipient.email@example.com",
            "status": "sent",
            "reject_reason": "hard-bounce",
            "_id": "abc123abc123abc123abc123abc123"
        }]
    */
}, function(e) {
    // Mandrill returns the error as an object with name and message keys
    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
});
  
};


app.get('/', function(req, res) {
   sendEmail(res);
  res.send('Hello World!s');
  res.send("hsould nevre show up");
  
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});