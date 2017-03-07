#pragma once
enum FrameType
{
	init, activation, message	//0, 1, 2
};

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

private:
	int BAUDRATE = 19200;
	int handle = -1;
	Frame initFrame;
	Frame activationFrame;
	Frame messageFrame;
};
