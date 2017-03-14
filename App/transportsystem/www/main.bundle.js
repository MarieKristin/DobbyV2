webpackJsonp([1,4],{

/***/ 328:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__assets_virtualjoystick_js__ = __webpack_require__(688);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__assets_virtualjoystick_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__assets_virtualjoystick_js__);
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
    //end of debugging
    // TODO: In einen Angular 2 Service schieben
    function ConnectComponent() {
        //public command: string;
        this.history = [];
        this.arrChoose = document.getElementsByClassName('hidden');
        this.arrMan = document.getElementsByClassName('manual');
        this.helpEl = document.getElementsByClassName('btn-prim');
        this.loader = document.getElementsByClassName('loader');
        this.direction = document.getElementsByClassName('direction');
        this.distance = document.getElementsByClassName('distance');
    }
    //start of debugging
    ConnectComponent.prototype.init = function () {
        this.helpEl[0].style.display = "none";
        this.joystick = new VirtualJoystick({
            mouseSupport: true,
            stationaryBase: true,
            direction: this.direction[0],
            distance: this.distance[0],
            baseX: 200,
            baseY: 400,
            limitStickTravel: true,
            stickRadius: 50
        });
        var laufI;
        for (laufI = 0; laufI < this.arrMan.length; laufI++) {
            this.arrMan[laufI].style.display = "block";
        }
    };
    ConnectComponent.prototype.connect = function () {
        var _this = this;
        var i = 0;
        this.helpEl[0].style.display = "none";
        this.loader[0].style.visibility = "visible";
        this._ws = new WebSocket('ws://192.168.0.1:8080');
        //this._ws = new WebSocket('ws://192.168.178.50:8080');
        var timeOut = setTimeout(function () {
            document.getElementsByClassName('loader')[0].style.visibility = "hidden";
            document.getElementsByClassName('error')[0].style.display = "block";
        }, 3000);
        this._ws.onopen = function (event) {
            clearTimeout(timeOut);
            _this.loader[0].style.visibility = "hidden";
            _this._ws.onmessage = function (event) {
                _this.history.push('[SERVER] ' + event.data);
            };
            for (i = 0; i < _this.arrChoose.length; i++) {
                _this.arrChoose[i].style.display = "block";
            }
        };
    };
    ConnectComponent.prototype.auto = function () {
        //if (!this.command) {
        //  return;
        //}
        //this.history.push('[CLIENT] ' + this.command);
        //this._ws.send(this.command);
        this._ws.send('auto');
        this.history.push('[CLIENT] ' + 'auto');
        //this.command = '';
    };
    ConnectComponent.prototype.man = function () {
        var i = 0;
        this.joystick = new VirtualJoystick({
            mouseSupport: true,
            stationaryBase: true,
            direction: this.direction[0],
            distance: this.distance[0],
            baseX: 200,
            baseY: 400,
            limitStickTravel: true,
            stickRadius: 50
        });
        //if (!this.command) {
        //  return;
        //}
        //this.history.push('[CLIENT] ' + this.command);
        //this._ws.send(this.command);
        this._ws.send('manual');
        this.history.push('[CLIENT] ' + 'manual');
        //this.command = '';
        for (i = 0; i < this.arrChoose.length; i++) {
            this.arrChoose[i].style.display = "none";
        }
        for (i = 0; i < this.arrMan.length; i++) {
            this.arrMan[i].style.display = "block";
        }
        //this.joystick._container.addEventListener( 'mousemove'	, this.calculateDirection	, false );
        //this.joystick.addEventListener('moved', this.calculateDirection(), false);
        //while(1) {
        //  (<HTMLElement>document.getElementById('debug1')).innerHTML = "Direction: " + this.joystick.calculateDirection();
        //}
    };
    ConnectComponent.prototype.back = function () {
        var i = 0;
        this.joystick.destroy();
        this._ws.send('abbrManuell');
        this.history.push('[CLIENT] ' + 'abbrManuell');
        for (i = 0; i < this.arrMan.length; i++) {
            this.arrMan[i].style.display = "none";
        }
        for (i = 0; i < this.arrChoose.length; i++) {
            this.arrChoose[i].style.display = "block";
        }
    };
    ConnectComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-websocket',
            template: __webpack_require__(669),
            styles: [__webpack_require__(664)]
        }), 
        __metadata('design:paramtypes', [])
    ], ConnectComponent);
    return ConnectComponent;
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
    }
    ConsoleComponent.prototype.connect = function () {
        var _this = this;
        this._ws = new WebSocket('ws://192.168.0.1:8080');
        this._ws.onmessage = function (event) {
            _this.history.push('[SERVER] ' + event.data);
        };
        this.helpArr[0].style.display = "block";
        this.helpArr[1].style.display = "block";
        this.helpEl[0].style.display = "none";
    };
    ConsoleComponent.prototype.send = function () {
        if (!this.command) {
            return;
        }
        this.history.push('[CLIENT] ' + this.command);
        this._ws.send(this.command);
        this.command = '';
    };
    ConsoleComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-websocket',
            template: __webpack_require__(670),
            styles: [__webpack_require__(665)]
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
    function GraphicsComponent() {
    }
    GraphicsComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.container = document.getElementById('container');
        this.camera = new THREE.PerspectiveCamera(45, this.container.offsetWidth / this.container.offsetHeight, 1, 500);
        this.camera.position.set(0, 0, 30);
        this.scene = new THREE.Scene();
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('assets/earth.jpg', function (texture) {
            var geometry = new THREE.SphereGeometry(5, 32, 32);
            var material = new THREE.MeshLambertMaterial({ map: texture });
            var sphere = new THREE.Mesh(geometry, material);
            _this.scene.add(sphere);
        });
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setClearColor(0x000000);
        var ambientLights = new THREE.AmbientLight(0x999999);
        this.scene.add(ambientLights);
        var spotLight = new THREE.PointLight(0xffffff);
        spotLight.position.set(0, 0, 500);
        this.scene.add(spotLight);
        this.container.appendChild(this.renderer.domElement);
        this.controls = new THREE.TrackballControls(this.camera);
        this.animate();
    };
    GraphicsComponent.prototype.animate = function () {
        var _this = this;
        window.requestAnimationFrame(function () { return _this.animate(); });
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    };
    GraphicsComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-graphics',
            template: __webpack_require__(671),
            styles: [__webpack_require__(666)]
        }), 
        __metadata('design:paramtypes', [])
    ], GraphicsComponent);
    return GraphicsComponent;
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
            template: __webpack_require__(672),
            styles: [__webpack_require__(667)]
        }), 
        __metadata('design:paramtypes', [])
    ], HomeComponent);
    return HomeComponent;
}());
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/home.component.js.map

