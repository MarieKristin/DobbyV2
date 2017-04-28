#include <stdlib.h>
#include <stdarg.h>
#include <stdio.h>
#include <fcntl.h>
#include <termios.h>
#include <pigpio.h>
#include "Frame.h"
#include "Lin.h"
#include "LogFiles.h"
#include "IOControl.h"
#include <syslog.h>
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


void Lin::circleRegulation(){
/*	cout << "CIrcleCirculation" << endl;
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

	}*/
}


int Lin::interpretControlString(std::string inputString, int status){
		logfiles->print_log(LOG_INFO, "InterpretControlString - Start");
		int help;
		std::stringstream puffer;

		//VelocityLeft//
		puffer  << (inputString.substr(3,2));
                puffer  >> std::hex >> velocityLeft;
                puffer.str("");
                puffer.clear();
		puffer  << (inputString.substr(0,2));
		puffer >> std::hex >> help;
		if( status == 0 || (status != 0 && (help != directionLeftLast))){
				 directionLeft = help;
					}
		else{
				if(status != 0 && velocityLeft == 0){
					messageFrame.setContent(0x3C, 0x84, directionLeftLast, 0x00, 0x55, 0xA5, directionRightLast, 0x00, 0xFF);
        				sendMessageFrame();
						logfiles->print_log(LOG_ERR, "Control-Werte nicht erlaubt: Beachte Mode");
					return 2;
					}
				else{logfiles->print_log(LOG_ERR, "Control-Werte nicht erlaubt: Beachte Mode");
					return 2;
					}}
		puffer.str("");
		puffer.clear();


		puffer  << (inputString.substr(6,2));
		puffer >> std::hex >> help;
		if( status == 0 || (status != 0 && (help != directionRightLast))){
				directionRight = help;

					}
		else{		logfiles->print_log(LOG_ERR, "Control-Werte nicht erlaubt: Beachte Mode");
					return 2;
					}
		puffer.str("");
		puffer.clear();

		puffer  << (inputString.substr(9,2));
		puffer  >> std::hex >> velocityRight;
		logfiles->print_log(LOG_ERR, "InterpretControlString - Vel1.:%d Dir1.:%d Vel2.:%d Dir2.: %d", velocityLeft, directionLeft, velocityRight, directionRight);
		return 1;
}




void Lin::startMotorsInit(){
	logfiles->print_log(LOG_ERR, "MotorInit Start");
	setInitialContents();
	if (ioControl->getHandle() < 0) {
		ioControl->openSerial();
	}
	velocityLeft = 0;
	velocityRight = 0;
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
	
	logfiles->print_log(LOG_ERR, "MotorInit Ende");
}

void Lin::startMotorsRoutine(){
	logfiles->print_log(LOG_ERR, "Werte an Motor senden Start");
	messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5, directionRight, velocityRight, 0xFF);
	sendMessageFrame();
	logfiles->print_log(LOG_ERR, "Werte an Motor senden ENDE");
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

void Lin::stopMode(){
	messageFrame.setContent(0x3C, 0x84, directionLeftLast, 0x00, 0x55, 0xA5, directionRightLast, 0x00, 0xFF);
        sendMessageFrame();
}


void Lin::WarningMode() {
	logfiles->print_log(LOG_ERR, "WarningMode Start");
	/*cout << "SensorWarningLevel" << endl;
	cout << warningMode << "\n";
	cout << "VelocityLeft: " << velocityLeft << endl;
	cout << "VelocityLeftLast: " << velocityLeftLast << endl;
	cout << "DirectionLeft: " << directionLeft << endl;
	cout << "VelocityRight: " << velocityRight << endl;
	cout << "VelocityRightLast: " << velocityRightLast << endl;
	cout << "DirectionRight: " << directionRight << endl;
*/

if((velocityLeftLast <= 27 || velocityRightLast <= 27) && gedrosselt == true){
	
	if(velocityLeft > 0 && velocityRight > 0){
			cout << "drossel";
			if(antriebsverhaeltnis != (velocityLeft/velocityRight)){
						cout << "drosssel1" << endl;
						goto neuerSchritt;
			}
			else if(velocityLeft < velocityLeftLast){
						cout << "drosssel2" << endl;
				messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5, directionRight, velocityRight, 0xFF);
                                sendMessageFrame();
			}
			else if(velocityRight < velocityRightLast){
						cout << "drosssel3" << endl;
				messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5, directionRight, velocityRight, 0xFF);
                                sendMessageFrame();
			}
			else{
			cout << "drosssel4" << endl;
			velocityLeft = velocityLeftLast;
			velocityRight = velocityRightLast;
			}
		}
	else{			messageFrame.setContent(0x3C, 0x84, directionLeft, 0x00, 0x55, 0xA5, directionRight, 0x00, 0xFF);
                                sendMessageFrame();
		
		}
	}
else{	neuerSchritt:
	if(velocityLeft > 27 || velocityRight > 27){
			logfiles->print_log(LOG_ERR, "Drosselungsprozess Start - Routine 1");	
			cout << "Routine 1\n";

			if(velocityLeft > velocityRight){
				antriebsverhaeltnis = velocityLeft / velocityRight;
				logfiles->print_log(LOG_ERR, "Drosselungsprozess - Option1");
				cout << "Option 1\n";
				while(velocityLeft > 27){
						velocityLeft = velocityLeft - 9;
                                		velocityRight = velocityLeft/antriebsverhaeltnis;
                                		messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
                                                		        directionRight, velocityRight, 0xFF);
                                		sendMessageFrame();
                                		}
				gedrosselt = true;
			}
			else{
				if(velocityLeft < velocityRight){
						cout << "Option 2\n";
						logfiles->print_log(LOG_ERR, "Drosselungsprozess - Option2");
						antriebsverhaeltnis = velocityRight / velocityLeft;
		                		while(velocityRight > 27){
                	                		velocityRight = velocityRight - 9;
                        	        		velocityLeft = velocityRight/antriebsverhaeltnis;
                               				messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
                                                       		directionRight, velocityRight, 0xFF);
                         				sendMessageFrame();
                                		}
					gedrosselt = true;
					}
				else{
					antriebsverhaeltnis = 1;
					while(velocityLeft > 27){
						cout << "Option 3\n";
						logfiles->print_log(LOG_ERR, "Drosselungsprozess - Option3");
						velocityLeft = velocityLeft - 9;
						velocityRight = velocityRight - 9;
						messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
									directionRight, velocityRight, 0xFF);
						sendMessageFrame();
						}
					gedrosselt = true;
					}

				}
			}
	else{
			cout << "Routine 2\n";
			logfiles->print_log(LOG_ERR, "Drosselungsprozess Start - Routine 2");	
			 messageFrame.setContent(0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
                                      		               directionRight, velocityRight, 0xFF);
                             		 sendMessageFrame();

			}

	

}
/*
        cout << "VelocityLeft: " << velocityLeft << endl;
        cout << "VelocityLeftLast: " << velocityLeftLast << endl;
        cout << "DirectionLeft: " << directionLeft << endl;
        cout << "VelocityRight: " << velocityRight << endl;
        cout << "VelocityRightLast: " << velocityRightLast << endl;
        cout << "DirectionRight: " << directionRight << endl;*/
		
		logfiles->print_log(LOG_ERR, "WarningMode Ende");

}
