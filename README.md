## Workshop In Skill Purchasing

This workshop covers buildling a sample skill which uses In-Skill Purchasing, specifically consumable products.

## The Skill

### Skill Overview

The skill we will build in this workshop is a basic game where the player is presented with a clue (specifically the name of an actor or actress).  The player then attempts to guess the answer (a television show on which the actor portrays a major character).  If the player would like another clue (an additional actor or actress), then the player can ask for a hint.  Hints are sold in packs of five, with a list price of $0.99 for each pack of five.

### Example User Interaction

The following is an example user interaction with the skill.  Some of the dialog has been shortened to make it easier to read.

User: Alexa, open name the show
  Alexa: Welcome to Name the Show, the game where you try to guess the show based on the actors in it.  Are you ready to begin?
User: Yes
  Alexa: Your clue is Billy Bob Thornton.  What show do you guess?
User: Man in the high castle
  Alexa: That is incorrect.  Please guess again.  What show do you guess?
User: Give me a hint
  Alexa: You currently do not have any hints, would you like to learn more about the Five Hint Pack?
User: Yes
  Alexa: The Five Hint Pack is available for 99 cents.  Would you like to buy it?
User: Yes
  Alexa: Great, you now own a five hint pack.  Here's your clue: Billy Bob Thornton and Nina Arianda.  Which show do you guess?
User: Goliath
  Alexa: Correct, the show I was thinking of was Goliath.  Would you like to play again?
User: No
(skill exits)

### Architecture

The architecture of the skill consists of an AWS Lambda function which uses and Amazon DynamoDB table to store persistent attributes (including hint inventory) across user sessions.  The Skill's interaction model is managed by the Alexa Skills Kit, and the In-Skill Product catalog and Payment Flow is managed by the Alexa Monetization Service.  The Skill's handler logic is coded in node.js and utilizes the Alexa Skills Kit SDK (ASK SDK).

Here is a detailed architecture dieagram:
TODO - !image

## The Workshop

This workshop is broken up into three labs.  Each lab will take approximately 30 minutes to complete.

The starting state of the skill is such that the premium feature (the hints), has already been added to tke skill.  The workshop will add the In-Skill Purchasing of the hint pack.

### Lab 1 - Setup and Product Configuration

In Lab 1, you will setup the workshop prerequisities, deploy the base skill and add a product to the In-Skill Product Catalog.

[Lab 1](./lab-1-guide.md)

### Lab 2 - Enable Buying the Product (ISP) Using Voice

In Lab 2, you will update the skill's voice interaction model to include intents related to buying hints.  Additionally, you will update the skill's handler code to handle these new intents as well as to interact with Alexa Monetization Service.

[Lab 2](./lab-2-guide.md)

### Lab 3 - Persist and Manage Inventory

In Lab 3, you will update the skill's inteaction model to include intents to check hint inventory levels, create the Amazon DynamoDB table which will store hint inventory levels, and update the skill's handler code to handle the new intent and persist the inventory levels in the data table.

[Lab 3](./lab-3-guide.md)

## After the Workshop

Once you have completed the workshop, you are ready to take your skill to the next level.  Suggested next steps can be found [here](./next-steps.md)

### Community Resources

[Amazon Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html)

[Alexa Skills - User Voice](https://alexa.uservoice.com)

## License

This library is licensed under the Amazon Software License.
