# Message board display

import time
import board
import json
import terminalio
from adafruit_matrixportal.matrixportal import MatrixPortal

# Message app website
URL="http://afternoon-plateau-82522.herokuapp.com/message/messageget"

# Display setup
matrixportal = MatrixPortal(
                status_neopixel=board.NEOPIXEL,
                debug=True,
                width=128,
                height=32,
                rotation=0,
                serpentine=False,
                url=URL)

# Create a new label with the color and text selected
matrixportal.add_text(
    text_font=terminalio.FONT,
    text_position=(0, (matrixportal.graphics.display.height // 2) - 1),
    scrolling=True,
)

# Delay between frames on scroll
SCROLL_DELAY = 0.03


while True:
    try:
        # Grab most recent message from the site
        message = json.loads(matrixportal.fetch())

        # Load the message and color
        matrixportal.set_text(message['message'])
        matrixportal.set_text_color(message['color'])

        # Scroll the message
        matrixportal.scroll_text(SCROLL_DELAY)
    except(ValueError, TypeError, RuntimeError) as e:
        # Any messages that can't be displayed (i.e. emojis)
        print("Error! - ", e)
        matrixportal.set_text("Error! - " + str(e))
        matrixportal.set_text_color("#ff0000")
        matrixportal.scroll_text(SCROLL_DELAY)

    time.sleep(2) # wait 2 seconds
