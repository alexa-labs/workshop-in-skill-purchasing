# Lab 3

In this lab we will update the IAM role used by the Lambda function so that the ASK SDK can automatically create the needed DynamoDB table.  We will also update the voice model to allow the customer to check their hint inventory level.  Finally we store the inventory as persistent attributes (in DynamoDB).

### Objectives
* Create DynamoDB Table
* Update VUI to check Inventory
* Use Persistent Attributes to store Hint Inventory

## Task 1. Update the AWS IAM Role to allow Amazon DynamoDB Access

1. Locate the execution role used by the skill's Lambda function in the AWS IAM Console.  If you are using Cloud9, click [here](https://console.aws.amazon.com/iam/home#/roles/Cloud9-lambda-Name-The-Show) and you will go directly to the role.  If you are using the CLI elsewhere, click [here](https://console.aws.amazon.com/iam/home#/roles/ask-lambda-Name-The-Show) to go directly to the role.  If you want to locate the role manually, follow these steps:
    1. Open the AWS Console: https://console.aws.amazon.com
    1. Type **IAM** in the search box and click on it.
    1. Click on **Roles**.
    1. Type **name-the-show** in the search box.
    1. Click the role.
1. On the right side of the **Permissions** tab, click **+ Add inline policy**.
1. Click the **JSON** tab.
1. Select the existing JSON and replace it with the following policy document.  This policy grants access to the role to (1) create the needed table and (2) read/write items to the table.  It is restricted to this for just a table named 'NameTheShow'.
    ```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "NameTheShowDynamoDBAccess",
                "Effect": "Allow",
                "Action": [
                    "dynamodb:CreateTable",
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:UpdateItem"
                ],
                "Resource": "arn:aws:dynamodb:::table/NameTheShow"
            }
        ]
    }
    ```
1. Click **Review Policy**.
1. Enter `NameTheShowDynamoDBAccess` as the **Name**.
1. Click **Create Policy**.

## Task 2. Update Voice Interaction Model (VUI)

Since the skill is going to track the available number of hints, the customer was want to ask for how many hints are remaining.  Let's add that to the interaction model.

In the **models** folder of your skill, locate the `en-US.json` file.  This is the interaction model for the en-US locale.  On line 5, locate the **Intents** object.  Copy the definition below and paste it on line 6 to add it to the **Intents** object.

```
                {
                   "name": "HintInventoryIntent",
                    "slots": [],
                    "samples": [
                        "how many hints do I have left",
                        "how many hints do I have",
                        "how many hints remain",
                        "how many hints"
                    ]
                },
 ```

 Save and close the file.

## Task 3. Update the Skill Builder to persist using a DynamoDB table.

1. Open the **index.js** file in your **/lambda/custom** folder.
1. Update the Skill Builder object to use DynamoDB by locating the **lab-3-task-3** marker and adding the following chained method calls:
    ```
      .withTableName('NameTheShow')
      .withAutoCreateTable(true)
    ```
1. Save and (optionally) close the file.

