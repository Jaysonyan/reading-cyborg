from bs4 import BeautifulSoup as soup
from urllib2 import urlopen

webURL = "https://americanliterature.com/short-stories-for-children"
homepage = urlopen(webURL)
homepageHTML = homepage.read()
homepage.close()
homeSoup = soup(homepageHTML, "html.parser")
print homeSoup.body.em
rawLinks = homeSoup.findAll("figure", {"class":"imgcs"})
#print rawLinks[0].a
links = []
# for item in rawLinks:
#     links.a.
