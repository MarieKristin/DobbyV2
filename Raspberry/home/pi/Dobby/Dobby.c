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

//Bibliothek für Socket-Verbindung zwischen Raspberry und Handy
#include <gio/gio.h>
#include <glib-unix.h> 			// Commandline-Bibliothek
#include <string.h>
#include <stdio.h>
#include <syslog.h>
#include <jansson.h>
#include <libwebsockets.h>

//Bibliotheken für Sensor
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <netdb.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <arpa/inet.h>

//Bibliotheken für Motor
#include <stdlib.h>
#include <stdarg.h>
#include <fcntl.h>
#include <termios.h>
#include <pigpio.h>

// #define _GNU_SOURCE
#define MAX_PAYLOAD 10000		 // Max Datasize der Socket-Verbindungen pro Task
#define PORT "2112"			 // Port am Sensors
#define BACKLOG 20 			 // Maximale Verbindungen in der Warteschlage
#define MAXDATASIZE 2000 		 // Max Datasize pro Datenausgabe des Sensors


/* ***************************************** */
/* Globale Variablen 			     */
/* ***************************************** */

//Sensor
int sockfd = 0;				 // Socket-File-Description für Sensor
int sens_init = 0;			 // Sensor-Routine Enable ; 7=enable; 0=disable
int ausloeser = 0;			 // Auslöserwinkel Gegenstand im Sensorfeld

//WebSocketServer
static struct libwebsocket_context *context;
char *notification;
gboolean opt_no_daemon = FALSE;
gboolean exit_loop = FALSE;
gboolean send_notification = FALSE;
gint port = 8080;
int signal_id = 0;
GOptionContext *option_context = NULL;
gint exit_value = EXIT_SUCCESS;

//Motor
int BAUDRATE = 19200;
int handle = -1;
struct termios options;



/* ***************************************** */
/* ***************************************** */
/* Allgemeine Funktionen					 */
/* ***************************************** */
/* ***************************************** */

/* ***************************************** */
/* Blinkfunktion zum Testen 		     */
/* ***************************************** */
unsigned int blinken(int lampe, int geschwindigkeit){
	int i = 0;
	while(i != 15) {
		gpioWrite(lampe, 1);
		delay(geschwindigkeit); // Warte 100 ms
		gpioWrite(lampe, 0);
		delay(geschwindigkeit); // Warte 100 ms
		i++;
		}
		return 1;
	}





/* ***************************************** */
/* ***************************************** */
/* Sensor-Funktionen */
/* ***************************************** */
/* ***************************************** */

/* ***************************************** */
/* Socketadresse - IPv4 or IPv6: 	     */
/* ***************************************** */
void *get_in_addr(struct sockaddr *sa){

    if (sa->sa_family == AF_INET) {
        return &(((struct sockaddr_in*)sa)->sin_addr);
    }
    return &(((struct sockaddr_in6*)sa)->sin6_addr);
}

/* ***************************************** */
/* Initialisierung der Sensor-Verbindung   	 */
/* ***************************************** */
int Sensor_initialisierung(){
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
    hints.ai_flags = AI_PASSIVE; if ((rv = getaddrinfo(hostname, PORT, &hints, &servinfo)) != 0) {
        fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(rv));
        return 1;
    }
    // loop through all the results and connect to the first we can
    for(p = servinfo; p != NULL; p = p->ai_next) { 				// Socket
        if ((sockfd = socket(p->ai_family, p->ai_socktype,
                p->ai_protocol)) == -1) {
            perror("client: socket");
            continue;
        }
        if (connect(sockfd, p->ai_addr, p->ai_addrlen) == -1) { 		// Connect
           // close(sockfd);
            perror("client: connect");
            continue;
        }
        break;
    }
    if (p == NULL) {
        fprintf(stderr, "client: failed to connect\n");
        return 2;
    }
    if( NULL != inet_ntop(p->ai_family, get_in_addr((struct sockaddr *)p->ai_addr),
            s, sizeof s)){
    printf("client: connecting to %s\n", s);}
    freeaddrinfo(servinfo);

	gpioWrite(24, 1);
	delay(2000);
	gpioWrite(24, 0);
	return(7);

}

