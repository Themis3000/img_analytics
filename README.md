# Image analytics
*Get analytics on any page you can embed an image*

(not yet hosted, still under development)

### Where can I use this?
Anywhere you can embed an image! This could be anything from a form post to a github profile. You can get data on the
approximate amount of unique viewers, the total amount of hits, and the approximate location of visitors.

### How does it work?
Every time a webpage is loaded, it needs to also request each image on the page.In this case, it's making a request to
our server for the image. When we get an image request we are able to log the requesting ip address in order to
distinguish between users and get an approximate location on where the request is coming from. We then send the site
back a 1x1 transparent image so that the tracker image is as invisible as possible.