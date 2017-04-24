webpackJsonp([1,4],{

/***/ 328:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__assets_virtualjoystick_js__ = __webpack_require__(693);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__assets_virtualjoystick_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__assets_virtualjoystick_js__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ConnectComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var ConnectComponent = (function () {
    function ConnectComponent(sanitizer) {
        this.history = [];
        this.arrChoose = document.getElementsByClassName('hidden');
        this.arrMan = document.getElementsByClassName('manual');
        this.helpEl = document.getElementsByClassName('btn-prim');
        this.loader = document.getElementsByClassName('loader');
        this.direction = document.getElementsByClassName('direction');
        this.distance = document.getElementsByClassName('distance');
        this.arrAuto = document.getElementsByClassName('auto');
        this.intervalID = null;
        this.sensStatus = 0;
        //0 - off, 1 - on:ok, 2 - on:warn, 3 - on:stop
        this.isAuto = 0;
        this.linker = sanitizer;
        /*this.url = sanitizer.bypassSecurityTrustResourceUrl('http://192.168.0.1:2209/livestream.html');*/
    }
    ConnectComponent.prototype.connect = function () {
        var _this = this;
        var i = 0;
        this.helpEl[0].style.display = "none";
        this.loader[0].style.display = "block";
        var menu = document.getElementsByClassName('menuButton');
        menu[0].classList.add('inactive');
        this._ws = new WebSocket('ws://192.168.0.1:2609');
        var timeOut = setTimeout(this.timeOutConnect, 3000, this._ws, this.loader[0], menu[0]);
        this._ws.onopen = function (event) {
            clearTimeout(timeOut);
            _this.loader[0].style.display = "none";
            _this._ws.onmessage = function (event) {
                //this.history.push('[SERVER] ' + event.data);
                var jsonData = JSON.parse(event.data);
                var status = jsonData.Sensor;
                if (status != undefined) {
                    if (status.localeCompare('default') != 0) {
                        if (status.localeCompare('OFF') == 0) {
                            _this.sensStatus = 0;
                        }
                        else if (status.localeCompare('OK') == 0) {
                            _this.sensStatus = 1;
                        }
                        else if (status.localeCompare('WARN') == 0) {
                            _this.sensStatus = 2;
                        }
                        else {
                            _this.sensStatus = 3;
                        }
                        _this.evaluateSensStatus();
                    }
                }
            };
            for (i = 0; i < _this.arrChoose.length; i++) {
                _this.arrChoose[i].style.display = "block";
            }
        };
        this._ws.onerror = function (event) {
            clearTimeout(timeOut);
            _this.timeOutConnect(_this._ws, _this.loader[0], menu[0]);
        };
    };
    ConnectComponent.prototype.timeOutConnect = function (ws, loader, menu) {
        ws.close();
        loader.style.display = "none";
        menu.classList.remove('inactive');
        document.getElementsByClassName('error')[0].style.display = "block";
    };
    ConnectComponent.prototype.auto = function () {
        var i = 0;
        this.isAuto = 1;
        this._ws.send('automatik');
        for (i = 0; i < this.arrChoose.length; i++) {
            this.arrChoose[i].style.display = "none";
        }
        this.url = this.linker.bypassSecurityTrustResourceUrl('http://192.168.0.1:2209/livestream.html');
        for (i = 0; i < this.arrAuto.length; i++) {
            this.arrAuto[i].style.display = "block";
        }
    };
    ConnectComponent.prototype.man = function () {
        var i = 0;
        var joyStickDiv = document.getElementsByClassName('joyStickDiv');
        var barMotor = document.getElementsByClassName('bar-inner');
        this.isAuto = 0;
        this.joystick = new VirtualJoystick({
            container: joyStickDiv[0],
            leftMotor: barMotor[0],
            leftMotorD: barMotor[1],
            rightMotor: barMotor[2],
            rightMotorD: barMotor[3],
            mouseSupport: true,
            stationaryBase: true,
            direction: this.direction[0],
            distance: this.distance[0],
            baseX: 180,
            baseY: 350,
            limitStickTravel: true,
            stickRadius: 90
        });
        this.intervalID = setInterval(this.sendToMotor, 400, this.history, this.joystick, this._ws);
        this._ws.send('manuell');
        //this.history.push('[CLIENT] ' + 'manuell');
        for (i = 0; i < this.arrChoose.length; i++) {
            this.arrChoose[i].style.display = "none";
        }
        for (i = 0; i < this.arrMan.length; i++) {
            this.arrMan[i].style.display = "block";
        }
    };
    ConnectComponent.prototype.sendToMotor = function (historyList, joyStick, webSocket) {
        var message;
        var dir = joyStick.getDirection();
        var dist = joyStick.getDistance();
        //Bereich von 0-90 abgedeckt durch 0-90 [JoyStick]
        //prinzipiell also 1 : 9/9=1
        //JoyStick Wertung in 5er Schritten:
        //0-9   :  0=0x00; 10-18 : 18=0x12
        //19-27 : 27=0x1B; 28-36 : 36=0x24
        //37-45 : 45=0x2D; 46-54 : 54=0x36
        //55-63 : 63=0x3F; 64-72 : 72=0x48
        //73-81 : 81=0x51; 82-90 : 90=0x5A
        var switch_dist = Math.ceil(dist / 9);
        if (switch_dist == 1 || switch_dist == 0) {
            dist = 0;
        }
        else {
            dist = (switch_dist * 90) / 10;
        }
        if (dist == 0) {
            var string_dist = '00';
            var other_motor1 = '00';
            var other_motor2 = '00';
        }
        else {
            var string_dist = dist.toString(16).toUpperCase();
            var calc_other_motor = Math.round(dist / 3);
            if (calc_other_motor < 7)
                calc_other_motor = 7;
            var other_motor1 = calc_other_motor.toString(16).toUpperCase();
            if (other_motor1.length == 1)
                other_motor1 = '0' + other_motor1;
            calc_other_motor = Math.round(dist / 8);
            if (calc_other_motor < 7)
                calc_other_motor = 7;
            var other_motor2 = calc_other_motor.toString(16).toUpperCase();
            if (other_motor2.length == 1)
                other_motor2 = '0' + other_motor2;
        }
        switch (dir) {
            case 'Base':
                message = 'AA-00-55-00';
                break;
            case 'up':
                message = 'AA-' + string_dist + '-55-' + string_dist;
                break;
            case 'up-left':
                message = 'AA-' + other_motor1 + '-55-' + string_dist;
                break;
            case 'up-l-left':
                message = 'AA-' + other_motor2 + '-55-' + string_dist;
                break;
            case 'up-right':
                message = 'AA-' + string_dist + '-55-' + other_motor1;
                break;
            case 'up-r-right':
                message = 'AA-' + string_dist + '-55-' + other_motor2;
                break;
            case 'down':
                message = '55-' + string_dist + '-AA-' + string_dist;
                break;
            case 'down-left':
                message = '55-' + other_motor1 + '-AA-' + string_dist;
                break;
            case 'down-l-left':
                message = '55-' + other_motor2 + '-AA-' + string_dist;
                break;
            case 'down-right':
                message = '55-' + string_dist + '-AA-' + other_motor1;
                break;
            case 'down-r-right':
                message = '55-' + string_dist + '-AA-' + other_motor2;
                break;
            case 'left':
                message = '55-' + string_dist + '-55-' + string_dist;
                break;
            case 'right':
                message = 'AA-' + string_dist + '-AA-' + string_dist;
                break;
            default:
                message = 'send something';
                break;
        }
        webSocket.send(message);
        //historyList.push('[CLIENT] ' + message);
    };
    ConnectComponent.prototype.clickSens = function () {
        if (this.sensStatus == 0) {
            this._ws.send('sensON');
            this.sensStatus = 1;
        }
        else {
            this._ws.send('sensOFF');
            this.sensStatus = 0;
        }
    };
    ConnectComponent.prototype.evaluateSensStatus = function () {
        var checkBox = document.getElementsByClassName('checkSens');
        var sensBox = document.getElementsByClassName('switch');
        if (this.sensStatus == 0) {
            checkBox[0].checked = false;
        }
        else {
            switch (this.sensStatus) {
                case 1:
                    sensBox[0].classList.remove('warn');
                    sensBox[0].classList.remove('stop');
                    break;
                case 2:
                    sensBox[0].classList.add('warn');
                    sensBox[0].classList.remove('stop');
                    break;
                case 3:
                    sensBox[0].classList.add('stop');
                    sensBox[0].classList.remove('warn');
                    break;
            }
            checkBox[0].checked = true;
        }
    };
    ConnectComponent.prototype.endWs = function () {
        var i;
        clearInterval(this.intervalID);
        this._ws.close();
        for (i = 0; i < this.arrChoose.length; i++) {
            this.arrChoose[i].style.display = "none";
        }
        this.helpEl[0].style.display = "block";
        var menu = document.getElementsByClassName('menuButton');
        menu[0].classList.remove('inactive');
    };
    ConnectComponent.prototype.back = function () {
        var i = 0;
        if (!this.isAuto) {
            clearInterval(this.intervalID);
            this.joystick.destroy();
        }
        this._ws.send('STOP');
        //this.history.push('[CLIENT] ' + 'STOP');
        for (i = 0; i < this.arrMan.length; i++) {
            this.arrMan[i].style.display = "none";
        }
        for (i = 0; i < this.arrAuto.length; i++) {
            this.arrAuto[i].style.display = "none";
        }
        for (i = 0; i < this.arrChoose.length; i++) {
            this.arrChoose[i].style.display = "block";
        }
    };
    ConnectComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-websocket',
            template: __webpack_require__(672),
            styles: [__webpack_require__(666)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["c" /* DomSanitizer */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["c" /* DomSanitizer */]) === 'function' && _a) || Object])
    ], ConnectComponent);
    return ConnectComponent;
    var _a;
}());
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/connect.component.js.map

