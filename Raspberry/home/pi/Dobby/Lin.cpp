#include <stdlib.h>
#include <stdarg.h>
#include <stdio.h>
#include <fcntl.h>
#include <termios.h>
#include <pigpio.h>
#include "Frame.h"
#include "Lin.h"
#include "IOControl.h"
#define _GLIBCXX_USE_C99 1
#include <string>
#include <iostream>
#include <sstream>

using namespace std;


Lin::Lin(IOControl *p_ioControl, LogFiles *p_logfiles){
	ioControl = p_ioControl;
	logfiles = p_logfiles;
	warningMode = false;
}

Lin::Lin()
{
}

Lin::~Lin()
{
}

void Lin::setInitFrame(int data0, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8)
{
	initFrame.setContent(data0, data1, data2, data3, data4, data5, data6, data7, data8);
}

void Lin::setActivationFrame(int data0, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8)
{
	activationFrame.setContent(data0, data1, data2, data3, data4, data5, data6, data7, data8);
}

void Lin::setMessageFrame(int data0, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8)
{
	messageFrame.setContent(data0, data1, data2, data3, data4, data5, data6, data7, data8);
}

void Lin::getFrame() {
	activationFrame.getFrame();
}

void Lin::stopMotors() {
	if (ioControl->getHandle() < 0) {
		ioControl->openSerial();
	}
	messageFrame.setContent(0x3C, 0x84, 0xAA, 0x00, 0x55, 0xA5, 0xAA, 0x00, 0xFF);
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

void Lin::circleRegulation(){
	cout << "CIrcleCirculation" << endl;
	if(velocityLeft != 00 ||  velocityRight != 00){
	if (((directionLeftLast != directionRightLast) && (directionLeft == directionRight)) ||
				((directionLeftLast == directionRightLast) && (directionLeft != directionRight))){
			int veloLeft = velocityLeftLast;
			int veloRight = velocityRightLast;
			if(velocityLeftLast < velocityRightLast){
				while(velocityRightLast > 6){
                                	veloLeft = veloLeft/2;
                                	veloRight = veloRight/2;
					messageFrame.setContent(0x3C, 0x84, directionLeftLast, veloLeft, 0x55, 0xA5,
							directionRightLast, veloRight, 0xFF);
					sendMessageFrame();
                                	}
				}
			else{
				while(velocityLeftLast > 6){
					veloLeft = veloLeft/2;
					veloRight = veloRight/2;
					messageFrame.setContent(0x3C, 0x84, directionLeftLast, veloLeft, 0x55, 0xA5,
                                                        directionRightLast, veloRight, 0xFF);
                                        sendMessageFrame();
					}
				}
			}

	}
}


int Lin::interpretControlString(std::string inputString, int status){
		int help;
		std::stringstream puffer;

		//VelocityLeft//
		puffer  << (inputString.substr(3,2));
                puffer  >> std::hex >> velocityLeft;
                puffer.str("");
                puffer.clear();

		puffer  << (inputString.substr(0,2));
		puffer >> std::hex >> help; 
		cout << "InterpretString Help: " << help << "\n";
		cout << "InterpretString LastLeft: " << directionLeftLast << "\n";
		if( status == 0 || (status != 0 && (help != directionLeftLast))){
				 directionLeft = help;
					}
		else{
				if(status != 0 && velocityLeft == 0){
					messageFrame.setContent(0x3C, 0x84, directionLeftLast, 0x00, 0x55, 0xA5, directionRightLast, 0x00, 0xFF);
        				sendMessageFrame();
					return 2;
					}
				else{
					return 2;
					}}
		puffer.str("");
		puffer.clear();

		/*puffer  << (inputString.substr(3,2));
		puffer  >> std::hex >> velocityLeft;
		puffer.str("");
		puffer.clear();*/

		puffer  << (inputString.substr(6,2));
		puffer >> std::hex >> help;
		cout << "InterpretString Help: " << help << "\n";
                cout << "InterpretString LastRight: " << directionRightLast << "\n";
		if( status == 0 || (status != 0 && (help != directionRightLast))){
				directionRight = help;

					}
		else{
					return 2;
					}
		puffer.str("");
		puffer.clear();

		puffer  << (inputString.substr(9,2));
		puffer  >> std::hex >> velocityRight;
		return 1;
//		cout << "DirectLeft:" << directionLeft << " VeloLeft:"<< velocityLeft << " DirectRight: " << directionRight << " VeloRight: " << velocityRight << "\n\n";
}




void Lin::startMotorsInit(){
	setInitialContents();
	if (ioControl->getHandle() < 0) {
		ioControl->openSerial();
	}
	velocityLeft = 0;
	velocityRight = 0;
	//directionLeft = 170;
	//directionRight = 85;
	messageFrame.setContent(0x3C, 0x84, 0xAA, 0x00, 0x55, 0xA5, 0x55, 0x00, 0xFF);
	sendWakeUp();
	ioControl->setSleep(310000);  //Warte 310ms
	sendInitFrame();
	ioControl->setSleep(50000);  //Warte 50ms
	sendActivationFrame();
	ioControl->setSleep(50000);	 //Warte 50ms
	sendMessageFrame();
	ioControl->setSleep(50000);  //Warte 50ms
	ioControl->setDelay(2000);

	velocityLeftLast = 0;
	velocityRightLast = 0;
	directionLeftLast = 0xAA;
	directionRightLast = 0x55;
}

void Lin::startMotorsRoutine(){
	cout << "startMotorsRountine" << endl;
	messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
		directionRight, velocityRight, 0xFF);
	sendMessageFrame();
}


