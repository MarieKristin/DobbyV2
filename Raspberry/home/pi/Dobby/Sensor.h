#pragma once

class IOControl;
class LogFiles;
class Sensor
{
public:
	Sensor();
	Sensor(IOControl *p_ioControl, LogFiles *logfiles);
	~Sensor();

	// Public Funktionen
	/* ***************************************** */
	/* Initialisierung der Sensor-Verbindung   	 */
	/* ***************************************** */
	int initialize();
	void startRoutine();

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


private:
	// Private Funktionen
	//Sensor
	//static int sockfd;				 // Socket-File-Description für Sensor
	//static int sens_init;			 // Sensor-Routine Enable ; 7=enable; 0=disable
	static int ausloeser;			 // Auslöserwinkel Gegenstand im Sensorfeld
	IOControl *ioControl;
	LogFiles *logfiles;
	/* ***************************************** */
	/* Socketadresse - IPv4 or IPv6: 	     */
	/* ***************************************** */
	void *get_in_addr(struct sockaddr *sa);



};