/***/ }),

/***/ 329:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ConsoleComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ConsoleComponent = (function () {
    // TODO: In einen Angular 2 Service schieben
    function ConsoleComponent() {
        this.history = [];
        this.helpArr = document.getElementsByClassName('hidden');
        this.helpEl = document.getElementsByClassName('btn-primary');
        this.loader = document.getElementsByClassName('loader');
        this.console = document.getElementsByClassName('cmdWindow');
    }
    ConsoleComponent.prototype.connect = function () {
        var _this = this;
        this.loader[0].style.display = "block";
        this.helpEl[0].style.display = "none";
        var menu = document.getElementsByClassName('menuButton');
        menu[0].classList.add('inactive');
        this._ws = new WebSocket('ws://192.168.0.1:2609');
        var timeOut = setTimeout(this.timeOutConnect, 3000, this._ws, this.loader[0], menu[0]);
        this._ws.onopen = function (event) {
            clearTimeout(timeOut);
            _this.loader[0].style.display = "none";
            _this._ws.onmessage = function (event) {
                var jsonData = JSON.parse(event.data);
                _this.history.push(jsonData.Message);
                setTimeout(_this.updateScroll, 100, _this.console[0]);
            };
            for (var i = 0; i < _this.helpArr.length; i++) {
                _this.helpArr[i].style.display = "block";
            }
            _this.console[0].style.display = "block";
        };
        this._ws.onerror = function (event) {
            clearTimeout(timeOut);
            _this.timeOutConnect(_this._ws, _this.loader[0], menu[0]);
        };
    };
    ConsoleComponent.prototype.timeOutConnect = function (ws, loader, menu) {
        ws.close();
        loader.style.display = "none";
        menu.classList.remove('inactive');
        document.getElementsByClassName('error')[0].style.display = "block";
    };
    ConsoleComponent.prototype.updateScroll = function (console) {
        //calculate how much the div needs to be scrolled
        var scrollHeight = console.scrollHeight;
        var height = console.clientHeight;
        var topCoord = console.scrollTop;
        if (topCoord < (scrollHeight - height)) {
            console.scrollTop += (scrollHeight - topCoord);
        }
    };
    ConsoleComponent.prototype.send = function () {
        if (!this.command) {
            return;
        }
        this.history.push('>' + this.command);
        this._ws.send(this.command);
        this.command = '';
    };
    ConsoleComponent.prototype.endWs = function () {
        var i;
        this._ws.close();
        for (i = 0; i < this.helpArr.length; i++) {
            this.helpArr[i].style.display = "none";
        }
        this.console[0].style.display = "none";
        this.helpEl[0].style.display = "block";
        var menu = document.getElementsByClassName('menuButton');
        menu[0].classList.remove('inactive');
    };
    ConsoleComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-websocket',
            template: __webpack_require__(673),
            styles: [__webpack_require__(667)]
        }), 
        __metadata('design:paramtypes', [])
    ], ConsoleComponent);
    return ConsoleComponent;
}());
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/console.component.js.map

/***/ }),

/***/ 330:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__assets_ping_js__ = __webpack_require__(692);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__assets_ping_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__assets_ping_js__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GraphicsComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var GraphicsComponent = (function () {
    function GraphicsComponent(sanitizer) {
        this.loader = document.getElementsByClassName('loader');
        this.url = sanitizer.bypassSecurityTrustResourceUrl('http://192.168.0.1/Modell/index.html');
    }
    GraphicsComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        var ws = new WebSocket('ws://192.168.0.1:2609');
        ws.onopen = function (event) {
            clearTimeout(timeOutConnect);
            ws.onmessage = function (event) {
                clearTimeout(timeOut);
                _this.loader[0].style.display = "none";
                document.getElementsByClassName('successFrame')[0].style.display = "block";
                ws.close();
            };
            ws.send('test');
            var timeOut = setTimeout(_this.errorHappened, 3000, ws, document, _this.loader[0]);
        };
        ws.onerror = function (event) {
            clearTimeout(timeOutConnect);
            _this.errorHappened(ws, document, _this.loader[0]);
        };
        var timeOutConnect = setTimeout(this.errorHappened, 3000, ws, document, this.loader[0]);
    };
    GraphicsComponent.prototype.errorHappened = function (ws, document, loader) {
        loader.style.display = "none";
        document.getElementsByClassName('errorDiv')[0].style.display = "block";
        ws.close();
    };
    GraphicsComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-graphics',
            template: __webpack_require__(674),
            styles: [__webpack_require__(668)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["c" /* DomSanitizer */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["c" /* DomSanitizer */]) === 'function' && _a) || Object])
    ], GraphicsComponent);
    return GraphicsComponent;
    var _a;
}());
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/graphics.component.js.map

/***/ }),

/***/ 331:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomeComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var HomeComponent = (function () {
    function HomeComponent() {
    }
    HomeComponent.prototype.ngOnInit = function () {
    };
    HomeComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-home',
            template: __webpack_require__(675),
            styles: [__webpack_require__(669)]
        }), 
        __metadata('design:paramtypes', [])
    ], HomeComponent);
    return HomeComponent;
}());
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/home.component.js.map

/***/ }),

/***/ 332:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ImpressumComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ImpressumComponent = (function () {
    function ImpressumComponent() {
    }
    ImpressumComponent.prototype.ngAfterViewInit = function () {
    };
    ImpressumComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-graphics',
            template: __webpack_require__(676),
            styles: [__webpack_require__(670)]
        }), 
        __metadata('design:paramtypes', [])
    ], ImpressumComponent);
    return ImpressumComponent;
}());
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/impressum.component.js.map

/***/ }),

/***/ 388:
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 388;


/***/ }),

/***/ 389:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(477);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__environments_environment__ = __webpack_require__(511);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_app_module__ = __webpack_require__(509);




if (__WEBPACK_IMPORTED_MODULE_2__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["a" /* enableProdMode */])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_3__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/main.js.map

/***/ }),

/***/ 508:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var AppComponent = (function () {
    function AppComponent() {
        this.menu = document.getElementsByClassName('menu');
        this.buttonMenu = document.getElementsByClassName('menuButton');
        this.menuElements = document.getElementsByClassName('linkEl');
    }
    AppComponent.prototype.ngAfterViewInit = function () {
        var firstElement = document.getElementsByClassName('linkEl');
        firstElement[0].classList.toggle('menuActive');
        this.menu[0].addEventListener('touchstart', this.handleTouchStart, false);
        this.menu[0].addEventListener('mousedown', this.handleTouchStart, false);
        this.menu[0].addEventListener('touchmove', this.handleTouchMove, false);
        this.menu[0].addEventListener('mousemove', this.handleTouchMove, false);
        var attrX = document.createAttribute("paramx");
        attrX.value = null;
        this.menu[0].setAttributeNode(attrX);
        var attrY = document.createAttribute("paramy");
        attrY.value = null;
        this.menu[0].setAttributeNode(attrY);
    };
    AppComponent.prototype.handleTouchStart = function (event) {
        event.target.setAttribute('paramx', event.touches[0].clientX.toString());
        event.target.setAttribute('paramy', event.touches[0].clientY.toString());
    };
    AppComponent.prototype.handleTouchMove = function (event) {
        var x = parseInt(event.target.getAttribute('paramx'));
        var y = parseInt(event.target.getAttribute('paramy'));
        if (!x || !y)
            return;
        var xUp = event.touches[0].clientX;
        var yUp = event.touches[0].clientY;
        var xDiff = x - xUp;
        var yDiff = y - yUp;
        if (Math.abs(xDiff) > Math.abs(yDiff) && xDiff > 0) {
            var menu = document.getElementsByClassName('menu');
            menu[0].classList.toggle('open');
            var buttonMenu = document.getElementsByClassName('menuButton');
            buttonMenu[0].classList.toggle('active');
        }
        event.target.setAttribute('paramx', null);
        event.target.setAttribute('paramy', null);
    };
    AppComponent.prototype.menuClicked = function () {
        if (this.buttonMenu[0].classList.contains('inactive')) {
        }
        else {
            var menu = this.menu[0];
            menu.classList.toggle('open');
            this.buttonMenu[0].classList.toggle('active');
        }
    };
    AppComponent.prototype.menuLinkClicked = function (linkElement) {
        var menu = this.menu[0];
        var el = document.getElementsByClassName('menuActive');
        el[0].classList.toggle('menuActive');
        this.menuElements[linkElement].classList.toggle('menuActive');
        menu.classList.toggle('open');
        this.buttonMenu[0].classList.toggle('active');
    };
    AppComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-root',
            template: __webpack_require__(671),
            styles: [__webpack_require__(665)]
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/app.component.js.map

/***/ }),

