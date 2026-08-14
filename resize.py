from PIL import Image
import os

img = Image.open('public/logo1.jpeg')
# Resize keeping aspect ratio, width = 600
wpercent = (600 / float(img.size[0]))
hsize = int((float(img.size[1]) * float(wpercent)))
img = img.resize((600, hsize), Image.Resampling.LANCZOS)
img.save('public/logo1_small.webp', format='WEBP')
print("Saved logo1_small.webp")
