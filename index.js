

exports.handler = function (event, context) {

    try {
        console.log("try/catch block")
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        console.log(event.request.type);
        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }

}

function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted")
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId + ", sessionId=" + session.sessionId);
      //this.emit(':talk',"begun");
        console.log("worked on session started");
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId + ", sessionId=" + session.sessionId);

    var speechOutput = "Welcome to Reading  Cyborg. Please try another read story prompt.";
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", "false"));

    //this.emit(':talk',"launch");
    console.log("worked on launch");
}



function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to the Reading  Cyborg. ' +
        'Please tell me what story you want';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Please tell me what story you want';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}




function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;
    // Dispatch to your skill's intent handlers
    if (intentName === 'ReadingCyborg') {
        console.log("SOMETHING!");
        readStoryFromSession(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}





const aws = require('aws-sdk');
const s3 = new aws.S3();


function readStoryFromSession(intent, session, callback) {



    //speechOutput = key ;
    var key = intent.slots.Item.value
    console.log(key)
    key = key.toLowerCase()+".txt"
    //speechOutput = key
    var speechOutput = "";

    // Retrieve the bucket & key for the uploaded S3 object that
    // caused this Lambda function to be triggered

    try{

         // Retrieve the object
        s3.getObject({

            Bucket: "readingcyborg",
            Key: key
        }, function(err, data) {

            if (err) {
                console.log(err, err.stack);

                //callback(err);
            } else {
                var s = data.Body.toString('ascii')
                console.log("Raw text:\n" + s);
                speechOutput = "Okay, this story is called "+key + " .";
                speechOutput += s;
              //  callback(null, null);
            }
        });
    }
    catch (e) {
        console.log('error')
    }



    console.log(speechOutput);
    const sessionAttributes = {};
    let shouldEndSession = false;

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
//  callback(sessionAttributes,
        buildSpeechletResponse(intent.name, speechOutput, null, shouldEndSession);

}




function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Hope you enjoyed the Alexa Reader. Goodbye for now!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}


// ------- Helper functions to build responses -------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        }, reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    console.log("built");
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
