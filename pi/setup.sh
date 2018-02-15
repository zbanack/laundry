#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

apt install apache2
systemctl enable apache2

echo "python ${PWD}/laundry.py" >> /etc/rc.local

reboot
