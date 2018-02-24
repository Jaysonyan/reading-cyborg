from bs4 import BeautifulSoup as soup
from urllib2 import urlopen
import re
import os

os.chdir('stories')
webURL = "https://americanliterature.com/short-stories-for-children"
homepage = urlopen(webURL)
homepageHTML = homepage.read()
homepage.close()

homeSoup = soup(homepageHTML, "html.parser")
rawLinks = homeSoup.findAll("figure", {"class":"imgcs"})

storyTitles = open("storyName.txt", 'w')

for item in rawLinks:
    storyURL = 'https://americanliterature.com'+ item.a['href']
    storypage = urlopen(storyURL)
    storyHTML = storypage.read()
    storypage.close()

    storySoup = soup(storyHTML, "html.parser")

    storyInfo = storySoup.findAll("div", {"class":"jumbotron"})
    try:
        title = storyInfo[0].h1.cite.get_text().replace("-", ' ')
        storyContent = storySoup.find_all(["p", "pre"])
        garbage = []
        for i in range(0,len(storyContent)):
            storyContent[i] = storyContent[i].encode('utf-8')
            if "href" in storyContent[i]:
                garbage.append(i)
            storyContent[i] = re.sub('<[^>]+>', '', storyContent[i])

        for i in range(len(garbage)-1,-1, -1):
            del storyContent[garbage[i]]

        storyContent = [x for x in storyContent if x != '']

        filename = "%s.txt" %title
        storyText = open(filename , 'w')
        storyText.write(title+",\n")
        storyTitles.write(title+",")

        for paragraph in storyContent:
            storyText.write(paragraph)
            storyText.write('\n')
        storyText.close()
    except:
        pass
storyTitles.close()
