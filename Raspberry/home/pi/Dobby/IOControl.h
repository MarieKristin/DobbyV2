#pragma once


class IOControl
{
public:
	IOControl();
	~IOControl();
	void setInit(int value);
	int getInit();
	// Public Funktionen

private:
	// Private Funktionen
	int BAUDRATE;
	int serialHandle;
	int init;
	int initialize();
	void setToOutput(int pin);
	void setToAlternative(int pin);
	void setToInput(int pin);
	void writePin(int pin, int value);
	void setDelay(int duration);
	void setSleep(int duration);
	void writeByte(int handle, int value);
	void closeSerial();
	void openSerial();
};