/* ***************************************** */
/* Sensor-Routine 			     */
/* ***************************************** */
void Sensor_routine(){

    char* msg= "\x02sRN LMDscandata\x03\0";
    int len = strlen(msg);
    int numbytes = 0;
    char buf[MAXDATASIZE];

    int sent = send(sockfd, msg, len, 0);	 						// Befehl zur Messwertanforderung
    if(sent!=-1){printf("%s gesendet, %d Bytes\n", msg, sent);}
    if(sent==-1){printf("Senden fehlgeschlagen\n");}

    gpioInitialise();

    numbytes = recv(sockfd, buf, MAXDATASIZE-1, 0);			// Empfang der Messwerte
    buf[numbytes] = '\0';						// Abschluss des Messwert-Strings
    printf("client: received '%s'\n",buf);


    char Messdateneinheit[6] = "DIST1";					// Startwert der Messkomponenten zur Auswertung
    int pos_search = 0;							//
    int pos_text = 0;							// Aktuelle Stelle im Suchstring
    int len_search = 5;							// Länge des Suchstringes (der Needle)
    int len_text = MAXDATASIZE;

   for (pos_text = 0; pos_text < len_text - len_search;++pos_text)	// Funktion zum Suchen des Startwertes der Messkomponenten
    {
        if(buf[pos_text] == Messdateneinheit[pos_search])
        {
            ++pos_search;
            if(pos_search == len_search)
            {
                // match
                printf("match from %d to %d\n",pos_text-len_search,pos_text);
                break;
            }
        }
        else
        {
           pos_text -=pos_search;
           pos_search = 0;
        }
    }

	int i = (pos_text-len_search)+1;				// Position des 1. Buchstabes der Needle
	int k = 0;							// Laufvariablen
 	char Messdateninhalt[6];					// 1. Argument
	char Skalierungsfaktor[9];					// 2. Argument
	char Skalierungsoffset[9];					// 3. Argument
	char Startwinkel[9];						// 4. Argument
	char Winkelschrittweite[5];					// 5. Argument
	char Anzahl_Daten[5];						// 6. Argument

		while(buf[i]!=' '){
			Messdateninhalt[k] = buf[i];
			k++;
			i++;
		}
		Messdateninhalt[6] = '\0';
		i++;
		k = 0;
		while(buf[i]!=' '){
			Skalierungsfaktor[k] = buf[i];
			k++;
			i++;
		}
		Skalierungsfaktor[9] = '\0';
		i++;
		k = 0;
		while(buf[i]!=' '){
			Skalierungsoffset[k] = buf[i];
			k++;
			i++;
		}
		Skalierungsoffset[9] = '\0';
		i++;
		k = 0;
		while(buf[i]!=' '){
			Startwinkel[k] = buf[i];
			k++;
			i++;
		}
		Startwinkel[9] = '\0';
		i++;
		k = 0;
		while(buf[i]!=' '){
			Winkelschrittweite[k] = buf[i];
			k++;
			i++;
		}
		Winkelschrittweite[5] = '\0';
		i++;
		k = 0;
		while(buf[i]!=' '){
			Anzahl_Daten[k] = buf[i];
			k++;
			i++;
		}
		Anzahl_Daten[5] = '\0';
		i++;


int l = 0;
char Entfernung[5];											// Entfernung in mm
int AnzahlDaten = (int)strtol(Anzahl_Daten, NULL, 16);
printf("%d\n", AnzahlDaten);

for(k=1; k<181; k++){
        while(buf[i]!=' '){
                Entfernung[l] = buf[i];
                l++;
                i++;
        }

		if(l<=5){Entfernung[l]='\0';}
		int entfernung = (int)strtol(Entfernung, NULL, 16);

		printf("%d %d", k, entfernung); 
		if(entfernung < 10){ }
		else{
        	if(entfernung < 400){
                	if(entfernung < 180){ausloeser = k; 
							gpioWrite(27, 1);
							printf("STOP\n");}
                	else{	printf("ACHTUNG\n"); 
							if(k == ausloeser){
								gpioWrite(27, 0);
								ausloeser = 0;} 
						}
        	}
        	else { 
				printf("alles ok\n");
				if(k == ausloeser){
				gpioWrite(27, 0);
				ausloeser = 0;}
	 	}
	}


	i++;
	l=0;
}

printf("Ende-Sensor\n");

}




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
GOptionEntry entries[] = {
	  { "no-daemon", 'n', 0, G_OPTION_ARG_NONE, &opt_no_daemon, "Don't detach WebSocketsServer into the background", NULL},		 // LongName, shortName, flags,
															 		 // OptionArgument, Argument_Data,
															 		 // Erklärung; App ermöglicht kein
															 		 // Background-Laufen
  	  { "port", 'p', 0, G_OPTION_ARG_INT, &port, "Port number [default: 8080]", NULL }, 			// LongName, shortName, flags, OptionArgument, Argument_Data, Erklärung
  	  { NULL }
};

