#include <gio/gio.h>
#include <glib-unix.h> 			// Commandline-Bibliothek
#include <string>
#include <string.h>
#include <stdio.h>
#include <syslog.h>
#include <jansson.h>
#include <libwebsockets.h>
#include <iostream>

#define MAX_PAYLOAD 10000		 // Max Datasize der Socket-Verbindungen pro Task
#define BACKLOG 20 			 	// Maximale Verbindungen in der Warteschlage

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
			+ LWS_SEND_BUFFER_POST_PADDING]; 				// Daten
	unsigned int len; 												// Länge
	unsigned int index; 												// Index
};

/* ***************************************** */
/* Log-Dateien schreiben 		     */
/* ***************************************** */
static void print_log(gint msg_priority, const gchar *msg, ...) {
	va_list arg;											// Argumentanzeiger
	va_start(arg, msg); // Initialisierung mit dem ersten optionalen Argument (Pointer, msg)
	GString *log = g_string_new(NULL); 		// Initialisierung variabeler String
	g_string_vprintf(log, msg, arg);

#ifdef DEBUG 													 // PRINT_LOG im Debugger
	g_print ("%s", log->str);
#endif

#ifdef HAVE_SYSTEMD 												 // PRINT_LOG bei D-Bus (asyncrhone Nachrichten)
	sd_journal_print (msg_priority, log->str);
#else 														 // Print_LOG im Raspberry syslog
	syslog(msg_priority, log->str);
#endif
	g_string_free(log, TRUE); 						// Speicherfreigabe String
	va_end(arg); 									// Ende der Argumentenliste
}

/* ***************************************** */
/* Interrupt durch Tastatur ausgelöst 	     */
/* ***************************************** */
static gboolean sigint_handler() {
	libwebsocket_cancel_service(context); 					// Beende Service
	exit_loop = TRUE; 									// Beende While-Schleife
	return TRUE;
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
	asprintf(&reply, "You typed \"%s\"", data);	// Füge zu den eigegebenen Daten "you typed" hinzu und schreibe in reply
	//Test Start
	string lampe = "WebCamera";
	int test = s_data.compare(lampe); // Vergleiche ob das eigegebene Wort dem Wert von "lampe" entspricht
	if (test == 0) {
		blinken(27, 100);
	}
	test = 7; 										 // == 0 ? -> ist gleich
	string weiss = "TestW";
	test = s_data.compare(weiss);
	if (test == 0) {
		blinken(27, 200);
	}
	test = 7;
	string rot = "TestR";
	test = s_data.compare(rot);
	if (test == 0) {
		blinken(23, 200);
	}
	test = 7;
	string gelb = "TestGe";
	test = s_data.compare(gelb);
	if (test == 0) {
		blinken(25, 200);
	}
	test = 7;
	string gruen = "TestGr";
	test = s_data.compare(gruen);
	if (test == 0) {
		blinken(24, 200);
	}
	test = 7;
	string start = "Start";
	test = s_data.compare(start);
	while (test == 0 && ausgefuehrt != 1) {
		if (sensor->getAusloeser() == 0) {
			ausgefuehrt = blinken(24, 50);
		} else {
			sensor->startRoutine();
		}
	}
	ausgefuehrt = 0;
	test = 7;
	string stop = "Stop";
	test = s_data.compare(stop);
	while (test == 0 && ausgefuehrt != 1) {
		if (sensor->getAusloeser() == 0) {
			ausgefuehrt = blinken(23, 50);
		} else {
			sensor->startRoutine();
		}
	}
	ausgefuehrt = 0;
	test = 7;
	string left = "Left";
	test = s_data.compare(left);
	while (ausgefuehrt != 1 && test == 0) {
		if (sensor->getAusloeser() == 0) {
			ausgefuehrt = blinken(25, 50);
		} else {
			sensor->startRoutine();
		}
	}
	ausgefuehrt = 0;
	test = 7;
	string right = "Right";
	test = s_data.compare(right);
	while (ausgefuehrt != 1 && test == 0) {
		if (sensor->getAusloeser() == 0) {
			ausgefuehrt = blinken(27, 50);
		} else {
			sensor->startRoutine();
		}
	}
	ausgefuehrt = 0;
	test = 7;
	string sensInit = "SensInit";
	test = s_data.compare(sensInit);
	if (test == 0) {
		gpioWrite(24, 0);
		gpioWrite(27, 1);
		gpioWrite(25, 1);
		sensor->initialize();
		if (sensor->getSensorRoutine() != 7) {
			gpioWrite(23, 1);
			gpioDelay(2000);
			gpioWrite(23, 0);
		}
		gpioWrite(25, 0);
		gpioWrite(27, 0);
	}
	test = 7;
	string sensOut = "SensOff";
	test = s_data.compare(sensOut);
	if (test == 0) {
		gpioWrite(23, 1);

		sensor->closeSensor();

		gpioDelay(2000);
		gpioWrite(23, 0);
	}
	string motorOn = "MotorOn";
	test = s_data.compare(motorOn);
	if (test == 0) {
		gpioWrite(23, 1);
		gpioWrite(25, 1);

		lin->startMotors(0x55, 0x30, 0x55, 0x30);

		gpioWrite(25, 0);
		gpioWrite(23, 0);
	}
	string motorOff = "MotorOff";
	test = s_data.compare(motorOff);
	if (test == 0) {
		gpioWrite(23, 1);
		gpioWrite(25, 1);

		lin->stopMotors();

		gpioWrite(25, 0);
		gpioWrite(23, 0);
	}

	// Test Ende
	reply_obj = json_pack("{s:s, s:s}", "Type", "standard", "Message", reply); // Erstellung JSON-Objekt -> "Type standart", "Message REPLY"
	reply_str = json_dumps(reply_obj, 0);
	reply_len = strlen(reply_str); 						// Länge der Antwort
	memcpy(buffer, reply_str, reply_len); // Kopie an Zieladresse "buffer" von Antwort-Pointer, Länge der Antwort
	json_decref(reply_obj); 						// gibt das JSON-Objekt frei
	free(reply); 								// gibt den String Antwort frei
	free(reply_str); 						// gibt den String "reply_str" frei
	return reply_len; 					// gibt die Länge der Antwort zurück
}

