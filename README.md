# jira-task-flow-visualizer

This tool is a TamperMonkey script that allows you to see a graph of child issues related to a jira ticket. It will simplify the sprint planning and help you to choose the next stories to take or find improvements to make in the project:
1.  you can see the current progress of your epic
2.  clearly see the dependency between tickets and see what tickets can be taken
3.  see what stories can be done in parallel
4.  easily find lacks in your preparation topic
5.  detect bottle necks in the development
6.  help team to understand the topic and how to proceed

# Getting started

You need to follow the following steps to correctly use the tool.

## 1 - Install TamperMonkey

Depending on the browser, find the TamperMonkey application in the browser extension market.

For chrome:
[link](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=fr).

## 2 - Install Jira Tasks Graph script

You have two options:

-   Open the user script by open the javascript file in raw mode by
    click in
    [here](https://raw.githubusercontent.com/criteo/jira-task-flow-visualizer/main/dist/jira-task-flow-visualizer/jira-task-flow-visualizer.user.js). TamperMonkey should automatically ask you to install the script for you

-   Otherwise, add your script manually by simply doing a copy paste

- Finally, replace the domain next to `@match` with your domain at the beginning of the script

### 3 - Configure Jira tickets properly

Each Jira ticket has to be linked to the other tickets by using:

•*depends on*

•*is depended by*

**Cloned** links or cross dependencies have to be removed otherwise a cross-dependency is detected. If it happens, a warning will be show and the graph will not show the dependencies correctly

If you use other different links such as "blocks" or "is blocked by", then they might be considered as opposite connections even though we expect them to be correct.

## 4 - Open an epic Jira ticket link

When opening any JIRA ticket containing child issues, you will see the graph below the description section.
