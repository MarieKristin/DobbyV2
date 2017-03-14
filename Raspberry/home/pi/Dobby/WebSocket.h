#pragma once

class IOControl;
class Lin;
class Sensor;

class WebSocket
{
public:
	WebSocket(IOControl *p_ioControl, Lin *p_lin, Sensor *p_sensor);
	WebSocket();
	~WebSocket();

	// Public Funktionen
	int initialize(int argc, char **argv);
	gint acceptNew();
	gint getExitValue();
	void closeRoutine();

	//WebSocketServer

private:
	IOControl *ioControl;
	Lin *lin;
	Sensor *sensor;
	static void print_log(gint msg_priority, const gchar *msg, ...);
	static gboolean sigint_handler();
	unsigned int prepare_reply(struct libwebsocket *wsi, unsigned char *data,
			unsigned char *buffer);
	static int my_callback(struct libwebsocket_context *context,
			struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
			void *user, void *in, size_t len);

};
