
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/DeMaCS-UNICAL/LoIDE/master/LICENSE)
[![GitHub release](https://img.shields.io/github/release/DeMaCS-UNICAL/LoIDE.svg)](https://github.com/DeMaCS-UNICAL/LoIDE/releases/latest)
[![GitHub issues](https://img.shields.io/github/issues/DeMaCS-UNICAL/LoIDE.svg)](https://github.com/DeMaCS-UNICAL/LoIDE/issues)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/DeMaCS-UNICAL/LoIDE)
![Lines of code](https://img.shields.io/tokei/lines/github/DeMaCS-UNICAL/LoIDE)
[![David](https://img.shields.io/david/DeMaCS-UNICAL/LoIDE)](https://david-dm.org/DeMaCS-UNICAL/LoIDE)

[![Online Demo](https://img.shields.io/website-up-down-green-red/https/www.mat.unical.it/calimeri/projects/loide.svg?label=online-demo)](https://loide.demacs.unical.it)
[![LoIDE website](https://img.shields.io/website-up-down-green-red/https/www.mat.unical.it/calimeri/projects/loide.svg?label=LoIDE-website)](https://demacs-unical.github.io/LoIDE)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/DeMaCS-UNICAL/LoIDE.svg?style=social)](https://twitter.com/intent/tweet?text=LoIDE%20-%20A%20web-based%20IDE%20for%20Logic%20Programming%0A&url=https%3A%2F%2Fdemacs-unical.github.io%2FLoIDE)


<!-- # LoIDE -->

![LoIDE](docs/images/logo_LoIDE.svg)

**A web-based IDE for Logic Programming.**

[![LoIDE web GUI](docs/screenshots/screenshot_3-col.png)](https://www.mat.unical.it/calimeri/projects/loide)

<!-- ___

Badge | Status
---                | ---
License            | [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/DeMaCS-UNICAL/LoIDE/master/LICENSE)
Current Version    | [![GitHub release](https://img.shields.io/github/release/DeMaCS-UNICAL/LoIDE.svg)](https://github.com/DeMaCS-UNICAL/LoIDE/releases/latest)
GitHub Issues      | [![GitHub issues](https://img.shields.io/github/issues/DeMaCS-UNICAL/LoIDE.svg)](https://github.com/DeMaCS-UNICAL/LoIDE/issues)
Our Online Beta    | [![Website](https://img.shields.io/website-up-down-green-red/https/www.mat.unical.it/calimeri/projects/loide.svg?label=my-website)](https://www.mat.unical.it/calimeri/projects/loide)
Tell your friends! | [![Twitter](https://img.shields.io/twitter/url/https/github.com/DeMaCS-UNICAL/LoIDE.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=%5Bobject%20Object%5D)

___ -->


<!-- ## IMPORTANT NOTE

<!-- __*LoIDE started as an undergraduate student's work of thesis, and is still at the early stages of development.*__ -->

<!-- __*It currently supports only Answer Set Programming; we encourage any feedback, but we do NOT recommend it for production yet.*__ -->


## Online Demo
Find a live demo at www.mat.unical.it/calimeri/projects/loide

Check the status of our services at https://loide.freshstatus.io

<!-- This online version uses the [EmbASPServerExecutor](https://github.com/DeMaCS-UNICAL/EmbASPServerExecutor) to run the solvers -->


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
These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites
It only requires [Node.js&reg;](https://nodejs.org)

### Download
You can find the latest version of LoIDE [here](https://github.com/DeMaCS-UNICAL/LoIDE/releases/latest).

Otherwise you can clone this repository.

Remember that you can always see all the releases of LoIDE [here](https://github.com/DeMaCS-UNICAL/LoIDE/releases). 

### Install
Install dependencies:
 ```
 npm install
 ```

Now you can run LoIDE in development or in production mode.

### Run in production mode
In this mode, LoIDE will be optimized for production.

Start the server:
```
npm start
```

Use _LoIDE_ in a browser at:
```
http://localhost:8084
```

If you wish to run _LoIDE_ over HTTPS, you must provide paths to certificate files in the ```app-config.json``` file.
Then, you can start _LoIDE_ in a browser at: 
```
http://localhost:8085
```

### Run in development mode
Run LoIDE in development mode only for development and testing purposes.

Start the server:
```
npm run start:dev
```

The browser will be opened automatically _LoIDE_ in at:
```
http://localhost:7000
```

### Note
You need an "executor" in order to run the solvers.

If you like it, you can use our [EmbASPServerExecutor](https://github.com/DeMaCS-UNICAL/EmbASPServerExecutor).


## Built With
 
 - [Ace](https://ace.c9.io) - The "base" of our editor
 - [Bootstrap](https://getbootstrap.com) - The front-end web framework used
 - [Clipboard.js](https://clipboardjs.com) - Used to create text boxes with copyable text
 - [Font Awesome Icons 4.7](https://fontawesome.com/v4.7.0/icons/) - Icon set used
 - [jQuery](https://jquery.com) and [its UI Layout plugin](http://plugins.jquery.com/layout) - Used to improve the UI
 - [jQuery contextMenu 2](https://swisnl.github.io/jQuery-contextMenu/) - Used for to create the context menus
 - [Mousetrap](https://craig.is/killing/mice) - Used to implement keyboard shortcuts outside the editor
 - [Pugjs](https://pugjs.org) - Used to create a dynamic html pages
 - [Socket.io](https://socket.io) - Used for executor server connection
 - [Browsersync](https://www.browsersync.io) - Used to enable the live reload on the browser
 - [Gulp](https://gulpjs.com) - Used to automate and enhance the workflow with its plugins:
   - [gulp-nodemon](https://github.com/JacksonGariety/gulp-nodemon) - Used to monitor for any changes in the source files and automatically restart the server
   - [gulp-babel](https://github.com/babel/gulp-babel#readme) - Used to used to convert ECMAScript 2015+ code into a backwards compatible version of JavaScript
   - [gulp-clean](https://github.com/peter-vilja/gulp-clean) - Used to remove files and folders
   - [gulp-uglify-es](https://gitlab.com/itayronen/gulp-uglify-es) - Used to minify JS files
   - [gulp-autoprefixer](https://github.com/sindresorhus/gulp-autoprefixer#readme) - Used to add CSS prefix
   - [gulp-csso](https://github.com/ben-eb/gulp-csso) - Used to minify CSS files
   - [gulp-imagemin](https://github.com/sindresorhus/gulp-imagemin#readme) - Used to minify PNG, JPEG, GIF and SVG images
 
<!-- 
## Contributing

Please read [CONTRIBUTING.md]() for details on our code of conduct, and the process for submitting pull requests to us.
 -->

## Versioning
We use [Semantic Versioning](http://semver.org) for versioning. For the versions available, see the [releases on this repository](https://github.com/DeMaCS-UNICAL/LoIDE/releases). 


## Credits
 - Stefano Germano (_Founder/Maintainer_)
 - Eliana Palermiti
 - Rocco Palermiti
 - Alexander Karaulshchikov
 - Giorgio Andronico
 - Francesco Calimeri (_Scientific Supervisor_)

From the [Department of Mathematics and Computer Science](https://www.mat.unical.it) of the [University of Calabria](http://unical.it)


## License
  This project is licensed under the [MIT License](LICENSE)
