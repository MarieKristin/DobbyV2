/* ***************************************** */
/* Globale Variablen 			     */
/* ***************************************** */

//Motoren

Lin *lin = new Lin();

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

struct termios options;
