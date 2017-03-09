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
/* main function 			     */
/* ***************************************** */
/* ***************************************** */
int main(int argc, char **argv) { // argc = Pointer auf Anzahl der Command-Argumente; argv = Pointer auf Command-Array
	gint cnt = 0;

		/*************************/
		/* Initialisierungsphase */
		/*************************/

		// Bibliothek um GPIOs anzusprechen
		if (ioControl->initialize() < 0) {
			cout << "[FAIL] PIGPIO Initialisierung fehlgeschlagen!\n";
		}

		ioControl->setToOutput(27);		// Lampe weiss
		ioControl->setToOutput(23);		// Lampe rot
		ioControl->setToOutput(24);		// Lampe gruen
		ioControl->setToOutput(25);		// Lampe gelb

		ioControl->writePin(25, 1);
		ioControl->writePin(27, 1);
		ioControl->setDelay(2000);
		ioControl->writePin(24, 0);

		webSocket->initialize(argc, argv);
		// Status fÃ¼r Websocket-Init wird in Funktion implementiert

		sensor->initialize();
		// Status fÃ¼r Sensor-Init wird in Funktion implementiert
		if (sensor->getSensorRoutine() != 7) {
			ioControl->writePin(23, 1);
			ioControl->setDelay(2000);
			ioControl->writePin(23, 0);
		}

		ioControl->writePin(25, 0);
		ioControl->writePin(27, 0);

		/*****************/
		/* Hauptschleife */
		/*****************/
		while (cnt >= 0 && !exit_loop) {
			ioControl->writePin(24, 1);
			if (sensor->getSensorRoutine() == 7) {
				sensor->startRoutine();
			}

			cnt = webSocket->acceptNew();
		}
		/* Abbruchroutine */
		webSocket->closeRoutine();

		sensor->closeSensor();			// Close Sensor-Socket

	#ifndef HAVE_SYSTEMD
		closelog();
	#endif

	return exit_value;
}