/***/ 509:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__graphics_graphics_component__ = __webpack_require__(330);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__home_home_component__ = __webpack_require__(331);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_forms__ = __webpack_require__(467);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_http__ = __webpack_require__(473);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__app_component__ = __webpack_require__(508);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__console_console_component__ = __webpack_require__(329);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__connect_connect_component__ = __webpack_require__(328);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__impressum_impressum_component__ = __webpack_require__(332);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__app_routing__ = __webpack_require__(510);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};











var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__angular_core__["b" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */],
                __WEBPACK_IMPORTED_MODULE_7__console_console_component__["a" /* ConsoleComponent */],
                __WEBPACK_IMPORTED_MODULE_8__connect_connect_component__["a" /* ConnectComponent */],
                __WEBPACK_IMPORTED_MODULE_9__impressum_impressum_component__["a" /* ImpressumComponent */],
                __WEBPACK_IMPORTED_MODULE_1__home_home_component__["a" /* HomeComponent */], __WEBPACK_IMPORTED_MODULE_0__graphics_graphics_component__["a" /* GraphicsComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_4__angular_forms__["a" /* FormsModule */],
                __WEBPACK_IMPORTED_MODULE_5__angular_http__["a" /* HttpModule */],
                __WEBPACK_IMPORTED_MODULE_10__app_routing__["a" /* appRoutes */]
            ],
            providers: [],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */]]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/app.module.js.map

/***/ }),

/***/ 510:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_router__ = __webpack_require__(497);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__home_home_component__ = __webpack_require__(331);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__console_console_component__ = __webpack_require__(329);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__connect_connect_component__ = __webpack_require__(328);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__graphics_graphics_component__ = __webpack_require__(330);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__impressum_impressum_component__ = __webpack_require__(332);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return appRoutes; });






var routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home'
    },
    {
        path: 'home',
        component: __WEBPACK_IMPORTED_MODULE_1__home_home_component__["a" /* HomeComponent */]
    },
    {
        path: 'console',
        component: __WEBPACK_IMPORTED_MODULE_2__console_console_component__["a" /* ConsoleComponent */]
    },
    {
        path: 'connect',
        component: __WEBPACK_IMPORTED_MODULE_3__connect_connect_component__["a" /* ConnectComponent */]
    },
    {
        path: 'graphics',
        component: __WEBPACK_IMPORTED_MODULE_4__graphics_graphics_component__["a" /* GraphicsComponent */]
    },
    {
        path: 'impressum',
        component: __WEBPACK_IMPORTED_MODULE_5__impressum_impressum_component__["a" /* ImpressumComponent */]
    }
];
var appRoutes = __WEBPACK_IMPORTED_MODULE_0__angular_router__["a" /* RouterModule */].forRoot(routes, { useHash: true });
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/app.routing.js.map

/***/ }),

/***/ 511:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.
var environment = {
    production: false
};
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/environment.js.map

/***/ }),

/***/ 665:
/***/ (function(module, exports) {

module.exports = ".jumbotron {\r\n  margin-top: 5%;\r\n  text-align: left;\r\n  border: none;\r\n  border-radius: 0;\r\n  background-color: #ebf0f5;\r\n  background-image: -webkit-linear-gradient(#becdd7, #ebf0f5, #becdd7);\r\n  background-image: linear-gradient(#becdd7, #ebf0f5, #becdd7);\r\n  border-top: 1px solid #879baa;\r\n  border-bottom: 1px solid #879baa;\r\n}\r\n\r\n.fußleiste {\r\n  position: absolute;\r\n  bottom: 0;\r\n  width: 100%;\r\n  text-align: center;\r\n  font-size: 0.7em;\r\n  background-color: #ebf0f5;\r\n  background-image: -webkit-linear-gradient(top, #ebf0f5, #becdd7);\r\n  background-image: linear-gradient(to bottom, #ebf0f5, #becdd7);\r\n  color: #000000;\r\n  border-top: 1px solid black;\r\n  padding: 1%;\r\n}\r\n\r\n.main-content {\r\n  margin: 0;\r\n  padding: 0;\r\n}\r\n\r\n#showMenu {\r\n  position: absolute;\r\n  top: 2%;\r\n  left: 84%;\r\n  background-color: #41aaaa;\r\n  background-image: -webkit-linear-gradient(top, #41aaaa, #00646e);\r\n  background-image: linear-gradient(to bottom, #41aaaa, #00646e);\r\n  box-shadow: inset 0 0 0 1px #004b55;\r\n  border: none;\r\n  border-radius: 5px;\r\n  padding: 5px 15px;\r\n  -webkit-appearance: none;\r\n     -moz-appearance: none;\r\n          appearance: none;\r\n  color: #ffffff;\r\n}\r\n\r\n#showMenu:active {\r\n  box-shadow: inset 0 0 0 1px #004b55,inset 0 5px 30px #003c46;\r\n  outline: none;\r\n}\r\n\r\n#showMenu:focus {\r\n  outline: none;\r\n}\r\n\r\n#showMenu.inactive {\r\n  background-color: #becdd7;\r\n  background-image: -webkit-linear-gradient(top, #becdd7, #879baa);\r\n  background-image: linear-gradient(to bottom, #becdd7, #879baa);\r\n  box-shadow: inset 0 0 0 1px #3c464b;\r\n  color: #ebf0f5;\r\n}\r\n\r\n#showMenu.inactive:active {\r\n  box-shadow: 0;\r\n}\r\n\r\n.menu {\r\n  background: #41aaaa;\r\n  position: fixed;\r\n  width: 240px;\r\n  height: 100%;\r\n  top: 0;\r\n  z-index: 1000;\r\n  left: -240px;\r\n  -webkit-transition: all 0.3s ease;\r\n  transition: all 0.3s ease;\r\n}\r\n\r\n.menu.open {\r\n  left: 0px;\r\n}\r\n\r\n.menu h3 {\r\n  color: #78cdcd;\r\n  font-size: 1.9em;\r\n  padding: 20px;\r\n  margin: 0;\r\n  font-weight: 300;\r\n  background: #00646e;\r\n}\r\n\r\n.menu a {\r\n  display: block;\r\n  color: #fff;\r\n  font-size: 1.1em;\r\n  font-weight: 300;\r\n  border-bottom: 1px solid #239196;\r\n  padding: 1em;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n}\r\n\r\n.menuActive {\r\n  background: #239196;\r\n}\r\n\r\n.menu a:active {\r\n  background: #78cdcd;\r\n  color: #239196;\r\n  text-decoration: none;\r\n}\r\n\r\n@media screen and (max-height: 26.375em) {\r\n  .menu {\r\n    font-size: 90%;\r\n    width: 190px;\r\n    left: -190px;\r\n  }\r\n}\r\n"

/***/ }),

