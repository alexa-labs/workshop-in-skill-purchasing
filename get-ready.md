Here's what we recommend you do before the workshop gets started:

# Workshop Prerequisites

1. Amazon Developer Account
1. AWS Account
1. ASK CLI

## Amazon Developer Account

1. Visit https://developer.amazon.com in your browser.
1. Log in using an existing set of credentials or create a new one.
1. Be sure to enter all the company information.

## Amazon Web Services (AWS) Account

1. Visit https://aws.amazon.com in your browser.
1. Log in using an existing account, or create a new one.
1. You will need a credit card and access to a phone in order to create a new account.

> Note: although a credit card is required to open a new AWS account, the resources required by the workshop all fit into the AWS Free Tier.  If the Free Tier has expired for your account, you may be charged for the use of the resources needed by this workshop.

## Alexa Skills Kit Command Line Interface (ASK CLI)

The ASK CLI is required to complete this lab.  If you do not have it setup on your local machine already, follow these steps to get a development environment (AWS Cloud9) setup with the ASK CLI in just a few minutes.  You must have an AWS Account in order to do this.

If you already have the ASK CLI working, skip to the next section.

If you want to setup the ASK CLI on your local machine instead of using Cloud9, follow the directions [here](https://alexa.design/cli). 

1. Sign in to your AWS Account
1. Navigate to [Cloud9](https://console.aws.amazon.com/cloud9/home)
1. Create an environment and name it "ASK Workshop"
1. Accept the defaults and click Next
1. Review and click Create Environment
1. Wait a few minutes while the environment is created.
1. Once the environment is ready, enter the following command in the bash terminal that is created by default.  This command installs the ASK CLI.
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

## Verify ASK-CLI Version

From the terminal/command prompt issue this command:

```
ask --version
```

You should see at least *1.4.5*.  If you don't, update your CLI by issuing this command:
```
npm install ask-cli -g
```

That's it!  Sit back, relax and wait for the workshop to get started!

\###