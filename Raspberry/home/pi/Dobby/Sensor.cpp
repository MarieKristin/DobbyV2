#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <netdb.h>
#include <syslog.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include "string.h"
#include "string"
#include "stdio.h"
#include "Sensor.h"
#include "IOControl.h"
#include "LogFiles.h"
#include "Lin.h"
#include <iostream>

#define PORT "2112"			 	// Port am Sensors
#define MAXDATASIZE 2000 		 // Max Datasize pro Datenausgabe des Sensors

using namespace std;

//Sensor
int Sensor::sockfd = 0;				 // Socket-File-Description für Sensor
int Sensor::sens_init = 0;			 // Sensor-Routine Enable ; 7=enable; 0=disable
int Sensor::ausloeser = 0;			 // Auslöserwinkel Gegenstand im Sensorfeld

Sensor::Sensor(IOControl *p_ioControl, LogFiles *p_logfiles, Lin *p_lin){
	lin = p_lin;
	ioControl = p_ioControl;
	logfiles = p_logfiles;
	ausloeser_entfernung = 65000;
}

Sensor::Sensor(){

}

Sensor::~Sensor(){

}

int Sensor::getSensInit(){
		int sensValue = sens_init;
		return sensValue;
	}


void Sensor::closeSensor(){
	int i = close(sockfd);
	ausloeser = 0;
	lin->gedrosselt = false;
	if(i == 0){setSensorRoutine(0);}
}

void Sensor::setAusloeser(int value){
	ausloeser = value;
}

int Sensor::getAusloeser(){
	return ausloeser;
}

void Sensor::setSocketFileDescription(int value){
	sockfd = value;
}

int Sensor::getSocketFileDescription(){
	return sockfd;
}

void Sensor::setSensorRoutine(int value){
	sens_init = value;
}

int Sensor::getSensorRoutine(){
	return sens_init;
}

void* Sensor::get_in_addr(struct sockaddr *sa) {

	if (sa->sa_family == AF_INET) {
		return &(((struct sockaddr_in*) sa)->sin_addr);
	}
	return &(((struct sockaddr_in6*) sa)->sin6_addr);
}

int Sensor::initialize() {
	logfiles->print_log(LOG_ERR, "SensorInit Start");

	const char* hostname = "192.168.111.111";
	int new_fd;
	int numbytes = 0;
	socklen_t addr_size;
	char buf[MAXDATASIZE];
	struct sockaddr_storage their_addr;
	struct addrinfo hints, *servinfo, *p;
	int rv;
	char s[INET6_ADDRSTRLEN];
	memset(&hints, 0, sizeof hints);
	hints.ai_family = AF_UNSPEC;
	hints.ai_socktype = SOCK_STREAM;
	hints.ai_flags = AI_PASSIVE;
	if ((rv = getaddrinfo(hostname, PORT, &hints, &servinfo)) != 0) {
		fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(rv));
		setSensorRoutine(1);
		return getSensorRoutine();
	}
	// loop through all the results and connect to the first we can
	for (p = servinfo; p != NULL; p = p->ai_next) { 				// Socket
		if ((sockfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol))
				== -1) {
			perror("client: socket");
			logfiles->print_log(LOG_ERR, "Sensor-Socket nicht erstellt");
			continue;
		}
		if (connect(sockfd, p->ai_addr, p->ai_addrlen) == -1) { 	// Connect
			// close(sockfd);
			perror("client: connect");
      	                logfiles->print_log(LOG_ERR, "Verbindung zum Socket fehlgeschlagen");
			continue;
		}
		break;
	}
	if (p == NULL) {
		fprintf(stderr, "client: failed to connect\n");
		logfiles->print_log(LOG_ERR, "Sensor nicht gefunden.");
		setSensorRoutine(2);
		return getSensorRoutine();
	}
	if (NULL
			!= inet_ntop(p->ai_family,
					get_in_addr((struct sockaddr *) p->ai_addr), s, sizeof s)) {
		printf("client: connecting to %s\n", s);
	}
	freeaddrinfo(servinfo);
	setSensorRoutine(7);
	logfiles->print_log(LOG_ERR, "SensorInit erfolgreich abgeschlossen");
	return getSensorRoutine();
}

