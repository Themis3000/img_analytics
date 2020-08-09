# Image analytics
*Get simple analytics on any page you can embed an image*

Live on site https://imgtraker.herokuapp.com/

Statistics panel for this page: https://imgtraker.herokuapp.com/stats/BzgJPaac
(somewhat dodgey on github sense github makes the request and passes it through to the browser)

### Where can I use this?
Anywhere you can embed an image! This could be anything from a form post to a github profile. You can get data on the
approximate amount of unique viewers, the total amount of hits, and the approximate location of visitors. (This however
depends on rather the website caches the image, which many modern websites do, but not all. Your mileage may varray site to site)

### How does it work?
Every time a webpage is loaded, it needs to also request each image on the page.In this case, it's making a request to
our server for the image. When we get an image request we are able to log the requesting ip address in order to
distinguish between users and get an approximate location on where the request is coming from. We then send the site
back a 1x1 transparent image so that the tracker image is as invisible as possible.

### How much does this slow down page load times?
This should leave page load times virtually unaffected because logging is done in a seprate thread, so the image is sent back
before the database call to log the visit occurs

![Tracker image](https://imgtraker.herokuapp.com/img/BzgJPaac.jpeg)
