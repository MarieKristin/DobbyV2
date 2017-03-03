#ifndef LIN_H
#define LIN_H

extern int BAUDRATE;
extern int handle;

int linInitialise();
void initializeSend();
int setFrame(int id, int data0, int data1, int data2, int data3, int data4,
		int data5, int data6, int data7, int data8);
int getChecksum(int frame[]);
void sendMessageFrame();
void sendActivationFrame();
void sendBreak();
void sendWakeUp();
void sendSyncByte();
void setInitialContents();
void stopMotors();
void startMotors(int directionLeft, int velocityLeft, int directionRight, int velocityRight);

#endif /* LIN_H */
