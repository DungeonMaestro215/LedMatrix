# SPDX-FileCopyrightText: 2020 Melissa LeBlanc-Williams, written for Adafruit Industries
#
# SPDX-License-Identifier: Unlicense
"""
This example checks the current Bitcoin price and scrolls it across the screen
"""
import time
import board
import terminalio
from adafruit_matrixportal.matrixportal import MatrixPortal

matrixportal = MatrixPortal()
matrixportal.add_text(text_position=(0,3), text_color=0xFFFFFF, scrolling=True)
matrixportal.set_text('This is a test')

while True:
    matrixportal.scroll()
    time.sleep(0.02)
