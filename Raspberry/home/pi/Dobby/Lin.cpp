#include <stdlib.h>
#include <stdarg.h>
#include <stdio.h>
#include <fcntl.h>
#include <termios.h>
#include <pigpio.h>
#include "Frame.h"
#include "Lin.h"

int Lin::BAUDRATE = 19200;
int Lin::handle = -1;

Lin::Lin(IOControl *p_ioControl){
	ioControl = p_ioControl;
}

Lin::Lin()
{
	if (gpioInitialise() < 0)
	{
		printf("[FAIL] pigpio Initialisierung fehlgeschlagen\n");
	}
	else
	{
		printf("[OK] pigpio Initialisierung ok\n");
	}
}

Lin::~Lin()
{
	gpioTerminate();
}

void Lin::setInitFrame(int data0, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8)
{
	initFrame->setContent(data0, data1, data2, data3, data4, data5, data6, data7, data8);
}

void Lin::setActivationFrame(int data0, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8)
{
	activationFrame->setContent(data0, data1, data2, data3, data4, data5, data6, data7, data8);
}

void Lin::setMessageFrame(int data0, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8)
{
	messageFrame->setContent(data0, data1, data2, data3, data4, data5, data6, data7, data8);
}

void Lin::getFrame() {
	activationFrame->getFrame();
}

void Lin::stopMotors() {
	if (handle < 0) {
		initializeSend();
	}
	messageFrame->setContent(0x3C, 0x84, 0xAA, 0x00, 0x55, 0xA5, 0xAA, 0x00, 0xFF);
	sendWakeUp();
	gpioSleep(PI_TIME_RELATIVE, 0, 310000);
	sendInitFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);
	sendActivationFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);
	sendMessageFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);
	gpioDelay(2000);
}

void Lin::startMotors(int directionLeft, int velocityLeft, int directionRight,
	int velocityRight) {
	setInitialContents();
	if (handle < 0) {
		initializeSend();
	}
	messageFrame->setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
		directionRight, velocityRight, 0xFF);
	sendWakeUp();
	gpioSleep(PI_TIME_RELATIVE, 0, 310000);  //Warte 310ms
	sendInitFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);  //Warte 50ms
	sendActivationFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);  //Warte 50ms
	sendMessageFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);  //Warte 50ms
	gpioDelay(2000);
}

int Lin::linInitialize() {
	return gpioInitialise();
}

void Lin::setInitialContents() {
	initFrame->setID(init);
	messageFrame->setID(message);
	activationFrame->setID(activation);

	initFrame->setContent(0x3C, 0xA0, 0x02, 0x10, 0x84, 0xFF, 0xFF, 0xFF, 0xFF); //Checksum 0xC8
	activationFrame->setContent(0x3C, 0xAA, 0x9F, 0x0E, 0x0D, 0x01, 0xFF, 0xFF, 0xFF); //Checksum 0x99
	messageFrame->setContent(0x3C, 0x84, 0xAA, 0x00, 0x55, 0xA5, 0xAA, 0x00, 0xFF); //Checksum 2B
}

void Lin::sendSyncByte() {
	serWriteByte(handle, 0x55);
}

void Lin::sendWakeUp() {
	handle = serClose(handle);
	gpioSetMode(14, PI_OUTPUT);
	gpioWrite(14, 0);
	gpioSleep(PI_TIME_RELATIVE, 0, 70);  //Warte 1ms
	gpioWrite(14, 1);
	gpioSetMode(14, PI_ALT0);
	handle = serOpen("/dev/ttyAMA0", BAUDRATE, 0);
	gpioSleep(PI_TIME_RELATIVE, 0, 150000);
}

void Lin::sendBreak() {
	handle = serClose(handle);
	printf("[OK] UART Closed\n");
	gpioSetMode(14, PI_OUTPUT);
	gpioWrite(14, 0);
	printf("[OK] Set Output Low, wait 100ms\n");
	gpioSleep(PI_TIME_RELATIVE, 0, 680);  //Warte 680µs
	gpioWrite(14, 1);
	gpioSleep(PI_TIME_RELATIVE, 0, 20);  //Warte 680µs
	printf("[OK] Set Output High\n");
	gpioSetMode(14, PI_ALT0);
	handle = serOpen("/dev/ttyAMA0", BAUDRATE, 0);
}

void Lin::sendInitFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < initFrame->getSize(); i++) {
		serWriteByte(handle, initFrame->getFrame()[i]);
	}
}

void Lin::sendActivationFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < activationFrame->getSize(); i++) {
		serWriteByte(handle, activationFrame->getFrame()[i]);
	}
}

void Lin::sendMessageFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < messageFrame->getSize(); i++) {
		serWriteByte(handle, messageFrame->getFrame()[i]);
	}
}
void Lin::initializeSend() {
	handle = serOpen("/dev/ttyAMA0", BAUDRATE, 0);

	if (0 > handle) {
		printf("[ERROR] UART open\n");
	}
	else {
		printf("[OK] UART open\n");
	}
}
