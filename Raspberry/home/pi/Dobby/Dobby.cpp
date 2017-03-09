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
#include "Sensor.h"

//Bibliotheken für Motor
#include <termios.h>
#include <pigpio.h>
#include "Lin.h"
#include "Frame.h"
#include "Global.h"

using namespace std;

/* ***************************************** */
/* ***************************************** */
/* Allgemeine Funktionen					 */
/* ***************************************** */
/* ***************************************** */

/* ***************************************** */
/* Blinkfunktion zum Testen 		     */
/* ***************************************** */
unsigned int blinken(int lampe, int geschwindigkeit) {
	int i = 0;
	while (i != 15) {
		gpioWrite(lampe, 1);
		gpioDelay(geschwindigkeit); // Warte 100 ms
		gpioWrite(lampe, 0);
		gpioDelay(geschwindigkeit); // Warte 100 ms
		i++;
	}
	return 1;
}




/* ***************************************** */
/* ***************************************** */
/* main function 			     */
/* ***************************************** */
/* ***************************************** */
int main(int argc, char **argv) { // argc = Pointer auf Anzahl der Command-Argumente; argv = Pointer auf Command-Array
	gint cnt = 0;

		/*************************/
		/* Initialisierungsphase */
		/*************************/

		// Bibliothek um GPIOs anzusprechen
		if (lin->linInitialize() < 0) {
			printf("Initialisierung fehlgeschlagen!\n");
		}
		gpioSetMode(27, PI_OUTPUT); 		// Lampe weiss
		gpioSetMode(23, PI_OUTPUT); 		// Lampe rot
		gpioSetMode(24, PI_OUTPUT);		// Lampe gruen
		gpioSetMode(25, PI_OUTPUT);		// Lampe gelb
		//
		gpioWrite(25, 1);
		gpioWrite(27, 1);
		gpioDelay(2000);
		gpioWrite(24, 0);
		WebSocket_initialisierung(argc, argv);
		// Status fÃ¼r Websocket-Init wird in Funktion implementiert


		sensor->initialize();
		// Status fÃ¼r Sensor-Init wird in Funktion implementiert
		if (sensor->getSensorRoutine() != 7) {
			gpioWrite(23, 1);
			gpioDelay(2000);
			gpioWrite(23, 0);
		}

		gpioWrite(25, 0);
		gpioWrite(27, 0);

		/*****************/
		/* Hauptschleife */
		/*****************/
		while (cnt >= 0 && !exit_loop) {
			gpioWrite(24, 1);
			if (sensor->getSensorRoutine() == 7) {
				sensor->startRoutine();
			}

			cnt = libwebsocket_service(context, 10);// u.a. neue Verbindungen werden akzeptiert ; ggf. setzen des send_notification
			if (send_notification) {
				libwebsocket_callback_on_writable_all_protocol(&protocols[0]);
				send_notification = FALSE;
			}
			g_main_context_iteration(NULL, FALSE);
		}

		/* Abbruchroutine */
		out: if (context != NULL)
			libwebsocket_context_destroy(context);
		if (signal_id > 0)
			g_source_remove(signal_id);
		if (option_context != NULL)
			g_option_context_free(option_context);

		sensor->closeSensor();			// Close Sensor-Socket

	#ifndef HAVE_SYSTEMD
		closelog();
	#endif

		return exit_value;

	return 0;
}

