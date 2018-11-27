# Lab 3

At the completion of Lab 2, you will have updated your skill's the voice interaction model and skill code to work with In-Skill Purchasing.  If that is not your current state, you can review Lab 2 (here)[./lab-2-guide.md] or find a completed Lab 2 [here](./lab-2-completed/)

In this lab we will update the IAM role used by the Lambda function so that the ASK SDK can automatically create the needed DynamoDB table.  We will also update the voice model to allow the customer to check their hint inventory level.  Finally we store the inventory as persistent attributes (in DynamoDB).

> Some of the the workshop steps require typing a command or copy/pasting code.  All of the strings you may need to type or paste for this lab can be found in this [resource file](resources/lab-3-command-file.txt).

### Objectives
* Create DynamoDB Table
* Update VUI to check Inventory
* Use Persistent Attributes to store Hint Inventory

## Task 1. Update the AWS IAM Role to allow Amazon DynamoDB Access

1. Locate the execution role used by the skill's Lambda function in the AWS IAM Console.  If you are using Cloud9, click [here](https://console.aws.amazon.com/iam/home#/roles/Cloud9-Name-The-Show) and you will go directly to the role.  If you are using the CLI elsewhere, click [here](https://console.aws.amazon.com/iam/home#/roles/ask-lambda-Name-The-Show) to go directly to the role.  If you want to locate the role manually, follow these steps:
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
                "Sid": "NameTheShowDynamoDBCreationAndAccess",
                "Effect": "Allow",
                "Action": [
                    "dynamodb:CreateTable",
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:UpdateItem"
                ],
                "Resource": "arn:aws:dynamodb:*:*:table/NameTheShow"
            }
        ]
    }
    ```
    For the purposes of the workshop, it is recommended to use the table auto-creation feature.  However if you prefer to manually create the DynamoDB table instead of having the SDK automatically create it for you, use the following policy instead.  The steps to create the table will come in a later Task.
    ```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "NameTheShowDynamoDBAccessOnly",
                "Effect": "Allow",
                "Action": [
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:UpdateItem"
                ],
                "Resource": "arn:aws:dynamodb:*:*:table/NameTheShow"
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

If you are manually creating your DynamoDB table, skip to *Task 3-Alt*.

1. Open the **index.js** file in your **/lambda/custom** folder.
1. Update the Skill Builder object to use DynamoDB by locating the **lab-3-task-3** marker and adding the following chained method calls:
    ```
      .withTableName('NameTheShow')
      .withAutoCreateTable(true)
    ```
1. Save and (optionally) close the file.

