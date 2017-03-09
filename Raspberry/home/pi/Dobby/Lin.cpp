#include <stdlib.h>
#include <stdarg.h>
#include <stdio.h>
#include <fcntl.h>
#include <termios.h>
#include <pigpio.h>
#include "Frame.h"
#include "Lin.h"


Lin::Lin(IOControl *p_ioControl){
	ioControl = p_ioControl;
}

Lin::Lin()
{
}

Lin::~Lin()
{
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
	if (ioControl->getHandle() < 0) {
		ioControl->openSerial();
	}
	messageFrame->setContent(0x3C, 0x84, 0xAA, 0x00, 0x55, 0xA5, 0xAA, 0x00, 0xFF);
	sendWakeUp();
	ioControl->setSleep(310000);
	sendInitFrame();
	ioControl->setSleep(50000);
	sendActivationFrame();
	ioControl->setSleep(50000);
	sendMessageFrame();
	ioControl->setSleep(50000);
	ioControl->setDelay(2000);
}

void Lin::startMotors(int directionLeft, int velocityLeft, int directionRight,
	int velocityRight) {
	setInitialContents();
	if (ioControl->getHandle() < 0) {
		ioControl->openSerial();
	}
	messageFrame->setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
		directionRight, velocityRight, 0xFF);
	sendWakeUp();
	ioControl->setSleep(310000);  //Warte 310ms
	sendInitFrame();
	ioControl->setSleep(50000);  //Warte 50ms
	sendActivationFrame();
	ioControl->setSleep(50000);	 //Warte 50ms
	sendMessageFrame();
	ioControl->setSleep(50000);  //Warte 50ms
	ioControl->setDelay(2000);
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
	ioControl->writeByte(0x55);
}

void Lin::sendWakeUp() {
	ioControl->closeSerial();
	ioControl->setToOutput(14)
	ioControl->writePin(14, 0);
	ioControl->setSleep(70);
	ioControl->writePin(14, 1);
	ioControl->setToAlternative(14);
	ioControl->openSerial();
	ioControl->setSleep(150000);
}

void Lin::sendBreak() {
	ioControl->closeSerial();
	ioControl->setToOutput(14);
	ioControl->writePin(14, 0);
	ioControl->setSleep(680);
	ioControl->writePin(14, 1);
	ioControl->setSleep(20);
	ipControl->setToAlternative(14);
	ioControl->openSerial();
}

void Lin::sendInitFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < initFrame->getSize(); i++) {
		ioControl->writeByte(initFrame->getFrame()[i]);
	}
}

void Lin::sendActivationFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < activationFrame->getSize(); i++) {
		ioControl->writeByte(activationFrame->getFrame()[i]);
	}
}

void Lin::sendMessageFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < messageFrame->getSize(); i++) {
		ioControl->writeByte(messageFrame->getFrame()[i]);
	}
}

