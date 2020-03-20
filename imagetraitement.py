from PIL import Image
import os
dirs = os.listdir("image")
i = 100;
for x in dirs:
	image = Image.open("image/"+x)
	new_image = image.resize((224, 224))
	new_image.save('image/'+str(i)+'.jpg')
	i = i + 1