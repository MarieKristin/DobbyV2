#ifndef LIN_H
#define LIN_H

class Lin
{
public:
	Lin();
	~Lin();
	void startMotors(int directionLeft, int velocityLeft, int directionRight, int velocityRight);
	void stopMotors();
	void initialiseSend();
	int linInitialise();
private:
	int setFrame(int id, int data0, int data1, int data2, int data3, int data4,
			int data5, int data6, int data7, int data8);
	int getChecksum(int frame[]);
	void sendMessageFrame();
	void sendActivationFrame();
	void sendInitFrame();
	void sendBreak();
	void sendWakeUp();
	void sendSyncByte();
	void setInitialContents();
};
#endif /* LIN_H */
