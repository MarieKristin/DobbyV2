
#include <gio/gio.h>
#include <glib-unix.h> 			// Commandline-Bibliothek
#include <string>
#include <string.h>
#include <stdio.h>
#include <syslog.h>
#include <jansson.h>
#include <libwebsockets.h>
#include <iostream>

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
#include <termios.h>
#include <pigpio.h>

#include <iostream>
#include <fstream>

using namespace std;


/* ***************************************** */
/* ***************************************** */
/* LogFile-Funktion                          */
/* ***************************************** */
/* ***************************************** */


void print_log(gint msg_priority, const gchar *msg, ...) {
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
/* ***************************************** */
/* main function 			     */
/* ***************************************** */
/* ***************************************** */
int main(int argc, char **argv) { // argc = Pointer auf Anzahl der Command-Argumente; argv = Pointer auf Command-Array
	gint cnt = 0;


	// Bibliothek um GPIOs anzusprechen
	gpioInitialise();

	gpioSetMode(21, PI_OUTPUT);
	gpioSetMode(20, PI_OUTPUT);
	gpioSetMode(16, PI_OUTPUT);
	gpioSetMode(12, PI_OUTPUT);
	gpioSetMode(7, PI_OUTPUT);
	gpioSetMode(8, PI_OUTPUT);
	gpioSetMode(25, PI_OUTPUT);
	gpioSetMode(24, PI_OUTPUT);
        gpioSetMode(23, PI_OUTPUT);
        gpioSetMode(18, PI_OUTPUT);
	gpioSetMode(2, PI_OUTPUT);
        gpioSetMode(3, PI_OUTPUT);
        gpioSetMode(4, PI_OUTPUT);

	string line = "0";
	print_log(LOG_INFO, "Boottime Start\n " );

	fstream myfile;
	myfile.open("/home/pi/Boot/release/wert.txt", ios::out);
	myfile << "0";
	myfile.close();


	while(line == "0"){

		myfile.open("/home/pi/Boot/release/wert.txt", ios::in);
		myfile >> line;
		myfile.close();


		gpioWrite(12, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(12, 0);
		gpioWrite(16, 1);
		gpioWrite(7, 1);
		gpioWrite(24, 1);
		gpioWrite(23, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(16, 0);
                gpioWrite(7, 0);
		gpioWrite(24, 0);
                gpioWrite(23, 0);
		gpioWrite(20, 1);
                gpioWrite(8, 1);
		gpioWrite(18, 1),
		gpioWrite(2, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(20, 0);
                gpioWrite(8, 0);
		gpioWrite(18, 0),
                gpioWrite(2, 0);
		gpioWrite(21, 1);
                gpioWrite(25, 1);
		gpioWrite(3, 1);
                gpioWrite(4, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(21, 0);
                gpioWrite(25, 0);
		gpioWrite(3, 0);
                gpioWrite(4, 0);

		}

/*	gpioTerminate();
	myfile.open("/home/pi/Boot/release/wert.txt", ios::out);

	if(myfile.is_open() == true){
        	myfile << "2";
        	myfile.close();
		}
*/

		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
                gpioWrite(21, 1);
		gpioWrite(24, 1);
		gpioWrite(23, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
                gpioWrite(20, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
                gpioWrite(16, 1);
		gpioWrite(18, 1);
		gpioWrite(2, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
                gpioWrite(12, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(7, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(8, 1);
		gpioWrite(3, 1);
		gpioWrite(4, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(25, 1);
		gpioSleep(PI_TIME_RELATIVE, 0, 200000);
		gpioWrite(25, 0);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(8, 0);
		gpioWrite(3, 0);
		gpioWrite(4, 0);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(7, 0);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(12, 0);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(16, 0);
		gpioWrite(2, 0);
		gpioWrite(18, 0);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(20, 0);
		gpioSleep(PI_TIME_RELATIVE, 0, 100000);
		gpioWrite(21, 0);
		gpioWrite(23, 0);
		gpioWrite(24, 0);
		gpioWrite(24, 1);
	gpioTerminate();

        myfile.open("/home/pi/Boot/release/wert.txt", ios::out);

        if(myfile.is_open() == true){
                myfile << "2";
                myfile.close();
                }



}
