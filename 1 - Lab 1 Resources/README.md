# Lab 1

## Task 1. Setup Prerequisites

1. Amazon Developer Account
1. AWS Account
1. ASK CLI

### Amazon Developer Account

1. Visit https://developer.amazon.com in your browser.
1. Log in using an existing set of credentials or create a new one.
1. Be sure to enter all the company informaiton.

### Amazon Web Services (AWS) Account

1. Visit https://aws.amazon.com in your browser.
1. Log in using an existing account, or create a new one.
1. You will need a credit card and access to a phone in order to create a new account.

> Note: although a credit card is required to open a new AWS account, the resources required by the workshop all fit into the AWS Free Tier.  If the Free Tier has expired for your account, you may be charged for the use of the resources needed by this workshop.

### Alexa Skills Kit Command Line Interface (ASK CLI)

The ASK CLI is required to complete this lab.  If you do not have it setup on your local machine already, follow these steps to get a development environment (AWS Cloud9) setup with the ASK CLI in just a few minutes.  You must have an AWS Account in order to do this.

If you already have the ASK CLI working, you can skip to the next section.

> TODO: Need to verify labels/steps
1. Sign in to your AWS Account
1. Navigate to Cloud9
1. Create an environment
1. Accept the defaults and click Next
1. Review and click Create Environment
1. Wait a few minutes while the environemnt is created.
1. Once the environment is ready, enter the command ```npm install ask-cli -g``` to install the ASK CLI.
1. Configure the ASK CLI by entering the command ```ask init --no-browser```.
1. Press **ENTER** to use the default profile.  This will use the temporary AWS credentials managed by Cloud9.  Click [here](https://link.to.info.about.temporary.credentials) to learn more about Temporary Credentials.
1. Click the link which is generated.  This will open a new tab in your browser.  You will need to sign in to your Amazon Developer account.
1. Once you grant permissions, a code will appear in the browser. Copy this code.
1. Switch back to the Cloud9 terminal.  Paste the code at the prompt.
1. If you have more than one Vendor ID associated with your login, select the one you want to use.
1. Now that the ASK CLI is installed and configured, there's one last step to get it to work with Cloud9 Temporary Credentials.  Enter this command ```ASK_LAMBDA_ROLE_PREFIX="Cloud9"```.  This will allow the ASK CLI to create IAM roles compatible with Cloud9 Temporary Credential restrictions.

## Task 2. Download Workshop Code

If you have git installed on your computer, clone this repo with this command:

```git clone https://github.com/alexa/workshop-in-skill-purchasing```

If you don't have git installed, click this [link](https://github.com/alexa/workshop-in-skill-purchasing/archive/master.zip) to download the repo.  Once downloaded, unzip it.

## Task 3. Deploy and Test the Base Skill

> Note: This guide is written with commands that work in Cloud9.  If you are using a Mac or Windows, the commands might be slightly different.

1. Change to the **0 - Base Skill** directory and deploy the skill.

```
$ cd workshop-in-skill-purchasing
$ cd "0 - Base Skill"
$ ask deploy
```

2. Verify the skill launches by using the CLI simulate command.

```
$ ask simulate -l en-US -t "open name the show"
```

3. _(Optional)_ Familiarize yourself with the skill.  Using a device linked to your account, the Alexa Developer Console test simulator or Echosim.io, play the game.

4. _(Optional)_ **Explore** the project structure.  You should see folders for lambda and models, and skill.json file.

	```
	$ ls
	lambda		models		skill.json
	```

5. **Open** the models folder.

	```
	$ cd models
	```

6. **Open** the interaction model file, en-US.json.

	```
	$ open en-US.json
	```

### Task 4. Create In-Skill Products

There are ASK CLI commands for creating your in-skill purchases.  This guide will walk you through creating of Consumable In-Skill Products.  

1. **Create** your first in-skill product.  You should be in the project's root directory.

	```
	$ ask add isp
	```

3. **Choose** Consumable.

	```
	? List of in-skill product types you can choose (Use arrow keys)
	❯ Consumables account
  Entitlement
  	Subscription
	```

4. **Choose** Entitlement_Template as your template.

	```bash
	? List of in-skill product templates you can choose (Use arrow keys)
	❯ Entitlement_Template
	```

5. **Name** your in-skill product *science_pack*.

	```bash
	? Please type in your new in-skill product name:
 	(Entitlement_Template) science_pack
	```

6. **Repeat** steps #2 - #5 to create two more entitlements: *history_pack* and *space_pack*.

	```bash
	? Please type in your new in-skill product name:
 	(Entitlement_Template) history_pack
	...
	? Please type in your new in-skill product name:
 	(Entitlement_Template) space_pack
	```

7. **Create** a subscription product named *all_access* using a similar process.

	```bash
	$ ask add isp

	? List of in-skill product types you can choose (Use arrow keys)
	  Entitlement
	❯ Subscription

	? List of in-skill product templates you can choose (Use arrow keys)
	❯ Subscription_Template

	? Please type in your new in-skill product name:
 	(Subscription_Template) all_access

8. **Navigate** to the new ISPs directory, and note the two folders, *entitlement* and *subscription*.  This is where the JSON files for each of your in-skill products reside.

	```bash
	$ cd isps
	$ ls
	```

9. **Navigate** to the *entitlement* folder.  You should see three files in this directory, one for each of the entitlements you created in our previous steps.

	```bash
	$ cd entitlement
	$ ls
	```

10. **Open** history_pack.json

	This JSON file contains all of the necessary fields for your in-skill product, but you'll need to add the details to get them ready to sell. Because we used the Entitlement_Template template, we have provided a small explanation for each field, make sure you replace all of them. Take a look at [the sample in our docs](https://developer.amazon.com/docs/smapi/isp-schemas.html#entitlement-schema) for an additional reference.  For this sample, at a minimum, you will need to update the name (not referenceName!), smallIconUri, largeIconUri, summary, description, purchasePromptDescription, boughtCardDescription, releaseDate and privacyPolicyUrl.  Alternatively you can copy and paste the contents of the files found here: [ISP Entitlements](https://github.com/alexa/skill-sample-nodejs-fact-in-skill-purchases/tree/master/isps.samples/entitlement).

	After updating *history.pack.json*, Fill out the details for the *science_pack.json* and *space_pack.json* files.  You will need to update with content about your science and space products including icons for each.

	> **IMPORTANT: Don't change the *referenceName* in your files, as our codebase is relying on those to be consistent.**

	Once you are happy with your pricing, descriptions, and the other metadata for your three entitlements, you should update the same fields plus the subscriptionPaymentFrequency for your subscription.  Alternatively you can copy and paste the contents of [All Access ISP subscription sample](https://raw.githubusercontent.com/alexa/skill-sample-nodejs-fact-in-skill-purchases/master/isps.samples/subscription/all_access.json) into your *all_access.json* file.

11. **Review and edit** the subscription file.

	```bash
	$ cd ../subscription
	$ open all_access.json
	```

	Now that you have customized your in-skill products, you can deploy your skill using the ASK CLI, and start testing it.

	> _Note: be sure to review the output to confirm there were no errors._

### Deployment

1. **Navigate** to the project's root directory. You should see a file named 'skill.json' there.

	```bash
	$ cd ../..
	```

2. **Deploy** the skill and the Lambda function in one step by running the following command:

	```bash
	$ ask deploy
	```
	Assuming that you followed all of the setup instructions for the ASK CLI, your entire skill and Lambda function should be created on their respective portals.


### Testing

1. To test, login to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask), click on the **Premium Facts Sample** entry in your skill list, and click on the "Test" tab.  The "Test" switch on your skill should have been automatically enabled.  If it was not, enable it now.

2. Your skill can now be tested on devices associated with your developer account, as well as the Test tab in the Developer Portal. To start using your skill, just type or say:

	```text
	Alexa, open premium facts sample
	```

**Note: The developer account associated with the skill is never charged for in-skill products.**  For more details about testing skills with in-skill products, please refer to the [In-Skill Purchase Testing Guide](https://developer.amazon.com/docs/in-skill-purchase/isp-test-guide.html)



## License Summary

