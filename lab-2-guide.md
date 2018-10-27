# Lab 2

At the completion of Lab 1, you will have a deployed, working base skill, plus you will have created and deployed the In-Skill Product we will use.  If that is not your current state, you can review Lab 1 (here)[./lab-1-guide.md] or find a completed Lab 1 [here](./2%20-%20Lab%201%20Completed/)

In this lab, you will update the voice interaction model and skill code to work with In-Skill Purchasing.

### Objectives
* Update Voice Interaction Model (VUI)
* Add Upsell to Skill Code
* Add Buy to Skill Code
* Add Connections Handler to Skill Code

## Task 1. Update Voice Interaction Model (VUI)

1. In the **models** folder of your skill, locate the `en-US.json` file.  This is the interaction model for the en-US locale.  On line 5, locate the **Intents** object.  The first intent that needs to be added is the `BuyHintIntent`.  Copy the definition below and paste it on line 6 to add it to the **Intents** object.
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
1. Repeat this process to add the CancelPurchaseIntent
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
1. Save and close the file.

## Task 2. Update skill code

1. Open the **index.js** file in your **/lambda/custom** folder.
1. Update the **useHint** helper function to make an upsell when clues are available and the user doesn't have any hints to use.  Do this by locating the **lab-2-task-2-a** marker and pasting in the following code between the start and end markers:
    ```javascript
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
    ```
1. Add the BuyHintResponseHandler code by locating the **lab-2-task-2-b** marker and pasting in the following code:
    ```javascript
    const BuyHintResponseHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'Connections.Response' &&
          (handlerInput.requestEnvelope.request.name === 'Upsell' ||
            handlerInput.requestEnvelope.request.name === 'Buy');
      },
      async handle(handlerInput) {
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

        // REHYDRATE SESSION ATTRIBUTES AFTER RETURNING FROM THE CONNECTIONS DIRECTIVE.
        if (persistentAttributes.currentSession !== undefined) {
          sessionAttributes.currentShow = persistentAttributes.currentSession.currentShow;
          sessionAttributes.currentActors = persistentAttributes.currentSession.currentActors;
        }
        console.log(`SESSION ATTRIBUTES = ${JSON.stringify(sessionAttributes)}`);

        let speakOutput = '';

        // IF THE USER DECLINED THE PURCHASE.
        if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'DECLINED') {
          speakOutput = requestAttributes.t('NO_HINTS_FOR_NOW', getClue(handlerInput));
        } else if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'ACCEPTED') {
          // IF THE USER SUCCEEDED WITH THE PURCHASE.
          if (sessionAttributes.currentActors !== undefined
            && sessionAttributes.currentActors.length !== 3) {
            useHint(handlerInput);
            const randomActor = getRandomActor(sessionAttributes.currentActors);
            sessionAttributes.currentActors += randomActor.toString();
          }
          speakOutput = requestAttributes.t('THANK_YOU', getClue(handlerInput));
        } else if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'ERROR') {
          // IF SOMETHING ELSE WENT WRONG WITH THE PURCHASE.
          speakOutput = requestAttributes.t('UNABLE_TO_SELL', getClue(handlerInput));
        }

        // CLEAR OUR OUR PERSISTED SESSION ATTRIBUTES.
        persistentAttributes.currentSession = undefined;
        handlerInput.attributesManager.savePersistentAttributes();

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .getResponse();
      },
    };
    ```
1. Repeat this for the **CancelPurchaseHandler**:
    ```javascript
    const CancelPurchaseHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'CancelPurchaseIntent';
      },
      async handle(handlerInput) {
        // SAVING SESSION ATTRIBUTES TO PERSISTENT ATTRIBUTES,
        // BECAUSE THE SESSION EXPIRES WHEN WE START A CONNECTIONS DIRECTIVE.
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

        persistentAttributes.currentSession = sessionAttributes;
        handlerInput.attributesManager.savePersistentAttributes();

        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return ms.getInSkillProducts(handlerInput.requestEnvelope.request.locale).then((res) => {
          const hintpack = res.inSkillProducts.filter(record => record.referenceName === 'Five_Hint_Pack');
          if (hintpack.length > 0 && hintpack[0].purchasable === 'PURCHASABLE') {
            return handlerInput.responseBuilder
              .addDirective({
                'type': 'Connections.SendRequest',
                'name': 'Cancel',
                'payload': {
                  'InSkillProduct': {
                    'productId': hintpack[0].productId,
                  },
                },
                'token': 'correlationToken',
              })
              .getResponse();
          }
          return handlerInput.responseBuilder
            .speak(requestAttributes.t('CANNOT_BUY_RIGHT_NOW'))
            .getResponse();
        });
      },
    };
    ```
