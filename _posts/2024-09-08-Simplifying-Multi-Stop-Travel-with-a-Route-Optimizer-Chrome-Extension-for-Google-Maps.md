---
layout: post
title: Simplifying Multi-Stop Travel with a Route Optimizer Chrome Extension for Google Maps
subtitle: Stop Guessing, Start Optimizing!
cover-img: /assets/img/maps.jpg
thumbnail-img: /assets/img/maps.jpg
share-img: /assets/img/maps.jpg
tags: 
author: Aadarsh Ramachandran
readtime: true
---

Google Maps is your go-to tool for navigation, packed with real-time traffic updates, estimated travel times, and detailed directions. But when it comes to planning routes with multiple stops, it falls short. There's no automatic way to optimize the order of your stops, leaving you to manually figure out the most efficient route. Who has time for that? 

This project introduces a Chrome extension that handles the optimization for you. It works directly within Google Maps, reading your chosen locations, calculating the optimal order, and then reloading the map with a more efficient route. No need to switch to a different app or website—this extension enhances your Google Maps experience right in your browser. Ofcourse, I get that this solution is designed specifically for Google Maps used in a browser which may not always be the case, but it still solves a real problem effectively.

The project taps into the Traveling Salesman Problem (TSP), which is all about finding the shortest possible route that visits a set of locations exactly once and returns to the starting point. The problem is represented as a graph, with locations as nodes and the routes between them as edges. The weight of each edge is the distance between two locations.

To crack this problem, we use Google's OR-Tools TSP solver to find the optimal solution in a fast and efficient way. And though it is based on the TSP, it can still optimize for one-way journeys. How so? Tweak the logic such that the return cost to the starting point is zero. This achieves an optimal route for one-way journeys while still solving a TSP.

So how does the extension work? You enter your locations in Google Maps opened in a browser, click on the extension, and it does the heavy lifting of figuring out the best order. It sends your input to a FastAPI backend, which handles the optimization. The extension then opens Google Maps in a new tab with the updated route, making it a seamless experience.

Consider the below image, as an example, where the desired locations to be visited are, in general, somewhere in San Fransisco, San Jose, Sunnyvale, New York and Texas. You input the order shown (San Fransisco -> Texas -> Sunnyvale -> New York -> San Jose -> San Fransisco) and the map shows your route. Clearly, it is not optimal.
![Example search](/assets/img/before.png)
To get the optimal order, you open the RouteOptimizer extension and answer 'Yes' for the 'Is this a round trip?' question, since we start and end at San Fransisco. Then, clicking 'Find Optimal Route' button will send the input location data to the backend sever where an API for the optimizer model is present. It then opens another tab with the optimal order in map.
![After Optimizing](/assets/img/after.png)
As it can be seen, the order is clearly better. (If you notice something fishy, check the *Note-* at the end of the post.)

To check out the project setup and dive into the code, [here's my GitHub repo](https://github.com/aadarshram/RouteOptimizer/tree/main).

**Note-**
For geocoding, the project uses Nominatim’s Geocoding API to convert addresses into latitude and longitude coordinates. And to calculate the actual distances between these points, it relies on Project OSRM’s Table Service.
The project uses free and open-source APIs, which makes development cost-effective. However, these services might occasionally throw errors or return less-than-perfect results. If you need more reliability or accuracy, you can always switch to more premium options and tweak the code in `utils.py` accordingly.

If you have any questions or want to discuss this project further, feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/aadarsh-ramachandran-881a08293).

