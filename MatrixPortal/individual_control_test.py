# Display test

# Imports
import time
import board
import displayio
from adafruit_matrixportal.matrix import Matrix

# config
MATRIX_WIDTH = 64
MATRIX_HEIGHT = 64
palette = displayio.Palette(2)
palette[0] = 0x000000   # Black
palette[1] = 0xFFFFFF   # White

# Setup objects
matrix = Matrix(width=MATRIX_WIDTH, height=MATRIX_HEIGHT, bit_depth=3)
display = matrix.display
print(dir(display))
group = displayio.Group()
bitmap = displayio.Bitmap(display.width, display.height, 2)
tile_grid = displayio.TileGrid(bitmap, pixel_shader=palette)
group.append(tile_grid)

# Paint some stuff
#bitmap[32, 16] = 1

# Show it
#display.show(group)
def set_pixel(bitmap, pixel, color):
    row = pixel%MATRIX_WIDTH
    col = pixel//MATRIX_WIDTH
    bitmap[row, col] = color

while True:
    for i in range(MATRIX_WIDTH*MATRIX_HEIGHT - 1):

        set_pixel(bitmap, i+1, 1)
        set_pixel(bitmap, i, 0)
        display.show(group)
        time.sleep(0.01)
