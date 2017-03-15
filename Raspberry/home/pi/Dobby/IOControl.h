#pragma once

class LogFiles;
class IOControl
{
public:
	IOControl(LogFiles *p_logfiles);
	~IOControl();
	// Public Funktionen


	int BAUDRATE;
	int serialHandle;
	int initialize();
	void setToOutput(int pin);
	void setToAlternative(int pin);
	void setToInput(int pin);
	void writePin(int pin, int value);
	void setDelay(int duration);
	void setSleep(int duration);
	void writeByte(int value);
	void closeSerial();
	void openSerial();
	unsigned int blinken(int lampe, int geschwindigkeit);
	void setHandle(int value);
	int getHandle();

private:
        LogFiles *logfiles;


};
