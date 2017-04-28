/*
 * Copyright (C) Lukasz Skalski <lukasz.skalski@op.pl>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * aalong with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

#include "LogFiles.h"
#include "Timer.h"

//Bibliothek für Socket-Verbindung zwischen Raspberry und Handy
#include <gio/gio.h>
#include <glib-unix.h> 			// Commandline-Bibliothek
#include <string>
#include <string.h>
#include <stdio.h>
#include <syslog.h>
#include <jansson.h>
#include <libwebsockets.h>
#include <iostream>
#include <fstream>

//Bibliotheken für Sensor
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <netdb.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include "Sensor.h"

//Bibliotheken für Motor
#include <termios.h>
#include <pigpio.h>
#include "Lin.h"
#include "Frame.h"
#include "IOControl.h"
#include "Global.h"

#include <pthread.h>

using namespace std;

#define MAX_PAYLOAD 10000		 // Max Datasize der Socket-Verbindungen pro Task
#define BACKLOG 20 			 // Maximale Verbindungen in der Warteschlage

static bool cover;
static bool manuellerModus;
int pin;

pthread_t warning_blinken_21;
pthread_t warning_blinken_20;
pthread_t warning_blinken_16;
pthread_t warning_blinken_12;
pthread_t warning_blinken_7;
pthread_t warning_blinken_8;
pthread_t warning_blinken_25;
pthread_t init_blinken;
int warningBlinkenID_21;
int warningBlinkenID_20;
int warningBlinkenID_16;
int warningBlinkenID_12;
int warningBlinkenID_7;
int warningBlinkenID_8;
int warningBlinkenID_25;


void *blinken(void* platzhalter){

	while(TRUE){
		ioControl->writePin((int)platzhalter, 0);
		ioControl->writePin((int)platzhalter, 1);
		ioControl->setDelay(100000);
		ioControl->writePin((int)platzhalter, 0);
		ioControl->setDelay(100000);
	}

}

void blinken_beenden(){
	logfiles->print_log(LOG_INFO, "blinken_beenden %d START",pin);

	if(warningBlinkenID_21 == 0){pthread_cancel(warning_blinken_21);
					ioControl->writePin(21, 0);
					warningBlinkenID_21 = -1;
					}
	if(warningBlinkenID_20 == 0){pthread_cancel(warning_blinken_20);
					ioControl->writePin(20, 0);
					warningBlinkenID_20 = -1;
                                        }
	if(warningBlinkenID_16 == 0){pthread_cancel(warning_blinken_16);
                                        ioControl->writePin(16, 0);
					warningBlinkenID_16 = -1;
					}
	if(warningBlinkenID_12 == 0){pthread_cancel(warning_blinken_12);
                                        ioControl->writePin(12, 0);
					warningBlinkenID_12 = -1;
					}
	if(warningBlinkenID_7 == 0){pthread_cancel(warning_blinken_7);
                                        ioControl->writePin(7, 0);
					warningBlinkenID_7 = -1;
					}
	if(warningBlinkenID_8 == 0){pthread_cancel(warning_blinken_8);
					ioControl->writePin(8, 0);
					warningBlinkenID_8 = -1;
                                        }
	if(warningBlinkenID_25 == 0){pthread_cancel(warning_blinken_25);
                                        ioControl->writePin(25, 0);
					warningBlinkenID_25 = -1;
					}

	pin = -1;
	logfiles->print_log(LOG_INFO, "blinken_beenden %d BEENDET",pin);	

}


//WebSocketServer
static struct libwebsocket_context *context;
char *notification;
gboolean opt_no_daemon = FALSE;
gboolean exit_loop = FALSE;
gboolean send_notification = FALSE;
gint port = 2609;
int signal_id = 0;
GOptionContext *option_context = NULL;
gint exit_value = EXIT_SUCCESS;
struct termios options;
int anzahlVerbindungen;

/* ***************************************** */
/* ***************************************** */
/* Socket-Funktionen 			     */
/* ***************************************** */
/* ***************************************** */
#ifdef HAVE_SYSTEMD
#include <systemd/sd-journal.h>
#endif