> Note: when using the withAutoCreateTable feature, the table will not be created until the first time the skill attempts to access it.  When that happens your skill will return an error message, but it is creating the table in the background.  Since the first time will be sometime during skill development, customers will not see this error message.  Give DynamoDB a few minutes (or less) to create the table.  If you want to check the status of the table, you can view all your DynamoDB tables (here)[https://console.aws.amazon.com/dynamodb/home].  This will default to the AWS region you used last, so if that's not the region where the table should be, change the region to the correct one using the drop down in the upper right corner of the AWS console.

### (Optional) Task 3-Alt. Manual DDB Table Creation

1. Open the **index.js** file in your **/lambda/custom** folder.
1. Update the Skill Builder object to use DynamoDB by locating the **lab-3-task-3** marker and adding the following chained method calls:
    ```
      .withTableName('NameTheShow')
    ```
1. Save and (optionally) close the file.
1. Navigate to the Amazon DynamoDB console: https://console.aws.amazon.com/dynamodb/home
1. Click *Create table*.
1. Enter *NameTheShow* into the Table name field. (Note: the capitalization must match)
1. Enter *id* as the Partition key.  Leave the type as String.  (Note: capitalization must match.)
1. _(Optional)_ Change the table settings.  Accepting the default settings is adequate for the purpose of this workshop.
1. Click *Create*.
1. It may take a few minutes for the table to be created, however you can continue with the workshop while this is happening in the background.

## Task 4. Update the Skill Code to Check Inventory

1. Open the **index.js** file in your **/lambda/custom** folder.
1. Add the HintInventoryHandler code by locating the **lab-3-task-4-a** marker and pasting in the following code:
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
    ```javascript
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
1. Locate the **useHint** helper function between the **lab-3-task-4-f** labels.  Replace the entire function so that it uses persistent attributes:
    ```javascript
    async function useHint(handlerInput) {
      const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

      sessionAttributes.hintsAvailable -= 1;
      persistentAttributes.hintsUsed += 1;
      handlerInput.attributesManager.savePersistentAttributes();
    }
    ```
1. Update the **HintHandler** function to use persistent attributes by locating the **lab-3-task-4-g** label and pasting in the following code:
    ```javascript
    // SAVING SESSION ATTRIBUTES TO PERSISTENT ATTRIBUTES,
    // BECAUSE THE SESSION EXPIRES WHEN WE START A CONNECTIONS DIRECTIVE.
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    persistentAttributes.currentSession = sessionAttributes;
    handlerInput.attributesManager.savePersistentAttributes();
    ```
1. Update the **BuyHintResponseHandler** function to re-hydrate the session when restarting after the making the Upsell or Buy request.  Locate the **lab-3-task-4-h** label and paste in the following code:
    ```javascript
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    // REHYDRATE SESSION ATTRIBUTES AFTER RETURNING FROM THE CONNECTIONS DIRECTIVE.
    if (persistentAttributes.currentSession !== undefined) {
        sessionAttributes.currentShow = persistentAttributes.currentSession.currentShow;
        sessionAttributes.currentActors = persistentAttributes.currentSession.currentActors;
    }
    ```
1. Update the **BuyHintResponseHandler** function to clear the persisted session by locating the **lab-3-task-4-i** label and pasting in the following code:
    ```javascript
    // CLEAR OUR OUR PERSISTED SESSION ATTRIBUTES.
    persistentAttributes.currentSession = undefined;
    handlerInput.attributesManager.savePersistentAttributes();
    ```
1. Update the **CancelPurchaseHandler** function to save the session when making the Cancel request.  Locate the **lab-3-task-4-j** label and paste in the following code:
    ```javascript
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    // SAVING SESSION ATTRIBUTES TO PERSISTENT ATTRIBUTES,
    // BECAUSE THE SESSION EXPIRES WHEN WE START A CONNECTIONS DIRECTIVE.
    persistentAttributes.currentSession = sessionAttributes;
    handlerInput.attributesManager.savePersistentAttributes();
    ```
1. Update the **BuyHintHandler** function to save the session when making the Buy request.  Locate the **lab-3-task-4-k** label and paste in the following code:
    ```javascript
    // SAVING SESSION ATTRIBUTES TO PERSISTENT ATTRIBUTES,
    // BECAUSE THE SESSION EXPIRES WHEN WE START A CONNECTIONS DIRECTIVE.
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    persistentAttributes.currentSession = sessionAttributes;
    handlerInput.attributesManager.savePersistentAttributes();
    ```
1. Save and close **index.js**

## Task 5. Deploy Updated Skill

1. From the root of the project (the folder with skill.json), enter `ask deploy` to deploy your updated interaction model and lambda function.
	```
	Expected Output:
	-------------------- Update Skill Project --------------------
	Skill Id: amzn1.ask.skill.***
	Skill deployment finished.
	Model deployment finished.
	Lambda deployment finished.
	Lambda function(s) updated:
	  [Lambda ARN] arn:aws:lambda:us-east-1:***
	In-skill product deployment finished.
	In-skill product(s) updated:
	  [ID] amzn1.adg.product.*** [FILE] isps/consumable/Five_Hint_Pack.json
	Your skill is now deployed and enabled in the development stage. Try invoking the skill via the "ask simulate" command.
	```

## Task 6. Test Your Skill

1. To test, login to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask), click on the **Name The Show** entry in your skill list, and click on the "Test" tab.  The "Test" switch on your skill should have been automatically enabled.  If it was not, enable it now.
1. Start testing your skill by typing:
	```text
	open name the show
	```
    > Note: using the invocation name of 'Alexa' is not required when using the simulator in the Developer Console.

    > **IMPORTANT: The developer account associated with the skill is never charged for in-skill products.**  For more details about testing skills with in-skill products, please refer to the [In-Skill Purchase Testing Guide](https://developer.amazon.com/docs/in-skill-purchase/isp-test-guide.html)

    > To reset your in-skill purchases to their original state, use the [reset-isp-entitlement](https://developer.amazon.com/docs/smapi/isp-command-reference.html#reset-isp-entitlement) command.  For your convenience, this command has been scripted and included in the working and resources folders.  Run it using `python reset-workshop-isps.py` command.

	```
	Expected Output:
	Welcome to Name The Show! I will give you the name of an actor or actress, and you have to tell me what television show I am thinking of. If you can't figure one out, you can purchase hints, and I'll give you the name of another actor from the same show. Ready for your first question?
	```
1. Play the game.  Be sure to ask for a hint so you can test out purchasing them.  If you already bought hints when testing Lab 2, use the instructions above to reset your purchases or just use them all and then buy some more.
1. (Optional) Test your skill again using an Echo device, like an Echo Dot or an Echo Show. Start testing your skill by saying:
	```text
	Alexa, open name the show
	```
    > If the device is using a different invocation word, use that instead of Alexa.

## Lab 3 Recap

By following these steps you should have accomplished these goals:
* Created a 'NameTheShow' DynamoDB Table
* Update the VUI to check Inventory
* Used Persistent Attributes to store Hint Inventory

Having trouble?  Not sure you're on the right path? Check out the [Completed Workshop](./workshop-completed/)

Make quick work of this lab?  Check out the [Extra Credit](./extra-credit.md) section for additional things you can do.

# Congratulations!!!

You made it!  If you were able to successfully purchase hints, you are on your way to successfully monetizing your skill.  Check out [next step](./next-steps.md) for more information on where to go next!

\###