/***/ 666:
/***/ (function(module, exports) {

module.exports = "p {\r\n  text-align: center;\r\n}\r\n\r\n.btn-choose {\r\n  float: left;\r\n  margin: 5%;\r\n}\r\n\r\n.btn-end {\r\n  position: absolute;\r\n  top: 80%;\r\n  left: 5%;\r\n}\r\n\r\n.error {\r\n  display: none;\r\n}\r\n\r\n.manual {\r\n  display: none;\r\n}\r\n\r\n.btn.manual {\r\n  position: absolute;\r\n  top: 80%;\r\n  left: 5%;\r\n  z-index: 100000;\r\n}\r\n\r\n.joyStickDiv {\r\n  position: absolute;\r\n  left: 0;\r\n  top: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n\r\n.switchDiv {\r\n  position: absolute;\r\n  top: 80%;\r\n  left: 55%;\r\n}\r\n\r\n.switchFloatie {\r\n  float: left;\r\n}\r\n\r\n.switch {\r\n  /*margin: 50px auto;*/\r\n  width: 80px;\r\n  height: 80px;\r\n  /*position: absolute;\r\n  top: 70%;\r\n  left: 70%;*/\r\n}\r\n\r\n.switch label {\r\n  width: 100%;\r\n  height: 100%;\r\n  position: relative;\r\n  display: block;\r\n  border-radius: 50%;\r\n  background: #eaeaea;\r\n  box-shadow:\r\n      0 3px 5px rgba(0,0,0,0.25),\r\n      inset 0 1px 0 rgba(255,255,255,0.3),\r\n      inset 0 -5px 5px rgba(100,100,100,0.1),\r\n      inset 0 5px 5px rgba(255,255,255,0.3);\r\n}\r\n\r\n.switch label:after {\r\n  content: \"\";\r\n  position: absolute;\r\n  top: -8%; right: -8%; bottom: -8%; left: -8%;\r\n  z-index: -1;\r\n  border-radius: inherit;\r\n  background: #ddd;\r\n  background: -webkit-gradient(linear, 0 0, 0 100%, from(#ccc), to(#fff));\r\n  background: -webkit-linear-gradient(#ccc, #fff);\r\n  background: linear-gradient(#ccc, #fff);\r\n  box-shadow:\r\n    inset 0 2px 1px rgba(0,0,0,0.15),\r\n    0 2px 5px rgba(200,200,200,0.1);\r\n}\r\n\r\n.switch label:before {\r\n  content: \"\";\r\n  position: absolute;\r\n  width: 20%;\r\n  height: 20%;\r\n  border-radius: inherit;\r\n  left: 40%;\r\n  top: 40%;\r\n  background: #969696;\r\n  background: -webkit-radial-gradient(40% 35%, #ccc, #969696 60%);\r\n  background: radial-gradient(40% 35%, #ccc, #969696 60%);\r\n  box-shadow:\r\n      inset 0 2px 4px 1px rgba(0,0,0,0.3),\r\n      0 1px 0 rgba(255,255,255,1),\r\n      inset 0 1px 0 white;\r\n}\r\n\r\n.switch input {\r\n  top: 0;\r\n  right: 0;\r\n  bottom: 0;\r\n  left: 0;\r\n  opacity: 0;\r\n  z-index: 100;\r\n  position: absolute;\r\n  width: 100%;\r\n  height: 100%;\r\n  cursor: pointer;\r\n}\r\n\r\n.switch input:checked ~ label {\r\n  background: #dedede;\r\n  background: -webkit-gradient(linear, 0 0, 0 100%, from(#dedede), to(#fdfdfd));\r\n  background: -webkit-linear-gradient(#dedede, #fdfdfd);\r\n  background: linear-gradient(#dedede, #fdfdfd);\r\n}\r\n\r\n.switch input:checked ~ label:before {\r\n  background: #25d025;\r\n  background: -webkit-radial-gradient(40% 35%, #5aef5a, #25d025 60%);\r\n  background: radial-gradient(40% 35%, #5aef5a, #25d025 60%);\r\n  box-shadow:\r\n      inset 0 3px 5px 1px rgba(0,0,0,0.1),\r\n      0 1px 0 rgba(255,255,255,0.4),\r\n      0 0 10px 2px rgba(0, 210, 0, 0.5);\r\n}\r\n\r\n.warn input:checked ~ label:before {\r\n  background: #ffcc00;\r\n  background: -webkit-radial-gradient(40% 35%, #ffff66, #ffcc00 60%);\r\n  background: radial-gradient(40% 35%, #ffff66, #ffcc00 60%);\r\n  box-shadow:\r\n      inset 0 3px 5px 1px rgba(0,0,0,0.1),\r\n      0 1px 0 rgba(255,255,255,0.4),\r\n      0 0 10px 2px rgba(255, 255, 0, 0.5);\r\n}\r\n\r\n.stop input:checked ~ label:before {\r\n  background: #ff0000;\r\n  background: -webkit-radial-gradient(40% 35%, #ff5050, #ff0000 60%);\r\n  background: radial-gradient(40% 35%, #ff5050, #ff0000 60%);\r\n  box-shadow:\r\n      inset 0 3px 5px 1px rgba(0,0,0,0.1),\r\n      0 1px 0 rgba(255,255,255,0.4),\r\n      0 0 10px 2px rgba(255, 0, 0, 0.5);\r\n}\r\n\r\n\r\n\r\n.rightMotor {\r\n  float: right;\r\n}\r\n\r\n.leftMotor {\r\n  float: left;\r\n}\r\n\r\n\r\n/*********************\r\n * Graph Bars styles *\r\n *********************/\r\n\r\n/* Bar wrapper - hides the inner bar when it goes below the bar, required */\r\n.bar-wrapper {\r\n    overflow: hidden;\r\n}\r\n/* Bar container - this guy is a real parent of a bar's parts - they all are positioned relative to him */\r\n.bar-container, .bar-container-down {\r\n    position: relative;\r\n    margin-top: 2.5em; /* should be at least equal to the top offset of background casing */\r\n    /* because back casing is positioned higher than actual bar */\r\n    width: 12.5em; /* required, we have to define the width of a bar */\r\n}\r\n\r\n/** BACK CASING **/\r\n/* Back panel */\r\n.bar-background {\r\n    width: 10em;\r\n    height: 100%;\r\n    position: absolute;\r\n    top: -2.5em;\r\n    left: 2.5em;\r\n    z-index: 1; /* just for reference */\r\n}\r\n\r\n.bar-background:before,\r\n.bar-background:after {\r\n    content: \"\";\r\n    position: absolute;\r\n}\r\n\r\n/* Bottom panel */\r\n.bar-background:before {\r\n    bottom: -2.5em;\r\n    right: 1.25em;\r\n    width: 10em;\r\n    height: 2.5em;\r\n\t-webkit-backface-visibility: hidden;\r\n    -webkit-transform: skew(-45deg);\r\n    transform: skew(-45deg);\r\n}\r\n\r\n/* Left back panel */\r\n.bar-background:after {\r\n    top: 1.25em;\r\n    right: 10em;\r\n    width: 2.5em;\r\n    height: 100%;\r\n\t-webkit-backface-visibility: hidden;\r\n    /* skew only the Y-axis */\r\n    -webkit-transform: skew(0deg, -45deg);\r\n    transform: skew(0deg, -45deg);\r\n}\r\n\r\n/** FRONT CASING **/\r\n/* Front panel */\r\n.bar-foreground {\r\n    z-index: 3; /* be above .bar-background and .bar-inner */\r\n}\r\n.bar-foreground,\r\n.bar-inner {\r\n    position: absolute;\r\n    width: 10em;\r\n    height: 100%;\r\n    top: 0;\r\n    left: 0;\r\n}\r\n\r\n.bar-foreground:before,\r\n.bar-foreground:after,\r\n.bar-inner:before,\r\n.bar-inner:after {\r\n    content: \"\";\r\n    position: absolute;\r\n}\r\n\r\n/* Right front panel */\r\n.bar-foreground:before,\r\n.bar-inner:before {\r\n    top: -1.25em;\r\n    right: -2.5em;\r\n    width: 2.5em;\r\n    height: 100%;\r\n    background-color: rgba(160, 160, 160, .27);\r\n\r\n    -webkit-transform: skew(0deg, -45deg);\r\n    transform: skew(0deg, -45deg);\r\n}\r\n\r\n/* Top front panel */\r\n.bar-foreground:after,\r\n.bar-inner:after {\r\n    top: -2.5em;\r\n    right: -1.25em;\r\n    width: 100%;\r\n    height: 2.5em;\r\n    background-color: rgba(160, 160, 160, .2);\r\n\r\n    -webkit-transform: skew(-45deg);\r\n    transform: skew(-45deg);\r\n}\r\n\r\n/** BAR's inner block **/\r\n.bar-inner {\r\n    z-index: 2; /* to be above .bar-background */\r\n    top: auto; /* reset position top */\r\n    background-color: rgba(5, 62, 123, .6);\r\n    height: 0;\r\n    bottom: -2.5em;\r\n    color: transparent; /* hide text values */\r\n\r\n    -webkit-transition: height 0.8s ease-in-out, bottom 0.8s ease-in-out;\r\n    transition: height 0.8s ease-in-out, bottom 0.8s ease-in-out;\r\n}\r\n\r\n.bar-inner-down {\r\n  top: 0%;\r\n  bottom: -2.5em;\r\n}\r\n\r\n/* Right panel */\r\n.bar-inner:before {\r\n    background-color: rgba(5, 62, 123, .6);\r\n}\r\n\r\n/* Top panel */\r\n.bar-inner:after {\r\n    background-color: rgba(47, 83, 122, .7);\r\n}\r\n\r\n/****************\r\n * SIZES        *\r\n ****************/\r\n /* Size of the Graph */\r\n.bar-container, .bar-container-down {\r\n  font-size: 4px;\r\n}\r\n/* Height of Bars */\r\n.bar-container, .bar-container-down {\r\n  height: 40em;\r\n}\r\n\r\n/****************\r\n *    Colors    *\r\n ****************/\r\n/* Bar's Back side */\r\n.bar-background {\r\n  background-color: rgba(160, 160, 160, .1);\r\n}\r\n/* Bar's Bottom side */\r\n.bar-background:before {\r\n  background-color: rgba(160, 160, 160, .2);\r\n}\r\n/* Bar's Left Back side */\r\n.bar-background:after {\r\n  background-color: rgba(160, 160, 160, .05);\r\n}\r\n/* Bar's Front side */\r\n.bar-foreground {\r\n  background-color: rgba(160, 160, 160, .1);\r\n}\r\n/* Bar's inner block */\r\n.bar-inner,\r\n.bar-inner:before { background-color: rgba(65, 170, 170, .6); }\r\n.bar-inner:after { background-color: rgba(0, 100, 110, .7); }\r\n\r\n.bar-inner-down,\r\n.bar-inner-down:before { background-color: rgba(175, 35, 95, .6); }\r\n.bar-inner-down:after { background-color: rgba(100, 25, 70, .7); }\r\n"

/***/ }),

