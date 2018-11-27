# Next Steps

Congratulations on finishing the workshop!  Now that you know your way around In-Skill Purchasing, you are ready to take your skill to the next level.  Here are our suggested next steps:

* [Remove Workshop AWS Resources](#remove-workshop-aws-resources)
* [Setup CLI in your preferred development environment](#Setup-CLI-in-your-preferred-development-environment)
* [Add Premium Content and ISP’s to your skill](#Add-Premium-Content-and-ISPs-to-your-skill)
* [Consider adding additional analytics within your skill](#Consider-adding-additional-analytics-within-your-skill)
* [Conduct a Beta Test](#Conduct-a-Beta-Test)
* [Certification](#Certification)
* [Monitor your skill’s performance](#Monitor-your-skills-performance)
* [Iterate and enhance your skill](#Iterate-and-enhance-your-skill)
* [Join the Community](#Join-the-Community)

### Remove Workshop AWS Resources

Although we recommend you keep the skill you created during this workshop around for reference, if you would like to instead remove some or all of the AWS resources created during this workshop, please follow these steps:

> _Note: If you chose different names during the workshop, be sure to search for those resources instead of those named below._

1. AWS Cloud9 Instance
    1. Navigate to [Cloud9 in the AWS console](https://console.aws.amazon.com/cloud9)
    1. Select the Cloud9 instance you created.
    1. Choose *Delete Environment* from the menu.
1. Amazon DynamoDB Table
    1. Navigate to [DynamoDB in the AWS console](https://console.aws.amazon.com/dynamodb/home?region=us-east-1#tables:)
    1. Select the NameTheShow table from the list.
    1. Click *Delete*.
1. AWS Lambda Function
    1. Navigate to [Lambda in the AWS console](https://console.aws.amazon.com/lambda)
    1. Select the ask-name-the-show function from the list.
    1. Click *Delete Function*.
1. AWS IAM Role
    1. Navigate to the [roles section in the IAM area in the AWS console](https://console.aws.amazon.com/iam/home#/roles)
    1. Select the name-the-show role from the list.
    1. Click *Delete Role*.
1. AWS CloudWatch Logs
    1. Navigate to [CloudWatch Logs in the AWS console](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logs:)
    1. Select the ask-name-the-show log group.
    1. Click *Delete*

### Setup CLI in your preferred development environment

In today's workshop, we used AWS Cloud9. You can continue to use Cloud9 for your skill development.  If you want to setup the ASK CLI on your local machine instead of using Cloud9, follow the directions [here](https://alexa.design/cli). 

### Add Premium Content and ISP’s to your skill

Your existing skill should have a great free experience.  Once you've decided you want to add a premium experience, you will need to decide what form that premium content will take.  Along with that, you should select what type of In-Skill Product is best suited to that premium content -- consumables, subscriptions or one-time purchases.

Once you've planned this out, add the premium content to your skill.  Add the In-Skill products following the general outline from this workshop - create the ISP, integrate Upsells and Buys into your skill, and add supporting functionality like subscription management or inventory tracking.

### Consider adding additional analytics within your skill

There is a rich set of metrics for how users interact with your skill available through the developer console.  In the developer console, click the **Analytics** link next to your skill to access the analytics.

Beyond these analytics, you should consider how users might interact with your skill and what data would be helpful in improving your skill.  For example, you might track how many customers use a hint on a particular question, or how many customers get a particular question wrong on the first try.  Exactly what you track will depend on your skill and it will likely evolve over time.  If you think the data might tell something that could improve your skill, track it. Review the data and if it's not helpful, stop.

### Conduct a Beta Test

Getting feedback from users is the best way to improve the user experience in your skill.  The skill beta testing tool can be used to test your Alexa skill in beta before releasing it to production. You can also use the skill beta testing tool to test changes to an existing skill, while still keeping the currently live version of the skill available for the general public. You can invite friends or family, your social network contacts, or other people for whom you have an email address to test your skill and provide feedback. Using skill beta testing can help increase your chances of skill success.

Get more information on beta testing here: https://alexa.design/betatest

### Certification

In today's workshop we configured the minimum required fields for an In-Skill Product to work in development.  The remaining fields for any In-Skill Products need to be updated prior to submitting your skill for certification.  It is at this time, that In-skill products are evaluated.

Prior to submitting your skill for certification, there are validation tests you can run which help to catch common certification failures.  These tests can be run from within the developer console or from the command line.  To run these tests using the CLI, enter this command from the project's root folder (that's the folder with the skill.json file):
```
ask validate
```
In addition to passing these validation tests, make sure that your skill passes all of the [certification requirements for a custom skill](https://developer.amazon.com/docs/custom-skills/certification-requirements-for-custom-skills.html).  

You should also review the [In-Skill Purchase Certification Guide](https://developer.amazon.com/docs/in-skill-purchase/isp-certification-guide.html) which is specific to skills which include In-Skill Products.

For general tips on certification, check out https://alexa.design/certification.

### Monitor your skill’s performance

As mentioned earlier, there is a rich set of metrics for how users interact with your skill available through the developer console.  In the developer console, click the **Analytics** link next to your skill to access the analytics.

A detailed description of the analytics available in the console can be found [here](https://developer.amazon.com/docs/devconsole/measure-skill-usage.html).  

Periodically review the metrics, and see how customers are using your skill.  See where customers are encountering problems, make adjustments, and keep improving your skill.

### Iterate and enhance your skill

After your skill is published, the world will continue to turn.  To keep your skill fresh, look at your metrics, listen to your customer feedback and continue to enhance your skill.  It could be as simple as adding new questions, but you might consider adding additional categories, a leaderboard and more.

### Join the Community

[Amazon Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html)

[Alexa Skills - User Voice](https://alexa.uservoice.com)

[Alexa Slack](https://amazonalexa.slack.com)

\###
