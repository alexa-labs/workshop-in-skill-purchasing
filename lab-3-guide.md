# Lab 3

Objectives
* Create DynamoDB Table
* Update VUI to check Inventory
* Use Persistent Attributes to store Hint Inventory
* 

## Update VUI

                   "name": "HintInventoryIntent",
                    "slots": [],
                    "samples": [
                        "how many hints do I have left",
                        "how many hints do I have",
                        "how many hints remain",
                        "how many hints"
                    ]
                },
 

 ## Update skill code

     HintInventoryHandler,

    CheckInventoryInterceptor,
  )
  .withTableName('NameTheShow')
  .withAutoCreateTable(true)


  const CheckInventoryInterceptor = {
  async process(handlerInput) {
    await checkInventory(handlerInput);
  },
};

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




## Update IAM Role



## Manual DDB Table Creation


### Testing

1. To test, login to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask), click on the **Premium Facts Sample** entry in your skill list, and click on the "Test" tab.  The "Test" switch on your skill should have been automatically enabled.  If it was not, enable it now.

2. Your skill can now be tested on devices associated with your developer account, as well as the Test tab in the Developer Portal. To start using your skill, just type or say:

	```text
	Alexa, open premium facts sample
	```

**Note: The developer account associated with the skill is never charged for in-skill products.**  For more details about testing skills with in-skill products, please refer to the [In-Skill Purchase Testing Guide](https://developer.amazon.com/docs/in-skill-purchase/isp-test-guide.html)