/***/ 667:
/***/ (function(module, exports) {

module.exports = ".cmdWindow {\r\n  background: #000;\r\n  border: 3px groove #ccc;\r\n  color: #ccc;\r\n  padding: 5px;\r\n  width: 80%;\r\n  height: 250px;\r\n  position: absolute;\r\n  left: 10%;\r\n  top: 150px;\r\n  font-size: 8pt;\r\n  overflow-y: scroll;\r\n  display: none;\r\n}\r\n\r\n.cmdList {\r\n  list-style-type: none;\r\n  margin: 0;\r\n  padding: 0;\r\n  width: 100%;\r\n  /*height: 100%;*/\r\n}\r\n\r\n#inSend {\r\n  position: absolute;\r\n  top: 65%;\r\n}\r\n\r\n#btnSend {\r\n  position: absolute;\r\n  top: 70%;\r\n}\r\n\r\n#closeBtn {\r\n  position: absolute;\r\n  top: 80%;\r\n}\r\n\r\n.btn-primary {\r\n\r\n}\r\n"

/***/ }),

/***/ 668:
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ 669:
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ 670:
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ 671:
/***/ (function(module, exports) {

module.exports = "<div class=\"container main-content\">\n  <!--<nav class=\"navbar navbar-light bg-faded\">\n    <ul class=\"nav navbar-nav\">\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [routerLink]=\"['/home']\">Home</a>\n      </li>\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [routerLink]=\"['/connect']\">Connect</a>\n      </li>\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [routerLink]=\"['/console']\">Konsole</a>\n      </li>\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [routerLink]=\"['/graphics']\">3D</a>\n      </li>\n    </ul>\n  </nav>-->\n  <nav class=\"menu\" id=\"navMenu\">\n    <h3>Menü</h3>\n    <a [routerLink]=\"['/home']\" (click)=\"menuLinkClicked(0)\" class=\"linkEl\">Home</a>\n    <a [routerLink]=\"['/connect']\" (click)=\"menuLinkClicked(1)\" class=\"linkEl\">Steuern</a>\n    <a [routerLink]=\"['/console']\" (click)=\"menuLinkClicked(2)\" class=\"linkEl\">Konsole</a>\n    <a [routerLink]=\"['/graphics']\" (click)=\"menuLinkClicked(3)\" class=\"linkEl\">3D</a>\n    <a [routerLink]=\"['/impressum']\" (click)=\"menuLinkClicked(4)\" class=\"linkEl\">Impressum</a>\n    <a (click)=\"menuClicked()\">Close</a>\n  </nav>\n  <button id=\"showMenu\" class=\"menuButton\" (click)=\"menuClicked()\">&#9776;</button>\n  <!-- /navbar -->\n\n  <!-- Main component for a primary marketing message or call to action -->\n  <div class=\"jumbotron\">\n    <h1>Transportsystem</h1>\n  </div>\n\n  <div class=\"fußleiste\">\n    &#169; 2017 - Transportsystem - Huentz, Kaiser, Stumpf\n  </div>\n\n  <router-outlet></router-outlet>\n\n</div> <!-- /container -->\n"

/***/ }),

/***/ 672:
/***/ (function(module, exports) {

module.exports = "<!--<button type=\"button\" class=\"btn btn-prim btn-primary\" (click)=\"connect()\">Connect</button>-->\r\n<button type=\"button\" class=\"btn btn-prim\" (click)=\"connect()\">Connect</button>\r\n<!--<button type=\"button\" class=\"btn btn-prim\" (click)=\"init()\">Debug Init</button>-->\r\n\r\n<p class=\"hidden\" style=\"\">W&auml;hlen Sie den Fahr-Modus:</p>\r\n<!--<input type=\"text\" class=\"hidden\" placeholder=\"Kommando\" [(ngModel)]=\"command\">-->\r\n<button type=\"button\" class=\"btn btn-choose hidden\" (click)=\"auto()\">Automatik</button>\r\n<button type=\"button\" class=\"btn btn-choose hidden\" (click)=\"man()\">Manuell</button>\r\n<button type=\"button\" class=\"btn btn-choose btn-end hidden\" (click)=\"endWs()\">Beenden</button>\r\n\r\n\r\n<section class=\"loader\" style=\"display:none\">\r\n  <!-- the loading animation -->\r\n  <ul class=\"bokeh\">\r\n    <li></li>\r\n    <li></li>\r\n    <li></li>\r\n    <li></li>\r\n  </ul>\r\n</section>\r\n\r\n<p class=\"error\">ERROR: Verbindung zum WebSocket Server fehlgeschlagen! Sind Sie mit der WLAN Schnittstelle verbunden?</p>\r\n\r\n<div class=\"auto\" style=\"display:none;\">\r\n  <iframe class=\"successFrame\" [src]=\"url\" frameborder=\"0\" width=\"100%\" height=\"400px\"></iframe>\r\n</div>\r\n\r\n<div id=\"debug1\" class=\"manual direction\" style=\"position:fixed; left:5%; top:25%; color:grey;\">\r\n  Direction: Base\r\n</div>\r\n\r\n<div id=\"debug2\" class=\"manual distance\" style=\"position:fixed; left:5%; top:29%; color:grey;\">\r\n  Distance: 0\r\n</div>\r\n\r\n<div class=\"manual joyStickDiv\"></div>\r\n\r\n<div class=\"leftMotor\">\r\n  <div class=\"bar-wrapper rightMotorUp manual\">\r\n    <div class=\"bar-container\">\r\n      <div class=\"bar-background\"></div>\r\n      <div class=\"bar-inner\" style=\"height: 0%; bottom: 0;\">0</div>\r\n      <div class=\"bar-foreground\"></div>\r\n    </div>\r\n  </div>\r\n  <div class=\"bar-wrapper rightMotorDown bar-wrapper-down manual\">\r\n    <div class=\"bar-container-down\">\r\n      <div class=\"bar-background\"></div>\r\n      <div class=\"bar-inner bar-inner-down\" style=\"height: 0%; bottom: 0;\">0</div>\r\n      <div class=\"bar-foreground\"></div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"rightMotor\">\r\n  <div class=\"bar-wrapper rightMotorUp manual\">\r\n    <div class=\"bar-container\">\r\n      <div class=\"bar-background\"></div>\r\n      <div class=\"bar-inner\" style=\"height: 0%; bottom: 0;\">0</div>\r\n      <div class=\"bar-foreground\"></div>\r\n    </div>\r\n  </div>\r\n  <div class=\"bar-wrapper rightMotorDown bar-wrapper-down manual\">\r\n    <div class=\"bar-container-down\">\r\n      <div class=\"bar-background\"></div>\r\n      <div class=\"bar-inner bar-inner-down\" style=\"height: 0%; bottom: 0;\">0</div>\r\n      <div class=\"bar-foreground\"></div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<button type=\"button\" class=\"btn manual auto\" (click)=\"back()\">Zur&uuml;ck</button>\r\n\r\n<div class=\"manual switchDiv\">\r\n  <div class=\"switchFloatie\">Sensor</div>\r\n  <div class=\"switch switchFloatie\">\r\n    <input type=\"checkbox\" class=\"checkSens\" (click)=\"clickSens()\" checked />\r\n    <label></label>\r\n  </div>\r\n</div>\r\n\r\n<ul>\r\n  <li *ngFor=\"let h of history\">{{ h }}</li>\r\n</ul>\r\n"

/***/ }),