void Lin::setInitialContents() {
	initFrame.setID(init);
	messageFrame.setID(message);
	activationFrame.setID(activation);
	initFrame.setContent(0x3C, 0xA0, 0x02, 0x10, 0x84, 0xFF, 0xFF, 0xFF, 0xFF); //Checksum 0xC8
	activationFrame.setContent(0x3C, 0xAA, 0x9F, 0x0E, 0x0D, 0x01, 0xFF, 0xFF, 0xFF); //Checksum 0x99
	messageFrame.setContent(0x3C, 0x84, 0xAA, 0x00, 0x55, 0xA5, 0xAA, 0x00, 0xFF); //Checksum 2B
}


void Lin::sendSyncByte() {
	ioControl->writeByte(0x55);
}


void Lin::sendWakeUp() {
	ioControl->closeSerial();
	ioControl->setToOutput(14);
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
	ioControl->setToAlternative(14);
	ioControl->openSerial();
}


void Lin::sendInitFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < initFrame.getSize(); i++) {
		ioControl->writeByte(initFrame.getFrame()[i]);
	}
}

void Lin::sendActivationFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < activationFrame.getSize(); i++) {
		ioControl->writeByte(activationFrame.getFrame()[i]);
	}
}

void Lin::sendMessageFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < messageFrame.getSize(); i++) {
		ioControl->writeByte(messageFrame.getFrame()[i]);
	}
}

void Lin::WarningMode() {



/*	cout << "SensorWarningLevel" << endl;
	if(velocityLeft > velocityRight){
		int verhaeltnis = velocityLeft / velocityRight;
		while(velocityLeft > 27){
				velocityLeft = velocityLeft - 9;
                                velocityRight = velocityLeft/verhaeltnis;
                                messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
                                                        directionRight, velocityRight, 0xFF);
                                sendMessageFrame();
                                }


	}
	else{
		if(velocityLeft < velocityRight){
				int verhaeltnis = velocityRight / velocityLeft;
		                while(velocityRightLast > 27){
                	                velocityRight = velocityRight - 9;
                        	        velocityLeft = velocityRight/verhaeltnis;
                                	messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
                                                        directionRight, velocityRight, 0xFF);
                                	sendMessageFrame();
                                }

			}
		else{
			while(velocityLeft <= 27){
				velocityLeft = velocityLeft - 9;
				velocityRight = velocityRight - 9;
				messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
							directionRight, velocityRight, 0xFF);
				sendMessageFrame();
				}
			}

		}*/
}
