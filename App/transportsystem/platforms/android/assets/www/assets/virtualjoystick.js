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