/* ***************************************** */
/* Commandline Optionen des Servers im Linux */
/* ***************************************** */
GOptionEntry entries[] = { { "no-daemon", 'n', 0, G_OPTION_ARG_NONE,
		&opt_no_daemon, "Don't detach WebSocketsServer into the background",
		NULL },		 // LongName, shortName, flags,
		// OptionArgument, Argument_Data,
		// Erklärung; App ermöglicht kein
		// Background-Laufen
		{ "port", 'p', 0, G_OPTION_ARG_INT, &port,
				"Port number [default: 8080]", NULL }, // LongName, shortName, flags, OptionArgument, Argument_Data, Erklärung
		{ NULL } };

/* ***************************************** */
/* Daten-Struct */
/* ***************************************** */
struct per_session_data {
	unsigned char buf[LWS_SEND_BUFFER_PRE_PADDING + MAX_PAYLOAD
			+ LWS_SEND_BUFFER_POST_PADDING]; 					// Daten
	unsigned int len; 									// Länge
	unsigned int index; 									// Index
};

/* ***************************************** */
/* Interrupt durch Tastatur ausgel�st 	     */
/* ***************************************** */
static gboolean sigint_handler() {
	libwebsocket_cancel_service(context); 							// Beende Service
	exit_loop = TRUE; 									// Beende While-Schleife
	return TRUE;
}

