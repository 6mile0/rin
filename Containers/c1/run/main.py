from urllib.request import urlopen

with urlopen('https://www.teu.ac.jp/') as f:
  print(f.read().decode('utf-8'))