import os

folder = "faviconPages"
os.makedirs(folder, exist_ok=True)

for icon in ['briefcase', 'cart', 'chill', 'circle', 'dollar', 'fence', 'fingerprint', 'food', 'fruit', 'gift', 'pet', 'tree', 'vacation']:
	pagecontent = f"""
	<!DOCTYPE html>
	<html>
	<head>
	<title>Page that has {icon} as a favicon</title>
	<link rel="icon" type="image/x-icon" href="resource://usercontext-content/{icon}.svg">
	<style>
	body {{
		background-color: black;
		color: white;
	}}
	</style>
	</head>
	<body>

	<h1>This is not a real page</h1>
	<p>If you can see this, you can safely close this tab without breaking anything.</p>

	</body>
	</html>
	"""

	with open(f"{folder}/{icon}.html", "w") as pagefile:
 		pagefile.write(pagecontent)
