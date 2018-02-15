#!/usr/bin/python

from time import sleep, strftime
import smbus
import sys

# Power management registers for MPU6050
power_mgmt_1 = 0x6b
power_mgmt_2 = 0x6c


def updateweb(client, locale, status):
    """
    Update the homepage with new status
    I had to write all of this in 24 hours plus design and 3d print the cases.
    It is all hard coded as a result.
    """
    with open("/var/www/html/index.html", 'w') as f:
        # This is for the front end app
        f.write("{\"name\":\"" + client + "\",\"location\":\"" +
                locale + "\",\"dryers\":{\"1\":" +
                ('1' if status else '0') + "}}")
    with open("/var/www/html/status.html", 'w') as f:
        # This is for the sync'd device
        f.write('1' if status else '0')


def read_byte(bus, i2caddr, adr):
    """
    Read a single byte from the bus
    """
    return bus.read_byte_data(i2caddr, adr)


def read_word(bus, i2caddr, adr):
    """
    Read two bytes, high and low, from the accelerometer
    return int
    """
    high = bus.read_byte_data(i2caddr, adr)
    low = bus.read_byte_data(i2caddr, adr + 1)
    val = (high << 8) + low  # combine the high and low values
    return val


def read_word_2c(bus, i2caddr, adr):
    """
    Read a word from the register and convert it from 2's compliment if necessary.
    Return int
    """
    val = read_word(bus, i2caddr, adr)
    if (val >= 0x8000):
        return -((65535 - val) + 1)  # 2's compliment conversion
    else:
        return val


def diff(x0, y0, z0, x1, y1, z1):
    """
    Return the sum of the differences in related values.
    """
    dx = abs(x0 - x1)
    dy = abs(y0 - y1)
    dz = abs(z0 - z1)
    return dx + dy + dz


def check_vibes(x0, y0, z0, x1, y1, z1, deadzone=750):
    """
    Return boolean if the accelerometer senses vibration.
    This module has a range of 1500 while resting.
    The default dead zone is 750 because 1500 is quite rare.

    Values for this can be measured with min-max.py before coded here.
    """
    total = diff(x0, y0, z0, x1, y1, z1)
    if total > deadzone:
        return True
    return False


def main(i2caddr, client, locale):
    """
    Main program for laundry detection.
    Runs on boot and updates the default apache webserver page with a json blob of info.
    """
    bus = smbus.SMBus(1)  # Initialize bus interface
    if i2caddr is None:
        i2caddr = 0x68  # address of sensor in i2cdetect for pins 1,3,5 and 6
    bus.write_byte_data(i2caddr, power_mgmt_1, 0)  # Wake up device from sleep mode
    xacc1 = 0
    yacc1 = 0
    zacc1 = 0
    timelen = 5  # Total samples gathered before making a decision on state.
    tracker = [None] * timelen  # Sample list of boolean outcomes.
    status = True  # status carries the value from the previous sample set
    output = True  # current sample set output
    while (True):
        counter = 0  # multi use counter for indexing and counting
        for x in range(timelen):
            sleep(1)  # 1 second interval between measurements
            xacc0 = read_word_2c(bus, i2caddr, 0x3b)  # x from data sheet
            yacc0 = read_word_2c(bus, i2caddr, 0x3d)  # y from data sheet
            zacc0 = read_word_2c(bus, i2caddr, 0x3f)  # z from data sheet
            tracker[counter] = check_vibes(xacc0, yacc0, zacc0, xacc1, yacc1, zacc1)  # determine state
            xacc1 = xacc0  # update old values
            yacc1 = yacc0
            zacc1 = zacc0
            counter += 1
        counter = 0  # reusing counter for sample tallying
        for b in tracker:  # sample tallying
            if b:
                counter += 1
        if counter > timelen / 2:  # this should weed out false positives
            output = True
        else:
            output = False
        tracker = [None] * timelen  # reset sample values
        if status != output:
            with open("laundry.log", 'a') as f:
                f.write("{0}: Status changed to: {1}\n".format(strftime("%Y-%m-%d %H:%M:%S"), output))
                print("{0}: Status changed to: {1}".format(strftime("%Y-%m-%d %H:%M:%S"), output))
            updateweb(client, locale, output)
        status = output


if __name__ == "__main__":
    try:
        config = sys.argv[1]
    except IndexError:
        print("second argument is the config file")
        exit()
    settings = ["i2caddr", "client", "locale"]  # The order of items in the config
    counter = 0
    with open(config) as setup:  # Format settings file for ease of use
        for line in setup:
            line = line.strip().split("=")
            if line[0] == 'i2caddr':
                settings[counter] = int(line[1], 16)
            else:
                settings[counter] = line[1]
            counter += 1
    main(settings[0], settings[1], settings[2])
