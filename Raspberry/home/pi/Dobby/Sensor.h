#pragma once

class IOControl;
class LogFiles;
class Lin;
class Sensor
{
public:
	Sensor();
	Sensor(IOControl *p_ioControl, LogFiles *logfiles, Lin *p_lin);
	~Sensor();

	int initialize();
	int startRoutine();

	void setAusloeser(int value);
	int getAusloeser();

	void setSocketFileDescription(int value);
	int getSocketFileDescription();
	int getSensInit();
	void setSensorRoutine(int value);
	int getSensorRoutine();
	static int sens_init;
	void closeSensor();
	static int sockfd;
	int warning_ausloeser;
	
	static int ausloeser;
	int ausloeser_entfernung;

	void stopMode();

private:
	Lin *lin;
	IOControl *ioControl;
	LogFiles *logfiles;
	//void stopMode();

	int aktuelle_entfernung;
	int aktueller_ausloeser;


	void *get_in_addr(struct sockaddr *sa);



};
