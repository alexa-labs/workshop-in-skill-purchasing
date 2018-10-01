/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

const data = [  {"showName": "Game of Thrones", "actor1": "Emilia Clark", "actor2": "Peter Dinklage", "actor3": "Kit Harrington"},
                {"showName": "Breaking Bad", "actor1": "Bryan Cranston", "actor2": "Aaron Paul", "actor3": "Anna Gunn"},
                {"showName": "Friends", "actor1": "Jennifer Aniston", "actor2": "Courteney Cox", "actor3": "Lisa Kudrow"},
                {"showName": "Westworld", "actor1": "Evan Rachel Wood", "actor2": "Jeffrey Wright", "actor3": "Ed Harris"},
                {"showName": "Parks and Recreation", "actor1": "Amy Poehler", "actor2": "Nick Offerman", "actor3": "Aziz Ansari"},
                {"showName": "Modern Family", "actor1": "Ed O'Neill", "actor2": "Sofia Vergara", "actor3": "Julie Bowen"},
                {"showName": "Brooklyn Nine Nine", "actor1": "Andy Samberg", "actor2": "Stephanie Beatriz", "actor3": "Andre Braugher"},
                {"showName": "How I Met Your Mother", "actor1": "Jason Segel", "actor2": "Cobie Smulders", "actor3": "Neil Patrick Harris"},
                {"showName": "Lost", "actor1": "Josh Holloway", "actor2": "Evangeline Lilly", "actor3": "Terry O'Quinn"},
                {"showName": "Firefly", "actor1": "Nathan Fillion", "actor2": "Alan Tudyk", "actor3": "Morena Baccarin"}];

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var hintText = "";
        //IF THE USER HAS HINTS AVAILABLE, LET THEM KNOW HOW MANY.
        if (sessionAttributes.hintsAvailable > 0) hintText = "You currently have " + sessionAttributes.hintsAvailable + " hints available to use. ";

        const speechText = "Welcome to Name The Show!  I will give you the name of an actor or actress, and you have to tell me what television show I am thinking of. If you can't figure one out, you can purchase hints, and I'll give you the name of another actor from the same show. " + hintText + " Ready for your first question?";

        return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        //GET RANDOM SHOW FROM OUR DATA.
        var randomShow = getRandom(0, data.length-1);
        var show = data[randomShow];
        sessionAttributes.currentShow = show;
        //GET RANDOM ACTOR FROM OUR SHOW.
        var randomActor = getRandom(1, 3);
        sessionAttributes.currentActors = randomActor.toString();

        var speechText = getClue(handlerInput);

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const BuyHintHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'BuyHintIntent';
    },
    async handle(handlerInput) {
        //SAVING SESSION ATTRIBUTES TO PERSISTENT ATTRIBUTES, BECAUSE THE SESSION EXPIRES WHEN WE START A CONNECTIONS DIRECTIVE.
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        persistentAttributes.currentSession = sessionAttributes;
        handlerInput.attributesManager.savePersistentAttributes();

        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return ms.getInSkillProducts(handlerInput.requestEnvelope.request.locale).then(function(res) {
            const hintpack = res.inSkillProducts.filter(record => record.referenceName == "Five_Hint_Pack");
            if (hintpack.length > 0 && hintpack[0].purchasable == "PURCHASABLE")  {
              return handlerInput.responseBuilder
                .addDirective({
                  'type': 'Connections.SendRequest',
                  'name': 'Buy',
                  'payload': {
                    'InSkillProduct': {
                      'productId': hintpack[0].productId
                    }
                  },
                 'token': 'correlationToken'
                })
                .getResponse();
            }
            else {
              return handlerInput.responseBuilder
                .speak('I am sorry. The hint pack is not available for purchase at this time.')
                .getResponse();
            }
          });
    }
};

const CancelPurchaseHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'CancelPurchaseIntent';
    },
    async handle(handlerInput) {
        //SAVING SESSION ATTRIBUTES TO PERSISTENT ATTRIBUTES, BECAUSE THE SESSION EXPIRES WHEN WE START A CONNECTIONS DIRECTIVE.
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        persistentAttributes.currentSession = sessionAttributes;
        handlerInput.attributesManager.savePersistentAttributes();

        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return ms.getInSkillProducts(handlerInput.requestEnvelope.request.locale).then(function(res) {
            const hintpack = res.inSkillProducts.filter(record => record.referenceName == "Five_Hint_Pack");
            if (hintpack.length > 0 && hintpack[0].purchasable == "PURCHASABLE")  {
              return handlerInput.responseBuilder
                .addDirective({
                  'type': 'Connections.SendRequest',
                  'name': 'Cancel',
                  'payload': {
                    'InSkillProduct': {
                      'productId': hintpack[0].productId
                    }
                  },
                 'token': 'correlationToken'
                })
                .getResponse();
            }
            else {
              return handlerInput.responseBuilder
                .speak('I am sorry. The hint pack is not available for purchase at this time.')
                .getResponse();
            }
          });
    }
};

const BuyHintResponseHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "Connections.Response" &&
               (handlerInput.requestEnvelope.request.name === "Upsell" ||
                handlerInput.requestEnvelope.request.name === "Buy");
    },
    async handle(handlerInput) {
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        //REHYDRATE SESSION ATTRIBUTES AFTER RETURNING FROM THE CONNECTIONS DIRECTIVE.
        if (persistentAttributes.currentSession != undefined) {
            sessionAttributes.currentShow = persistentAttributes.currentSession.currentShow;
            sessionAttributes.currentActors = persistentAttributes.currentSession.currentActors;
        }
        console.log("SESSION ATTRIBUTES = " + JSON.stringify(sessionAttributes));
       
        var speechText = "";
        
        //IF THE USER DECLINED THE PURCHASE.
        if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'DECLINED') {
            speechText = "No hints for now.  Got it. " + getClue(handlerInput);
        }
        //IF THE USER SUCCEEDED WITH THE PURCHASE.
        else if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'ACCEPTED') {
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            if (sessionAttributes.currentActors != undefined && sessionAttributes.currentActors.length != 3) {
                useHint(handlerInput);
                var randomActor = getRandomActor(sessionAttributes.currentActors);
                sessionAttributes.currentActors += randomActor.toString();
            }
            speechText = "Thanks for buying some hints! " + getClue(handlerInput);
        }
        //IF SOMETHING ELSE WENT WRONG WITH THE PURCHASE.
        else if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'ERROR') {
            speechText = "It looks like we are unable to sell hints right now.  Sorry.  Maybe you'll get it this time anyways. " + getClue(handlerInput);
        }

        //CLEAR OUR OUR PERSISTED SESSION ATTRIBUTES.
        persistentAttributes.currentSession = undefined;
        handlerInput.attributesManager.savePersistentAttributes();


        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const AnswerHandler = {
    canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
           (handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent' ||
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.FallbackIntent");
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        var speechText = "I'm sorry.  That is not the show I'm thinking of.  You can guess again, or say I Don't Know.  If you would like a hint, just say give me a hint.";
        //IF THE USER'S ANSWER MATCHED ONE OF THE SLOT VALUES, THEY WERE CORRECT.
        if (isER_SUCCESS_MATCH("answer", handlerInput)) {
            if (handlerInput.requestEnvelope.request.intent.slots.answer.resolutions.resolutionsPerAuthority[0].values[0].value.name.toLowerCase() === sessionAttributes.currentShow.showName.toLowerCase()) {
                speechText = "That is correct!  I was thinking of the show " + sessionAttributes.currentShow.showName + ".  Would you like to try another question?";
            }
        }

        return handlerInput.responseBuilder
               .speak(speechText)
               .reprompt(speechText)
               .getResponse();
    }
};

const HintInventoryHandler = {
    canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
           handlerInput.requestEnvelope.request.intent.name === 'HintInventoryIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        var speechText = "You currently have " + sessionAttributes.hintsAvailable + " hints available.  Are you ready for your next question?";

        return handlerInput.responseBuilder
               .speak(speechText)
               .reprompt(speechText)
               .getResponse();
    }
};

