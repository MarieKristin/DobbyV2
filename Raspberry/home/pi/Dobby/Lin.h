#pragma once
#include <string>
#include <Frame.h>
#include "LogFiles.h"
enum FrameType
{
	init, activation, message	//0, 1, 2
};

class IOControl;
class Frame;
class LogFiles;
class Lin


{
public:
	Lin();
	Lin(IOControl *p_ioControl, LogFiles *p_logfiles);
	~Lin();
	void setInitFrame(int data0, int data1, int data2, int data3, int data4,
		int data5, int data6, int data7, int data8);
	void setActivationFrame(int data0, int data1, int data2, int data3, int data4,
		int data5, int data6, int data7, int data8);
	void setMessageFrame(int data0, int data1, int data2, int data3, int data4,
		int data5, int data6, int data7, int data8);
	void getFrame();
	void startMotorsInit();
	void startMotorsRoutine();
	int interpretControlString(std::string inputString, int ausloeser);
	void WarningMode();
	void stopMode();
	int directionLeft;
	int velocityLeft;
	int directionRight;
	int velocityRight;
	void circleRegulation();
	int directionLeftLast;
	int velocityLeftLast;
	int directionRightLast;
	int velocityRightLast;
	bool warningMode;
	bool gedrosselt;
private:
	int antriebsverhaeltnis;
	IOControl *ioControl;
	LogFiles *logfiles;
	static int BAUDRATE;
	static int handle;
	Frame initFrame;
	Frame activationFrame;
	Frame messageFrame;
	void sendInitFrame();
	void sendWakeUp();
	void sendActivationFrame();
	void sendMessageFrame();
	void setInitialContents();
	void sendSyncByte();
	void sendBreak();
};
