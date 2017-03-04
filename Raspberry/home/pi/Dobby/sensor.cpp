#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <netdb.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <sensor.h>

/* ***************************************** */
/* Socketadresse - IPv4 or IPv6: 	     */
/* ***************************************** */
void *get_in_addr(struct sockaddr *sa) {

	if (sa->sa_family == AF_INET) {
		return &(((struct sockaddr_in*) sa)->sin_addr);
	}
	return &(((struct sockaddr_in6*) sa)->sin6_addr);
}

/* ***************************************** */
/* Initialisierung der Sensor-Verbindung   	 */
/* ***************************************** */
int Sensor_initialisierung() {
	const char* hostname = "192.168.111.111";
	int new_fd;
	int numbytes = 0;
	socklen_t addr_size;
	char buf[MAXDATASIZE];
	struct sockaddr_storage their_addr;
	struct addrinfo hints, *servinfo, *p;
	int rv;
	char s[INET6_ADDRSTRLEN];
	memset(&hints, 0, sizeof hints);
	hints.ai_family = AF_UNSPEC;
	hints.ai_socktype = SOCK_STREAM;
	hints.ai_flags = AI_PASSIVE;
	if ((rv = getaddrinfo(hostname, PORT, &hints, &servinfo)) != 0) {
		fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(rv));
		return 1;
	}
	// loop through all the results and connect to the first we can
	for (p = servinfo; p != NULL; p = p->ai_next) { 				// Socket
		if ((sockfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol))
				== -1) {
			perror("client: socket");
			continue;
		}
		if (connect(sockfd, p->ai_addr, p->ai_addrlen) == -1) { 	// Connect
			// close(sockfd);
			perror("client: connect");
			continue;
		}
		break;
	}
	if (p == NULL) {
		fprintf(stderr, "client: failed to connect\n");
		return 2;
	}
	if (NULL
			!= inet_ntop(p->ai_family,
					get_in_addr((struct sockaddr *) p->ai_addr), s, sizeof s)) {
		printf("client: connecting to %s\n", s);
	}
	freeaddrinfo(servinfo);

	gpioWrite(24, 1);
	delay(2000);
	gpioWrite(24, 0);
	return (7);
}


/* ***************************************** */
/* Sensor-Routine 			     */
/* ***************************************** */
void Sensor_routine() {

	char* msg = "\x02sRN LMDscandata\x03\0";
	int len = strlen(msg);
	int numbytes = 0;
	char buf[MAXDATASIZE];

	int sent = send(sockfd, msg, len, 0);	 // Befehl zur Messwertanforderung
	if (sent != -1) {
		printf("%s gesendet, %d Bytes\n", msg, sent);
	}
	if (sent == -1) {
		printf("Senden fehlgeschlagen\n");
	}

	gpioInitialise();

	numbytes = recv(sockfd, buf, MAXDATASIZE - 1, 0);	// Empfang der Messwerte
	buf[numbytes] = '\0';					// Abschluss des Messwert-Strings
	printf("client: received '%s'\n", buf);

	char Messdateneinheit[6] = "DIST1";	// Startwert der Messkomponenten zur Auswertung
	int pos_search = 0;							//
	int pos_text = 0;							// Aktuelle Stelle im Suchstring
	int len_search = 5;					// Länge des Suchstringes (der Needle)
	int len_text = MAXDATASIZE;

	for (pos_text = 0; pos_text < len_text - len_search; ++pos_text)// Funktion zum Suchen des Startwertes der Messkomponenten
			{
		if (buf[pos_text] == Messdateneinheit[pos_search]) {
			++pos_search;
			if (pos_search == len_search) {
				// match
				printf("match from %d to %d\n", pos_text - len_search,
						pos_text);
				break;
			}
		} else {
			pos_text -= pos_search;
			pos_search = 0;
		}
	}

	int i = (pos_text - len_search) + 1;// Position des 1. Buchstabes der Needle
	int k = 0;							// Laufvariablen
	char Messdateninhalt[6];					// 1. Argument
	char Skalierungsfaktor[9];					// 2. Argument
	char Skalierungsoffset[9];					// 3. Argument
	char Startwinkel[9];						// 4. Argument
	char Winkelschrittweite[5];					// 5. Argument
	char Anzahl_Daten[5];						// 6. Argument

	while (buf[i] != ' ') {
		Messdateninhalt[k] = buf[i];
		k++;
		i++;
	}
	Messdateninhalt[6] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Skalierungsfaktor[k] = buf[i];
		k++;
		i++;
	}
	Skalierungsfaktor[9] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Skalierungsoffset[k] = buf[i];
		k++;
		i++;
	}
	Skalierungsoffset[9] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Startwinkel[k] = buf[i];
		k++;
		i++;
	}
	Startwinkel[9] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Winkelschrittweite[k] = buf[i];
		k++;
		i++;
	}
	Winkelschrittweite[5] = '\0';
	i++;
	k = 0;
	while (buf[i] != ' ') {
		Anzahl_Daten[k] = buf[i];
		k++;
		i++;
	}
	Anzahl_Daten[5] = '\0';
	i++;

	int l = 0;
	char Entfernung[5];										// Entfernung in mm
	int AnzahlDaten = (int) strtol(Anzahl_Daten, NULL, 16);
	printf("%d\n", AnzahlDaten);

	for (k = 1; k < 181; k++) {
		while (buf[i] != ' ') {
			Entfernung[l] = buf[i];
			l++;
			i++;
		}

		if (l <= 5) {
			Entfernung[l] = '\0';
		}
		int entfernung = (int) strtol(Entfernung, NULL, 16);

		printf("%d %d", k, entfernung);
		if (entfernung < 10) {
		} else {
			if (entfernung < 400) {
				if (entfernung < 180) {
					ausloeser = k;
					gpioWrite(27, 1);
					printf("STOP\n");
				} else {
					printf("ACHTUNG\n");
					if (k == ausloeser) {
						gpioWrite(27, 0);
						ausloeser = 0;
					}
				}
			} else {
				printf("alles ok\n");
				if (k == ausloeser) {
					gpioWrite(27, 0);
					ausloeser = 0;
				}
			}
		}
		i++;
		l = 0;
	}
	printf("Ende-Sensor\n");
}