const IDontKnowHandler = {
    canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
           handlerInput.requestEnvelope.request.intent.name === 'IDontKnowIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        var speechText = "OK.  That was a tough one.  The show I was thinking of was " + sessionAttributes.currentShow.showName + ".  Would you like to try another question?";

        return handlerInput.responseBuilder
               .speak(speechText)
               .reprompt(speechText)
               .getResponse();
    }
};

const HintHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'HintIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        //IF THE USER HAS ALREADY USED TWO HINTS ON THIS PUZZLE, DON'T LET THEM USE ANOTHER.  WE DON'T HAVE MORE INFORMATION TO OFFER THEM.
        if (sessionAttributes.currentActors.length === 3) {
            var speechText = "You have already used two clues on this show.  We don't have any more clues for you. " + getClue(handlerInput);

            return handlerInput.responseBuilder
               .speak(speechText)
               .reprompt(speechText)
               .getResponse();
        }
        //IF THE USER HAS AVAILABLE HINTS, USE ONE.
        else if (sessionAttributes.hintsAvailable > 0) {
            useHint(handlerInput);
            console.log("CURRENT ACTOR = " + sessionAttributes.currentActors);
            var randomActor = getRandomActor(sessionAttributes.currentActors);
            console.log("RANDOM ACTOR = " + randomActor);
            sessionAttributes.currentActors += randomActor.toString();
            var speechText = "OK.  I've added an actor to your clues.  Here it is. " + getClue(handlerInput);

            return handlerInput.responseBuilder
               .speak(speechText)
               .reprompt(speechText)
               .getResponse();
        }
        //OTHERWISE, OFFER THEM AN OPPORTUNITY TO BUY A HINT.
        else {
            //SAVING SESSION ATTRIBUTES TO PERSISTENT ATTRIBUTES, BECAUSE THE SESSION EXPIRES WHEN WE START A CONNECTIONS DIRECTIVE.
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
            persistentAttributes.currentSession = sessionAttributes;
            handlerInput.attributesManager.savePersistentAttributes();            
            
            const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

            return ms.getInSkillProducts(handlerInput.requestEnvelope.request.locale).then(function(res) {
                const hintpack = res.inSkillProducts.filter(record => record.referenceName == "Five_Hint_Pack");
                if (hintpack.length > 0 && hintpack[0].purchasable == "PURCHASABLE")  {
                return handlerInput.responseBuilder
                        .addDirective({
                            'type': 'Connections.SendRequest',
                            'name': 'Upsell',
                            'payload': {
                            'InSkillProduct': {
                                'productId': hintpack[0].productId
                            },
                            'upsellMessage': "You don't currently have any hints available.  Would you like to know more about the five hint pack?"
                            },
                        'token': 'correlationToken'  
                        })
                        .getResponse();
                }
                else {
                return handlerInput.responseBuilder
                    .speak('I am sorry. That hint pack is not available for purchase at this time.')
                    .getResponse();
                }
            });
        }
        
        var speechText = "";

        return handlerInput.responseBuilder
               .speak(speechText)
               .reprompt(speechText)
               .getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'I give you the name of an actor or actress, and you have to tell me what television show I am thinking of.  You can buy hints if you need the name of a second or third actor...just ask!  Are you ready for a question?';

        return handlerInput.responseBuilder
               .speak(speechText)
               .reprompt(speechText)
               .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent')) ||
                (handlerInput.requestEnvelope.request.type === "Connections.Response" &&
                handlerInput.requestEnvelope.request.name === "Cancel" &&
                handlerInput.requestEnvelope.request.payload.purchaseResult == 'ACCEPTED');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
               .speak(speechText)
               .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        console.log(`Error stack: ${error.stack}`);

        return handlerInput.responseBuilder
        .speak('Something seems to be broken.  Can you try that again?')
        .reprompt('Something seems to be broken.  Can you try that again?')
        .getResponse();
    },
};

function getRandom(min, max){
    return Math.floor(Math.random() * (max-min+1)+min);
}

function getRandomActor(currentActor)
{
    console.log("CURRENT ACTOR = " + currentActor);
    switch(currentActor.toString())
    {
        case "1": case "13": case "31": 
            console.log("RETURN 2.");
            return 2;
        case "2": case "12": case "21":
            console.log("RETURN 3.");
            return 3;
        case "3": case "23": case "32":
            console.log("RETURN 1.");
            return 1;
    }
}

