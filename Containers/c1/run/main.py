from urllib.request import urlopen

with urlopen('https://example.com') as f:
  print(f.read().decode('utf-8'))