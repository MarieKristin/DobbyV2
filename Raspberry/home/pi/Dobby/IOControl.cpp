#include <stdlib.h>
#include <stdarg.h>
#include <stdio.h>
#include <fcntl.h>
#include <termios.h>
#include <pigpio.h>
#include <iostream>

IOControl::IOControl(){
	BAUDRATE = 19200;
}

IOControl::~IOControl(){

}

void IOControl::setInit(int n_init){
	init = n_init,
}

int getInit(){
	return init;
}

int IOControl::initialize(){
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

void IOControl::setDelay(int duration){
	gpioDelay(duration);
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

void setHandle(int value){
	serialHandle = value;
}

int getHandle(){
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
