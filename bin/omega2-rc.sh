#!/bin/sh

omega2-ctrl gpiomux set spi_cs1 gpio

while read pin; do
  fast-gpio set-output $pin
  fast-gpio set $pin 0
  if [[ ! -f /sys/class/gpio/gpio$pin ]]; then
    echo $pin > /sys/class/gpio/export
  fi
done <<EOF
  0
  1
  6
  2
  3
  18
  19
  11
EOF
