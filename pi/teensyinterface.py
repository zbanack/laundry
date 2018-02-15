import sys
import RPi.GPIO as GPIO
import time
import urllib2

# Pins that the Teensy is connected to
# LSB last (Little endian)
channels = (6, 13, 19, 26)

GPIO.setmode(GPIO.BCM)
GPIO.setup(channels, GPIO.OUT)  # Set pins' mode is output


def tobin(i):
    return str(bin(i)[2:]).zfill(4)  # Convert to string for ease of processing


for i in channels:
    GPIO.output(i, GPIO.LOW)  # Set pins to high(+3.3V) to off led


while(True):
    try:
        # Set this before using
        status = urllib2.urlopen("URL OF TARGET PARTNER").read()
    except Exception:
        status = 0
    status = int(status)
    if status:
        status = 2
    else:
        if len(sys.argv) > 1:
            status = int(sys.argv[1])
        else:
            status = 1
    status = tobin(status)

    # Each status permutation corresponds to an LED pattern on the teensy.
    if status[0] == '1':
        GPIO.output(channels[0], GPIO.HIGH)
    else:
        GPIO.output(channels[0], GPIO.LOW)
    if status[1] == '1':
        GPIO.output(channels[1], GPIO.HIGH)
    else:
        GPIO.output(channels[1], GPIO.LOW)
    if status[2] == '1':
        GPIO.output(channels[2], GPIO.HIGH)
    else:
        GPIO.output(channels[2], GPIO.LOW)
    if status[3] == '1':
        GPIO.output(channels[3], GPIO.HIGH)
    else:
        GPIO.output(channels[3], GPIO.LOW)
    print(status)
    time.sleep(5)
GPIO.cleanup()
