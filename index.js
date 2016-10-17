/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 *
 * Examples   * One-shot model:
 *  User: "Alexa, ask Minecraft Helper how to make paper."
 *  Alexa: "(reads back recipe for paper)"
 */

'use strict';

var AlexaSkill = require('./AlexaSkill'),
    recipes = require('./recipes');

var APP_ID = undefined; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';
var https = require('https');
var questions = {};
var hostName = "<hostname>";
var username = "<userid>";
var password = "<password>";
var auth = new Buffer(username + ':' + password).toString('base64');

/**
 * MinecraftHelper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HowTo = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HowTo.prototype = Object.create(AlexaSkill.prototype);
HowTo.prototype.constructor = HowTo;

HowTo.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to the Oracle Sales Cloud assistant? ... what can I help you with.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, say help me.";
    response.ask(speechText, repromptText);
};


function sendDiredtions(eventCallback){
  var noteBody = 
             { 
                  notification: {
                      "body" : "tap to start navigation",
                      "title" : "Location Received",
                      "icon" : "icon",
                      "sound" : "default"

                  },
                  data: { 
                    message: 
                    "https://www.google.com/maps/dir/751+Port+Walk+Place,+Redwood+City,+CA+94065-1813,+USA/Capital+One+-+SoMa,+201+3rd+St,+San+Francisco,+CA+94103/@37.6464079,-122.4719565,11z/data=!3m1!4b1!4m13!4m12!1m5!1m1!1s0x808f98c78cbdc0db:0xaba47cba0671cd72!2m2!1d-122.252545!2d37.537021!1m5!1m1!1s0x8085807da1d640ef:0x4f69c2c31773649e!2m2!1d-122.3999972!2d37.7850453"
                  }, 
                  to: 
                  "eBYcizqQyuA:APA91bFOHfnH7lBnzN5u7vqY_plod-imbhEccJNPDTJ27cMhYqJuKbvOUFPhPWHT2qdVNtg7Fpg11v9aeUyM1n5woIp7MOnFuQ5HIv0voGesubxwnqjOQn_ZsFSd6ga2AikY6HoYCBBU"
            };

    var messageString = JSON.stringify(noteBody);


    var options = {
      appid: "amzn1.echo-sdk-ams.app.your-app-id",
      host: "fcm.googleapis.com",
      path: "/fcm/send",
      method: "POST",
      json: true,
      headers: {
                        Authorization: 'key=<Google Project Key>',
                        'Content-Type': 'application/json'
 
                    }
    };  

     var req = https.request(options, function(res) {
        console.log("direction creation response received with response code:" + res.statusCode);
          var body = '';
          res.on('data', function (chunk) {
              body += chunk;
          });

          res.on('end', function () {
              console.log(body);
              eventCallback("");
          });
          //eventCallback("");

     }).on('error', function (e) {
        console.log("Got error in posting a new note: ", e);
        eventCallback("");
    });

    req.write(messageString);
    req.end();

    console.log("end of send to directions"); 
}

/** This method makes the REST call on first request **/
function getJsonEventsFromWikipedia(eventCallback) {

     console.log("vik::::::testing date:" + new Date());
     var date = new Date();
    console.log("ISO date:"  + date.toISOString());
     var today = date.toISOString().substring(0, 10);
     console.log("Final date:" + today);
    //REST paths
    var aptmtPath = "/salesApi/resources/latest/activities?finder=MyAppointmentsInDateRange;EndDtRFAttr=" + today + "T23:59:00-07:00,StartDtRFAttr=" + today + "T00:00:00-07:00&orderBy=ActivityStartDate:asc&onlyData=true&fields=ActivityNumber,ActivityStartDate,Subject,Location,ActivityCreatedBy,PrimaryContactName,AccountId";
    console.log("url:" + aptmtPath);

    var options = {
      appid: "amzn1.echo-sdk-ams.app.your-app-id",
      host: hostName,
      path: aptmtPath,
      headers: {
                        Authorization: 'Basic ' + auth,
                        'Content-Type': 'application/json'
                    }
    };


    //call for appointments
    https.get(options, function(res) {
                        console.log("vik:::::::::::::::::::::inside data fetch with res:" + res.toString());
                        var body = '';

                        res.on('data', function (chunk) {
                            body += chunk;
                        });

                        res.on('end', function () {
                            var retArr = parseJson(body);
                   
                            retArr["this"] = "I have added your note to this meeting";
                            retArr["deals"] = "There are 3 deals that are due close by tomorrow";
                            retArr["open opportunities"] = "There are 7 open opportunities this week.";
                            retArr["traffic"] = "There is a moderate traffic. It will take about 15 to 20 min via US 101";
                            retArr["thank you"] = "Have a nice day!";
                            eventCallback(retArr);
                        
                        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
        eventCallback("");
    });
}

function parseJson(inputText) {
    console.log("vik:::::::::::: new url inside parse json");
    console.log("inputText:" + inputText);
    var retArr = {};
    var obj = JSON.parse(inputText);

    
    if(obj.items.length == 0){
      retArr["meetings"] = "You have no meetings today.";
      retArr["appointments"] = "You have no meeting today.";
    }
    else if(obj.items.length == 1){
      retArr["meetings"] = "You have 1 meeting today.";
      retArr["appointments"] = "You have 1 meeting today.";
    }
    else{
      retArr["meetings"] = "You have " + obj.items.length + " meetings today.";
      retArr["appointments"] = "You have " + obj.items.length + " appointments today.";
    }
    
     if(obj.items.length > 0){
          //get first meeting details
         var mTime = obj.items[0].ActivityStartDate;
         console.log("meeting start date and time:" + mTime);
         mTime = formatTime(mTime);
         console.log("meeting start time as per Sushma:" + mTime);
         var meetingDetails = "Your first meeting is at " + mTime + " am for " + obj.items[0].Subject + " at " + obj.items[0].Location;
         retArr["meeting"] = meetingDetails;
         retArr["appointment"] = meetingDetails;
         retArr["activityNumber"] = obj.items[0].ActivityNumber;
         retArr["accountId"] = obj.items[0].AccountId;
     }
    
    return retArr;
}

function formatTime(inputDate) {
                var date = new Date(inputDate);
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var ampmflag = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                hours = hours - 7;
                if( hours < 0)
                  ampmflag = (ampmflag == 'PM') ? 'AM' : 'PM';
                hours = hours < 0 ? 12 + hours : hours;
                minutes < 10 ? '0' + minutes : minutes;
                var outTime = hours + " " + minutes + ' ' + ampmflag;
                return outTime;
}
 

function getOptys(eventCallback){
     console.log("start of getOptys");
     var optyPath = "/salesApi/resources/11.1.11/opportunities?finder=MyOpportunitiesFinder;OptyStatusCode=OPEN,RecordSet=MYOPTIES,EffectiveBeginDate=2016-01-01,EffectiveEndDate=2016-10-10&onlyData=true&fields=OptyId";
      var options = {
      appid: "amzn1.echo-sdk-ams.app.your-app-id",
      host: hostName,
      path: optyPath,
      headers: {
                        Authorization: 'Basic ' + auth,
                        'Content-Type': 'application/json'
                    }
      };

      https.get(options, function(res) {
                        console.log("vik:::::::::::::::::::::inside opty data fetch with res:" + res.toString());
                        var body = '';

                        res.on('data', function (chunk) {
                            body += chunk;
                        });

                        res.on('end', function () {
                            eventCallback(body);
                        
                        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
        eventCallback("");
    });

 }

function handleFirstEventRequest(intent, session, response) {
    var repromptText = "With History Buff, you can get historical events for any day of the year. For example, you could say today, or August thirtieth. Now, which day do you want?";
    
    var sessionAttributes = {};
    var cardContent = "";

    var cardTitle = "Events on ";
    //response.tell("There is an issue here vik");
    getJsonEventsFromWikipedia(function (events) {
        var speechText = "";
        sessionAttributes.text = events;

        if (events.length == 0) {
            speechText = "There is a problem connecting to Oracle Sales Cloud at this time. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else{
              console.log("vik::::::::::::: json response received");
              console.log("values are:" + events["open opportunities"]);
              //console.log("values are:" + events["appointments"]);

              questions = events;

              console.log("making opty call");
              //make opty call and feed data here
              //this wont work as the call is not blocking
              getOptys(function(events){

                 console.log("real opty count is:" + events);
              });

        
            //once events return the correct data below can be commented

       /*  questions = {
            "meetings": "You have 5 meetings today.",
            "appointments": "You have 5 appointments today.",
            "meeting": "Your first meeting is at 10 30 am with Safeway in their office. The agenda is to discuss new sales mobile application uptake and road map for Release 13 features",
            "appointment": "Your first appointment is at 10 30 am with Safeway in their office. The agenda is to discuss new sales mobile application uptake and road map for Release 13 features",
            "traffic": "There is a moderate traffic. It will take about 15 to 20 min via US 101",
            "this": "I have added your note to this meeting",
            "open opportunities": "There are 14 open opportunities this week.",
            "deals" : "There are 3 deals that are due close by tomorrow",
            "thank you" : "Have a nice day!",
            "coolest" : "Siva Sunder san",
            "attendees": "Siva Sunder san, Anil Ranka and Vik Kumar",
            "participants": "Siva Sunder san, Anil Ranka and Vik Kumar"
        };*/
     
        sessionAttributes.text = questions;
        session.attributes = sessionAttributes;

         var respData = questions["meetings"];
        //responde for default question
        var speechOutput = {
            speech: respData,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: "What else can i help you with?",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

            response.ask(speechOutput,  repromptOutput);
        }
    });
}


function createNewNote(eventCallback) {
    console.log("start of createNewNote method");
    //new Buffer("Hello World").toString('base64')

    console.log("Activity Number::::::::::::" + questions["activityNumber"]);
    var noteData = new Buffer("talk about new products").toString('base64');
     var aptmtPath = "/salesApi/resources/11.1.11/activities/"+ questions["activityNumber"] + "/child/Note";
     var noteBody = 
                        {
                            "NoteTxt" : noteData,
                            "NoteTypeCode" : "GENERAL",
                            "VisibilityCode": "INTERNAL"
                        };

    var messageString = JSON.stringify(noteBody);


    var options = {
      appid: "amzn1.echo-sdk-ams.app.your-app-id",
      host: hostName,
      path: aptmtPath,
      method: "POST",
      json: true,
      headers: {
                        Authorization: 'Basic ' + auth,
                        'Content-Type': 'application/vnd.oracle.adf.resourceitem+json'
 
                    }
    };  

     var req = https.request(options, function(res) {
        console.log("note creation response received with response code:" + res.statusCode);
          var body = '';
          res.on('data', function (chunk) {
              body += chunk;
          });

          res.on('end', function () {
              console.log(body);
              eventCallback("");
          });

     }).on('error', function (e) {
        console.log("Got error in posting a new note: ", e);
        eventCallback("");
    });

    req.write(messageString);
    req.end();

    console.log("end of createNewNote"); 
   // eventCallback("");
}

function handleCreateNewNote(session, response){
    console.log("start of handleCreateNewNote 1");

    createNewNote(function (events) {
         var respData = questions["this"];
         console.log("response data is:" + respData);
        //respond for default question
        var speechOutput = {
            speech: respData,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        var repromptOutput = {
                    speech: "What else can I help with?",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
         response.ask(speechOutput, repromptOutput);
    });
}

function getParticipantDetails(eventCallback){
     console.log("Activity Number::::::::::::" + questions["activityNumber"]);
      var aptmtPath = "/salesApi/resources/11.1.11/activities/"+ questions["activityNumber"] + "/child/ActivityContact";
       var options = {
      appid: "amzn1.echo-sdk-ams.app.your-app-id",
      host: hostName,
      path: aptmtPath,
      headers: {
                        Authorization: 'Basic ' + auth,
                        'Content-Type': 'application/json'
                    }
    };


    //call for appointments
    https.get(options, function(res) {
                        console.log("vik:::::::::::::::::::::inside data fetch with res:" + res.toString());
                        var body = '';

                        res.on('data', function (chunk) {
                            body += chunk;
                        });

                        res.on('end', function () {
                            var retArr = parseActivityContactJson(body);
                            eventCallback(retArr);
                        
                        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
        eventCallback("");
    });
}


function parseActivityContactJson(inputText){
    var obj = JSON.parse(inputText);
    var contacts = "";
    if(obj.items != null){
             console.log("json length" + obj.items.length);
             var objArr = obj.items;
        
            for(var i =0 ; i <objArr.length; i++){
                contacts += objArr[i].ContactName + ", ";
            }

            console.log("values processed:" + i);
        }
        return contacts;
}

function handleSendToDirections(session, response){
    console.log("Start of handleSendToDirections");

    sendDiredtions(function (events) {
         console.log("response data is:" + events);
        //respond for default question
        var speechOutput = {
            speech: "sent",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        var repromptOutput = {
                    speech: "What else can I help with?",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
         response.ask(speechOutput, repromptOutput);
    });

}


function handleParticipantDetails(session, response){
    console.log("Start of getParticipantDetails");

    getParticipantDetails(function (events) {
         console.log("response data is:" + events);
        //respond for default question
        var speechOutput = {
            speech: events,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        var repromptOutput = {
                    speech: "What else can I help with?",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
         response.ask(speechOutput, repromptOutput);
    });

}


/**
 this is not implemented yet as it needs contact id
**/
function addContactToActivity(eventCallback) {
    console.log("start of addContactToActivity method");

    console.log("Activity Number::::::::::::" + questions["activityNumber"]);
     var aptmtPath = "/salesApi/resources/11.1.11/activities/"+ questions["activityNumber"] + "/child/Note";
     var noteBody = 
                        {
                            "NoteTxt" : "Anil Ranka",
                            "NoteTypeCode" : "GENERAL",
                            "VisibilityCode": "INTERNAL"
                        };

    var messageString = JSON.stringify(noteBody);


    var options = {
      appid: "amzn1.echo-sdk-ams.app.your-app-id",
      host: hostName,
      path: aptmtPath,
      method: "POST",
      json: true,
      headers: {
                    Authorization: 'Basic ' + auth,
                    'Content-Type': 'application/vnd.oracle.adf.resourceitem+json'
 
                }
    };  

     var req = https.request(options, function(res) {
        console.log("note creation response received with response code:" + res.statusCode);
          var body = '';
          res.on('data', function (chunk) {
              body += chunk;
          });

          res.on('end', function () {
              console.log(body);
              eventCallback("");
          });
          //eventCallback("");

     }).on('error', function (e) {
        console.log("Got error in posting a new note: ", e);
        eventCallback("");
    });

    req.write(messageString);
    req.end();

    console.log("end of createNewNote"); 
   // eventCallback("");
}

function handleAddContact(session, response){
    console.log("Start of handleAddContact");

    addContactToActivity(function (events) {
         console.log("response data is:" + events);
        //respond for default question
        var speechOutput = {
            speech: events,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        var repromptOutput = {
                    speech: "What else can I help with?",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
         response.ask(speechOutput, repromptOutput);
    });
}

function parseAccountJson(inputText){
    var obj = JSON.parse(inputText);
    var accountData = "";
    var orgName = "";
    if(obj.items != null){
        console.log("json length" + obj.items.length);
        orgName = obj.items[0].OrganizationName;
             
    }
    
    accountData = "This account is with " + orgName + ". There are 3 open opportunities at this moment. Be careful! You have lost 5 opportunities in past with them.";
    return accountData;
}

function getAccountDetails(eventCallback){
    console.log("getAccountDetails:::Account id::::" + questions["accountId"]);
      var aptmtPath = "/crmCommonApi/resources/11.1.11/accounts?q=PartyId="+ questions["accountId"];
      var options = {
          appid: "amzn1.echo-sdk-ams.app.your-app-id",
          host: hostName,
          path: aptmtPath,
          headers: {
                            Authorization: 'Basic ' + auth,
                            'Content-Type': 'application/json'
                        }
    };

    console.log("url:" + hostName + aptmtPath);

    //call for appointments
    https.get(options, function(res) {
                        console.log("vik:::::::::::::::::::::inside data fetch with res:" + res.toString());
                        var body = '';

                        res.on('data', function (chunk) {
                            body += chunk;
                        });

                        res.on('end', function () {
                            var retArr = parseAccountJson(body);
                            eventCallback(retArr);
                        
                        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
        eventCallback("");
    });
}

function handleGetAccountInfo(session, response){
    console.log("Start of handleGetAccountInfo");
    console.log("Account id::::" + questions["accountId"]);

    getAccountDetails(function (events) {
         console.log("getAccountDetails:::response data is:" + events);
        //respond for default question
        var speechOutput = {
            speech: events,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        var repromptOutput = {
                    speech: "What else can I help with?",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
         response.ask(speechOutput, repromptOutput);
    });

}


//STARTING POINT
HowTo.prototype.intentHandlers = {
     "GetFirstEventIntent": function (intent, session, response) {
        handleFirstEventRequest(intent, session, response);
    },

    "RecipeIntent": function (intent, session, response) {
        var itemSlot = intent.slots.Item,
            itemName;
        if (itemSlot && itemSlot.value){
            itemName = itemSlot.value.toLowerCase();
        }

        console.log("ItemName:" + itemName);
        var sessionAttributes = session.attributes;
        var quesData = sessionAttributes.text;
          
        var cardTitle = "Recipe for " + itemName;
        var  recipe = recipes[itemName];
        
        if( quesData != null && quesData.toString().length > 0)
            recipe = quesData[itemName];

         var speechOutput,
            repromptOutput;
     //   if (recipe) {
            speechOutput = {
                speech: recipe,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            //response.tellWithCard(speechOutput, cardTitle, recipe);
            
            if(itemName == 'thank you'){
                response.tell(speechOutput);
            }else if(itemName == 'this'){
                console.log("add new note use case intent");
                 handleCreateNewNote(session, response);
            }else if(itemName == 'attendees' || itemName == 'participants'){
                handleParticipantDetails(session, response);
            }else if(itemName == 'add'){
                console.log("vik::::::::::::::: trying to add a new contact to the meeting");
                handleAddContact(session, response);
            }else if(itemName == 'account' || itemName == 'customer'){
                console.log("vik::::::::::::::: trying to get more details about an account");
                handleGetAccountInfo(session, response);
            }else if(itemName == 'driving directions'){
              console.log("vik::::::::: driving directions intent");
                 handleSendToDirections(session, response);
            }
            else if(itemName == 'day'){
                console.log("asking about day summary");
                 repromptOutput = {
                    speech: "What else can I help with?",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };

                speechOutput = {
                    speech: "You won 3 opportunities and closed 7 deals today. Awesome, you were on a roll!",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.ask(speechOutput,repromptOutput);
            }
            else if(recipe){
                //this will handle all hard coded questions
                repromptOutput = {
                    speech: "What else can I help with?",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.ask(speechOutput, repromptOutput);
        
       } else {
            var speech;
            if (itemName) {
                speech = "I'm sorry, I currently do not have the information for " + itemName + ". What else can I help with?";
            } else {
                speech = "I'm sorry, I currently do not have that information. What else can I help with?";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "What else can I help with?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
      }
    },

      "AMAZON.StartOverIntent": function (intent, session, response) {
        
        var today = new Date();
        var curHr = today.getHours();
        console.log("Vik checking time");
        console.log(curHr);

        var moment = "Good Morning!";
        if (curHr < 12) {
          moment = "Good Morning!";
        } else if (curHr < 18) {
         moment = "Good Afternoon!";
        } else {
          moment = "Good Evening!!";
        }

         var speechOutput = {
                speech: moment + " What can I help you with?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
          var  repromptOutput = {
                speech: "What can I help with?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
        response.ask(speechOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask questions such as, how many appointments I have today, or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can say things like, how many deals to close by tomorrow, or you can say exit... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

exports.handler = function (event, context) {
    var howTo = new HowTo();
    howTo.execute(event, context);
};