/* 	*****************************************	*/
/* 	callback-Funktionen							*/
/* 	*****************************************	*/
static int my_callback(struct libwebsocket_context *context,
		struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
		void *user, void *in, size_t len) {

	struct per_session_data *psd = (struct per_session_data*) user;
	int nbytes;

	switch (reason) {

	case LWS_CALLBACK_ESTABLISHED:		// Eintrag sys-LogFile (/var/log/syslog)
		print_log(LOG_INFO, "(%p) (callback) connection established\n", wsi);
		break;

	case LWS_CALLBACK_CLOSED:			// Eintrag sys-LogFile (/var/log/syslog)
		print_log(LOG_INFO, "(%p) (callback) connection closed\n", wsi);
		break;

	case LWS_CALLBACK_SERVER_WRITEABLE:	// Anfrage beantwortet (Part 2 von 2)

		nbytes = libwebsocket_write(wsi, &psd->buf[LWS_SEND_BUFFER_PRE_PADDING],
				psd->len, LWS_WRITE_TEXT);
		memset(&psd->buf[LWS_SEND_BUFFER_PRE_PADDING], 0, psd->len);
		print_log(LOG_INFO, "(%p) (callback) %d bytes written\n", wsi, nbytes);
		if (nbytes < 0) {
			print_log(LOG_ERR,
					"(%p) (callback) %d bytes writing to socket, hanging up\n",
					wsi, nbytes);
			return 1;
		}
		if (nbytes < (int) psd->len) {
			print_log(LOG_ERR, "(%p) (callback) partial write\n", wsi);
			return -1; /*TODO*/
		}
		break;

	case LWS_CALLBACK_RECEIVE:				// Anfrage bekommen (Part 1 von 2)
		print_log(LOG_INFO, "(%p) (callback) received %d bytes\n", wsi,
				(int) len);				// Pro "Symbol" ein Byte
		if (len > MAX_PAYLOAD) {
			print_log(LOG_ERR,
					"(%p) (callback) packet bigger than %u, hanging up\n", wsi,
					MAX_PAYLOAD);	// Falls maximale Länge erreicht
			return 1;
		}

		psd->len = prepare_reply(wsi, (unsigned char*) in, &psd->buf[LWS_SEND_BUFFER_PRE_PADDING]);
		if (psd->len > 0) {
			libwebsocket_callback_on_writable(context, wsi);
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
static struct libwebsocket_protocols protocols[] = { { "my_protocol", // Protokoll-Name
		my_callback, 										// Callback-Funktion
		sizeof(struct per_session_data) }, 			// Datengröße je Session
		{ NULL, NULL, 0 } };


/* ***************************************** */
/* Initialisierung WebSocket 		     */
/* ***************************************** */
int WebSocket_initialisierung(int argc, char **argv) {

	GError *error = NULL;
	gint signal_id = 0;
	struct lws_context_creation_info info;

	/* Phase 1: Optionen überprüfen	   */
	/* Commandline Optionen überprüfen */
	option_context = g_option_context_new("- WebSocketsServer"); // WebSockets-Optionen deklarieren z.B. <Pfad> -h --no-daemon
	g_option_context_add_main_entries(option_context, entries, NULL); // Optionen hinzufügen
	if (!g_option_context_parse(option_context, &argc, &argv, &error)) // Überprüft/Parst die Command-Line-Options -> keine Fehler: TRUE
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
	memset(&info, 0, sizeof info); 						// Speicherreservierung
	info.port = port; 								// Port für die Verbindung
	info.iface = "wlan0";
	//info.iface = NULL; 										// keine Wertzuweisung
	info.protocols = protocols; // Beschreibung des Protokolls in Zeile 284 (struct)
	info.extensions = libwebsocket_get_internal_extensions();
	info.gid = -1; 										// Gruppen-ID
	info.uid = -1; 										// User-ID
	info.options = 0;
	info.ssl_cert_filepath = NULL; 						// keine Wertzuweisung
	info.ssl_private_key_filepath = NULL; 				// keine Wertzuweisung

	/* Phase 4: Interrupt durch Tastatur */
	/* handle SIGINT		       */
	signal_id = g_unix_signal_add(SIGINT, (GSourceFunc) sigint_handler, NULL); // Signalnummer (2), Funktionsaufruf

	/* Phase 5: Erstellung "listening" - Serverinstanz */
	/* create context 				    */
	context = libwebsocket_create_context(&info);
	if (context == NULL) {
		print_log(LOG_ERR, "(main) libwebsocket context init failed\n");
		return -1;
		gpioWrite(23, 1);
		gpioDelay(2000);
		gpioWrite(23, 0);
	}
	print_log(LOG_INFO, "(main) context - %p\n", context);

	gpioWrite(24, 1);
	gpioDelay(2000);
	gpioWrite(24, 0);
}

WebSocket::WebSocket(IOControl *p_ioControl){
	ioControl = p_ioControl;
}

WebSocket::WebSocket(){

}

WebSocket::~WebSocket(){

}
