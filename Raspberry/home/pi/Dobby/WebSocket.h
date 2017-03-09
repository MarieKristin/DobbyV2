#pragma once

class IOControl;

class WebSocket
{
public:
	WebSocket(IOControl *p_ioControl);
	WebSocket();
	~WebSocket();

	// Public Funktionen
	int WebSocket_initialisierung(int argc, char **argv);
private:
	IOControl *ioControl;
	static void print_log(gint msg_priority, const gchar *msg, ...);
	static gboolean sigint_handler();
	unsigned int prepare_reply(struct libwebsocket *wsi, unsigned char *data,
			unsigned char *buffer);
	static int my_callback(struct libwebsocket_context *context,
			struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
			void *user, void *in, size_t len);

};