unsigned int manuelleMotorroutine(struct libwebsocket *wsi, unsigned char *data, unsigned char *buffer){

	timer ManuRout;
	string s_data = reinterpret_cast<char*>(data);
	json_t *reply_obj;
	char *reply_str;
	char *reply;
	int reply_len;
	asprintf(&reply, "You typed \"%s\"", data);
	logfiles->print_log(LOG_INFO, "Manuelle Motorroutine %s",data);
	int ausgefuehrt = 0;
	int test = s_data.compare("STOP");
	int hilf = -1;
	if(test == 0){
		
		ioControl->writePin(3, 0);
		lin->stopMode();
		manuellerModus = false;
//		cout << "STOP_DONE!" << endl;
		ausgefuehrt = 1;
	}

	test = s_data.compare("sensON");
	const char *status = "";
	if(test == 0){
		if((hilf = sensor->sens_init) == 0 || (hilf = sensor->sens_init) == 1 ||(hilf = sensor->sens_init) == 2 ||(hilf = sensor->sens_init) == -1 ){
			if(hilf == -1){hilf = 0;} // Zur Sicherstellung, dass korrekte Antwort gesendet wird
			sensor->initialize();
			if(sensor->sens_init == 7){
				ioControl->writePin(2, 1);
				sensor->startRoutine();
				//status = "ON";
			}
			else{
				//status = "OFF";
			}
		}
		ausgefuehrt = 1;
	}

	test = s_data.compare("sensOFF");
	if(test == 0){
		sensor->closeSensor();
		if(hilf == -1){hilf = 0;} // Zur Sicherstellung, dass korrekte Antwort gesendet wird
		if(sensor->sens_init != 7){
                             ioControl->writePin(2, 0);   //status = "OFF";
                        }
                        else{
                                //status = "ON";
                        }

		ausgefuehrt = 1;
	}

	if(ausgefuehrt == 0){
		int status = lin->interpretControlString(s_data, sensor->ausloeser);
		if(status == 1){

				if(sensor->sens_init == 7){

						int rueckgabewert = sensor->startRoutine();
							if(rueckgabewert == 1){
								if(pin != -1){blinken_beenden();}
								lin->startMotorsRoutine();
								}
							if(rueckgabewert == 2){
								int ausloeser = sensor->warning_ausloeser;
							        if(pin != -1){blinken_beenden();}
								if(ausloeser > 152 && ausloeser < 180){
										if(warningBlinkenID_25 == 0){pthread_cancel(warning_blinken_25);} pin = 25;
                                                                                warningBlinkenID_25 = pthread_create (&warning_blinken_25, NULL, blinken, (void*)25);}
								 else if(ausloeser > 127 && ausloeser < 151){
										if(warningBlinkenID_8 == 0){pthread_cancel(warning_blinken_8);} pin = 8;
										 warningBlinkenID_8 = pthread_create (&warning_blinken_8, NULL, blinken, (void*)8);}
        							 else if(ausloeser> 101 && ausloeser < 126){
										if(warningBlinkenID_7 == 0){pthread_cancel(warning_blinken_7);} pin = 7;
                                                                                 warningBlinkenID_7 = pthread_create (&warning_blinken_7, NULL, blinken, (void*)7);}
        							 else if(ausloeser > 76 && ausloeser < 100){
										if(warningBlinkenID_12 == 0){pthread_cancel(warning_blinken_12);} pin = 12;
                                                                                 warningBlinkenID_12 = pthread_create (&warning_blinken_12, NULL, blinken, (void*)12);}
        							 else if(ausloeser > 52 && ausloeser < 75){
										if(warningBlinkenID_16 == 0){pthread_cancel(warning_blinken_16);} pin = 16;
                                                                                 warningBlinkenID_16 = pthread_create (&warning_blinken_16, NULL, blinken, (void*)16);}
        							 else if(ausloeser > 26 && ausloeser < 51){
										if(warningBlinkenID_20 == 0){pthread_cancel(warning_blinken_20);} pin = 20;
                                                                                 warningBlinkenID_20 = pthread_create (&warning_blinken_20, NULL, blinken, (void*)20);}
        							 else if(ausloeser > 0 && ausloeser < 25){
										if(warningBlinkenID_21 == 0){pthread_cancel(warning_blinken_21);} pin = 21;
                                                                                 warningBlinkenID_21 = pthread_create (&warning_blinken_21, NULL, blinken, (void*)21);}

								// ueberspringen:
								lin->WarningMode();
								// Implements WarningModeRoutine
								}
							if(rueckgabewert == 3){	//StopMode
								if(pin != -1){blinken_beenden();}

								ioControl->alleGPIOSAusschalten();
                                                                int ausloeser = sensor->ausloeser;
                                                                logfiles->print_log(LOG_INFO, "Ausloeser %d", ausloeser);
                                                                if(ausloeser > 152 && ausloeser < 180){ ioControl->writePin(25, 1);}
                                                                 else if(ausloeser > 127 && ausloeser < 151){ ioControl->writePin(8, 1);}
                                                                 else if(ausloeser> 101 && ausloeser < 126){ ioControl->writePin(7, 1);}
                                                                 else if(ausloeser > 76 && ausloeser < 100){ ioControl->writePin(12, 1);}
                                                                 else if(ausloeser > 52 && ausloeser < 75){ ioControl->writePin(16, 1);}
                                                                 else if(ausloeser > 26 && ausloeser < 51){ ioControl->writePin(20, 1);}
                                                                 else if(ausloeser > 0 && ausloeser < 25){ ioControl->writePin(21, 1);}

								if(lin->velocityLeftLast != 0){
								lin->stopMode();}
								}
							if(rueckgabewert == 4){ // ggf. ab 2. STOP-Aufruf
								if(pin!= -1){blinken_beenden();}
								ioControl->alleGPIOSAusschalten();
                                                                int ausloeser = sensor->ausloeser;
                                                                if(ausloeser > 152 && ausloeser < 180){ ioControl->writePin(25, 1);}
                                                                 else if(ausloeser > 127 && ausloeser < 151){ ioControl->writePin(8, 1);}
                                                                 else if(ausloeser> 101 && ausloeser < 126){ ioControl->writePin(7, 1);}
                                                                 else if(ausloeser > 76 && ausloeser < 100){ ioControl->writePin(12, 1);}
                                                                 else if(ausloeser > 52 && ausloeser < 75){ ioControl->writePin(16, 1);}
                                                                 else if(ausloeser > 26 && ausloeser < 51){ ioControl->writePin(20, 1);}
                                                                 else if(ausloeser > 0 && ausloeser < 25){ ioControl->writePin(21, 1);}

								lin->startMotorsRoutine();
								goto Notausgang;
								}
							}
				else{
							lin->startMotorsRoutine();
						}

	}

		else{ // if status == 2

			if(sensor->sens_init == 7){
						sensor->startRoutine();}
			goto Notausgang;
		}

	if(sensor->ausloeser == 0){
	lin->velocityLeftLast = lin->velocityLeft;
	lin->velocityRightLast = lin->velocityRight;
	lin->directionLeftLast = lin->directionLeft;
	lin->directionRightLast = lin->directionRight;}


	}//ganz außen*/

	Notausgang: cout << "Notausgang\n\n";

if(sensor->sens_init != 7){status = "OFF";}
else{

	if(lin->warningMode == TRUE){status ="WARN";}
	else if(sensor->ausloeser != 0){status = "STOP";}
	else if(sensor->ausloeser == 0){status = "OK";}
	}

cout << "Status: " << status << "\n";


	reply_obj = json_pack("{s:s, s:s, s:s}", "Type", "standard", "Message", reply, "Sensor", status);

	reply_str = json_dumps(reply_obj, 0);
	reply_len = strlen(reply_str); 						// Länge der Antwort
	memcpy(buffer, reply_str, reply_len); 					// Kopie an Zieladresse "buffer" von Antwort-Pointer, Länge der Antwort
	json_decref(reply_obj); 						// gibt das JSON-Objekt frei
	free(reply); 								// gibt den String Antwort frei
	free(reply_str); 							// gibt den String "reply_str" frei
	ManuRout.stop();
	cout << ManuRout << endl;
	return reply_len;

}






