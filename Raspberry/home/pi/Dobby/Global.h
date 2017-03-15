/* ***************************************** */
/* Globale Variablen 			     */
/* ***************************************** */

#pragma once

LogFiles *logfiles = new LogFiles();

IOControl *ioControl = new IOControl(logfiles);

Lin *lin = new Lin(ioControl, logfiles);

Sensor *sensor = new Sensor(ioControl, logfiles);


