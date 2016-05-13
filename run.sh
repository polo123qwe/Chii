#!/bin/sh
echo Chii Started
nohup forever -a -o /home/pi/Documents/Projects/logs/chii/out.log -e /home/pi/Documents/Projects/logs/chii/err.log start -w --watchDirectory /home/pi/Documents/Projects/chii --watchIgnore /home/pi/Documents/Projects/chii/.git --killSignal=SIGTERM --exitcrash --uid "chii" /home/pi/Documents/Projects/chii/bin/bot.js >> /home/pi/Documents/Projects/logs/chii/nohup.out &