/* ***************************************** */
/* Antwortnachricht vorbereiten */
/* ***************************************** */
unsigned int prepare_reply(struct libwebsocket *wsi, unsigned char *data,
		unsigned char *buffer) {
	string s_data = reinterpret_cast<char*>(data);
	json_t *reply_obj;
	char *reply_str;
	char *reply;
	int reply_len;
	int ausgefuehrt = 0;
	int hilf = -1;
	asprintf(&reply, "You typed \"%s\"", data);				// Füge zu den eigegebenen Daten "you typed" hinzu und schreibe in reply
	logfiles->print_log(LOG_INFO, "Allgemeine Routine %s",data);
	string manuell = "manuell";
	int test = s_data.compare(manuell); 					// Vergleiche ob das eigegebene Wort dem Wert von "lampe" entspricht
	const char* sensorHilf;
	if (test == 0) {
		ioControl->writePin(3, 1);
		lin->startMotorsInit();
		manuellerModus = true;
		pin = -1;
		hilf = sensor->getSensInit();
		if(hilf != 7){
			sensorHilf = "OFF";
		}
		else{
			sensorHilf = "ON";
		}
	}
	test = 7;

	string automatik = "automatik";							// == 0 ? -> ist gleich
	test = s_data.compare(automatik);
	if (test == 0) {
		pthread_create (&init_blinken, NULL, blinken, (void*)3);
		system("/etc/init.d/livestream.sh start &");
	}
	test = 7;

	string manuStop = "STOP";
	test = s_data.compare(manuStop);
	if (test == 0) {
		pthread_cancel(init_blinken);
		system("/etc/init.d/livestream.sh stop &");
	}
	test = 7;

	string sensInit = "SensInit";
	test = s_data.compare(sensInit);
	if (test == 0) {
		sensor->initialize();
		if(sensor->getSensorRoutine() == 7){
				ioControl->writePin(2, 1);
		}	
	}
	test = 7;
	string sensOut = "SensOff";
	test = s_data.compare(sensOut);
	if (test == 0) {
		sensor->closeSensor();
			if(sensor->getSensorRoutine() == 0){
					ioControl->writePin(2,0);
				}
			}
		
	
	cover = true;

	if(hilf == -1 ){
	reply_obj = json_pack("{s:s, s:s}", "Type", "standard", "Message", reply); // Erstellung JSON-Objekt -> "Type standart", "Message REPLY"
	}
	else{
	reply_obj = json_pack("{s:s, s:s, s:s}", "Type", "standard", "Message", reply, "Sensor", sensorHilf);
	}
	reply_str = json_dumps(reply_obj, 0);
	reply_len = strlen(reply_str); 						// Länge der Antwort
	memcpy(buffer, reply_str, reply_len); 					// Kopie an Zieladresse "buffer" von Antwort-Pointer, Länge der Antwort
	json_decref(reply_obj); 						// gibt das JSON-Objekt frei
	free(reply); 								// gibt den String Antwort frei
	free(reply_str); 							// gibt den String "reply_str" frei
	return reply_len; 							// gibt die Länge der Antwort zurück
}

