---
layout: post
title: Introducing ConsumerWise: An AI-Powered Nutrient Analysis Tool
subtitle: Your all-in-one nutrition analysis app designed to empower informed decisions about your diet.
cover-img: /assets/img/consumerwise_cover.jpg
thumbnail-img: /assets/img/consumerwise_logo.jpg
share-img: /assets/img/consumerwise_logo.jpg
tags: Web Application, Google Cloud, Gen-AI
author: Aadarsh Ramachandran
readtime: true
---

In today's fast-paced world, people don’t really have the time to analyze the complex nutritional details on packaged food product labels. Even when they do, understanding what the numbers mean for their diet or health goals can be overwhelming. That’s where ConsumerWise comes in. This is a solution myself and my friends, Harshith MR, Krishna Murari C and Sri Prakash developed in an attempt to address this problem.

ConsumerWise is a web application powered by modern-day Generative AI, designed to help users make informed decisions about their food choices. With so much confusing information on nutrition labels, ConsumerWise simplifies the process by scanning food labels and breaking down the nutritional information into easy-to-understand visual aids and text descriptions. But that's not all. It also offers a chatbot- NutriBot, that users can chat with to gain further insight on the product or ask anything else! It’s like having a nutritionist right in your pocket.

Let’s take a look at how ConsumerWise works, what makes it special, and the tech that powers it.

## How It Works
ConsumerWise runs on an end-to-end pipeline that involves a few clever steps:

OCR for Label Scanning: The first step is uploading a photo of the food product label. Using Optical Character Recognition (OCR) powered by GPT-4o MINI and the Vision API, the app extracts nutritional information like macronutrients, vitamins, minerals, and allergens. Whether it’s a clear, flat image or a label wrapped around a bottle, the OCR is designed to handle it.

Visual Aids: Once the nutritional data is extracted, ConsumerWise presents the information through visual charts like pie charts and histograms and a brief text description. This helps users quickly understand the distribution of nutrients like fats, proteins, and carbohydrates and other nutritional information.

NutriBot: Leveraging a context-aware chatbot that can also fetch relevant details from the internet as and when needed, users can simply ask the chatbot any follow-up queries related to the product or general questions. This enables users to have some kind of a pocket nutritionist. It can also give personalized responses for registered users by using the context from the answers for questions asked in the registration process (e.g., dietary preferences, allergies, health goals, etc).


## The Tech Behind ConsumerWise
The project uses a combination of cutting-edge tools to achieve its goals:

- Backend & Frontend: Built with Flask (Python) and a responsive frontend using HTML, CSS/Bootstrap, and JavaScript.
- FastAPI: Wraps all the API endpoints for LLM calls, ensuring quick and efficient processing.
- Google Cloud App Engine & Google Cloud SQL: The entire app is deployed on Google Cloud for scalability and data management.
- GPT-4o MINI & Vision API: Responsible for the natural language processing and image recognition that powers NutriBot and the OCR.
- 

## Sample Demonstration
<video width="600" controls>
  <source src="path_to_your_video.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Future Plans

Looking forward, possible ways to improve the existing solution is the following:

- Mobile App: A native version of ConsumerWise for on-the-go use without internet access.
- Web Extension: A tool that lets users easily analyze food products while shopping online without having to open another website or app.
- Recommender Systems: To provide users personalized advice and suggestions based on their preferences.

## Conclusion

ConsumerWise is an attempt to offer an intuitive and personalized way for users to make smarter food choices. By leveraging generative AI technologies, we envision a world with improved consumer awareness and a healthier lifestyle.
