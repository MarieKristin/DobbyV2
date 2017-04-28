#include <stdlib.h>
#include <stdarg.h>
#include <stdio.h>
#include <fcntl.h>
#include <termios.h>
#include <pigpio.h>
#include <iostream>
#include "IOControl.h"
using namespace std;

IOControl::IOControl(LogFiles *p_logfiles){
	logfiles = p_logfiles;
	serialHandle = 0;
	BAUDRATE = 19200;
}

IOControl::~IOControl(){

}

int IOControl::initialize(){
	cout << "Initialisierung PIGPIO";
	return gpioInitialise();
}

void IOControl::setToOutput(int pin){
	gpioSetMode(pin, PI_OUTPUT);
}

void IOControl::setToInput(int pin){
	gpioSetMode(pin, PI_INPUT);
}

void IOControl::setToAlternative(int pin){
	gpioSetMode(pin, PI_ALT0);
}

void IOControl::writePin(int pin, int value){
	gpioWrite(pin, value);
}

void IOControl::writeByte(int value){
	serWriteByte(getHandle(), value);
}

void IOControl::setDelay(int duration){
	gpioDelay(duration);
}

void IOControl::setDelay1(){
	gpioSleep(PI_TIME_RELATIVE, 5, 0);
}

void IOControl::setSleep(int duration){
	gpioSleep(PI_TIME_RELATIVE, 0, duration);
}

void IOControl::openSerial(){
	setHandle(serOpen("/dev/ttyAMA0", BAUDRATE, 0));
	cout << "[OK] UART opened\n";
}

void IOControl::closeSerial(){
	setHandle(serClose(getHandle()));
	cout << "[OK] UART Closed\n";
}

void IOControl::setHandle(int value){
	serialHandle = value;
}

int IOControl::getHandle(){
	return serialHandle;
}

/* ***************************************** */
/* Blinkfunktion zum Testen 		     */
/* ***************************************** */
unsigned int IOControl::blinken(int lampe, int geschwindigkeit) {
	int i = 0;
	while (i != 15) {
		gpioWrite(lampe, 1);
		gpioDelay(geschwindigkeit); // Warte 100 ms
		gpioWrite(lampe, 0);
		gpioDelay(geschwindigkeit); // Warte 100 ms
		i++;
	}
	return 1;
}

void IOControl::alleGPIOSAusschalten(){
	writePin(25, 0);
	writePin(8, 0);
	writePin(7, 0);
	writePin(12, 0);
	writePin(16, 0);
	writePin(20, 0);
	writePin(21, 0);
}