/***/ 673:
/***/ (function(module, exports) {

module.exports = "<button type=\"button\" id=\"btn-primary\" class=\"btn btn-primary\" (click)=\"connect()\">Connect</button>\n\n<section class=\"loader\" style=\"display:none\">\n  <!-- the loading animation -->\n  <ul class=\"bokeh\">\n    <li></li>\n    <li></li>\n    <li></li>\n    <li></li>\n  </ul>\n</section>\n\n<p class=\"error\" style=\"display:none; text-align: center;\">ERROR: Verbindung zum WebSocket Server fehlgeschlagen! Sind Sie mit der WLAN Schnittstelle verbunden?</p>\n\n<div class=\"cmdWindow\">\n  <ul class=\"cmdList\">\n    <li class=\"cmdItem\" *ngFor=\"let h of history\">{{ h }}</li>\n  </ul>\n</div>\n\n<input type=\"text\" id=\"inSend\" class=\"hidden\" placeholder=\"Kommando\" [(ngModel)]=\"command\">\n<button type=\"button\" id=\"btnSend\" class=\"btn hidden\" (click)=\"send()\">Senden</button>\n<button type=\"button\" id=\"closeBtn\" class=\"btn hidden\" (click)=\"endWs()\">Beenden</button>\n"

/***/ }),

/***/ 674:
/***/ (function(module, exports) {

module.exports = "<!--<div id=\"container\" style=\"width: 100%; height: 400px\"></div>-->\n<!--<div ng-include=\"'http://192.168.0.1/html/index.html'\"></div>-->\n<!--<iframe class=\"successFrame\" src=\"http://192.168.0.1/html/index.html\" frameborder=\"0\" width=\"100%\" height=\"400px\" style=\"display: none\"></iframe>-->\n<section class=\"loader\">\n  <!-- the loading animation -->\n  <ul class=\"bokeh\">\n    <li></li>\n    <li></li>\n    <li></li>\n    <li></li>\n  </ul>\n</section>\n\n<iframe class=\"successFrame\" [src]=\"url\" frameborder=\"0\" width=\"100%\" height=\"400px\" style=\"display: none\"></iframe>\n<div class=\"errorDiv\" id=\"container\" style=\"display: none; text-align: center;\">Fehler: die Verbindung zu Dobby steht offenbar nicht. Sind Sie mit der WLAN-Schnittstelle verbunden?</div>\n"

/***/ }),

/***/ 675:
/***/ (function(module, exports) {

module.exports = "<img src=\"assets/logo.png\" alt=\"Logo\" style=\"width:80%; position:fixed; left:10%; top:40%;\"/>\r\n"

/***/ }),

/***/ 676:
/***/ (function(module, exports) {

module.exports = "<div style=\"height: 400px; padding: 3%; overflow-y: scroll;\">\n  <h4>Dobby-App v2.10</h4>\n  <p>\n    Diese App ist Teil des Dobby-Projektes, welches als Projekt für den Kurs Software-Engineering\n    der Dualen Hochschule Baden-Württemberg im dritten Semester startete und nun mit der Studienarbeit\n    des fünften und sechsten Semesters abgeschlossen wurde.\n  </p>\n\n  <br/>\n  <h4>Entwickler</h4>\n  <p>\n    Das Projekt wurde entwickelt von\n    <br/>\n    <img src=\"assets/Nico.png\" width=\"30%\" style=\"margin-left: auto; margin-right: 5%;\"/><img src=\"assets/Marie.png\" width=\"30%\" style=\"margin-left: auto; margin-right: 5%;\"/><img src=\"assets/Daniel.png\" width=\"30%\" style=\"margin-left: auto; margin-right: auto;\"/>\n    <i>Nicolas Huentz</i>, <i>Marie-Kristin Kaiser</i>  & <i>Daniel Stumpf</i>.\n  </p>\n\n  <br/>\n  <h4>Sponsoren</h4>\n  <p>\n    Dieses Projekt hätte ohne die tatkräftige Unterstützung folgender Sponsoren nicht abgeschlossen\n    werden können:\n    <br/><br/>\n    <img src=\"assets/firmen2.png\" width=\"100%\"/>\n  </p>\n\n  <br/>\n  <h4>Haftungsausschluss</h4>\n  <p>\n    Bitte beachten Sie, dass die App zu Lernzwecken entwickelt wurde und wir deswegen keine Garantie\n    für diese Software geben können.\n  </p>\n</div>\n"

/***/ }),

/***/ 692:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// The following lines allow the ping function to be loaded via commonjs, AMD,
// and script tags, directly into window globals.
// Thanks to https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) { if (true) { !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); } else if (typeof module === 'object' && module.exports) { module.exports = factory(); } else { root.ping = factory(); }
}(this, function () {

    /**
     * Creates and loads an image element by url.
     * @param  {String} url
     * @return {Promise} promise that resolves to an image element or
     *                   fails to an Error.
     */
    function request_image(url) {
        return new Promise(function(resolve, reject) {
            var img = new Image();
            img.onload = function() { resolve(img); };
            img.onerror = function() { reject(url); };
            img.src = url + '?random-no-cache=' + Math.floor((1 + Math.random()) * 0x10000).toString(16);
        });
    }

    /**
     * Pings a url.
     * @param  {String} url
     * @param  {Number} multiplier - optional, factor to adjust the ping by.  0.3 works well for HTTP servers.
     * @return {Promise} promise that resolves to a ping (ms, float).
     */
    function ping(url, multiplier) {
        return new Promise(function(resolve, reject) {
            var start = (new Date()).getTime();
            var response = function() { 
                var delta = ((new Date()).getTime() - start);
                delta *= (multiplier || 1);
                resolve(delta); 
            };
            request_image(url).then(response).catch(response);
            
            // Set a timeout for max-pings, 5s.
            setTimeout(function() { reject(Error('Timeout')); }, 5000);
        });
    }
    
    return ping;
}));

/***/ }),

/***/ 693:
/***/ (function(module, exports) {

var VirtualJoystick	= function(opts)
{
	opts			= opts			|| {};
	this._container		= opts.container	|| document.body;
	this._barMotorR = opts.rightMotor !== undefined ? opts.rightMotor : false;
	this._barMotorRD = opts.rightMotorD !== undefined ? opts.rightMotorD : false;
	this._barMotorL = opts.leftMotor !== undefined ? opts.leftMotor : false;
  this._barMotorLD = opts.leftMotorD !== undefined ? opts.leftMotorD : false;
	this._strokeStyle	= opts.strokeStyle	|| 'cyan';
	this._stickEl		= opts.stickElement	|| this._buildJoystickStick();
	this._baseEl		= opts.baseElement	|| this._buildJoystickBase();
	this._mouseSupport	= opts.mouseSupport !== undefined ? opts.mouseSupport : false;
	this._stationaryBase	= opts.stationaryBase || false;
	this._direction = opts.direction !== undefined ? opts.direction : false;
	this._distance = opts.distance !== undefined ? opts.distance : false;
	this._baseX		= this._stickX = opts.baseX || 0
	this._baseY		= this._stickY = opts.baseY || 0
	this._limitStickTravel	= opts.limitStickTravel || false
	this._stickRadius	= opts.stickRadius !== undefined ? opts.stickRadius : 100
	this._useCssTransform	= opts.useCssTransform !== undefined ? opts.useCssTransform : false

	//this._container.style.position	= "relative"

	this._container.appendChild(this._baseEl)
	this._baseEl.style.position	= "absolute"
	this._baseEl.style.display	= "none"
	this._container.appendChild(this._stickEl)
	this._stickEl.style.position	= "absolute"
	this._stickEl.style.display	= "none"

	this._pressed	= false;
	this._touchIdx	= null;

	if(this._stationaryBase === true){
		this._baseEl.style.display	= "";
		this._baseEl.style.left		= (this._baseX - this._baseEl.width /2)+"px";
		this._baseEl.style.top		= (this._baseY - this._baseEl.height/2)+"px";
		this._stickEl.style.display = "";
		this._stickEl.style.left  = (this._baseX - this._stickEl.width/2)+"px";
		this._stickEl.style.top   = (this._baseY - this._stickEl.height/2)+"px";
	}

	this._transform	= this._useCssTransform ? this._getTransformProperty() : false;
	this._has3d	= this._check3D();

	var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	this._$onTouchStart	= __bind(this._onTouchStart	, this);
	this._$onTouchEnd	= __bind(this._onTouchEnd	, this);
	this._$onTouchMove	= __bind(this._onTouchMove	, this);
	this._container.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.addEventListener( 'touchend'	, this._$onTouchEnd	, false );
	this._container.addEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
		this._container.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.addEventListener( 'mouseup'	, this._$onMouseUp	, false );
		this._container.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
}

VirtualJoystick.prototype.destroy	= function()
{
	this._container.removeChild(this._baseEl);
	this._container.removeChild(this._stickEl);

	this._container.removeEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.removeEventListener( 'touchend'		, this._$onTouchEnd	, false );
	this._container.removeEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._container.removeEventListener( 'mouseup'		, this._$onMouseUp	, false );
		this._container.removeEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.removeEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
}

/**
 * @returns {Boolean} true if touchscreen is currently available, false otherwise
*/
VirtualJoystick.touchScreenAvailable	= function()
{
	return 'createTouch' in document ? true : false;
}

/**
 * microevents.js - https://github.com/jeromeetienne/microevent.js
*/
;(function(destObj){
	destObj.addEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
		return fct;
	};
	destObj.removeEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	};
	destObj.dispatchEvent		= function(event /* , args... */){
		if(this._events === undefined) 	this._events	= {};
		if( this._events[event] === undefined )	return;
		var tmpArray	= this._events[event].slice();
		for(var i = 0; i < tmpArray.length; i++){
			var result	= tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1))
			if( result !== undefined )	return result;
		}
		return undefined
	};
})(VirtualJoystick.prototype);

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype.deltaX	= function(){ return this._stickX - this._baseX;	}
VirtualJoystick.prototype.deltaY	= function(){ return this._stickY - this._baseY;	}