/* ***************************************** */
/* Daten-Struct */
/* ***************************************** */
	struct per_session_data {
		unsigned char buf[LWS_SEND_BUFFER_PRE_PADDING + MAX_PAYLOAD + LWS_SEND_BUFFER_POST_PADDING]; 				// Daten
		unsigned int len; 													// Länge
		unsigned int index; 													// Index
};



/* ***************************************** */
/* Log-Dateien schreiben 		     */
/* ***************************************** */
static void print_log (gint msg_priority, const gchar *msg, ...){
	  va_list arg;												 // Argumentanzeiger
  	  va_start(arg, msg); 											 // Initialisierung mit dem ersten optionalen Argument (Pointer, msg)
          GString *log = g_string_new(NULL); 									 // Initialisierung variabeler String
          g_string_vprintf (log, msg, arg);

#ifdef DEBUG 													 // PRINT_LOG im Debugger
  g_print ("%s", log->str);
#endif

#ifdef HAVE_SYSTEMD 												 // PRINT_LOG bei D-Bus (asyncrhone Nachrichten)
  sd_journal_print (msg_priority, log->str);
#else 														 // Print_LOG im Raspberry syslog
  syslog (msg_priority, log->str);
#endif
  g_string_free(log, TRUE); 											 // Speicherfreigabe String
  va_end(arg); 													 // Ende der Argumentenliste
}


/* ***************************************** */
/* Interrupt durch Tastatur ausgelöst 	     */
/* ***************************************** */
    static gboolean sigint_handler (){
		  libwebsocket_cancel_service (context); 							 // Beende Service
		  exit_loop = TRUE; 										 // Beende While-Schleife
		  return TRUE;
}


/* ***************************************** */ 
/* Antwortnachricht vorbereiten */ 
/* ***************************************** */
unsigned int prepare_reply (struct libwebsocket *wsi, unsigned char *data, unsigned char *buffer){
  json_t *reply_obj;
  char *reply_str;
  char *reply;
  int reply_len;
  int ausgefuehrt = 0;
  asprintf (&reply, "You typed \"%s\"", data);								 // Füge zu den eigegebenen Daten "you typed" hinzu und schreibe in reply
  	//Test Start
	const char lampe[] = "WebCamera";
	int test = strcmp(data, lampe); 								 // Vergleiche ob das eigegebene Wort dem Wert von "lampe" entspricht
	if(test == 0){blinken(27, 100);} test = 7; 										 // == 0 ? -> ist gleich
	const char weiss[] = "TestW";
	test = strcmp(data, weiss); 
	if(test == 0){blinken(27, 200);} test = 7;
	const char rot[] = "TestR";
	test = strcmp(data, rot); 
        if(test == 0){blinken(23, 200);} test = 7;
	const char gelb[] = "TestGe";
	test = strcmp(data, gelb); 
        if(test == 0){blinken(25, 200);} test = 7;
	const char gruen[] = "TestGr";
        test =  strcmp(data, gruen);
	if(test == 0){blinken(24, 200);} test = 7;
	const char start[] = "Start";
	test = strcmp(data, start);
	while(test == 0 && ausgefuehrt != 1){
			if(ausloeser == 0){ausgefuehrt = blinken(24, 50);}
			else{Sensor_routine();}} ausgefuehrt = 0; test = 7;
	const char stop[] = "Stop";
	test = strcmp(data, stop);
	while(test == 0 && ausgefuehrt != 1){
                        if(ausloeser == 0){ausgefuehrt = blinken(23, 50);}
                        else{Sensor_routine();}} ausgefuehrt = 0; test = 7;
	const char left[] = "Left";
	test = strcmp(data, left);
	while(ausgefuehrt != 1 && test == 0){
                        if(ausloeser == 0){ausgefuehrt = blinken(25, 50);}
                        else{Sensor_routine();}} ausgefuehrt = 0; test = 7;
	const char right[] = "Right";
	test = strcmp(data, right);
	while(ausgefuehrt != 1 && test == 0){
                        if(ausloeser == 0){ausgefuehrt = blinken(27, 50);}
                        else{Sensor_routine();}} ausgefuehrt = 0; test = 7;
	const char sensInit[] = "SensInit";
	test = strcmp(data, sensInit);
	if(test == 0){	gpioWrite(24, 0);
			gpioWrite(27, 1);
			gpioWrite(25, 1);
			sens_init = Sensor_initialisierung();
			if(sens_init != 7){gpioWrite(23, 1); delay(2000); gpioWrite(23, 0);}
			gpioWrite(25, 0);
			gpioWrite(27, 0);} test = 7;
	const char sensOut[] = "SensOff";
	test = strcmp(data, sensOut);
	if(test == 0){ gpioWrite(23,1);
			close(sockfd);
			sens_init = 0;

			delay(2000);
			gpioWrite(23, 0);
			}


		// Test Ende
  reply_obj = json_pack ("{s:s, s:s}", "Type", "standard", "Message", reply);				 // Erstellung JSON-Objekt -> "Type standart", "Message REPLY"
  reply_str = json_dumps (reply_obj, 0);
  reply_len = strlen (reply_str); 									 // Länge der Antwort
  memcpy (buffer, reply_str, reply_len); 								 // Kopie an Zieladresse "buffer" von Antwort-Pointer, Länge der Antwort
  json_decref (reply_obj); 										 // gibt das JSON-Objekt frei
  free (reply); 											 // gibt den String Antwort frei
  free (reply_str); 											 // gibt den String "reply_str" frei
  return reply_len; 											 // gibt die Länge der Antwort zurück
}


