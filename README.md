# LoIDE

## Overview
Web-based IDE for Logic Programming

## Functional requirements

- **Function**: Download file
  - **Description**: The user selects the proper button to download the text of his program
  - **Inputs**: The text of the program
  - **Source**: The text will be submitted in input by the user 
  - **Outputs**: File .txt (or eventual other formats)
  - **Destination**: It will be saved in the download file of its proper computer or other devices

- **Function**: Insert examples to test
  - **Description**: The user has the possibility to click on many typical problems, ready to be resolved
  - **Inputs**: Text of the problem 
  - **Source**: The insertion of the problem in the editor, will be inserted automatically by the app
  - **Outputs**: The resolution of the problem 
  - **Destination**: The program will return the problem solved by the Solver ASP

- **Function**: Syntax highlighter
  - **Description**: The text is highlighted accross the colors of certain parts of the syntax ASP based on their function, such as comments, terms, aggregate literals
  - **Inputs**: Text of the program
  - **Source**: The text will be inserted in input by the user in the appropriate text editor 
  - **Outputs**: Syntax highlighter
  - **Destination**: The syntax will be managed by the text editor _Ace_, integrated in the app, programming it in base the ASP language

- **Function**: Interactive report of the syntax errors
  - **Description**: The user clicking the icon error in the apposite line, will visualize a report of eventual syntactic errors
  - **Inputs**: Text of the program
  - **Source**: The text will be submitted in input by the user 
  - **Outputs**: The syntactic errors will be displayed
  - **Destination**: The syntactic errors will be detected by the text editor _Ace_

- **Function**: Customization of the solver 
  - **Description**: You can choose to resolve the problem with various listed solvers
  - **Inputs**: Text of the problem
  - **Source**: The text will be submitted in input by the user  or selected from various examples 
  - **Outputs**: Resolution of the problem with the relative solver 
  - **Destination**: Solve ASP chosen

- **Function**: Customize the options of the solver 
  - **Description**: Selected a solver, you can choose an option that filters or enriches the problem 
  - **Inputs**: Solver's option
  - **Source**: Selected in input by the user 
  - **Outputs**:  Resolution of the problem with the relative solver's option
  - **Destination**: Solver ASP chosen 
  - **Pre-condition**: Selected the solver 

- **Function**: Desplayed the result of the solver 
  - **Description**: Will appear in the right container, the answer set of the problem and maybe some debugging information
  - **Outputs**: Visualization of the result of the problem 
  - **Destination**: Gui

## Running LoIDE
You need to install node.js and run `npm install` in this directory.
Then run 
```
node server.js
```
And you can run _LoIDE_ in your browser by serving:
```
http://localhost:8084/index.html
```


## IMPORTANT NOTE

__*LoIDE is part of an undergraduate student's work of thesis, and is still at the early stages of development.*__

__*It currently supports only Answer Set Programming; we encourage any feedback, but we do NOT recommend it for production yet.*__
