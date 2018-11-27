# Extra Credit

If you were able to make quick work of the Labs in today's workshop, here are some things you might consider doing as 'extra credit':
* Make the Skill 'yours'
* Add a New Locale
* Make it Multi-Modal

## Make the "Name the Show" skill yours

To customize this skill before you publish it, there are a few things you need to change.  First you need to modify the answers (and the clues!), and then you'll need to adjust the verbiage to align with the item being guessed and the clues.

### Modify the Answers and Clues

1. Open the **clues-en.js** file located in the **lambda/custom/languages** folder.
1. For each entry, enter the answer in the **showName** field.  Enter the clues in the actor1, actor2 and actor3.  Note that clues will be provided in a random order.
1. Remove any entries (be sure to keep the file properly formatted!) that are extra, or add more if you need them.
1. Save the file.  Keep the file open if you need to refer to it for the list of answers for the next step.
1. Open the **en-US.json** file located in the **models** folder.
1. Each answer needs to have a corresponding entry in the **Answer** slot type.  When adding the entry to the list, convert the answer to all lower case and keep any punctuation.
1. If there are synonyms which are considered acceptable alternate answers, add them to their corresponding entries.
1. Save the interaction model.

### Change the Item to be "Named"

1. Open the **en.js** file located in the **lambda/custom/languages** folder.
1. Review the file and update terminology to align with the item that the user will be guessing and the clues being provided.
1. Save and close the file.
1. Open the **skill.json** file located in the project root folder.
1. (Optional) If you would like to make your code more readable and relevant to your skill, update the references to showName, actor1, actor2 and actor3.  You will find references in both the **clues-en.js** file in the **lambda/custom/languages** folder and the **index.js** file in the **lambda/custom** folder. 

## Add a New Locale

As of November 2018, In-Skill Products are only currently available in the en-US locale, however with some minor modifications, the Name The Show skill could be used in more locales.  To prepare your skill, first it will need to be localized, and then any adjustments due to ISP availability must be made.

### Localize the Skill

1. The Name The Show skill has already been internationalized.  To localize it, first duplicate these locale specific files and name them according to the new file:
    * lambda/custom/language/clues-en.js
    * lambda/custom/language/en.js
    * models/en-US.json
1. Open each of these files in turn, and make any translation adjustments required.
1. Update the reference in the clone of en.js to point to the new clues file you just created.
1. Open the **index.js** file and locate the languageStrings object.  Add a new entry for each new locale. 
1. Open the **skill.json** file located in the project root folder.
1. Find the locales section, and copy the entire en-US entry.  Add a comma to the end of the en-US section, and paste in a copy of it.  Modify the locale name to the locale you are adding, and then modify the rest of the attributes to be appropriate to the new locale.
1. Save and close all the modified files.
1. Deploy the updated skill.
1. Test it!

### Name The Show without In-Skill Purchasing

How you would like the skill to operate in locales without In-Skill Purchasing will be up to you, however one option is to grant a customer a certain number of hints when enabling the skill, or giving a set number per day or per session.  The skill we started with before making any changes in the lab works this way.  Each session gets two hints.  Check out the LaunchRequest of the [Lab 1 Completed](./lab-1-completed) skill to see how that works.

In addition you'll need to detect the locale in the other intent handlers so can respond appropriately (e.g. "Buying hints is not currently supported in the Canadian English version of Name the Show.  Instead, you are allotted two free hints per session.")

## Make it Multi-Modal

To make the skill work better with screens, consider adding an image for the clue (e.g. actor's picture), and an image for each answer (i.e. show's title screen)

You could add the images by [adding a card](https://developer.amazon.com/docs/custom-skills/include-a-card-in-your-skills-response.html) to the skill's response.

If you don't mind giving users with an Echo Show or other display-enabled devices a slight advantage, add the `Display.RenderTemplate` directive based on guidance from [here](https://developer.amazon.com/docs/custom-skills/create-skills-for-alexa-enabled-devices-with-a-screen.html).

\###