/* 	*****************************************	*/
/* 	callback-Funktionen							*/
/* 	*****************************************	*/
static int my_callback (struct libwebsocket_context *context, struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason, void *user, void *in, size_t len){

  struct per_session_data *psd = (struct per_session_data*) user;
  int nbytes;

  switch (reason)
    {

      case LWS_CALLBACK_ESTABLISHED:									// Eintrag sys-LogFile (/var/log/syslog)
        print_log (LOG_INFO, "(%p) (callback) connection established\n", wsi);
      break;

      case LWS_CALLBACK_CLOSED:										// Eintrag sys-LogFile (/var/log/syslog)
        print_log (LOG_INFO, "(%p) (callback) connection closed\n", wsi);
      break;

      case LWS_CALLBACK_SERVER_WRITEABLE:								// Anfrage beantwortet (Part 2 von 2)

        nbytes = libwebsocket_write(wsi, &psd->buf[LWS_SEND_BUFFER_PRE_PADDING], psd->len, LWS_WRITE_TEXT);
        memset (&psd->buf[LWS_SEND_BUFFER_PRE_PADDING], 0, psd->len);
        print_log (LOG_INFO, "(%p) (callback) %d bytes written\n", wsi, nbytes);
        if (nbytes < 0)
          {
            print_log (LOG_ERR, "(%p) (callback) %d bytes writing to socket, hanging up\n", wsi, nbytes);
            return 1;
          }
        if (nbytes < (int)psd->len)
          {
            print_log (LOG_ERR, "(%p) (callback) partial write\n", wsi);
            return -1; /*TODO*/
          }
      break;

      case LWS_CALLBACK_RECEIVE:										// Anfrage bekommen (Part 1 von 2)
        print_log (LOG_INFO, "(%p) (callback) received %d bytes\n", wsi, (int) len);				// Pro "Symbol" ein Byte
        if (len > MAX_PAYLOAD)
          {
            print_log (LOG_ERR, "(%p) (callback) packet bigger than %u, hanging up\n", wsi, MAX_PAYLOAD);	// Falls maximale Länge erreicht
            return 1;
          }

        psd->len = prepare_reply (wsi, in, &psd->buf[LWS_SEND_BUFFER_PRE_PADDING]);
        if (psd->len > 0)
          {
            libwebsocket_callback_on_writable (context, wsi);
          }
      break;

      default:
      break;
    }

  return 0;
}


/* ***************************************** */
/* Beschreibung des Protokolls 		     */
/* ***************************************** */
static struct libwebsocket_protocols protocols[] = {
  { "my_protocol", 												// Protokoll-Name
     my_callback, 												// Callback-Funktion
     sizeof(struct per_session_data)}, 										// Datengröße je Session
  	{	NULL,
		NULL,
		0	}
};


