# Skew: A Newspaper Bias Meter

> A Vue.js project
> This project was created by Dylan Vanelli and Sean Snider for CS290.
> The instructions below provide a sure-fire way to run the application locally on your machine. The data within the application saves to Firebase, so all interactions made by the user are recorded and update the application in real time for all users.
> This application is important and relevant in light of so-called "fake news." The integrity of publications now more than ever must be critically evaluated by the public in order to ensure information is accurate. In that light, we are entrusting the public with determining the media biases of various newspapers.
> In order to ensure this data is accurate, we have provided tools in our application for users to express their approval of current scores. If approval ratings are noticeably low for a given source, then administrators can take note of the source and determine whether or not to manually remove it.
> For reference, in order to access the administrative account to test features, the administrative account we have set up for testing purposes is as followed: username: admin@skew.com, password: admin123.

## Build Setup

``` bash
#First clone this repository to your local machine. Then cd into the clone's directory and do the following:

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## About the project:

### Interactively enter data or load data from an online source that is organized within a database
• User may vote on the bias of a news source, share whether they agree with the current bias rating, and if appropriate, upload a newspaper.<br>
• Data is stored on Firebase. Newspapers are stored in an array of objects that contain all relevant information (creatorID, name, url, votes, thumbs up, thumbs down). When a user interacts with the voting section of the website, the information on Firebase is altered in real time. User information (history of votes and approval ratings of publications) is also stored in Firebase. This information is also altered in real-time as a user interacts with the application.<br>
### Interact with the cumulative data in a useful way
• Data on each newspaper is visualized using Chart.js, which allows data fields to be manipulated to alter the visualization. Pie charts are constructed to show both the breakdown of votes for each political bias for each newspaper, as well as the approval rating of that newspaper. The approval rating is a key insight because a newspaper may be inaccurately determined to be Conservative, for example, so users can express their disagreement so that administrators may review the listing.<br>
### View the cumulative or individual data in multiple ways
• User voting and approval statistics are constantly collected and computed into meaningful statistics. Some key statistics include: a user's average approval rating (how many newspaper bias ratings they agree with), a user's voting history, and a user's political bias based on how they voted compared to how the majority of users voted. A user's personal bias is specifically important because it determines a user's ability to create new newspapers. If a user is proven to be excessively bias (ex. voting Conservative on multiple publications that are clearly Liberal), they will lose their ability to add content.<br>
### Keep track of individual preferences regarding users of your web site
• User voting and approval rating habits are stored on Firebase and retrieved on login. As mentioned above, these voting habits make for meaningful statistics. Both voting and approval statistics are stored as arrays on Firebase and are updated in real time if a user decides to change their vote.<br>
<br>

### Roles
Check the application "About" tab for information on different types of users and their abilities.

### User Feedback
Christian Leonard: "The website feels pretty easy to navigate. I really liked the visualizations, but wasn't sure why you separated the bias votes and the approval ratings... might look better if they were side to side. The Emojis are great though. Makes the site seem modern and social-media oriented somehow. The site also feels really fast. The interface is really reactive and helps with the user's interactions."

Nathan Vanelli: "Cool app, better concept. The concept is great and pretty relevant to what's going on with "fake news" and the power of user data, revealed by the Cambridge Analytica scandal. The visualization page was my favorite part, just because it's easier to make sense of large groups of numbers with graphs. Also, the user stats page is interesting -- it shows how submitting a small amount of information can reveal larger trends about a user. I would like to know more about the exact math behind the bias calculations, but the explanations/methodology was pretty clear."

Logan Tappe: "Pretty awesome! In terms of User Experience, the app flows pretty well. However, I would make the home page the about page and then provide an easy way to navigate to the page where you vote. Other than that the layout seemed pretty logical and the overall concept is really cool! I like how you took data presented on one page and graphed it on another. it might have been smart to format them all on the same page. For example, maybe next to each newspaper bias/approval ratings you put the graphs. That might be too cluttered though. Overall, really cool app!"
