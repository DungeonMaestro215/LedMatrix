# Scroll and color test

import time
import board
import json
import terminalio
from adafruit_matrixportal.matrixportal import MatrixPortal

URL="http://afternoon-plateau-82522.herokuapp.com/message/messageget"

# --- Display setup ---
matrixportal = MatrixPortal(
                status_neopixel=board.NEOPIXEL,
                debug=True,
                width=128,
                height=32,
                serpentine=True,
                url=URL)

# Create a new label with the color and text selected
matrixportal.add_text(
    text_font=terminalio.FONT,
    text_position=(0, (matrixportal.graphics.display.height // 2) - 1),
    scrolling=True,
)

SCROLL_DELAY = 0.03


contents = [
    { 'text': 'Bruh',  'color': '#cf2727'}]

while True:
    try:
        message = json.loads(matrixportal.fetch())
        matrixportal.set_text(message['message'])
        matrixportal.set_text_color(message['color'])
        matrixportal.scroll_text(SCROLL_DELAY)
    except(ValueError, RuntimeError) as e:
        print("Error! - ", e)

    # for content in contents:
#         matrixportal.set_text(content['text'])

#         Set the text color
#         matrixportal.set_text_color(content['color'])

#         Scroll it
#         matrixportal.scroll_text(SCROLL_DELAY)

    time.sleep(10) # wait 60 seconds