/* 	*****************************************	*/
/* 	callback-Funktionen				*/
/* 	*****************************************	*/
static int my_callback(struct libwebsocket_context *context,
		struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
		void *user, void *in, size_t len) {

	struct per_session_data *psd = (struct per_session_data*) user;
	int nbytes;

	switch (reason) {

	case LWS_CALLBACK_ESTABLISHED:			// Eintrag sys-LogFile (/var/log/syslog)
		ioControl->writePin(18, 1);
		anzahlVerbindungen++;
		logfiles->print_log(LOG_INFO, "(%p) (callback) connection established\n", wsi);
		break;

	case LWS_CALLBACK_CLOSED:			// Eintrag sys-LogFile (/var/log/syslog)
		anzahlVerbindungen--;
		if(anzahlVerbindungen == 0){ioControl->writePin(18, 0);}
		logfiles->print_log(LOG_INFO, "(%p) (callback) connection closed\n", wsi);
		break;

	case LWS_CALLBACK_SERVER_WRITEABLE:		// Anfrage beantwortet (Part 2 von 2)

		nbytes = libwebsocket_write(wsi, &psd->buf[LWS_SEND_BUFFER_PRE_PADDING],
				psd->len, LWS_WRITE_TEXT);
		memset(&psd->buf[LWS_SEND_BUFFER_PRE_PADDING], 0, psd->len);
		logfiles->print_log(LOG_INFO, "(%p) (callback) %d bytes written\n", wsi, nbytes);
		if (nbytes < 0) {
			logfiles->print_log(LOG_ERR,
					"(%p) (callback) %d bytes writing to socket, hanging up\n",
					wsi, nbytes);
			return 1;
		}
		if (nbytes < (int) psd->len) {
			logfiles->print_log(LOG_ERR, "(%p) (callback) partial write\n", wsi);
			return -1; /*TODO*/
		}
		break;

	case LWS_CALLBACK_RECEIVE:					// Anfrage bekommen (Part 1 von 2)
		logfiles->print_log(LOG_INFO, "(%p) (callback) received %d bytes\n", wsi,
				(int) len);				// Pro "Symbol" ein Byte
		if (len > MAX_PAYLOAD) {
			logfiles->print_log(LOG_ERR,
					"(%p) (callback) packet bigger than %u, hanging up\n", wsi,
					MAX_PAYLOAD);			// Falls maximale Länge erreicht
			return 1;
		}

		if(manuellerModus == false){				//bei manuellem Modus wird Bit gesetzt -> dann nur Steuerbefehle
		psd->len = prepare_reply(wsi, (unsigned char*) in, &psd->buf[LWS_SEND_BUFFER_PRE_PADDING]);
				if (psd->len > 0) {
					libwebsocket_callback_on_writable(context, wsi);
				}}
		else{
		psd->len = manuelleMotorroutine(wsi, (unsigned char*) in, &psd->buf[LWS_SEND_BUFFER_PRE_PADDING]);
				if (psd->len > 0) {
					libwebsocket_callback_on_writable(context, wsi);
				}}

		break;

	default:
		break;
	}

	return 0;
}

/* ***************************************** */
/* Beschreibung des Protokolls 		     */
/* ***************************************** */
static struct libwebsocket_protocols protocols[] = { { "my_protocol", 		// Protokoll-Name
		my_callback, 							// Callback-Funktion
		sizeof(struct per_session_data) }, 				// Datengröße je Session
		{ NULL, NULL, 0 } };

