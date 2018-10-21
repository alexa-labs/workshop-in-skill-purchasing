# Lab 2

At the completion of Lab 1, you will have a deployed, working base skill, plus you will have created and deployed the In-Skill Product we will use.  If that is not your current state, you can review Lab 1 (here)[./lab-1-guide.md] or find a completed Lab 1 [here](./2%20-%20Lab%201%20Completed/)

In this lab, you will update the voice interaction model and skill code to work with In-Skill Purchasing.

### Objectives
* Update Voice Interaction Model (VUI)
* Add Upsell to Skill Code
* Add Buy to Skill Code

## Task 1. Update Voice Interaction Model (VUI)

In the **models** folder of your skill, locate the `en-US.json` file.  This is the interaction model for the en-US locale.  On line 5, locate the **Intents** object.  The first intent that needs to be added is the `BuyHintIntent`.  Copy the definition below and paste it on line 6 to add it to the **Intents** object.

```
                {
                    "name": "BuyHintIntent",
                    "slots": [],
                    "samples": [
                        "purchase more hints",
                        "purchase hints",
                        "get more hints",
                        "buy hints",
                        "buy more hints",
                        "buy some hints"
                    ]
                },
```
As you can see in the JSON snippet, you are defining the name of the intent, the slots (there are none for this intent), and the sample utterances which teach Alexa how to recognize someone is intending to trigger this intent.

Repeat this process to add these intents:
### HintIntent

```
                {
                    "name": "HintIntent",
                    "slots": [],
                    "samples": [
                        "use a hint",
                        "give me a hint",
                        "give me another actor",
                        "i need a hint"
                    ]
                },
```
### CancelPurchaseIntent
```
                {
                    "name": "CancelPurchaseIntent",
                    "slots": [],
                    "samples": [
                        "cancel my purchase",
                        "return my hints",
                        "cancel transaction",
                        "stop purchase"
                    ]
                },
```
The updated interaction model also needs to have the built-in intents for Yes and No added.  For these intents, there are no slots, and you don't need to provide any sample utterances.  Otherwise, adding them follows the same process.
### AMAZON.YesIntent
```
                {
                    "name": "AMAZON.YesIntent",
                    "samples": []
                },
```
### AMAZON.NoIntent
```
                {
                    "name": "AMAZON.NoIntent",
                    "samples": []
                },
```                  

Save and close the file.

## Task 2. Update skill code

    HintHandler,
    BuyHintHandler,
    BuyHintResponseHandler,
    CancelPurchaseHandler,

## TODO: skill code needs to track hints in session variables before we add persistent attributes

async function useHint(handlerInput) {
  const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

  sessionAttributes.hintsAvailable -= 1;
  persistentAttributes.hintsUsed += 1;
  handlerInput.attributesManager.savePersistentAttributes();
}


const HintHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'HintIntent';
  },
  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let speakOutput = '';
    let repromptOutput = '';

    // IF THE USER HAS ALREADY USED TWO HINTS ON THIS PUZZLE, DON'T LET THEM USE ANOTHER.
    // WE DON'T HAVE MORE INFORMATION TO OFFER THEM.
    if (sessionAttributes.currentActors.length === 3) {
      speakOutput = requestAttributes.t('NO_MORE_CLUES', getClue(handlerInput));
      repromptOutput = speakOutput;

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    } else if (sessionAttributes.hintsAvailable > 0) {
      // IF THE USER HAS AVAILABLE HINTS, USE ONE.
      useHint(handlerInput);
      console.log(`CURRENT ACTOR = ${sessionAttributes.currentActors}`);
      const randomActor = getRandomActor(sessionAttributes.currentActors);
      console.log(`RANDOM ACTOR = ${randomActor}`);
      sessionAttributes.currentActors += randomActor.toString();
      speakOutput = requestAttributes.t('NEW_CLUE', getClue(handlerInput));
      repromptOutput = speakOutput;

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    }
    // OTHERWISE, OFFER THEM AN OPPORTUNITY TO BUY A HINT.

    // SAVING SESSION ATTRIBUTES TO PERSISTENT ATTRIBUTES,
    // BECAUSE THE SESSION EXPIRES WHEN WE START A CONNECTIONS DIRECTIVE.
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    persistentAttributes.currentSession = sessionAttributes;
    handlerInput.attributesManager.savePersistentAttributes();

    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(handlerInput.requestEnvelope.request.locale).then((res) => {
      const hintpack = res.inSkillProducts.filter(record => record.referenceName === 'Five_Hint_Pack');
      if (hintpack.length > 0 && hintpack[0].purchasable === 'PURCHASABLE') {
        return handlerInput.responseBuilder
          .addDirective({
            'type': 'Connections.SendRequest',
            'name': 'Upsell',
            'payload': {
              'InSkillProduct': {
                'productId': hintpack[0].productId,
              },
              'upsellMessage': requestAttributes.t('UPSELL_MESSAGE'),
            },
            'token': 'correlationToken',
          })
          .getResponse();
      }
      return handlerInput.responseBuilder
        .speak(requestAttributes.t('CURRENTLY_UNAVAILABLE'))
        .getResponse();
    });
  },
};

