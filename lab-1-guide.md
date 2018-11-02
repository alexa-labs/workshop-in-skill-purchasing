# Lab 1

### Objectives
* Setup Prerequisites
* Deploy Base Workshop Skill
* Create and deploy a Consumable In-Skill Product

## Task 1. Setup Prerequisites

1. Amazon Developer Account
1. AWS Account
1. ASK CLI

### Amazon Developer Account

1. Visit https://developer.amazon.com in your browser.
1. Log in using an existing set of credentials or create a new one.
1. Be sure to enter all the company information.

### Amazon Web Services (AWS) Account

1. Visit https://aws.amazon.com in your browser.
1. Log in using an existing account, or create a new one.
1. You will need a credit card and access to a phone in order to create a new account.

> Note: although a credit card is required to open a new AWS account, the resources required by the workshop all fit into the AWS Free Tier.  If the Free Tier has expired for your account, you may be charged for the use of the resources needed by this workshop.

### Alexa Skills Kit Command Line Interface (ASK CLI)

The ASK CLI is required to complete this lab.  If you do not have it setup on your local machine already, follow these steps to get a development environment (AWS Cloud9) setup with the ASK CLI in just a few minutes.  You must have an AWS Account in order to do this.

If you already have the ASK CLI working, you can skip to the next section.

