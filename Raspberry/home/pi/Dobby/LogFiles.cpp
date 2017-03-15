#include "LogFiles.h"
#include <gio/gio.h>
#include <glib-unix.h> 			// Commandline-Bibliothek
#include <string>
#include <string.h>
#include <stdio.h>
#include <syslog.h>
#include <jansson.h>
#include <libwebsockets.h>
#include <iostream>


LogFiles::LogFiles()
{

}

LogFiles::~LogFiles()
{

}




void LogFiles::print_log(gint msg_priority, const gchar *msg, ...) {
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
