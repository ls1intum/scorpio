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
const test_api_1 = __webpack_require__(5);
const course_1 = __webpack_require__(6);
const exercise_1 = __webpack_require__(9);
const sidebarProvider_1 = __webpack_require__(12);
const authentication_provider_1 = __webpack_require__(8);
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "scorpio" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('scorpio.test', async () => {
        vscode.window.showInformationMessage('Start API test');
        try {
            console.log(`start test`);
            const testBody = await (0, test_api_1.getTest)();
            console.log(`Test return: ${testBody}`);
        }
        catch (e) {
            vscode.window.showErrorMessage(`error: ${e}`);
            return;
        }
    }));
    context.subscriptions.push(new authentication_provider_1.ArtemisAuthenticationProvider(context.secrets));
    // register sidebar for problem statement
    const sidebarProvider = new sidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("artemis-sidebar", sidebarProvider));
    // command to authenticate the user with the Artemis server by cookie
    context.subscriptions.push(vscode.commands.registerCommand('scorpio.authenticateCookie', async () => (0, authentication_1.authenticateCookieCmd)()));
    // command to authenticate the user with the Artemis server by bearer token
    context.subscriptions.push(vscode.commands.registerCommand('scorpio.authenticateToken', async () => (0, authentication_1.authenticateTokenCmd)()));
    // command to select a course and exercise
    context.subscriptions.push(vscode.commands.registerCommand('scorpio.selectExercise', async () => {
        const courseOptions = await (0, course_1.build_course_options)();
        await (0, exercise_1.build_exercise_options)(courseOptions);
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
exports.authenticateTokenCmd = exports.authenticateCookieCmd = exports.token = void 0;
const vscode = __importStar(__webpack_require__(1));
const config_1 = __webpack_require__(3);
const authentication_api_1 = __webpack_require__(4);
async function authenticateCookieCmd() {
    vscode.window.showInformationMessage('Start Cookie Authentication');
    const username = await vscode.window.showInputBox({ value: config_1.settings.user, prompt: 'Enter Username' });
    const password = await vscode.window.showInputBox({ value: config_1.settings.password, prompt: 'Enter Password', password: true });
    try {
        console.log(`authenticate with ${username}, ${password}`);
        (0, authentication_api_1.authenticateCookie)(username, password);
    }
    catch (e) {
        console.error(`error: ${e}`);
        vscode.window.showErrorMessage(`error: ${e}`);
        return;
    }
}
exports.authenticateCookieCmd = authenticateCookieCmd;
async function authenticateTokenCmd() {
    vscode.window.showInformationMessage('Start Token Authentication');
    const username = await vscode.window.showInputBox({ value: config_1.settings.user, prompt: 'Enter Username' });
    const password = await vscode.window.showInputBox({ value: config_1.settings.password, prompt: 'Enter Password', password: true });
    try {
        console.log(`authenticate with ${username}, ${password}`); // TODO: remove this line
        exports.token = await (0, authentication_api_1.authenticateToken)(username, password);
    }
    catch (e) {
        console.error(`error: ${e}`);
        vscode.window.showErrorMessage(`error: ${e}`);
        return;
    }
}
exports.authenticateTokenCmd = authenticateTokenCmd;


/***/ }),
/* 3 */
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
exports.settings = void 0;
const vscode = __importStar(__webpack_require__(1));
exports.settings = {
    base_url: vscode.workspace.getConfiguration('scorpio').get('apiBaseUrl'),
    client_url: vscode.workspace.getConfiguration('scorpio').get('clientBaseUrl'),
    user: vscode.workspace.getConfiguration('scorpio').get('userData.username'),
    password: vscode.workspace.getConfiguration('scorpio').get('userData.password')
};


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.authenticateToken = exports.authenticateCookie = void 0;
const config_1 = __webpack_require__(3);
async function authenticateCookie(username, password) {
    if (!username || !password) {
        throw new Error('Username and Password are required');
    }
    const url = `${config_1.settings.base_url}/api/public/authenticate`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
            "rememberMe": true
        })
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.body}`);
    }
    console.log(JSON.stringify(response.headers));
}
exports.authenticateCookie = authenticateCookie;
async function authenticateToken(username, password) {
    if (!username || !password) {
        throw new Error('Username and Password are required');
    }
    var url = new URL(`${config_1.settings.base_url}/api/public/authenticate`);
    url.searchParams.append('as-bearer', 'true');
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
            "rememberMe": true
        })
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.body}`);
    }
    const data = await response.text();
    console.log(`response data: ${data}`);
    return data;
}
exports.authenticateToken = authenticateToken;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTest = void 0;
const authentication_1 = __webpack_require__(2);
const config_1 = __webpack_require__(3);
async function getTest() {
    const url = `${config_1.settings.base_url}/api/public/headers`;
    const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authentication_1.token}`
    });
    const response = await fetch(url, {
        method: 'GET',
        headers: headers
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
    }
    return await response.text();
}
exports.getTest = getTest;


/***/ }),
/* 6 */
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
exports.build_course_options = void 0;
const vscode = __importStar(__webpack_require__(1));
const course_api_1 = __webpack_require__(7);
const authentication_provider_1 = __webpack_require__(8);
async function build_course_options() {
    let courses;
    try {
        const session = await vscode.authentication.getSession(authentication_provider_1.AUTH_ID, [], { createIfNone: false });
        if (!session) {
            throw new Error(`Please sign in`);
        }
        courses = await (0, course_api_1.fetch_courses)(session.accessToken);
    }
    catch (e) {
        vscode.window.showErrorMessage(`error: ${e}`);
        return;
    }
    const courseOptions = courses.map(course => ({
        label: course.title, // Adjust based on your data structure
        description: course.description, // Adjust based on your data structure
        course: course, // Use a unique identifier
    }));
    return courseOptions;
}
exports.build_course_options = build_course_options;


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetch_courses = void 0;
const config_1 = __webpack_require__(3);
async function fetch_courses(token) {
    const url = `${config_1.settings.base_url}/api/courses`;
    console.log("fetching courses");
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
    }
    const data = await response.json();
    console.log(`retrieved courses successful ${data}`);
    return data;
}
exports.fetch_courses = fetch_courses;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArtemisAuthenticationProvider = exports.AUTH_ID = void 0;
const vscode_1 = __webpack_require__(1);
const config_1 = __webpack_require__(3);
const authentication_api_1 = __webpack_require__(4);
exports.AUTH_ID = 'artemis';
const AUTH_NAME = `Artemis`;
const SESSIONS_SECRET_KEY = `${exports.AUTH_ID}.sessions`;
class ArtemisSession {
    constructor(accessToken, username, scopes) {
        this.id = exports.AUTH_ID;
        this.accessToken = accessToken;
        this.account = {
            label: username,
            id: username,
        };
        this.scopes = scopes ?? [];
    }
}
class ArtemisAuthenticationProvider {
    constructor(secretStorage) {
        this.secretStorage = secretStorage;
        this._onDidChangeSessions = new vscode_1.EventEmitter();
        console.log('ArtemisAuthenticationProvider');
        this.sessionPromise = this.getSessionFromStorage();
        this._disposable = vscode_1.Disposable.from(vscode_1.authentication.registerAuthenticationProvider(exports.AUTH_ID, AUTH_NAME, this), secretStorage.onDidChange(() => this.checkForUpdates()));
    }
    get onDidChangeSessions() {
        return this._onDidChangeSessions.event;
    }
    /**
   * Get the existing sessions
   * @param scopes
   * @returns
   */
    async getSessions(scopes) {
        console.log('getSessions');
        const session = await this.getSessionFromStorage();
        return session ? [session] : [];
    }
    async getSessionFromStorage() {
        return this.secretStorage.get(SESSIONS_SECRET_KEY).then((sessionString) => sessionString ? JSON.parse(sessionString) : undefined);
    }
    /**
     * Create a new auth session
     * @param scopes
     * @returns
     */
    async createSession(scopes) {
        console.log('createSession');
        try {
            var username = config_1.settings.user;
            if (!username) {
                username = await vscode_1.window.showInputBox({
                    ignoreFocusOut: true,
                    prompt: 'Enter your email address',
                });
            }
            if (!username) {
                throw new Error('No username provided');
            }
            var password = config_1.settings.password;
            if (!password) {
                password = await vscode_1.window.showInputBox({
                    ignoreFocusOut: true,
                    prompt: 'Enter your password',
                    password: true
                });
            }
            if (!password) {
                throw new Error('No password provided');
            }
            const token = await this.login(username, password);
            if (!token) {
                throw new Error(`login failure`);
            }
            const session = new ArtemisSession(token, username, scopes);
            await this.secretStorage.store(SESSIONS_SECRET_KEY, JSON.stringify(session));
            this._onDidChangeSessions.fire({ added: [session], removed: [], changed: [] });
            return session;
        }
        catch (e) {
            vscode_1.window.showErrorMessage(`Sign in failed: ${e}`);
            throw e;
        }
    }
    async login(username, password) {
        return (0, authentication_api_1.authenticateToken)(username, password);
    }
    // This function is called when the end user signs out of the account.
    async removeSession(_sessionId) {
        console.log("removeSession");
        const session = await this.sessionPromise;
        if (!session) {
            return;
        }
        await this.secretStorage.delete(SESSIONS_SECRET_KEY);
        this._onDidChangeSessions.fire({ added: [], removed: [session], changed: [] });
    }
    // This is a crucial function that handles whether or not the token has changed in
    // a different window of VS Code and sends the necessary event if it has.
    async checkForUpdates() {
        const added = [];
        const removed = [];
        const previousSession = await this.sessionPromise;
        this.sessionPromise = this.getSessionFromStorage();
        const currentSession = await this.sessionPromise;
        if (!currentSession) {
            return;
        }
        if (previousSession?.accessToken !== currentSession?.accessToken) {
            if (previousSession) {
                removed.push(previousSession);
            }
            if (currentSession) {
                added.push(currentSession);
            }
        }
        else {
            return;
        }
        this._onDidChangeSessions.fire({ added: added, removed: removed, changed: [] });
    }
    dispose() {
        this._disposable?.dispose();
    }
}
exports.ArtemisAuthenticationProvider = ArtemisAuthenticationProvider;


/***/ }),
/* 9 */
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
exports.build_exercise_options = void 0;
const vscode = __importStar(__webpack_require__(1));
const exercise_api_1 = __webpack_require__(10);
const shared_model_1 = __webpack_require__(11);
const authentication_provider_1 = __webpack_require__(8);
async function build_exercise_options(courseOptions) {
    if (!courseOptions) {
        return;
    }
    const selectedCourse = await vscode.window.showQuickPick(courseOptions, {
        placeHolder: 'Select an item',
    });
    if (!selectedCourse) {
        vscode.window.showErrorMessage('No course was selected');
        return;
    }
    let exercises;
    try {
        const session = await vscode.authentication.getSession(authentication_provider_1.AUTH_ID, [], { createIfNone: false });
        if (!session) {
            throw new Error(`Please sign in`);
        }
        exercises = await (0, exercise_api_1.fetch_exercise)(session.accessToken, selectedCourse.course.id);
    }
    catch (e) {
        vscode.window.showErrorMessage(`error: ${e}`);
        return;
    }
    const exerciseOptions = exercises.map(exercise => ({
        label: exercise.title, // Adjust based on your data structure
        description: "", // Adjust based on your data structure
        exercise: exercise, // Use a unique identifier
    }));
    const selectedExercise = await vscode.window.showQuickPick(exerciseOptions, {
        placeHolder: 'Select an item',
    });
    if (!selectedExercise) {
        vscode.window.showErrorMessage('No exercise was selected');
        return;
    }
    // set current course here so that if an error occurs before the previous exercise and course are still set
    (0, shared_model_1.set_current)(selectedCourse.course, selectedExercise.exercise);
}
exports.build_exercise_options = build_exercise_options;


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetch_problem_statement = exports.fetch_exercise = void 0;
const config_1 = __webpack_require__(3);
async function fetch_exercise(token, courseId) {
    const url = `${config_1.settings.base_url}/api/courses/${courseId}/programming-exercises`;
    console.log("fetching exercises");
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
    }
    const data = await response.json();
    console.log(`retrieved exercises successful ${data}`);
    return data;
}
exports.fetch_exercise = fetch_exercise;
async function fetch_problem_statement(token, courseId, exerciseId) {
    const url = `${config_1.settings.base_url}/api/courses/${courseId}/exercises/${exerciseId}/problem-statement`;
    console.log("fetching problem statement");
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
    }
    const data = await response.text();
    console.log(`retrieved exercises successful ${data}`);
    return data;
}
exports.fetch_problem_statement = fetch_problem_statement;


/***/ }),
/* 11 */
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
exports.set_current = exports.current = void 0;
const vscode = __importStar(__webpack_require__(1));
exports.current = {
    course: undefined,
    exercise: undefined,
    onCurrentChange: new vscode.EventEmitter()
};
const set_current = (course, exercise) => {
    exports.current.course = course;
    exports.current.exercise = exercise;
    exports.current.onCurrentChange.fire();
};
exports.set_current = set_current;


/***/ }),
/* 12 */
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
exports.SidebarProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
const config_1 = __webpack_require__(3);
const shared_model_1 = __webpack_require__(11);
class SidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        shared_model_1.current.onCurrentChange.event(() => {
            this.updateWebviewContent();
        });
    }
    resolveWebviewView(webviewView) {
        console.log("resolveWebviewView");
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        this.updateWebviewContent();
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "onInfo": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showInformationMessage(data.value);
                    break;
                }
                case "onError": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
            }
        });
    }
    updateWebviewContent() {
        if (!this._view) {
            return;
        }
        // TODO if current_course is undefined, show a message to select a course and exercise
        if (!shared_model_1.current.course || !shared_model_1.current.exercise) {
            vscode.window.showErrorMessage("Please select a course and exercise");
            return;
        }
        this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        const problemStatementUrl = `${config_1.settings.client_url}/courses/${shared_model_1.current.course?.id}/exercises/${shared_model_1.current.exercise?.id}`;
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Angular App</title>
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <style>
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 93%;
          border: none;
          margin: 5px;
          display: block;
        }
        </style>
			</head>
      <body>
      <h1> Artemis </h1>
      <iframe src="${problemStatementUrl}" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>      
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;


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