/* ***************************************** */
/* Initialisierung WebSocket 		     */
/* ***************************************** */
int WebSocket_initialisierung(int argc, char **argv) {
	GError *error = NULL;
	gint signal_id = 0;
	struct lws_context_creation_info info;

	/* Phase 1: Optionen Überprüfen	   */
	/* Commandline Optionen Überprüfen */
	option_context = g_option_context_new("- WebSocketsServer"); 		// WebSockets-Optionen deklarieren z.B. <Pfad> -h --no-daemon
	g_option_context_add_main_entries(option_context, entries, NULL); 	// Optionen hinzufügen
	if (!g_option_context_parse(option_context, &argc, &argv, &error)) 	// Überprüft/Parst die Command-Line-Options -> keine Fehler: TRUE
			{
		g_printerr("%s: %s\n", argv[0], error->message);
		exit_value = EXIT_FAILURE;
		return -1;
	}
	if (!opt_no_daemon
			&& lws_daemonize("/var/run/lock/.websocketsserver-lock")) {
		g_printerr("%s: failed to daemonize\n", argv[0]);
		exit_value = EXIT_FAILURE;
		return -1;
	}

	/* Phase 2: Open Syslog */
#ifndef HAVE_SYSTEMD
	openlog("WebSocketsServer", LOG_NOWAIT | LOG_PID, LOG_USER);
#endif

	/* Phase 3: Initialisierung Server-Eigenschaften */
	/* Minimalkonfiguration			   */
	/* fill 'lws_context_creation_info' struct 	   */
	memset(&info, 0, sizeof info); 								// Speicherreservierung
	info.port = port; 									// Port für die Verbindung
	info.iface = "wlan0";
	//info.iface = NULL; 									// keine Wertzuweisung
	info.protocols = protocols; // Beschreibung des Protokolls in Zeile 284 (struct)
	info.extensions = libwebsocket_get_internal_extensions();
	info.gid = -1; 										// Gruppen-ID
	info.uid = -1; 										// User-ID
	info.options = 0;
	info.ssl_cert_filepath = NULL; 								// keine Wertzuweisung
	info.ssl_private_key_filepath = NULL; 							// keine Wertzuweisung

	/* Phase 4: Interrupt durch Tastatur */
	/* handle SIGINT		       */
	signal_id = g_unix_signal_add(SIGINT, (GSourceFunc) sigint_handler, NULL); // Signalnummer (2), Funktionsaufruf

	/* Phase 5: Erstellung "listening" - Serverinstanz */
	/* create context 				    */
	context = libwebsocket_create_context(&info);
	if (context == NULL) {
		logfiles->print_log(LOG_ERR, "(main) libwebsocket context init failed\n");
		return -1;
	}
	logfiles->print_log(LOG_INFO, "(main) context - %p\n", context);

}

/* ***************************************** */
/* ***************************************** */
/* main function 			     */
/* ***************************************** */
/* ***************************************** */
int main(int argc, char **argv) { // argc = Pointer auf Anzahl der Command-Argumente; argv = Pointer auf Command-Array
	logfiles->print_log(LOG_INFO, "Dobby-Programm Start");
	gint cnt = 0;
	anzahlVerbindungen = 0;

	fstream myfile;
	string line = "1";
	myfile.open("/home/pi/Boot/release/wert.txt", ios::out);
	myfile << "1";
	myfile.close();

	while(line == "1"){
		myfile.open("/home/pi/Boot/release/wert.txt", ios::in);
		myfile >> line;
		myfile.close();
		sleep(1);
	}

	system("/etc/init.d/boottime.sh stop");

	/*************************/
	/* Initialisierungsphase */
	/*************************/


	// Bibliothek um GPIOs anzusprechen
	if (ioControl->initialize() < 0) {
		cout << "[FAIL] PIGPIO Initialisierung fehlgeschlagen!\n";
	}

	pthread_create (&init_blinken, NULL, blinken, (void*)23);
	WebSocket_initialisierung(argc, argv);
	// Status für Websocket-Init wird in Funktion implementiert
	sensor->initialize();
	if(sensor->sens_init == 7){ioControl->writePin(2, 1);}
	// Status für Sensor-Init wird in Funktion implementiert

	cover = false;		// Bit für Zeitmessungen
	manuellerModus = false;
	/*****************/
	/* Hauptschleife */
	/*****************/
	pthread_cancel(init_blinken);
	ioControl->writePin(24, 1);
    ioControl->writePin(23, 1);
	logfiles->print_log(LOG_INFO, "Main-Schleife Start");
	while (cnt >= 0 && !exit_loop) {
		timer t;
		
		if(manuellerModus == false){
			cnt = libwebsocket_service(context, 10);			// u.a. neue Verbindungen werden akzeptiert ; ggf. setzen des send_notification
			}
		else{
			cnt = libwebsocket_service(context, 3000);
			}

		if (send_notification) {
			libwebsocket_callback_on_writable_all_protocol(&protocols[0]);
			send_notification = FALSE;
		}

		g_main_context_iteration(NULL, FALSE);
		t.stop();
		if(cover == true){cout << t  << endl; cover = false;}
	}

	/* Abbruchroutine */
	out: if (context != NULL)
		libwebsocket_context_destroy(context);
	if (signal_id > 0)
		g_source_remove(signal_id);
	if (option_context != NULL)
		g_option_context_free(option_context);
	sensor->closeSensor();								// Close Sensor-Socket
#ifndef HAVE_SYSTEMD
	closelog();
#endif		

	return exit_value;
}