/***/ }),

/***/ 386:
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 386;


/***/ }),

/***/ 387:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(475);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__environments_environment__ = __webpack_require__(509);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_app_module__ = __webpack_require__(507);




if (__WEBPACK_IMPORTED_MODULE_2__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["a" /* enableProdMode */])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_3__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/main.js.map

/***/ }),

/***/ 506:
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
        this.title = 'app works!';
    }
    AppComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-root',
            template: __webpack_require__(668),
            styles: [__webpack_require__(663)]
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/app.component.js.map

/***/ }),

/***/ 507:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__graphics_graphics_component__ = __webpack_require__(330);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__home_home_component__ = __webpack_require__(331);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser__ = __webpack_require__(147);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_forms__ = __webpack_require__(465);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_http__ = __webpack_require__(471);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__app_component__ = __webpack_require__(506);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__console_console_component__ = __webpack_require__(329);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__connect_connect_component__ = __webpack_require__(328);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__app_routing__ = __webpack_require__(508);
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
                __WEBPACK_IMPORTED_MODULE_1__home_home_component__["a" /* HomeComponent */], __WEBPACK_IMPORTED_MODULE_0__graphics_graphics_component__["a" /* GraphicsComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_4__angular_forms__["a" /* FormsModule */],
                __WEBPACK_IMPORTED_MODULE_5__angular_http__["a" /* HttpModule */],
                __WEBPACK_IMPORTED_MODULE_9__app_routing__["a" /* appRoutes */]
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

/***/ 508:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_router__ = __webpack_require__(495);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__home_home_component__ = __webpack_require__(331);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__console_console_component__ = __webpack_require__(329);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__connect_connect_component__ = __webpack_require__(328);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__graphics_graphics_component__ = __webpack_require__(330);
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
    }
];
var appRoutes = __WEBPACK_IMPORTED_MODULE_0__angular_router__["a" /* RouterModule */].forRoot(routes, { useHash: true });
//# sourceMappingURL=G:/Uni/Dobby/App/DobbyTransportsystem/DobbyV2/App/src/app.routing.js.map