int Sensor::startRoutine() {
	logfiles->print_log(LOG_ERR, "SensorRoutine Start");
	string msg = "\x02sRN LMDscandata\x03\0";
	int len = msg.size();
	int numbytes = 0;
	char buf[MAXDATASIZE];

	int sent = send(sockfd, msg.data(), len, 0);	 // Befehl zur Messwertanforderung
	if (sent != -1) {
//		printf("%s gesendet, %d Bytes\n", msg.data(), sent);
	}
	if (sent == -1) {
		logfiles->print_log(LOG_ERR, "Werte-Befehl senden fehlgeschlagen\n");
		printf("Senden fehlgeschlagen\n");
	}

//	ioControl->initialize();

	numbytes = recv(sockfd, buf, MAXDATASIZE - 1, 0);			// Empfang der Messwerte
	buf[numbytes] = '\0';							// Abschluss des Messwert-Strings
	char Messdateneinheit[6] = "DIST1";					// Startwert der Messkomponenten zur Auswertung
	int pos_search = 0;							//
	int pos_text = 0;							// Aktuelle Stelle im Suchstring
	int len_search = 5;							// Länge des Suchstringes (der Needle)
	int len_text = MAXDATASIZE;

	for (pos_text = 0; pos_text < len_text - len_search; ++pos_text)	// Funktion zum Suchen des Startwertes der Messkomponenten
			{
		if (buf[pos_text] == Messdateneinheit[pos_search]) {
			++pos_search;
			if (pos_search == len_search) {
				break;
			}
		} else {
			pos_text -= pos_search;
			pos_search = 0;
		}
	}

	int i = (pos_text - len_search) + 1;					// Position des 1. Buchstabes der Needle
	int k = 0;								// Laufvariablen
	char Messdateninhalt[6];						// 1. Argument
	char Skalierungsfaktor[9];						// 2. Argument
	char Skalierungsoffset[9];						// 3. Argument
	char Startwinkel[9];							// 4. Argument
	char Winkelschrittweite[5];						// 5. Argument
	char Anzahl_Daten[5];							// 6. Argument
	while (buf[i] != ' ') {
		Messdateninhalt[k] = buf[i];
		k++;
		i++;
	}
	Messdateninhalt[6] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Skalierungsfaktor[k] = buf[i];
		k++;
		i++;
	}
	Skalierungsfaktor[9] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Skalierungsoffset[k] = buf[i];
		k++;
		i++;
	}
	Skalierungsoffset[9] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Startwinkel[k] = buf[i];
		k++;
		i++;
	}
	Startwinkel[9] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Winkelschrittweite[k] = buf[i];
		k++;
		i++;
	}
	Winkelschrittweite[5] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Anzahl_Daten[k] = buf[i];
		k++;
		i++;
	}
	Anzahl_Daten[5] = '\0';
	i++;

	int l = 0;
	char Entfernung[5];										// Entfernung in mm
	int AnzahlDaten = (int) strtol(Anzahl_Daten, NULL, 16);
	int aktuelle_entfernung = 65000;
	for (k = 1; k < 181; k++) {

		while (buf[i] != ' ') {
			Entfernung[l] = buf[i];
			l++;
			i++;
		}

		if (l <= 5) {
			Entfernung[l] = '\0';
			}

		int entfernung = (int) strtol(Entfernung, NULL, 16);
		if (entfernung < 10) {
			}

		else {	if(aktuelle_entfernung > entfernung){
						aktuelle_entfernung = entfernung;
						aktueller_ausloeser = k;
						}
			}


		i++;
		l = 0;
	}
//	cout << "Aktuelle Entfernung: " << aktuelle_entfernung << "\n" ;
//	cout << "Aktueller Ausloeser: " << aktueller_ausloeser << "\n";
	lin->warningMode = false;
	if(aktuelle_entfernung < 600){
		if(aktuelle_entfernung < 350){
				if(ausloeser == 0){
					ausloeser = aktueller_ausloeser;
					ausloeser_entfernung = aktuelle_entfernung;
					logfiles->print_log(LOG_ERR, "SensorRoutine - STOP1 Auslöser: %d", ausloeser);
					return 3;}
				else{
					if(aktueller_ausloeser >= ausloeser-15 && aktueller_ausloeser <= ausloeser + 15 ){
						if(aktuelle_entfernung > ausloeser_entfernung){
									logfiles->print_log(LOG_ERR, "SensorRoutine - STOP2 Auslöser: %d", ausloeser);
									return 4;}
						else{
							logfiles->print_log(LOG_ERR, "SensorRoutine - STOP1 Auslöser: %d", ausloeser);
							return 3;}
					}

				}}
			else{		warning_ausloeser_alt = warning_ausloeser;
					warning_ausloeser = aktueller_ausloeser;
					ausloeser = 0;
					lin->warningMode = true;
					logfiles->print_log(LOG_ERR, "SensorRoutine - WARN Auslöser: %d", warning_ausloeser);
					return 2;
					}
		}
	else{
		if(ausloeser != 0){ausloeser = 0; warning_ausloeser_alt = 0; warning_ausloeser = 0;}
		if(lin->gedrosselt != false){lin->gedrosselt = false;}
		logfiles->print_log(LOG_ERR, "SensorRoutine - OK");
		return 1;
		}

//	printf("Ende-Sensor\n");
}