1. Repeat this for the **BuyHintHandler**:
    ```javascript
    const BuyHintHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'BuyHintIntent';
      },
      async handle(handlerInput) {
        // SAVING SESSION ATTRIBUTES TO PERSISTENT ATTRIBUTES,
        // BECAUSE THE SESSION EXPIRES WHEN WE START A CONNECTIONS DIRECTIVE.
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        persistentAttributes.currentSession = sessionAttributes;
        handlerInput.attributesManager.savePersistentAttributes();

        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return ms.getInSkillProducts(handlerInput.requestEnvelope.request.locale).then((res) => {
          const hintpack = res.inSkillProducts.filter(record => record.referenceName === 'Five_Hint_Pack');
          if (hintpack.length > 0 && hintpack[0].purchasable === 'PURCHASABLE') {
            return handlerInput.responseBuilder
              .addDirective({
                'type': 'Connections.SendRequest',
                'name': 'Buy',
                'payload': {
                  'InSkillProduct': {
                    'productId': hintpack[0].productId,
                  },
                },
                'token': 'correlationToken',
              })
              .getResponse();
          }
          return handlerInput.responseBuilder
            .speak(requestAttributes.t('CANNOT_BUY_RIGHT_NOW'))
            .getResponse();
        });
      },
    };
    ```
1. Add the new handlers to the list of available handlers by locating the **lab-2-task-2-c** marker and pasting in the following code:
    ```javascript
    BuyHintHandler,
    BuyHintResponseHandler,
    CancelPurchaseHandler,
    ```
1. Update the **canHandle** condition for the **CancelAndStopIntentHandler** by adding the following code at marker **lab-2-task-2-d**:
    ```javascript
            ||
          (handlerInput.requestEnvelope.request.type === 'Connections.Response' &&
            handlerInput.requestEnvelope.request.name === 'Cancel' &&
            handlerInput.requestEnvelope.request.payload.purchaseResult === 'ACCEPTED')
    ```
1. Remove the default hint provisioning that was part of the base skill for the workshop.  (This provisioning allows you to test the skill.)  Find the **lab-2-task-2-e** marker and comment out (or remove) these lines of code:
    ```javascript
      // SET DEFAULT NUMBER OF HINTS PER USER SESSION
      sessionAttributes.hintsAvailable = 2;
    ```
1. Close and save **index.js**.

## Task 3. Updates String Messages

1. Open the **en.js** file found in **/lambda/custom/languages**.
1. Replace these strings:
```javascript
    WELCOME_MESSAGE: 'Welcome to Name The Show!  I will give you the name of an actor or actress, and you have to tell me what television show I am thinking of. If you can\'t figure one out, you can purchase hints, and I\'ll give you the name of another actor from the same show. %s Ready for your first question?',
    HELP_PROMPT: 'I give you the name of an actor or actress, and you have to tell me what television show I am thinking of.  You can buy hints if you need the name of a second or third actor...just ask!  Are you ready for a question?',
```

1. Add these strings:
```javascript
    CANNOT_BUY_RIGHT_NOW: 'I am sorry. The hint pack is not available for purchase at this time.',
    NO_HINTS_FOR_NOW: 'No hints for now.  Got it. %s',
    THANK_YOU: 'Thanks for buying some hints! %s',
    UNABLE_TO_SELL: 'It looks like we are unable to sell hints right now.  Sorry.  Maybe you\'ll get it this time anyways. %s',
    UPSELL_MESSAGE: 'You don\'t currently have any hints available.  Would you like to know more about the five hint pack?',
    CURRENTLY_UNAVAILABLE: 'I am sorry. That hint pack is not available for purchase at this time.',
```
1. Close and save **en.js**.

## Task 4. Deploy Updated Skill

1. From the root of the project (the folder with skill.json), enter `ask deploy` to deploy your updated interaction model and lambda function.

## Task 5. Test Your Skill

1. To test, login to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask), click on the **Name The Show** entry in your skill list, and click on the "Test" tab.  The "Test" switch on your skill should have been automatically enabled.  If it was not, enable it now.
1. Your skill can now also be tested on devices associated with your developer account. Start testing your skill by typing or saying:
	```text
	Alexa, open name the show
	```
    > Note: using the invocation name of 'Alexa' is not required when using the simulator in the Developer Console.

    > **IMPORTANT: The developer account associated with the skill is never charged for in-skill products.**  For more details about testing skills with in-skill products, please refer to the [In-Skill Purchase Testing Guide](https://developer.amazon.com/docs/in-skill-purchase/isp-test-guide.html)
1. Play the game.  Be sure to ask for hints so you can test out purchasing them.  Your purchases won't be persisted across sessions, and you can't yet check your inventory levels.

## Lab 2 Recap

Congrats!  By following these steps you should have accomplished these goals:
* Updated the VUI
* Added Upsell to Skill Code
* Added Buy to Skill Code
* Added Connections Handler to Skill Code

Continue the workshop in [Lab 3](./lab-3-guide.md)

Having trouble?  Not sure you're on the right path? Check out [Completed Lab 2](./4%20-%20Lab%202%20Completed/)
