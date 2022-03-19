# Display test

# Imports
import time
import enum
import board
import displayio
from adafruit_matrixportal.matrix import Matrix

# config
bit_depth = 1
base_width = 64
base_height = 32
chain_across = 1
tile_down = 2
serpentine = True
width = base_width * chain_across
height = base_height * tile_down

# Colors
class Color():
    BLACK = 0
    WHITE = 1
    RED = 2
    GREEN = 3
    BLUE = 4

# Color Palette
palette = displayio.Palette(5)
palette[Color.BLACK] = 0x000000
palette[Color.WHITE] = 0xFFFFFF
palette[Color.RED]   = 0xFF0000
palette[Color.GREEN] = 0x00FF00
palette[Color.BLUE]  = 0x0000FF

# Setup objects
matrix = Matrix(width=width, height=height, bit_depth=bit_depth, serpentine=serpentine)
display = matrix.display
group = displayio.Group()
bitmap = displayio.Bitmap(display.width, display.height, len(palette))
tile_grid = displayio.TileGrid(bitmap, pixel_shader=palette)
group.append(tile_grid)
display.show(group)


# Set a the pixel (to the given color
def set_pixel(bitmap, pixel_num, color):
    row = pixel_num // width
    col = pixel_num % width
    print(row, col)
    bitmap[col, row] = color

#set_pixel(bitmap, 1024, 1)
bitmap[0, 16] = Color.RED
bitmap[0, 17] = Color.GREEN
bitmap[0, 40] = Color.BLUE


print(bitmap.width, bitmap.height)

# Draw even more pixels
for x in range(32, 40):
    for y in range(4, 9):
        bitmap[x, y] = 1

# Loop forever to keep image
while True:
    pass

#while True:
    #for i in range(width*height - 1):
        #set_pixel(bitmap, i+1, 1)
        #set_pixel(bitmap, i, 0)
        #display.show(group)
        #time.sleep(1)