/*VirtualJoystick.prototype.up	= function(deltaX, deltaY){
	if( deltaY >= 0 ) return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	//if ( Math.abs(deltaX) > ( Math.tan(67.5)*Math.abs(deltaY) )) return false;
	return true;
}
VirtualJoystick.prototype.down	= function(deltaX, deltaY){
	if( deltaY <= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	//if ( Math.abs(deltaX) > ( Math.tan(67.5)*Math.abs(deltaY) ) ) return false;
	return true;
}
VirtualJoystick.prototype.right	= function(deltaX, deltaY){
	if( deltaX <= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	//if ( Math.abs(deltaY) > ( Math.tan(67.5)*Math.abs(deltaX) ) ) return false;
	return true;
}
VirtualJoystick.prototype.left	= function(deltaX, deltaY){
	if( deltaX >= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	//if ( Math.abs(deltaY) > ( Math.tan(67.5)*Math.abs(deltaX) ) ) return false;
	return true;
}*/

/*
* return values:
* - 0: up           - 6: down         - 12: center
* - 1: up-right     - 7: down-left
* - 2: up-r-right   - 8: down-l-left
* - 3: right        - 9: left
* - 4: down-r-right - 10:up-l-left
* - 5: down-right   - 11:up-left
*/

VirtualJoystick.prototype.getDir = function(deltaX, deltaY) {
  //test the four direction with at least one value first
  if (deltaX == 0) {
    if (deltaY == 0) return 12;
    if (deltaY >0) return 6; //down
    return 0; //up
  }
  if (deltaY == 0) {
    if (deltaX >0) return 3; //right
    return 9; //left
  }

  //not one exact direction
  var alpha = this.getAlpha(deltaX, deltaY);

  if (deltaY <0) {  //somewhere in the upper part
    if (alpha <=27) return 0; //up
    if (alpha <=(27+25)) {
      if (deltaX>0) return 1; //up-right
      return 11; //up-left
    }
    if (alpha <=(27+25+25)) {
      if (deltaX>0) return 2; //up-r-right
      return 10; //up-l-left
    }
    if (deltaX >0) return 3; //right
    return 9; //left
  } else { //somwhere in the lower part
    if (alpha <=27) return 6; //down
    if (alpha <=(27+25)) {
      if (deltaX>0) return 5; //down-right
      return 7; //down-left
    }
    if (alpha <=(27+25+25)) {
      if (deltaX>0) return 4; //down-r-right
      return 8; //down-l-left
    }
    if (deltaX >0) return 3; //right
    return 9; //left
  }
}

VirtualJoystick.prototype.getAlpha = function(deltaX, deltaY) {
  var alpha = this.degrees(Math.atan(this.round(Math.abs(deltaX)/Math.abs(deltaY), 3)));
  return alpha;
}

VirtualJoystick.prototype.round = function(number, dec) {
  return +(Math.round(number + "e+" + dec)  + "e-" + dec);
}

