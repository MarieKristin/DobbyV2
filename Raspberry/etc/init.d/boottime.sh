#! /bin/sh
### BEGIN INIT INFO
# Provides: Boottime
# Required-Start: $syslog
# Required-Stop:  $syslog
# Default-Start:  2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: Boottime
# Description:
### END INIT INFO

case "$1" in
start)
echo "Boottime wird gestartet"
# Starte Programm
#/home/pi/WebSocketsServer/release/WebSocketsServer
#/home/pi/Dobby/release/Dobby
/home/pi/Boot/release/Boottime &
;;

stop)
echo "Boottime wird beendet"
# Beende Programm
killall Boottime
;;

*)
echo "Benutzt: /etc/init.d/boottime.sh { start|stop }"
exit 1
;;
esac
exit 0