/***/ }),

/***/ 509:
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

/***/ 663:
/***/ (function(module, exports) {

module.exports = ".main-content {\r\n  margin: 0;\r\n  padding: 0;\r\n}\r\n"

/***/ }),

/***/ 664:
/***/ (function(module, exports) {

module.exports = "p {\r\n  text-align: center;\r\n}\r\n\r\n.btn-choose {\r\n  float: left;\r\n  margin: 5%;\r\n}\r\n\r\n.error {\r\n  display: none;\r\n}\r\n\r\n.manual {\r\n  display: none;\r\n}\r\n"

/***/ }),

/***/ 665:
/***/ (function(module, exports) {

module.exports = "\r\n"

/***/ }),

/***/ 666:
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ 667:
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ 668:
/***/ (function(module, exports) {

module.exports = "<div class=\"container main-content\">\n  <nav class=\"navbar navbar-light bg-faded\">\n    <!--<a class=\"navbar-brand\" href=\"#\">TS</a>-->\n    <ul class=\"nav navbar-nav\">\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [routerLink]=\"['/home']\">Home</a>\n      </li>\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [routerLink]=\"['/connect']\">Connect</a>\n      </li>\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [routerLink]=\"['/console']\">Konsole</a>\n      </li>\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [routerLink]=\"['/graphics']\">3D</a>\n      </li>\n    </ul>\n  </nav> <!-- /navbar -->\n\n  <!-- Main component for a primary marketing message or call to action -->\n  <div class=\"jumbotron\">\n    <h1>Transportsystem</h1>\n  </div>\n\n  <router-outlet></router-outlet>\n\n</div> <!-- /container -->\n"

/***/ }),

/***/ 669:
/***/ (function(module, exports) {

module.exports = "<!--<button type=\"button\" class=\"btn btn-prim btn-primary\" (click)=\"connect()\">Connect</button>-->\r\n<!--<button type=\"button\" class=\"btn btn-prim\" (click)=\"connect()\">Connect</button>-->\r\n<button type=\"button\" class=\"btn btn-prim\" (click)=\"init()\">Debug Init</button>\r\n\r\n<p class=\"hidden\" style=\"\">W&auml;hlen Sie den Fahr-Modus:</p>\r\n<!--<input type=\"text\" class=\"hidden\" placeholder=\"Kommando\" [(ngModel)]=\"command\">-->\r\n<button type=\"button\" class=\"btn btn-choose hidden\" (click)=\"auto()\">Automatik</button>\r\n<button type=\"button\" class=\"btn btn-choose hidden\" (click)=\"man()\">Manuell</button>\r\n\r\n<img src=\"../../assets/ajax-loader.gif\" class=\"loader\" alt=\"Loading...\" style=\"visibility:hidden\">\r\n<p class=\"error\">ERROR: Failed to Connect to the WebSocket Server!</p>\r\n\r\n<ul>\r\n  <li *ngFor=\"let h of history\">{{ h }}</li>\r\n</ul>\r\n\r\n<!--<p class=\"hidden\">\r\n  X: <p id=\"textView1\"></p>\r\n  Y: <p id=\"textView2\"></p>\r\n  Angle: <p id=\"textView3\"></p>\r\n  Distance: <p id=\"textView4\"></p>\r\n  Direction: <p id=\"textView5\"></p>\r\n</p>-->\r\n\r\n<!--<img class=\"img_joystick hidden\" width=\"350dp\" height=\"350dp\" src=\"../../assets/image_button_bg.png\" />-->\r\n\r\n<div id=\"debug1\" class=\"manual direction\" style=\"position:fixed; left:5%; top:30%; color:grey;\">\r\n  Direction: Base\r\n</div>\r\n\r\n<div id=\"debug2\" class=\"manual distance\" style=\"position:fixed; left:5%; top:34%; color:grey;\">\r\n  Distance: 0\r\n</div>\r\n\r\n<!--<button type=\"button\" class=\"btn manual\" (click)=\"back()\">Zur&uuml;ck</button>-->\r\n"

/***/ }),

