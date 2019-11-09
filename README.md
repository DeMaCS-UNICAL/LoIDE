
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/DeMaCS-UNICAL/LoIDE/master/LICENSE)
[![GitHub release](https://img.shields.io/github/release/DeMaCS-UNICAL/LoIDE.svg)](https://github.com/DeMaCS-UNICAL/LoIDE/releases/latest)
[![GitHub issues](https://img.shields.io/github/issues/DeMaCS-UNICAL/LoIDE.svg)](https://github.com/DeMaCS-UNICAL/LoIDE/issues)
[![David](https://img.shields.io/david/DeMaCS-UNICAL/LoIDE)](https://david-dm.org/DeMaCS-UNICAL/LoIDE)
[![Website](https://img.shields.io/website-up-down-green-red/https/www.mat.unical.it/calimeri/projects/loide.svg?label=my-website)](https://www.mat.unical.it/calimeri/projects/loide)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/DeMaCS-UNICAL/LoIDE.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=%5Bobject%20Object%5D)


<!-- # LoIDE -->

![LoIDE](docs/images/logo_LoIDE.svg)

**A web-based IDE for Logic Programming.**

![LoIDE web GUI](docs/screenshots/screenshot_3-col.png)

<!-- ___

Badge | Status
---                | ---
License            | [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/DeMaCS-UNICAL/LoIDE/master/LICENSE)
Current Version    | [![GitHub release](https://img.shields.io/github/release/DeMaCS-UNICAL/LoIDE.svg)](https://github.com/DeMaCS-UNICAL/LoIDE/releases/latest)
GitHub Issues      | [![GitHub issues](https://img.shields.io/github/issues/DeMaCS-UNICAL/LoIDE.svg)](https://github.com/DeMaCS-UNICAL/LoIDE/issues)
Our Online Beta    | [![Website](https://img.shields.io/website-up-down-green-red/https/www.mat.unical.it/calimeri/projects/loide.svg?label=my-website)](https://www.mat.unical.it/calimeri/projects/loide)
Tell your friends! | [![Twitter](https://img.shields.io/twitter/url/https/github.com/DeMaCS-UNICAL/LoIDE.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=%5Bobject%20Object%5D)

___ -->


## IMPORTANT NOTE

__*LoIDE started as an undergraduate student's work of thesis, and is still at the early stages of development.*__

__*It currently supports only Answer Set Programming; we encourage any feedback, but we do NOT recommend it for production yet.*__


## Online Beta
Find a live beta version at www.mat.unical.it/calimeri/projects/loide

This online version uses the [EmbASPServerExecutor](https://github.com/DeMaCS-UNICAL/EmbASPServerExecutor) to run the solvers


## Purpose
The main goal of the LoIDE project is the release of a modular and extensible web-IDE for Logic Programming using modern technologies and languages.

A further goal of the project is to provide a web-service with a common set of APIs for different logic-based languages.  
Further information can be found in the [Wiki](https://github.com/DeMaCS-UNICAL/LoIDE/wiki/APIs)

## Key Features

 - Syntax highlighting
 - Output highlighting
 - Layout and appearance customization
 - Keyboard shortcuts
 - Multiple file support
 - Execution and Solvers options definition
 - Import and Export files


## Getting Started (Installation and Usage)
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
It requires only [Node.js&reg;](https://nodejs.org)

### Installing
Install dependencies:
 ```
 npm install
 ```

### Running
Start the server:
```
npm start
```

Use _LoIDE_ in a browser at:
```
http://localhost:8084
```

### Note
You need an "executor" in order to run the solvers.

If you like it, you can use our [EmbASPServerExecutor](https://github.com/DeMaCS-UNICAL/EmbASPServerExecutor).


## Built With
 - [Ace](https://ace.c9.io) - The "base" of our editor
 - [Bootstrap](https://getbootstrap.com) - the front-end web framework used
 - [jQuery](https://jquery.com) and [its UI Layout plugin](http://plugins.jquery.com/layout) - Used to improve the UI
 - [BiMap](https://github.com/alethes/bimap) - Used to manage the options for solvers and languages
 - [keymaster.js](https://github.com/madrobby/keymaster) - Used to implement keyboard shortcuts outside the editor

<!-- 
## Contributing

Please read [CONTRIBUTING.md]() for details on our code of conduct, and the process for submitting pull requests to us.
 -->

## Versioning
We use [Semantic Versioning](http://semver.org) for versioning. For the versions available, see the [releases on this repository](https://github.com/DeMaCS-UNICAL/LoIDE/releases). 


## Credits
 - Stefano Germano
 - Eliana Palermiti
 - Rocco Palermiti
 - Francesco Calimeri

From the [Department of Mathematics and Computer Science](https://www.mat.unical.it) of the [University of Calabria](http://unical.it)


## License
  This project is licensed under the [MIT License](LICENSE)
