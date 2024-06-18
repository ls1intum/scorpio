/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(1));
const authentication_1 = __webpack_require__(2);
const course_1 = __webpack_require__(4);
const exercise_1 = __webpack_require__(5);
const config_1 = __webpack_require__(3);
const originRequest_1 = __webpack_require__(6);
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "scorpio-web" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('scorpio.origin', async () => {
        vscode.window.showInformationMessage('Try to get origin');
        try {
            console.log(`get origin`);
            const origin = await (0, originRequest_1.getOrigin)();
            console.log(`origin: ${origin}`);
        }
        catch (e) {
            vscode.window.showErrorMessage(`error: ${e}`);
            return;
        }
    }));
    // command to authenticate the user with the Artemis server
    context.subscriptions.push(vscode.commands.registerCommand('scorpio.authenticateCookie', async () => {
        vscode.window.showInformationMessage('Start Cookie Authentication');
        const username = await vscode.window.showInputBox({ prompt: 'Enter Username' });
        const password = await vscode.window.showInputBox({ prompt: 'Enter Password', password: true });
        if (!username || !password) {
            // vscode.window.showErrorMessage('Username and Password are required');
            vscode.window.showWarningMessage('falling back to test credentials');
            console.log(`authenticate with ${config_1.testuser}, ${config_1.testpassword}`); // TODO: remove this line
            (0, authentication_1.authenticateCookie)(config_1.testuser, config_1.testpassword); // TODO: remove this line
            return;
        }
        try {
            console.log(`authenticate with ${username}, ${password}`); // TODO: remove this line
            (0, authentication_1.authenticateCookie)(username, password);
        }
        catch (e) {
            vscode.window.showErrorMessage(`error: ${e}`);
            return;
        }
    }));
    // command to authenticate the user with the Artemis server
    context.subscriptions.push(vscode.commands.registerCommand('scorpio.authenticateToken', async () => {
        vscode.window.showInformationMessage('Start Token Authentication');
        const username = await vscode.window.showInputBox({ prompt: 'Enter Username' });
        const password = await vscode.window.showInputBox({ prompt: 'Enter Password', password: true });
        if (!username || !password) {
            // vscode.window.showErrorMessage('Username and Password are required');
            vscode.window.showWarningMessage('falling back to test credentials');
            console.log(`authenticate with ${config_1.testuser}, ${config_1.testpassword}`); // TODO: remove this line
            (0, authentication_1.authenticateToken)(config_1.testuser, config_1.testpassword); // TODO: remove this line
            return;
        }
        try {
            console.log(`authenticate with ${username}, ${password}`); // TODO: remove this line
            (0, authentication_1.authenticateToken)(username, password);
        }
        catch (e) {
            vscode.window.showErrorMessage(`error: ${e}`);
            return;
        }
    }));
    // command to select a course and exercise
    context.subscriptions.push(vscode.commands.registerCommand('scorpio.selectExercise', async () => {
        let courses;
        try {
            courses = await (0, course_1.fetch_courses)();
        }
        catch (e) {
            vscode.window.showErrorMessage(`error: ${e}`);
            return;
        }
        const courseOptions = courses.map(course => ({
            label: course.title, // Adjust based on your data structure
            description: course.description, // Adjust based on your data structure
            itemId: course.id, // Use a unique identifier
        }));
        const selectedCourse = await vscode.window.showQuickPick(courseOptions, {
            placeHolder: 'Select an item',
        });
        if (!selectedCourse) {
            vscode.window.showErrorMessage('Course is required');
            return;
        }
        let exercises;
        try {
            exercises = await (0, exercise_1.fetch_exercise)(selectedCourse.itemId);
        }
        catch (e) {
            vscode.window.showErrorMessage(`error: ${e}`);
            return;
        }
        const exerciseOptions = exercises.map(exercise => ({
            label: exercise.title, // Adjust based on your data structure
            description: "", // Adjust based on your data structure
            itemId: exercise.id, // Use a unique identifier
        }));
        const selectedExercise = await vscode.window.showQuickPick(exerciseOptions, {
            placeHolder: 'Select an item',
        });
        if (!selectedCourse) {
            vscode.window.showErrorMessage('Course is required');
            return;
        }
    }));
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.authenticateToken = exports.authenticateCookie = exports.token = void 0;
const config_1 = __webpack_require__(3);
async function authenticateCookie(username, password) {
    const url = `${config_1.base_url}/api/public/authenticate`;
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
            "rememberMe": true
        })
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} message: ${response.body}`);
        }
    });
}
exports.authenticateCookie = authenticateCookie;
async function authenticateToken(username, password) {
    const url = `${config_1.base_url}/api/public/authenticate/token`;
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
            "rememberMe": true
        })
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} message: ${response.body}`);
        }
        return response.text();
    }).then((data) => {
        console.log(`response data: ${data}`);
        exports.token = data;
    });
}
exports.authenticateToken = authenticateToken;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports) => {


// export const base_url = "http://artemis.local/api";
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.testpassword = exports.testuser = exports.base_url = void 0;
exports.base_url = "http://localhost:8080";
exports.testuser = "artemis_admin";
exports.testpassword = "artemis_admin";
// export const base_url = "https://artemis-test9.artemis.cit.tum.de"
// export const testuser = "artemis_admin"
// export const testpassword = "***REMOVED***"


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetch_courses = void 0;
const authentication_1 = __webpack_require__(2);
const config_1 = __webpack_require__(3);
async function fetch_courses() {
    const url = `${config_1.base_url}/api/courses`;
    const headers = {
        'Content-Type': 'application/json',
        'Cookie': `jwt=${authentication_1.token}`,
    };
    console.log("fetching courses");
    return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: headers,
    }).then((response) => {
        if (!response.ok) {
            response.text().then((text) => {
                throw new Error(`HTTP error! status: ${response.status} message: ${text}`);
            });
        }
        return response.json();
    }).then((data) => {
        console.log(`retrieved courses successful ${data}`);
        return data;
    });
}
exports.fetch_courses = fetch_courses;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetch_exercise = void 0;
const authentication_1 = __webpack_require__(2);
const config_1 = __webpack_require__(3);
async function fetch_exercise(courseId) {
    const url = `${config_1.base_url}/api/courses/${courseId}/programming-exercises`;
    console.log("fetching exercises");
    return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Cookie': `jwt=${authentication_1.token}`,
        },
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
        }
        return response.json();
    }).then((data) => {
        console.log(`retrieved exercises successful ${data}`);
        return data;
    });
}
exports.fetch_exercise = fetch_exercise;


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOrigin = void 0;
const config_1 = __webpack_require__(3);
async function getOrigin() {
    const url = `${config_1.base_url}/api/public/origin`;
    return fetch(url, {
        method: 'GET',
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
        }
        return response.text();
    });
}
exports.getOrigin = getOrigin;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map