async function useHint(handlerInput) {
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    sessionAttributes.hintsAvailable -= 1;
    persistentAttributes.hintsUsed += 1;
    handlerInput.attributesManager.savePersistentAttributes();
}

function getClue(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var show = sessionAttributes.currentShow;
    var actors = sessionAttributes.currentActors;
    if (show === undefined || actors === undefined) return " Are you ready for a question? ";

    var actor = actors.split("");
    var actorString = "";
    var reference = "this person";

    for (var i = 0;i<actor.length;i++)
    {
        if (i != 0) {
            actorString += ", and ";
            reference = "these people";
        }
        actorString += show["actor" + actor[i]];
    }

    return "Guess the show I'm thinking of, that stars " + reference + ": <break time='.5s'/> " + actorString;
}

function isER_SUCCESS_MATCH(slot, handlerInput) {
    if ((handlerInput) &&
        (handlerInput.requestEnvelope) &&
        (handlerInput.requestEnvelope.request) &&
        (handlerInput.requestEnvelope.request.intent) &&
        (handlerInput.requestEnvelope.request.intent.slots) &&
        (handlerInput.requestEnvelope.request.intent.slots[slot]) &&
        (handlerInput.requestEnvelope.request.intent.slots[slot].resolutions) &&
        (handlerInput.requestEnvelope.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0]) &&
        (handlerInput.requestEnvelope.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].status) &&
        (handlerInput.requestEnvelope.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].status.code) &&
        (handlerInput.requestEnvelope.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH")) return true;
    return false;
}

async function checkInventory(handlerInput)
{
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (persistentAttributes.hintsUsed === undefined) persistentAttributes.hintsUsed = 0;
    if (persistentAttributes.hintsPurchased === undefined) persistentAttributes.hintsPurchased = 0;
    
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(handlerInput.requestEnvelope.request.locale).then(function(res) {
        if (res.inSkillProducts.length > 0) {
            const hintpack = res.inSkillProducts[0];
            const hintsPurchased = (hintpack.activeEntitlementCount * 5);  // x5 because each purchase contains five hints. 
                                                                                 // Will differ per skill/product implementation

            if (persistentAttributes.hintsPurchased > hintsPurchased) {
                //THIS CAN HAPPEN IF A CUSTOMER RETURNS AN ACCIDENTAL PURCHASE.
                //YOU SHOULD RESET THEIR TOTALS TO REFLECT THAT RETURN.
                persistentAttributes.hintsPurchased = hintsPurchased;

                if (persistentAttributes.hintsUsed > hintsPurchased) {
                    //IF THE USER HAS USED MORE HINTS THAN THEY HAVE PURCHASED, SET THEIR TOTAL "USED" TO THE TOTAL "PURCHASED."
                    persistentAttributes.hintsUsed = hintsPurchased;
                }
            }
            else if (persistentAttributes.hintsPurchased < hintsPurchased) {
                //THIS SHOULDN'T HAPPEN UNLESS WE FORGOT TO MANAGE OUR INVENTORY PROPERLY.
                persistentAttributes.hintsPurchased = hintsPurchased;
            }
        }

        sessionAttributes.hintsAvailable = persistentAttributes.hintsPurchased - persistentAttributes.hintsUsed;
        handlerInput.attributesManager.savePersistentAttributes();
    });
}

const RequestLog = {
    async process(handlerInput) {
        console.log("REQUEST ENVELOPE = " + JSON.stringify(handlerInput.requestEnvelope));
        await checkInventory(handlerInput);
        return;
    }
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
.addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    YesIntentHandler,
    AnswerHandler,
    HintHandler,
    BuyHintHandler,
    BuyHintResponseHandler,
    IDontKnowHandler,
    HintInventoryHandler,
    CancelAndStopIntentHandler,
    CancelPurchaseHandler,
    SessionEndedRequestHandler
)
.addErrorHandlers(ErrorHandler)
.addRequestInterceptors(RequestLog)
.withTableName("Consumables")
.withAutoCreateTable(true)
.lambda();
