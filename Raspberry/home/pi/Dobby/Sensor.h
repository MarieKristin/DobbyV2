#pragma once
class Sensor
{
public:
	Sensor();
	~Sensor();

	// Public Funktionen
	/* ***************************************** */
	/* Initialisierung der Sensor-Verbindung   	 */
	/* ***************************************** */
	void initialize();
	void startRoutine();

	void setAusloeser(int value);
	int getAusloeser();

	void setSocketFileDescription(int value);
	int getSocketFileDescription();

	void setSensorRoutine(int value);
	int getSensorRoutine();

	void closeSensor();

private:
	// Private Funktionen
	//Sensor
	static int sockfd;				 // Socket-File-Description f�r Sensor
	static int sens_init;			 // Sensor-Routine Enable ; 7=enable; 0=disable
	static int ausloeser;			 // Ausl�serwinkel Gegenstand im Sensorfeld


	/* ***************************************** */
	/* Socketadresse - IPv4 or IPv6: 	     */
	/* ***************************************** */
	void *get_in_addr(struct sockaddr *sa);



};