> Note: when using the withAutoCreateTable feature, the table will not be created until the first time the skill attempts to access it.  When that happens your skill will return an error message, but it is creating the table in the background.  Since the first time will be sometime during skill development, customers will not see this error message.  Give DynamoDB a few minutes (or less) to create the table.  If you want to check the status of the table, you can view all your DynamoDB tables (here)[https://console.aws.amazon.com/dynamodb/home].  This will default to the AWS region you used last, so if that's not the region where the table should be, change the region to the correct one using the drop down in the upper right corner of the AWS console.

### (Optional) Task 3-Alt. Manual DDB Table Creation

TODO - add manual DDB creation steps

## Task 4. Update the Skill Code to Check Inventory

1. Open the **index.js** file in your **/lambda/custom** folder.
1. Add the HintInveotryHandler code by locating the **lab-3-task-4-a** marker and pasting in the following code:
    ```javascript
    const HintInventoryHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'HintInventoryIntent';
      },
      handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

        const speakOutput = requestAttributes.t('REPLAY_PROMPT', sessionAttributes.hintsAvailable);
        const repromptOutput = speakOutput;

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(repromptOutput)
          .getResponse();
      },
    };
    ```
1. Add the HintInventoryHandler to the list of available handlers by locating the **lab-3-task-4-b** marker and pasting in the following code:
    ```javascript
        HintInventoryHandler,
    ```
1. Add the CheckInventoryInterceptor.  This code will be run on every request to the skill, so we don't have to include it in every handler.  Locate the **lab-3-task-4-c** marker and paste in the following code:
    ```
    const CheckInventoryInterceptor = {
      async process(handlerInput) {
        await checkInventory(handlerInput);
      },
    };
    ```
1. Enable this new interceptor by locating the **lab-3-task-4-d** marker and adding the following code:
    ```javascript
        CheckInventoryInterceptor,
    ```
1. Add the **checkInventory** helper function by locating the **lab-3-task-4-e** marker and pasting in the following code:
    ```javascript
    async function checkInventory(handlerInput) {
      const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      if (persistentAttributes.hintsUsed === undefined) persistentAttributes.hintsUsed = 0;
      if (persistentAttributes.hintsPurchased === undefined) persistentAttributes.hintsPurchased = 0;

      const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

      return ms.getInSkillProducts(handlerInput.requestEnvelope.request.locale).then((res) => {
        if (res.inSkillProducts.length > 0) {
          const hintpack = res.inSkillProducts[0];

          // x5 because each purchase contains five hints.
          const hintsPurchased = (hintpack.activeEntitlementCount * 5);
          // Will differ per skill/product implementation

          if (persistentAttributes.hintsPurchased > hintsPurchased) {
            // THIS CAN HAPPEN IF A CUSTOMER RETURNS AN ACCIDENTAL PURCHASE.
            // YOU SHOULD RESET THEIR TOTALS TO REFLECT THAT RETURN.
            persistentAttributes.hintsPurchased = hintsPurchased;

            if (persistentAttributes.hintsUsed > hintsPurchased) {
              // IF THE USER HAS USED MORE HINTS THAN THEY HAVE PURCHASED,
              // SET THEIR TOTAL "USED" TO THE TOTAL "PURCHASED."
              persistentAttributes.hintsUsed = hintsPurchased;
            }
          } else if (persistentAttributes.hintsPurchased < hintsPurchased) {
            // THIS SHOULDN'T HAPPEN UNLESS WE FORGOT TO MANAGE OUR INVENTORY PROPERLY.
            persistentAttributes.hintsPurchased = hintsPurchased;
          }
        }

        sessionAttributes.hintsAvailable = persistentAttributes.hintsPurchased
          - persistentAttributes.hintsUsed;
        handlerInput.attributesManager.savePersistentAttributes();
      });
    }
    ```
1. Repeat this for the **BuyHintResponseHandler**:
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
1. Save and close **index.js**

## Task 5. Deploy Updated Skill

1. From the root of the project (the folder with skill.json), enter `ask deploy` to deploy your updated interaction model and lambda function.

## Task 6. Test Your Skill

1. To test, login to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask), click on the **Name The Show** entry in your skill list, and click on the "Test" tab.  The "Test" switch on your skill should have been automatically enabled.  If it was not, enable it now.
1. Your skill can now also be tested on devices associated with your developer account. Start testing your skill by typing or saying:
	```text
	Alexa, open name the show
	```
    > Note: using the invocation name of 'Alexa' is not required when using the simulator in the Developer Console.

    > **IMPORTANT: The developer account associated with the skill is never charged for in-skill products.**  For more details about testing skills with in-skill products, please refer to the [In-Skill Purchase Testing Guide](https://developer.amazon.com/docs/in-skill-purchase/isp-test-guide.html)
1. Play the game.  Be sure to ask for hints so you can test out purchasing them.

## Lab 3 Recap

By following these steps you should have accomplished these goals:
* Created a 'NameTheShow' DynamoDB Table
* Update the VUI to check Inventory
* Used Persistent Attributes to store Hint Inventory

Having trouble?  Not sure you're on the right path? Check out the [Completed Workshop](./9%20-%20Completed%20Workshop/)

# Congratulations!!!

You made it!  If you were able to successfully purchase hints, you are on your way to successfully monetizing your skill.  Check out (next step)[./next-steps.md] for more information on where to go next!

/###