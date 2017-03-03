/* ******************************************/
/* ******************************************/
/* Motor-Funktionen 			     		*/
/* ******************************************/
/* ******************************************/

#include <stdlib.h>
#include <stdarg.h>
#include <stdio.h>
#include <fcntl.h>
#include <termios.h>
#include <pigpio.h>
#include <lin.h>
#include <lin_p.h>

class Lin {
private:
	int BAUDRATE = 19200;
	int handle = -1;
	enum {
		message = 1, activation = 2, init = 3
	};
	struct frame{
		int id;
		int frameContent[10];
	} initFrame, messageFrame, activationFrame;
public:
	Lin(){
		if (gpioInitialise() < 0)
		{
			printf("[FAIL] PIGPIO Initialisierung fehlgeschlagen");
		}
		else
		{
			printf("[OK] PIGPIO Initialisierung ok");
		}
	}
	~Lin(){
		gpioTerminate();
		printf("[OK] PIGPIO beendet");
	}
};
/**
 *
 */
void initializeSend() {
	handle = serOpen("/dev/ttyAMA0", BAUDRATE, 0);

	if (0 > handle) {
		printf("[ERROR] UART open\n");
	} else {
		printf("[OK] UART open\n");
	}
}

/**
 *
 * @param id	Frame ID
 * @param data0 ID
 * @param data1	DB0
 * @param data2	DB1
 * @param data3	DB2
 * @param data4	DB3
 * @param data5	DB4
 * @param data6	DB5
 * @param data7	DB6
 * @param data8	DB7
 * @return 1 if the frame was set correctly, otherwise 0
 */
int setFrame(int id, int data0, int data1, int data2, int data3, int data4,
		int data5, int data6, int data7, int data8) {
	if (id == message) {
		messageFrame.frameContent[0] = data0;
		messageFrame.frameContent[1] = data1;
		messageFrame.frameContent[2] = data2;
		messageFrame.frameContent[3] = data3;
		messageFrame.frameContent[4] = data4;
		messageFrame.frameContent[5] = data5;
		messageFrame.frameContent[6] = data6;
		messageFrame.frameContent[7] = data7;
		messageFrame.frameContent[8] = data8;
		messageFrame.frameContent[9] = getChecksum(messageFrame.frameContent);
		return 1;
	}

	if (id == init) {
		initFrame.frameContent[0] = data0;
		initFrame.frameContent[1] = data1;
		initFrame.frameContent[2] = data2;
		initFrame.frameContent[3] = data3;
		initFrame.frameContent[4] = data4;
		initFrame.frameContent[5] = data5;
		initFrame.frameContent[6] = data6;
		initFrame.frameContent[7] = data7;
		initFrame.frameContent[8] = data8;
		initFrame.frameContent[9] = getChecksum(initFrame.frameContent);
		return 1;
	}

	if (id == activation) {
		activationFrame.frameContent[0] = data0;
		activationFrame.frameContent[1] = data1;
		activationFrame.frameContent[2] = data2;
		activationFrame.frameContent[3] = data3;
		activationFrame.frameContent[4] = data4;
		activationFrame.frameContent[5] = data5;
		activationFrame.frameContent[6] = data6;
		activationFrame.frameContent[7] = data7;
		activationFrame.frameContent[8] = data8;
		activationFrame.frameContent[9] = getChecksum(
				activationFrame.frameContent);
		return 1;
	}
	printf("Falsche oder unbekannte FrameID (%d)", id);
	return 0;
}
/**
 *
 * @param frame
 * @return
 */
int getChecksum(int frame[]) {
	int summe = 0;
	int i;

	for (i = 1; i < 9; i++) {
		summe += frame[i];
		if (summe > 255) {
			summe -= 255;
		}
	}
	return ~summe & 0xFF;
}

/**
 *
 */
void sendMessageFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < sizeof(messageFrame.frameContent); i++) {
		serWriteByte(handle, messageFrame.frameContent[i]);
	}
}

/**
 *
 */
void sendActivationFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < sizeof(activationFrame.frameContent); i++) {
		serWriteByte(handle, activationFrame.frameContent[i]);
	}
}

/**
 *
 */
void sendInitFrame() {
	sendBreak();
	sendSyncByte();
	int i;
	for (i = 0; i < sizeof(initFrame.frameContent); i++) {
		serWriteByte(handle, initFrame.frameContent[i]);
	}
}

/**
 *
 */
void sendBreak() {
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

/**
 *
 */
void sendWakeUp() {
	handle = serClose(handle);
	gpioSetMode(14, PI_OUTPUT);
	gpioWrite(14, 0);
	gpioSleep(PI_TIME_RELATIVE, 0, 70);  //Warte 1ms
	gpioWrite(14, 1);
	gpioSetMode(14, PI_ALT0);
	handle = serOpen("/dev/ttyAMA0", BAUDRATE, 0);
	gpioSleep(PI_TIME_RELATIVE, 0, 150000);
}

/**
 *
 */
void sendSyncByte() {
	serWriteByte(handle, 0x55);
}

/**
 *
 */
void setInitialContents() {
	messageFrame.id = message;
	activationFrame.id = activation;
	initFrame.id = init;
	setFrame(init, 0x3C, 0xA0, 0x02, 0x10, 0x84, 0xFF, 0xFF, 0xFF, 0xFF); //Checksum 0xC8
	setFrame(activation, 0x3C, 0xAA, 0x9F, 0x0E, 0x0D, 0x01, 0xFF, 0xFF, 0xFF); //Checksum 0x99
}

int linInitialise(){
	return gpioInitialise();
}

/**
 *
 * @param directionLeft
 * @param velocityLeft	value between 0 and 100 (0x64). The velocity of the left engine
 * @param directionRight
 * @param velocityRight value between 0 and 100 (0x64). The velocity of the right engine
 */
void startMotors(int directionLeft, int velocityLeft, int directionRight,
		int velocityRight) {
	setInitialContents();
	if (handle < 0) {
		initializeSend();
	}
	setFrame(message, 0x3C, 0x84, directionLeft, velocityLeft, 0x55, 0xA5,
			directionRight, velocityRight, 0xFF);
	sendWakeUp();
	gpioSleep(PI_TIME_RELATIVE, 0, 310000);  //Warte 310ms
	sendInitFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);  //Warte 50ms
	sendActivationFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);  //Warte 50ms
	sendMessageFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);  //Warte 50ms
	delay(2000);
}

/**
 *
 */
void stopMotors() {
	if (handle < 0) {
		initializeSend();
	}
	setFrame(message, 0x3C, 0x84, 0xAA, 0x00, 0x55, 0xA5, 0xAA, 0x00, 0xFF); //Checksum 2B
	sendWakeUp();
	gpioSleep(PI_TIME_RELATIVE, 0, 310000);
	sendInitFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);
	sendActivationFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);
	sendMessageFrame();
	gpioSleep(PI_TIME_RELATIVE, 0, 50000);
	delay(2000);
}
