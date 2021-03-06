var express = require("express");
var logfmt = require("logfmt");
var app = express();
app.use(logfmt.requestLogger());



var sendEmail = function(email) {
    var Mandrill = require('mandrill-api/mandrill');
    var m = new mandrill.Mandrill();
    m.users.info(function(info) {
        console.log('Reputation: ' + info.reputation + ', Hourly Quota: ' + info.hourly_quota);
    });
/*    var template_name = "HoosClass";
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
            "email": email,
            "name": "fake email name",
            "type": "to"
        }],
        "important": true,
        "track_opens": true
    };
        var async = false;
    var ip_pool = "Main Pool";
    var send_at = "example send_at";
    m.messages.sendTemplate({
        "template_name": template_name,
        "template_content": template_content,
        "message": message
    }, function(result) {
        console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    }); 
*/
};

if (!String.format) {
    String.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

function getCourseFromSmallPage(result, classNum) {
    try {
        var formatCourseAcronym = result.query.results.tr.class.split(" ")[2];
        //alert(formatCourseAcronym);
        if (is_int(formatCourseAcronym[2])) {
            formatCourseAcronym = formatCourseAcronym.substring(0, 2) + " " + formatCourseAcronym.substring(2, formatCourseAcronym.length);
        } else if (is_int(formatCourseAcronym[3])) {
            formatCourseAcronym = formatCourseAcronym.substring(0, 3) + " " + formatCourseAcronym.substring(3, formatCourseAcronym.length);

        } else {
            formatCourseAcronym = formatCourseAcronym.substring(0, 4) + " " + formatCourseAcronym.substring(4, formatCourseAcronym.length);

        }
        var classType = result.query.results.tr.td[2].strong;
        var formatClassType = 10;
        if (classType === "Lecture") {
            formatClassType = 1;
        }
        if (classType === "Discussion") {
            formatClassType = 2;
        }
        if (classType === "Seminar") {
            formatClassType = 3;
        }
        if (classType === "Laboratory") {
            formatClassType = 4;
        }
        if (classType === "Independent Study") {
            formatClassType = 5;
        }
        if (classType === "Practicum") {
            formatClassType = 6;
        }
        if (classType === "Workshop") {
            formatClassType = 7;
        }
        if (classType === "Studio") {
            formatClassType = 8;
        }
        if (classType === "Clinical") {
            formatClassType = 9;
        }


        var units = result.query.results.tr.td[2].p.split(" ");
        var formatUnits = units[0].substring(1, units[0].length);
        if (units.length === 4) {

            formatUnits = formatUnits + " - " + units[2];
        }
        var status = result.query.results.tr.td[3].p.content;
        var waitlist = 0;
        var statusCode = "w";
        if (status.substring(0, 4) === "Wait") {
            var temp = status.split(" ")[2];
            waitlist = temp.substring(1, temp.length - 1);
            statusCode = "w";

        } else if (status === "Closed") {
            statusCode = "c";
        } else if (status === "Open") {
            statusCode = "o";

        }
        var spots = result.query.results.tr.td[4].a.content;
        var professor = result.query.results.tr.td[5].strong.span.content;
        var timing = result.query.results.tr.td[6].p;
        var room = result.query.results.tr.td[7].p;

        var name = result.query.results.td.p;

        var course = {};
        course.acronym = formatCourseAcronym;
        course.classType = formatClassType;
        course.units = units;
        course.waitlist = waitlist;
        course.spots = spots;
        course.professor = professor;
        course.timing = timing;
        course.room = room;
        course.name = name;
        course.number = classNum;
        course.status = statusCode;
        return course;
    } catch (err) {
        res.send(err.message);

    }
}


function is_int(value) {
    if ((parseFloat(value) == parseInt(value)) && !isNaN(value)) {
        return true;
    } else {
        return false;
    }
}

//only for testing
function dostuff(){
//-------------cycle code------------------------
var request = require('request');
var pg = require('pg');
var conString = process.env.DATABASE_URL;
pg.connect(conString, function(err, client) {
    if (err) {
        console.log("!!!!!!!!!!!!!!!!!!" + err.message);
        //res.send(err.message);

    } else {
        console.log(client);
        var q = "select * from alerts where done=false";
        var query = client.query(q);
        query.on('row', function(row) {

            //check if changed. Build a course object with the appropriate fields.
            url = String.format("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Frabi.phys.virginia.edu%2FmySIS%2FCS2%2Fsectiontip.php%3FSemester%3D1148%26ClassNumber%3D{0}%22%20and%20xpath%3D%22%2F%2Ftr%22&diagnostics=false", row.class_num);
            request(url, function(error, response, body) {
                if (error) {
                    console.log(error);
                }


                try {
                    var result = JSON.parse(body);
                    var course = getCourseFromSmallPage(result, classNum);
                    if (course.status === open) {
                        sendEmail(row.email);
                    } else {
                        var listOfChanges = {}; //{name: xxx original: new:}
                        //no point in looking at all the various fields for now. Only compare ones that will likely change ie. units, status (NOT THE NUMBER IN THE WAITLIST!!!), prof, time, room. Things that might change whether person wants to take class or not so as to 
                        if (course.status === "open") {
                            sendEmail(row.email);
                        } else {

                            if (course.professor != row.professor) {
                                listOfChanges.put({
                                    name: "professor",
                                    originalValue: row.professor,
                                    newValue: course.professor
                                });
                            }
                            if (course.timing != row.timing) {
                                listOfChanges.put({
                                    name: "timing",
                                    originalValue: row.timing,
                                    newValue: course.timing
                                });
                            }
                            if (course.units != row.units) {
                                listOfChanges.put({
                                    name: "timing",
                                    originalValue: row.timing,
                                    newValue: course.timing
                                });

                            if(listOfChanges.length>0)
                                {
                                    sendEmail();
                                }
                            }
                        }
                        //ALSO!!!! TO MAKE THIS BETTER, make methods for turning each response, result, ... into a course. DO NOT turn turn entire flow into method. That actually just makes things more confusing, I feel.
                    }
                } catch (err) {
                    console.log(err.message);
                }


            });
        });
    }

});




//-----------------------------------------------
}



var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
    dostuff();
});