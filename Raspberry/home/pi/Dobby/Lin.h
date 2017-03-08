#pragma once
enum FrameType
{
	init, activation, message	//0, 1, 2
};

class Frame;

class Lin
{
public:
	Lin();
	~Lin();
	void setInitFrame(int data0, int data1, int data2, int data3, int data4,
		int data5, int data6, int data7, int data8);
	void setActivationFrame(int data0, int data1, int data2, int data3, int data4,
		int data5, int data6, int data7, int data8);
	void setMessageFrame(int data0, int data1, int data2, int data3, int data4,
		int data5, int data6, int data7, int data8);
	void getFrame();
	void startMotors(int directionLeft, int velocityLeft, int directionRight, int velocityRight);
	void stopMotors();
	void initializeSend();
	int linInitialize();

private:
	static int BAUDRATE;
	static int handle;
	Frame *initFrame;
	Frame *activationFrame;
	Frame *messageFrame;
	void sendInitFrame();
	void sendWakeUp();
	void sendActivationFrame();
	void sendMessageFrame();
	void setInitialContents();
	void sendSyncByte();
	void sendBreak();
};