LaunchRequest
    // IF THE USER HAS HINTS AVAILABLE, LET THEM KNOW HOW MANY.
    if (sessionAttributes.hintsAvailable > 0) hintText = requestAttributes.t('HINTS_AVAILABLE', sessionAttributes.hintsAvailable);


CancelAndStopIntentHandler
      (handlerInput.requestEnvelope.request.type === 'Connections.Response' &&
        handlerInput.requestEnvelope.request.name === 'Cancel' &&
        handlerInput.requestEnvelope.request.payload.purchaseResult === 'ACCEPTED');

getClue
  TODO: need to update based on i18n changes
  for (let i = 0; i < actor.length; i += 1) {
    if (i !== 0) {
      actorString += ', and ';
      reference = 'these people';
    }
    actorString += show['actor' + actor[i]];
  }

i18n Updates

    HINTS_AVAILABLE: 'You currently have %i hints available to use.',
    WELCOME_MESSAGE: 'Welcome to Name The Show!  I will give you the name of an actor or actress, and you have to tell me what television show I am thinking of. If you can\'t figure one out, you can purchase hints, and I\'ll give you the name of another actor from the same show. %s Ready for your first question?',
    CANNOT_BUY_RIGHT_NOW: 'I am sorry. The hint pack is not available for purchase at this time.',
    HELP_PROMPT: 'I give you the name of an actor or actress, and you have to tell me what television show I am thinking of.  You can buy hints if you need the name of a second or third actor...just ask!  Are you ready for a question?',
    NO_HINTS_FOR_NOW: 'No hints for now.  Got it. %S',
    THANK_YOU: 'Thanks for buying some hints! %s',
    UNABLE_TO_SELL: 'It looks like we are unable to sell hints right now.  Sorry.  Maybe you\'ll get it this time anyways. %s',
    NOT_CORRECT: 'I\'m sorry.  That is not the show I\'m thinking of.  You can guess again, or say I Don\'t Know.  If you would like a hint, just say give me a hint.',
    CORRECT_ANSWER: 'That is correct!  I was thinking of the show %s.  Would you like to try another question?',
    REPLAY_PROMPT: 'You currently have %i hints available.  Are you ready for your next question?',
    NO_MORE_CLUES: 'You have already used two clues on this show.  We don\'t have any more clues for you. %s',
    NEW_CLUE: 'OK.  I\'ve added an actor to your clues.  Here it is. %s',
    UPSELL_MESSAGE: 'You don\'t currently have any hints available.  Would you like to know more about the five hint pack?',
    CURRENTLY_UNAVAILABLE: 'I am sorry. That hint pack is not available for purchase at this time.',

### Lab 2 Recap

Congrats!  By following these steps you should have accomplished these goals:
* Updated the VUI
* Added Upsell to Skill Code
* Added Buy to Skill Code

Continue the workshop in [Lab 3](./lab-3-guide.md)

Having trouble?  Not sure you're on the right path? Check out [Completed Lab 2](./4%20-%20Lab%202%20Completed/)