/* ***************************************** */
/* Initialisierung WebSocket 		     */
/* ***************************************** */
int WebSocket_initialisierung(int argc, char **argv){

	    GError *error = NULL;
	    gint signal_id = 0;
	    struct lws_context_creation_info info;

		/* Phase 1: Optionen überprüfen	   */
		/* Commandline Optionen überprüfen */
		  option_context = g_option_context_new ("- WebSocketsServer"); 				// WebSockets-Optionen deklarieren z.B. <Pfad> -h --no-daemon
		  g_option_context_add_main_entries (option_context, entries, NULL);				// Optionen hinzufügen
		  if (!g_option_context_parse (option_context, &argc, &argv, &error))				// Überprüft/Parst die Command-Line-Options -> keine Fehler: TRUE
			{
			  g_printerr ("%s: %s\n", argv[0], error->message);
			  exit_value = EXIT_FAILURE;
			  return -1;
			}
		  if (!opt_no_daemon && lws_daemonize("/var/run/lock/.websocketsserver-lock"))
			{
			  g_printerr ("%s: failed to daemonize\n", argv[0]);
			  exit_value = EXIT_FAILURE;
			  return -1;
			}

		  /* Phase 2: Open Syslog */
		  #ifndef HAVE_SYSTEMD
			  openlog("WebSocketsServer", LOG_NOWAIT|LOG_PID, LOG_USER);
		  #endif

		  /* Phase 3: Initialisierung Server-Eigenschaften */
		  /* Minimalkonfiguration			   */
		  /* fill 'lws_context_creation_info' struct 	   */
		  memset (&info, 0, sizeof info); 								// Speicherreservierung
		  info.port = port; 										// Port für die Verbindung
		  info.iface = "wlan0";
			//info.iface = NULL; 										// keine Wertzuweisung
		  info.protocols = protocols; 									// Beschreibung des Protokolls in Zeile 284 (struct)
		  info.extensions = libwebsocket_get_internal_extensions();
		  info.gid = -1; 										// Gruppen-ID
		  info.uid = -1; 										// User-ID
		  info.options = 0;
		  info.ssl_cert_filepath = NULL; 								// keine Wertzuweisung
		  info.ssl_private_key_filepath = NULL; 							// keine Wertzuweisung

		  /* Phase 4: Interrupt durch Tastatur */
		  /* handle SIGINT		       */
		  signal_id = g_unix_signal_add (SIGINT, sigint_handler, NULL);					// Signalnummer (2), Funktionsaufruf

		 /* Phase 5: Erstellung "listening" - Serverinstanz */
		 /* create context 				    */
		  context = libwebsocket_create_context (&info);
		  if (context == NULL)
			{
			  print_log (LOG_ERR, "(main) libwebsocket context init failed\n");
			  return -1;
			gpioWrite(23, 1);
			delay(2000);
			gpioWrite(23, 0);
			}
		  print_log (LOG_INFO, "(main) context - %p\n", context);

		gpioWrite(24, 1);
		 delay(2000);
		gpioWrite(24, 0);
}



/* ***************************************** */
/* ***************************************** */
/* main function 			     */
/* ***************************************** */
/* ***************************************** */
int main(int argc, char **argv){ 								// argc = Pointer auf Anzahl der Command-Argumente; argv = Pointer auf Command-Array
	  gint cnt = 0;

	/*************************/
	/* Initialisierungsphase */
	/*************************/

	// Bibliothek um GPIOs anzusprechen
	if(gpioInitialise() < 0){
			printf("Initialisierung fehlgeschlagen!\n");
			}
	gpioSetMode(27, PI_OUTPUT); 		// Lampe weiss
	gpioSetMode(23, PI_OUTPUT); 		// Lampe rot
	gpioSetMode(24, PI_OUTPUT);		// Lampe gruen
	gpioSetMode(25, PI_OUTPUT);		// Lampe gelb
	//
	gpioWrite(25, 1);
	gpioWrite(27, 1);
	delay(2000);
	gpioWrite(24, 0);
	WebSocket_initialisierung(argc, argv);
	// Status für Websocket-Init wird in Funktion implementiert
	sens_init = Sensor_initialisierung();
	// Status für Sensor-Init wird in Funktion implementiert
	if(sens_init != 7){gpioWrite(23, 1); delay(2000); gpioWrite(23, 0);}

	gpioWrite(25, 0);
	gpioWrite(27, 0);

	/*****************/
	/* Hauptschleife */
	/*****************/
		  while (cnt >= 0 && !exit_loop)
			{ gpioWrite(24, 1);
			  if(sens_init == 7){ Sensor_routine();}

			  cnt = libwebsocket_service (context, 10);				// u.a. neue Verbindungen werden akzeptiert ; ggf. setzen des send_notification
			  if (send_notification)
				{
				  libwebsocket_callback_on_writable_all_protocol (&protocols[0]);
				  send_notification = FALSE;
				}
			  g_main_context_iteration (NULL, FALSE);
			}


		  /* Abbruchroutine */
		     out:
			  if (context != NULL)
				libwebsocket_context_destroy (context);
			  if (signal_id > 0)
				g_source_remove (signal_id);
			  if (option_context != NULL)
				g_option_context_free (option_context);
			  close(sockfd); 								// Close Sensor-Socket
			  #ifndef HAVE_SYSTEMD
			    closelog();
			  #endif

  return exit_value;
}

