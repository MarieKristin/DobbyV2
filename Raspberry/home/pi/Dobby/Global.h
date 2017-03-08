/* ***************************************** */
/* Globale Variablen 			     */
/* ***************************************** */

//Motoren

Lin *lin = new Lin();

Sensor *sensor = new Sensor();

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