VirtualJoystick.prototype.degrees = function(radians) {
  return radians * 180 / Math.PI;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onUp	= function()
{
	this._pressed	= false;
	//this._stickEl.style.display	= "none";
	this._move(this._stickEl.style, (this._baseX - this._stickEl.width / 2), (this._baseY - this._stickEl.height / 2));
	//style display in center
	if (this._direction != false)	this._direction.innerHTML = "Direction: Base";
	if (this._distance != false) this._distance.innerHTML = "Distance: 0";
	this._stickX	= this._baseX;
	this._stickY	= this._baseY;

	if(this._stationaryBase == false){
		this._baseEl.style.display	= "none";

		this._baseX	= this._baseY	= 0;
		this._stickX	= this._stickY	= 0;
	}
}

VirtualJoystick.prototype._onDown	= function(x, y)
{
	this._pressed	= true;
	if(this._stationaryBase == false){
		this._baseX	= x;
		this._baseY	= y;
		this._baseEl.style.display	= "";
		this._move(this._baseEl.style, (this._baseX - this._baseEl.width /2), (this._baseY - this._baseEl.height/2));
	}

	this._stickX	= x;
	this._stickY	= y;

	if(this._limitStickTravel === true){
		var deltaX	= this.deltaX();
		var deltaY	= this.deltaY();
		var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
		if(stickDistance > this._stickRadius){
			var stickNormalizedX = deltaX / stickDistance;
			var stickNormalizedY = deltaY / stickDistance;

			this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
			this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
		}
	}

	//this._stickEl.style.display	= "";
	//style display
	this._move(this._stickEl.style, (this._stickX - this._stickEl.width /2), (this._stickY - this._stickEl.height/2));
}

VirtualJoystick.prototype._onMove	= function(x, y)
{
	if( this._pressed === true ){
		this._stickX	= x;
		this._stickY	= y;

		if(this._limitStickTravel === true){
			var deltaX	= this.deltaX();
			var deltaY	= this.deltaY();
			var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
			if(stickDistance > this._stickRadius){
				var stickNormalizedX = deltaX / stickDistance;
				var stickNormalizedY = deltaY / stickDistance;

				this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
				this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
			}
		}
    this._calculateDirection();
    this._move(this._stickEl.style, (this._stickX - this._stickEl.width /2), (this._stickY - this._stickEl.height/2));
	}
}

VirtualJoystick.prototype.getDirection = function() {
  var dir = 'Base';

  //if( this._pressed === false )	return false;
  var deltaX	= this.deltaX();
  var deltaY	= this.deltaY();

  switch(this.getDir(deltaX,deltaY)) {
    case 0:
      dir = 'up';
      break;
    case 1:
      dir = 'up-right';
      break;
    case 2:
      dir = 'up-r-right';
      break;
    case 3:
      dir = 'right';
      break;
    case 4:
      dir = 'down-r-right';
      break;
    case 5:
      dir = 'down-right';
      break;
    case 6:
      dir = 'down';
      break;
    case 7:
      dir = 'down-left';
      break;
    case 8:
      dir = 'down-l-left';
      break;
    case 9:
      dir = 'left';
      break;
    case 10:
      dir = 'up-l-left';
      break;
    case 11:
      dir = 'up-left';
      break;
    default:
      //do Nothing because it's either the center or something went wrong
      break;
  }

  this.updateMotorBars();
  return dir;
}

VirtualJoystick.prototype.updateMotorBars = function() {
  var dist = this.getDistance();
  var switch_dist = Math.ceil(dist/9);
  if(switch_dist == 1 || switch_dist == 0) {
    dist = 0;
  } else {
    dist = (switch_dist*90)/10;
  }
  dist = Math.ceil(dist*(10/9));
  /*
   *  90 - 100%   45 - 50%
   *  81 -  90%   36 - 40%
   *  72 -  80%   27 - 30%
   *  63 -  70%   18 - 20%
   *  54 -  60%   00 -  0%
   */

  if (this._barMotorR == false || this._barMotorRD == false) {
    //it's not defined so nothing is supposed to happen
  } else {
    if (this._rightMotor <= 0) {
      this._barMotorR.style.height = "0%";
      if(this._rightMotor == 0) {
        this._barMotorRD.style.height = "0%";
      } else this._barMotorRD.style.height = (dist*this._rightMotor*(-1)/100) + "%";
    } else {
      this._barMotorRD.style.height = "0%";
      this._barMotorR.style.height = (dist*this._rightMotor/100) + "%";
    }
  }

  if (this._barMotorL == false || this._barMotorLD == false) {
    //it's not defined so nothing is supposed to happen
  } else {
    if (this._leftMotor <= 0) {
      this._barMotorL.style.height = "0%";
      if(this._leftMotor == 0) {
        this._barMotorLD.style.height = "0%";
      } else this._barMotorLD.style.height = (dist*this._leftMotor*(-1)/100) + "%";
    } else {
      this._barMotorLD.style.height = "0%";
      this._barMotorL.style.height = (dist*this._leftMotor/100) + "%";
    }
  }
}

VirtualJoystick.prototype.getDistance = function() {
  var deltaX	= this.deltaX();
  var deltaY	= this.deltaY();
  var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
  stickDistance = Math.round(stickDistance);
  return stickDistance;
}

this._leftMotor = 0;
this._rightMotor = 0;
VirtualJoystick.prototype._calculateDirection = function() {
  var dir = 'Base';

  if( this._pressed === false )	return false;
  var deltaX	= this.deltaX();
  var deltaY	= this.deltaY();

  switch(this.getDir(deltaX,deltaY)) {
    case 0:
      dir = 'up';
      this._leftMotor = this._rightMotor = 100;
      break;
    case 1:
      dir = 'up-right';
      this._leftMotor = 100;
      this._rightMotor = Math.round(100/3);
      break;
    case 2:
      dir = 'up-r-right';
      this._leftMotor = 100;
      this._rightMotor = Math.round(100/8);
      break;
    case 3:
      dir = 'right';
      this._leftMotor = 100;
      this._rightMotor = -100;
      break;
    case 4:
      dir = 'down-r-right';
      this._leftMotor = -100;
      this._rightMotor = Math.round(-100/8);
      break;
    case 5:
      dir = 'down-right';
      this._leftMotor = -100;
      this._rightMotor = Math.round(-100/3);
      break;
    case 6:
      dir = 'down';
      this._leftMotor = this._rightMotor = -100;
      break;
    case 7:
      dir = 'down-left';
      this._rightMotor = -100;
      this._leftMotor = Math.round(-100/3);
      break;
    case 8:
      dir = 'down-l-left';
      this._rightMotor = -100;
      this._leftMotor = Math.round(-100/8);
      break;
    case 9:
      dir = 'left';
      this._rightMotor = 100;
      this._leftMotor = -100;
      break;
    case 10:
      dir = 'up-l-left';
      this._rightMotor = 100;
      this._leftMotor = Math.round(100/8);
      break;
    case 11:
      dir = 'up-left';
      this._rightMotor = 100;
      this._leftMotor = Math.round(100/3);
      break;
    default:
      this._rightMotor = 0;
      this._leftMotor = 0;
      //do Nothing because it's either the center or something went wrong
      break;
  }

  this.updateMotorBars();

  if (this._direction != false) {
    this._direction.innerHTML = "Direction: " + dir;
  }
  if (this._distance != false) {
    var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
    this._distance.innerHTML = "Distance: " + Math.round(stickDistance);
  }
}

//////////////////////////////////////////////////////////////////////////////////
//		bind touch events (and mouse events for debug)			//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onMouseUp	= function(event)
{
	return this._onUp();
}

VirtualJoystick.prototype._onMouseDown	= function(event)
{
	event.preventDefault();
	var x	= event.clientX;
	var y	= event.clientY;
	return this._onDown(x, y);
}

VirtualJoystick.prototype._onMouseMove	= function(event)
{
	var x	= event.clientX;
	var y	= event.clientY;
	//this.calculateDirection();
	return this._onMove(x, y);
}

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onTouchStart	= function(event)
{
	// if there is already a touch inprogress do nothing
	if( this._touchIdx !== null )	return;

	// notify event for validation
	var isValid	= this.dispatchEvent('touchStartValidation', event);
	if( isValid === false )	return;

	// dispatch touchStart
	this.dispatchEvent('touchStart', event);

	event.preventDefault();
	// get the first who changed
	var touch	= event.changedTouches[0];
	// set the touchIdx of this joystick
	this._touchIdx	= touch.identifier;

	// forward the action
	var x		= touch.pageX;
	var y		= touch.pageY;
	return this._onDown(x, y)
}

VirtualJoystick.prototype._onTouchEnd	= function(event)
{
	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// dispatch touchEnd
	this.dispatchEvent('touchEnd', event);

	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++);
	// if touch event isnt found,
	if( i === touchList.length)	return;

	// reset touchIdx - mark it as no-touch-in-progress
	this._touchIdx	= null;

//??????
// no preventDefault to get click event on ios
event.preventDefault();

	return this._onUp()
}

VirtualJoystick.prototype._onTouchMove	= function(event)
{
	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++ );
	// if touch event with the proper identifier isnt found, do nothing
	if( i === touchList.length)	return;
	var touch	= touchList[i];

	event.preventDefault();

	var x		= touch.pageX;
	var y		= touch.pageY;
	return this._onMove(x, y)
}


//////////////////////////////////////////////////////////////////////////////////
//		build default stickEl and baseEl				//
//////////////////////////////////////////////////////////////////////////////////

/**
 * build the canvas for joystick base
 */
VirtualJoystick.prototype._buildJoystickBase	= function()
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 252;
	canvas.height	= 252;

	var ctx		= canvas.getContext('2d');
	var base_image = new Image();
	base_image.onload = function() {
	  ctx.drawImage(base_image,0,0,canvas.width,canvas.height);
	}
	base_image.onerror = function() {
	  ctx.beginPath();
    ctx.strokeStyle = this._strokeStyle;
    ctx.lineWidth	= 6;
    ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle	= this._strokeStyle;
    ctx.lineWidth	= 2;
    ctx.arc( canvas.width/2, canvas.width/2, 60, 0, Math.PI*2, true);
    ctx.stroke();
	}
	base_image.src = 'assets/joyStick_bg.svg';
	return canvas;
}

/**
 * build the canvas for joystick stick
 */
VirtualJoystick.prototype._buildJoystickStick	= function()
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 132;
	canvas.height	= 132;
	var ctx		= canvas.getContext('2d');

	var stick_image = new Image();
  stick_image.onload = function() {
    ctx.drawImage(stick_image,0,0,canvas.width,canvas.height);
  }
  stick_image.onerror = function() {
    ctx.beginPath();
    ctx.strokeStyle	= this._strokeStyle;
    ctx.lineWidth	= 6;
    ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true);
    ctx.stroke();
  }
  stick_image.src = 'assets/joyStick_stick.svg';
	return canvas;
}

//////////////////////////////////////////////////////////////////////////////////
//		move using translate3d method with fallback to translate > 'top' and 'left'
//      modified from https://github.com/component/translate and dependents
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._move = function(style, x, y)
{
	if (this._transform) {
		if (this._has3d) {
			style[this._transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)';
		} else {
			style[this._transform] = 'translate(' + x + 'px,' + y + 'px)';
		}
	} else {
		style.left = x + 'px';
		style.top = y + 'px';
	}
}

VirtualJoystick.prototype._getTransformProperty = function()
{
	var styles = [
		'webkitTransform',
		'MozTransform',
		'msTransform',
		'OTransform',
		'transform'
	];

	var el = document.createElement('p');
	var style;

	for (var i = 0; i < styles.length; i++) {
		style = styles[i];
		if (null != el.style[style]) {
			return style;
		}
	}
}

VirtualJoystick.prototype._check3D = function()
{
	var prop = this._getTransformProperty();
	// IE8<= doesn't have `getComputedStyle`
	if (!prop || !window.getComputedStyle) return module.exports = false;

	var map = {
		webkitTransform: '-webkit-transform',
		OTransform: '-o-transform',
		msTransform: '-ms-transform',
		MozTransform: '-moz-transform',
		transform: 'transform'
	};

	// from: https://gist.github.com/lorenzopolidori/3794226
	var el = document.createElement('div');
	el.style[prop] = 'translate3d(1px,1px,1px)';
	document.body.insertBefore(el, null);
	var val = getComputedStyle(el).getPropertyValue(map[prop]);
	document.body.removeChild(el);
	var exports = null != val && val.length && 'none' != val;
	return exports;
}


/***/ }),

/***/ 698:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(389);


/***/ })

},[698]);
//# sourceMappingURL=main.bundle.map