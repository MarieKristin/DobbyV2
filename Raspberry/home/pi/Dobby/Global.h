/* ***************************************** */
/* Globale Variablen 			     */
/* ***************************************** */

IOControl *ioControl = new IOControl();

Lin *lin = new Lin(ioControl);

Sensor *sensor = new Sensor(ioControl);

WebSocket *webSocket = new WebSocket(ioControl);

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
