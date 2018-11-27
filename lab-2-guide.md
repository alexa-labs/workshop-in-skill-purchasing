# Lab 2

At the completion of Lab 1, you will have a deployed, working base skill, plus you will have created and deployed the In-Skill Product we will use.  If that is not your current state, you can review Lab 1 [here](./lab-1-guide.md) or find a completed Lab 1 [here](./lab-1-completed/)

In this lab, you will update the voice interaction model and skill code to work with In-Skill Purchasing.

> Some of the the workshop steps require typing a command or copy/pasting code.  All of the strings you may need to type or paste for this lab can be found in this [resource file](resources/lab-2-command-file.txt).

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
1. Copy and paste the following after the BuyHintIntent to add the CancelPurchaseIntent:
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
1. Update the **HintHandler** helper function to make an upsell when clues are available and the user doesn't have any hints to use.  Do this by locating the **lab-2-task-2-a** start and end markers and replacing the code there with the following code:
    > Note 1: Be sure to include the lab-3-task-4-g label in what you copy/paste -- it'll be needed for the next lab. 
    > Note 2: If you are more comfortable replacing the entire HintHandler block of code, you can find it in the [lab 2 resource file](./resources/lab-2-command-file.txt).
    ```javascript
        // OTHERWISE, OFFER THEM AN OPPORTUNITY TO BUY A HINT.

        // lab-3-task-4-g

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
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

        // lab-3-task-4-h

        console.log(`SESSION ATTRIBUTES = ${JSON.stringify(sessionAttributes)}`);

        let speakOutput = '';

        // IF THE USER DECLINED THE PURCHASE.
        if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'DECLINED') {
          speakOutput = requestAttributes.t('NO_HINTS_FOR_NOW', getClue(handlerInput));
        } else if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'ACCEPTED') {
          // IF THE USER SUCCEEDED WITH THE PURCHASE.
          if (!sessionAttributes.hintsAvailable) {
            console.log('no hintsAvailable session attribute. setting hints to 5');
            sessionAttributes.hintsAvailable = 5;
          }
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

        // lab-3-task-4-i

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .getResponse();
      },
    };
    ```
1. Copy and paste the following after the BuyHintResponseHandler:
    ```javascript
    const CancelPurchaseHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'CancelPurchaseIntent';
      },
      async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

        // lab-3-task-4-j
        
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
1. Copy and paste the following after the CancelPurchaseHandler:
    ```javascript
    const BuyHintHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'BuyHintIntent';
      },
      async handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

        // lab-3-task-4-k        

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

1. From the root of the project (the folder with skill.json), enter `ask deploy` to deploy your updated interaction model and lambda function.  This may take a few minutes to complete.
	```
	Expected Output:
	-------------------- Update Skill Project --------------------
	Skill Id: amzn1.ask.skill.***
	Skill deployment finished.
	Model deployment finished.
	Lambda deployment finished.
	Lambda function(s) updated:
	  [Lambda ARN] arn:aws:lambda:***
	In-skill product deployment finished.
	In-skill product(s) updated:
	  [ID] amzn1.adg.product.*** [FILE] isps/consumable/Five_Hint_Pack.json
	Your skill is now deployed and enabled in the development stage. Try invoking the skill via the "ask simulate" command.
	```

## Task 5. Test Your Skill (Optional)

1. To test, login to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask), click on the **Name The Show** entry in your skill list, and click on the "Test" tab.  The "Test" switch on your skill should have been automatically enabled.  If it was not, enable it now.
1. Start testing your skill by typing:
	```text
	open name the show
	```
    > Note: using the invocation name of 'Alexa' is not required when using the simulator in the Developer Console.

    > Your skill can now also be tested on devices associated with your developer account. 

    > **IMPORTANT: The developer account associated with the skill is never charged for in-skill products.**  For more details about testing skills with in-skill products, please refer to the [In-Skill Purchase Testing Guide](https://developer.amazon.com/docs/in-skill-purchase/isp-test-guide.html).

    > To reset your in-skill purchases to their original state, use the [reset-isp-entitlement](https://developer.amazon.com/docs/smapi/isp-command-reference.html#reset-isp-entitlement) command.  For your convenience, this command has been scripted and included in the working and resources folders.  Run it using `python reset-workshop-isps.py` command.
	```
	Expected Output:
	Welcome to Name The Show! I will give you the name of an actor or actress, and you have to tell me what television show I am thinking of. If you can't figure one out, you can purchase hints, and I'll give you the name of another actor from the same show. Ready for your first question?
	```
1. Play the game.  Be sure to ask for hints so you can test out purchasing them.  Your purchases won't be persisted across sessions, and you can't yet check your inventory levels.  During a game, try saying 'give me a hint' or 'buy hints'.

## Lab 2 Recap

Congrats!  By following these steps you should have accomplished these goals:
* Updated the VUI
* Added Upsell to Skill Code
* Added Buy to Skill Code
* Added Connections Handler to Skill Code

Make quick work of this lab?  Check out the [Extra Credit](./extra-credit.md) section for additional things you can do before beginning the next lab.

Continue the workshop in [Lab 3](./lab-3-guide.md)

Having trouble?  Not sure you're on the right path? Check out [Completed Lab 2](./lab-2-completed/)

\###
