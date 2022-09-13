# Display test

# Imports
import time
import board
import json
import displayio
from adafruit_matrixportal.matrixportal import MatrixPortal

# Config
bit_depth = 6
base_width = 64
base_height = 32
chain_across = 1
tile_rows = 2
serpentine = True

MATRIX_WIDTH = base_width * chain_across
MATRIX_HEIGHT = base_height * tile_rows

# Message app website
# URL="http://afternoon-plateau-82522.herokuapp.com/message/messageget"
URL="http://dennysprojects.herokuapp.com/multipaint/"

# Color Palette
palette = displayio.Palette(3)
palette[0] = 0x000000
palette[1] = 0x222222
palette[2] = 0x880000


# Setup objects
matrixportal = MatrixPortal(
    status_neopixel=board.NEOPIXEL,
    debug=True,
    width=MATRIX_WIDTH,
    height=MATRIX_HEIGHT,
    bit_depth=bit_depth,
    serpentine=serpentine,
    tile_rows=tile_rows,
    url=URL
)
display = matrixportal.display
group = displayio.Group()
bitmap = displayio.Bitmap(display.width, display.height, len(palette))
tile_grid = displayio.TileGrid(bitmap, pixel_shader=palette)
group.append(tile_grid)
display.show(group)

# Bitmap
#bitmap = displayio.Bitmap(display.width, display.height, 4)

# Color some pixels
#bitmap[0, 15] = 1
#bitmap[0, 16] = 1
#bitmap[1000] = 2

# Loop
i = 4095
while True:
    bitmap[i] = 1
    if (i != 4095): bitmap[i+1] = 0
    else: bitmap[0] = 0
    i = i-1
    if (i < 0): i = 4095

    time.sleep(.001)
