var express = require("express");
var logfmt = require("logfmt");
var app = express();


app.use(logfmt.requestLogger());

var sendEmail = function(res) {
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
    mandrill_client.messages.sendTemplate({
        "template_name": template_name,
        "template_content": template_content,
        "message": message
    }, function(result) {
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

if (!String.format) {
    String.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

//https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Frabi.phys.virginia.edu%2FmySIS%2FCS2%2Fpage.php%3FSemester%3D1148%26Type%3DGroup%26Group%3DMDST%22%20and%0A%20%20%20%20%20%20xpath%3D%22%2F%2Ftr%5Bcontains(.%2C'20526')%5D%22&format=json&callback=
var checkLousList = function(classNum, subject) {
    var request = require('request');
    var yql = "https://query.yahooapis.com/v1/public/yql?q=\"";
    var query = String.format("select * from html where url='http://rabi.phys.virginia.edu/mySIS/CS2/page.php?Semester=1148&Type=Group&Group={0}' and ", subject);
    var xpath = String.format("xpath='//tr[contains(.,\"{0}\")]'", classNum);
    var params = "&format=json";
    var url = yql + query + xpath + params;
     
    //var xmlHttp = null;

    //xmlHttp = new XMLHttpRequest();
    //xmlHttp.open( "GET", url, false );
    //xmlHttp.send( null );
    //return url;//xmlHttp.responseText;
  var retval="a";
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            retval = body;
            alert("a");
           // return body; // Print the google web page.
        }
       // retval="b";
    });
    return retval;
};

app.get('/', function(req, res) {
    //res.send("queued");
    var email = req.query.email;
    var classNum = req.query.classnum;
    var subject = req.query.subject;
    res.send(checkLousList(20526,"MDST"));
    //sendEmail(res);
    //res.send('id: '+ req.query.id);
    //res.send("hsould nevre show up");

});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});