/***/ 670:
/***/ (function(module, exports) {

module.exports = "<h2>Todo</h2>\n<ol>\n  <li>Verbindung zum Raspi aufbauen</li>\n  <li>Kommando senden</li>\n  <li>Kommando empfangen?</li>\n</ol>\n\n<button type=\"button\" id=\"btn-primary\" class=\"btn btn-primary\" (click)=\"connect()\">Connect</button>\n\n<input type=\"text\" class=\"hidden\" placeholder=\"Kommando\" [(ngModel)]=\"command\">\n<button type=\"button\" class=\"btn hidden\" (click)=\"send()\">Senden</button>\n\n<ul>\n  <li *ngFor=\"let h of history\">{{ h }}</li>\n</ul>\n"

/***/ }),

/***/ 671:
/***/ (function(module, exports) {

module.exports = "<div id=\"container\" style=\"width: 100%; height: 400px\"></div>\n"

/***/ }),

/***/ 672:
/***/ (function(module, exports) {

module.exports = "<img src=\"../../assets/logo.png\" alt=\"Logo\">\n"

/***/ }),

/***/ 688:
/***/ (function(module, exports) {

var VirtualJoystick	= function(opts)
{
	opts			= opts			|| {};
	this._container		= opts.container	|| document.body;
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

	this._container.style.position	= "relative"

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

/*
VirtualJoystick.prototype.up	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY >= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;
}
VirtualJoystick.prototype.down	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY <= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;
}
VirtualJoystick.prototype.right	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX <= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;
}
VirtualJoystick.prototype.left	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX >= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;
}
*/

VirtualJoystick.prototype.up	= function(deltaX, deltaY){
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
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onUp	= function()
{
	this._pressed	= false;
	this._stickEl.style.display	= "none";
	if (this._direction != false)	this._direction.innerHTML = "Direction: Base";
	if (this._distance != false) this._distance.innerHTML = "Distance: 0";

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

	this._stickEl.style.display	= "";
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

VirtualJoystick.prototype._calculateDirection = function() {
  var dir = 'Base';

  if( this._pressed === false )	return false;
  var deltaX	= this.deltaX();
  var deltaY	= this.deltaY();

  if ( this.up(deltaX, deltaY) ) {            //so the stick is somewhere in the upper part
    if ( this.left(deltaX, deltaY) ) {        //so the stick is "up left"
      dir = 'up-left';
    } else if ( this.right(deltaX, deltaY) ) {//so the stick is "up right"
      dir = 'up-right';
    } else {                                  //so the stick is "up"
      dir = 'up';
    }
  } else if ( this.down(deltaX, deltaY) ) {   //so the stick is somewhere in the lower part
    if ( this.left(deltaX, deltaY) ) {        //so the stick is "down left"
        dir = 'down-left';
      } else if ( this.right(deltaX, deltaY) ) {//so the stick is "down right"
        dir = 'down-right';
      } else {                                  //so the stick is "down"
      dir = 'down';
    }
  } else if ( this.left(deltaX, deltaY) ) {   //so the stick is "left"
    dir = 'left';
  } else if ( this.right(deltaX, deltaY) ) {  //so the stick is "right"
    dir = 'right';
  }                                           //if nothing is fitting for the direction, this means
                                              //either something went horribly wrong
                                              //or the stick is in default position

  if (this._direction != false) {
    this._direction.innerHTML = "Direction: " + dir;
  }
  if (this._distance != false) {
    var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
    this._distance.innerHTML = "Distance: " + Math.round(stickDistance);
  }

  return dir;
  //(<HTMLElement>document.getElementById('debug1')).innerHTML = "Direction: " + dir;
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
	canvas.width	= 126;
	canvas.height	= 126;

	var ctx		= canvas.getContext('2d');
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

	return canvas;
}

/**
 * build the canvas for joystick stick
 */
VirtualJoystick.prototype._buildJoystickStick	= function()
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 86;
	canvas.height	= 86;
	var ctx		= canvas.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle	= this._strokeStyle;
	ctx.lineWidth	= 6;
	ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true);
	ctx.stroke();
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
			//this._calculateDirection();
		} else {
			style[this._transform] = 'translate(' + x + 'px,' + y + 'px)';
			//this._calculateDirection();
		}
	} else {
		style.left = x + 'px';
		style.top = y + 'px';
		//this._calculateDirection();
	}
	//this._calculateDirection();
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

/***/ 691:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(387);


/***/ })

},[691]);
//# sourceMappingURL=main.bundle.map