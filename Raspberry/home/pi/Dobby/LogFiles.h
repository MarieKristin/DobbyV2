#pragma once

#include <gio/gio.h>
#include <glib-unix.h> 

class LogFiles
{
public:
	LogFiles();
	~LogFiles();
	void print_log(gint msg_priority, const gchar *msg, ...);

private:

};