1. Sign in to your AWS Account
1. Navigate to [Cloud9](https://console.aws.amazon.com/cloud9/home)
1. Create an environment
1. Accept the defaults and click Next
1. Review and click Create Environment
1. Wait a few minutes while the environment is created.
1. Once the environment is ready, enter the following command to install the ASK CLI.
	
	```
	npm install ask-cli -g
	``` 

1. Configure the ASK CLI by entering the command 

	```
	ask init --no-browser
	```

1. Press **ENTER** to use the default profile.  This will use the temporary AWS credentials managed by Cloud9.  Click [here](https://docs.aws.amazon.com/cloud9/latest/user-guide/auth-and-access-control.html#auth-and-access-control-temporary-managed-credentials) to learn more about Temporary Credentials.
1. Click the link which is generated.  Click **Open** in the pop-up menu.  This will open a new tab in your browser.  You will need to sign in to your Amazon Developer account.
1. Once you grant permissions, a code will appear in the browser. Copy this code.
1. Switch back to the Cloud9 terminal.  Paste the code at the prompt.
1. If you have more than one Vendor ID associated with your login, select the one you want to use.
	> If your Vendor ID cannot be retrieved (error message is 'call list-vendors error' / 401 / 'You are not authorized to access this operation'), it typically means you haven't fully created your Developer Account.  Return to https://developer.amazon.com/alexa-skills-kit and finish providing the requested data.
1. Now that the ASK CLI is installed and configured, there's one last step to get it to work with Cloud9 Temporary Credentials.  Enter the following command:
	
	```
	echo 'export ASK_DEPLOY_ROLE_PREFIX=Cloud9-' >> ~/.bashrc
	```

	This sets an environment variable which allows the ASK CLI to create IAM roles compatible with Cloud9 Temporary Credential restrictions.

1. **IMPORTANT** For the new environment variable to be usable, close the current terminal session (enter `exit` or click the **x** on the terminal tab) and launch a new terminal session (click the **+** and then select **New Terminal**)

## Task 2. Download Workshop Code

Now that the prerequisites are taken care of, let's get the base skill setup.

1. Clone the workshop repo with this command:

	```
	git clone https://github.com/alexa/workshop-in-skill-purchasing
	```

If you are not using Cloud9, and don't have git installed, you can [download the latest archive](https://github.com/alexa/workshop-in-skill-purchasing/archive/master.zip) to get the entire repo.  Once downloaded, unzip it.

## Task 3. Deploy and Test the Base Skill

> Note: This guide is written with commands that work in Cloud9.  If you are using a Mac or Windows, the commands might be slightly different.

1. Change to the **working** directory and deploy the skill.
	```
	cd workshop-in-skill-purchasing
	cd working
	ask deploy
	```
1. Verify the skill launches by using the CLI simulate command.
	```
	ask simulate -l en-US -t "open name the show"
	```

	> NOTE: if you receive an error that says _"Simulation did not result to an intent belonging to this skill."_, you may have a live skill enabled with the same invocation phrase, in this case *name the show*. Be sure to disable any other skills that may conflict.

1. _(Optional)_ Familiarize yourself with the skill. Use the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) to test your skill's interactions.  Once logged into the developer cosnole, click on your skill in the list (it should be the first one).

1. _(Optional)_ Explore the project structure in the tree view.  You should see folders for lambda and models, and skill.json file.
	```text
	working [1]
	|
	| skill.json [2]
	|
	+-- lambda
	|      |
	|      +-- custom [3]
	|             |
	|             | index.js [4]
	|             |
	|             +-- languages [5]
	|             |      |
	|             |      |  en.js [6]
	|             |
	|             +-- node_modules
	+-- models [7]
	      |
	      | en-US.json [8]

	[1] This is the project root folder.  You should run the ASK-CLI from this folder.
	[2] This the skill manifest.  The skill configuration is controlled by this file.
	[3] This is the root folder of the Lambda function.  Everything in this folder is uploaded to Lambda as the deployment package.
	[4] This is the code file designated as the Lambda handler.  All the workshop code is in this file.
	[5] If you want to extend the skill to other languages/locales using the i18next framework, you can place other language/locale files you reference in this folder.
	[6] This is the file which holds the English translations for the strings used by the skill code. 
	[7] This is the folder which contains the interaction models for each locale.
	[8] This is the en-US (English, United States) interaction model.
	```

## Task 4. Create In-Skill Products

There are ASK CLI commands for creating your in-skill purchases.  This section will walk you through creating the Consumable In-Skill Products.  

1. Create your first in-skill product.  You should be in the project's root directory.
	```
	ask add isp
	```
1. Choose **Consumable**.
	```
	? List of in-skill product types you can choose (Use arrow keys)
	❯ Consumables
	Entitlement
 	Subscription
	```
1. Choose **Consumable_Template** as your template.  (Note - currently there is only one template.)
	```
	? List of in-skill product templates you can choose (Use arrow keys)
	❯ Consumable_Template
	```
1. Name your in-skill product `Five_Hint_Pack`.  (Note - This name is used in the skill code, and is case-sensitive.)
	```
	? Please type in your new in-skill product name:
 	(Consumable_Template) Five_Hint_Pack
	```
1. Navigate to the new ISPs directory, and note the folder, *consumable*.  This is where the JSON file for your consumable in-skill product resides.  If you were using one-time purchases or subscriptions you would see folders name *entitlements* or *subscriptions*.
	```
	cd isps
	ls
	```
1. Navigate to the **consumable** folder.  You should see one file in this directory which you created in an earlier step.
	```
	cd consumable
	ls
	```
1. Open **Five_Hint_Pack.json** and edit the contents.  You can do this in Cloud9 by double-clicking on the file in the navigation pane on the left.

	This JSON file contains all of the necessary fields for your in-skill product, but you'll need to add the details to get them ready to sell. Because we used the Consumable_Template template, we have provided a small explanation for each field, make sure you replace all of them. Take a look at [the sample in our docs](https://developer.amazon.com/docs/smapi/isp-schemas.html#consumable-schema) for an additional reference.  For this sample, at a minimum, you will need to update the name (not referenceName!), smallIconUri, largeIconUri, summary, description, purchasePromptDescription, boughtCardDescription, releaseDate and privacyPolicyUrl.

	> **IMPORTANT: Don't change the *referenceName* field in your file, as the workshop codebase is relying on the provided value.**

Field|Description|Value for Workshop
-----|-----------|------------------
`name`|The name of the product.  Used by Alexa when reporitng a purchase was successful.|Five Hint Pack
`smallIconUri`|Small icon used with product when displayed in the skill store or Alexa app.  |https://s3.amazonaws.com/ask-samples-resources/icons/moneyicon_108.png
`largeIconUri`|Large icon used with product when displayed in the skill store or Alexa app.|https://s3.amazonaws.com/ask-samples-resources/icons/moneyicon_512.png
`summary`|Summary description of the product.| The Five Hint Pack will give you five hints to help you solve our questions.
`description`|A full description explaining the product's functionality and any prerequisites to using it.| The Five Hint Pack will give you five hints to help you solve our questions.
`purchasePromptDescription`|The description of the product a customer hears when making a purchase or when they cancel a subscription.| This will give you five hints to help you solve our questions.
`boughtCardDescription`|A description of the product that displays on the skill card in the Alexa app.| You have successfully purchased the five hint pack! 
`releaseDate`|The first date the product is available for purhcase.|2018-10-01
`privacyPolicyUrl`|A URL to the privacy policy for this locale.|https://localhost/privacy.html

  Now that you have customized your in-skill product, you can deploy your ISP.  Before you publish your skill, you should complete the remaining fields.

  > Need help creating icons for your ISP or skill? Check out the [Alexa Skill Icon Builder](https://developer.amazon.com/docs/tools/icon-builder.html)

## Task 5. ISP Deployment

1. **Navigate** to the project's root directory. You should see a file named 'skill.json' there.

	```
	cd ../..
	```

2. **Deploy** the In-Skill Product by running the following command:

	```
	ask deploy --target isp
	```

	Alternatively you can use `ask deploy` without the `--target isp` modifier, however it will redeploy your entire skill -- the manifest, the interaction model and the lambda code, as well as re-build your interaction model -- which can take a few minutes.  If there were no changes to the skill other than creating the ISP's, then you can target your deployment.  Enter `ask deploy --help` for the full list of the target options and other usage information.

## Lab 1 Recap

Congrats!  By following these steps you should have accomplished these goals:
* Setup your accounts, the ASK CLI, and other prerequisites
* Deployed the version of the "Name The Show" skill without any In-Skill Products
* Created and deployed the "Five_Hint_Pack" Consumable In-Skill Product

Continue the workshop in [Lab 2](./lab-2-guide.md)

Having trouble?  Not sure you're on the right path? Check out [Completed Lab 1](./2%20-%20Lab%201%20Completed/)
