---
layout: post
title: "💆‍♀️ State of Recommendations"
description: "Product embeddings. Users via products. Jobs recommenders."
image:
  path: /assets/newsletter/db.png
date: 2020-08-18
category: data-meets-product
toc: true
---
* TOC
{:toc}

## Belarus
> 🚨 The last week was really sad for the Belarus. And independent of your political views I encourage to check out any news on the situation there. 🚨


On the data side we've got plenty of recent articles about **recommenders**. This is going to be a lengthy piece covering 5 articles, 3 papers and providing an overview on how recommenders are built at this current moment. Most cases will be structured as follows: overview, data, model, evaluation, results.

Generally, the industry have converged to **embedding representations** of both users (customers) and items (anything that is . The difference is mostly in **how these vectors are generated and how are used afterwards.** Two biggest trends:
> - On the **item side**: pretty much every one builds embedding spaces to optimize for the product similarity.
> - On the **user side**: customer representations really vary depending on the use case and business model. 
{: .thought}


## LinkedIn Learning
![data]({{ site.url }}{{ site.baseurl }}/assets/newsletter/linkedin.png){: class="thumbnail-img"}

We start with the LinkedIn Learning use case and their two [^1] [^2] articles about it. The main goal for them is to *"surface the most relevant and personalized course recommendations"*.

There are two main models powering the offline (recalculated for each user) recommendations - neural collaborative filtering [^3] and generalized linear mixed model [^4].

### Collaborative Filtering (CF)
**Overview:** pros/cons of CF are well-known and LinkedIn didn't escape them. Here is their recap:

- works better for core learners (members who are already active on the LinkedIn Learning platform)
- focuses on recent interactions *(not a very common one, probably a property of their implementation)*
- diversified recommendations
- no domain knowledge needed
- however, cold start problems

> I think recency and diversity are the most interesting points here.
> - **Recency:** generally, CF doesn't give preference for the recent items unless implemented with some kind of time decay or position-aware component in the model.
> - **Diversity:** in e-commerce, CF often REDUCES the diversity of the content because it converges to clusters of popular items. And here, probably, due to the fact that course catalog is not that big and that every person can take any course, it's actually increases it.
  {: .thought}

**Data:** Course watch history data with a watch-time threshold (if a learner only watches the first three seconds of a course, it's not included).

**Model:** Computing learner and course embeddings separately. This is also knows a two-tower architecture. [^5]

> Interesting that input to the learner part is **user/course co-occurrence matrix**, while input to the course part is **course/course similarity** matrix.
{: .thought}

**Training/Evaluation:** the modeling objective is to predict course watches using the past watches. The important part is to split training data by time to avoid leakage. Holding the last interaction for each user as a test set - **leave-one-out** approach. 

It's expensive to rank all items for all users, so a random sample of 100 items that user didn't interact with is taken and the one item that is tried to be predicted is ranked against these 100. Performance is judged by **hit ratio and NDCG** at 10 are calculated after.

**Results:** 


### Response Prediction Model
Another offline model to compliment CF is so-called "Response Prediction". It takes into account user and course metadata as well as user's actions

> This algorithm typically performs better than CF for members with no/little previous engagement on LinkedIn Learning, as well as for new courses with few prior interactions.

**Data**:
- User profile features (skills, industry, etc.)
- Course metadata (difficulty, category, skills)
- Historical explicit engagement (clicks, bookmarks, etc.) with the course watch time as an importance weight given to each click instance

> As a result, this importance weight helps to promote courses with higher watch times and creates a model that can optimize for course watches, not just clicks.

**Model**: a fancy named "Generalized Linear Mixture Model (GLMix)" is used here. In reality, it's actually quite a simple (though hard computationally, [check the paper](https://www.kdd.org/kdd2016/papers/files/adf0562-zhangA.pdf)) approach to express user's probability to click via a sum of the three components: a global model, per-learner model, and per-course model.

### Next steps
> We are currently working on a model ensemble that can perform personalized blending of Response Prediction and Neural CF models to improve the overall performance on the final recommendation task. Secondly, we also plan to adopt Attention Models into our Neural CF framework for learner profiling, i.e., assigning attention weights to a learner’s course watch history to capture long term and short term interests in a more effective manner.



Qualified Applicant (QA) AI model, which learns the kinds of applicant skills and experience that a hirer is looking for based on the hirer’s engagement with past candidates

## LinkedIn Jobs
In their [next article](https://engineering.linkedin.com/blog/2020/quality-matches-via-personalized-ai) LinkedIn shared some insights on their jobs recommendations (which can be probably useful for any job-seeker).

> Our analysis demonstrated that the majority of job applicants **apply to at least 5 jobs**, while the majority of **job postings receive at least 10 applicants**. This proves to result in enough data to train the personalization models.

**Goal**: to predict the probability of a positive recruiter action, conditional on a given member applying to a given job.

**Data**: One of the most interesting parts here. How to identify if a signal is negative? 
> We make the negatives conclusive if no engagement is seen after 14 days. [However,] if a recruiter responds to other applications submitted later, we may infer the negative label [earlier].

**Model**: here, the same model from the above (GLMix).

```logit(P(positive response | member, job)) = F_global(X_member, X_job) + F_member(X_job) + F_job(X_member)```


> We used linear models for fm and fj, but one **can use any model in the above formulation as long as the produced scores are calibrated to output log-odds** (for example, a neural net). Usually, linear models are sufficient as per-member and per-job components, as individual members and individual jobs **do not have enough interactions** to train more complex non-linear models.

**Evaluation**: AUC and NDCG is used.

**Production**: 
- user/job models are retrained daily, with automated quality checks in place
- global model his updated once every few weeks
- initializing weights with existing values to reduce the training time

## Pinterest
And now - Pinterest. A very thoughtful and a pragmatic [piece from them](https://medium.com/pinterest-engineering/pinnersage-multi-modal-user-embedding-framework-for-recommendations-at-pinterest-bfd116b49475). Really worth checking out.
![data]({{ site.url }}{{ site.baseurl }}/assets/newsletter/pinterest.png){: class="thumbnail-img"}


### General Idea
Represent users via item embeddings. But averaging of embeddings works bad for longer-term user interests (e.g. paintings and shoes average to a salad). Hence, first they run **item clustering** on the last 90 actions of a user and **medoids** (like centroids, but should be an existing item) from the 3 most important clusters are taken (3 is a sweet spot for the performance/diversity tradeoff). After they have 3 items aNN search is performed to find similar items. Using medoids instead of cluster averages also **improves caching** of the solution.

### Model
The main model is quite simple [Ward clustering](https://en.wikipedia.org/wiki/Ward%27s_method) with the goal to produce different amount of clusters depending on variety of items in the user’s history. A time decay average is used to assign importance to clusters.

### ANN
- Using HNSW
- Filtering out near duplicates and lower quality pins
- Using medoids allows to save in caching (no need to compute aNN all the time)

### Model serving
Served using a classical [lambda architecture](https://en.wikipedia.org/wiki/Lambda_architecture):
> 1. Daily Batch Inference: PinnerSage is run daily over the **last 90 day actions** of a user on a MapReduce cluster. The output of the daily inference job (list of medoids and their importance) are served online in key-value store.
2. Lightweight Online Inference: We collect the **most recent 20 actions** of each user on the latest day (after the last update to the entry in the key-value store) for online inference. PinnerSage uses a real-time event-based streaming service to consume action events and update the clusters initiated from the key-value store. 
In practice, the system optimization plays a critical role in enabling the productionization of PinnerSage.

Also in [the paper](https://arxiv.org/pdf/2007.03634.pdf) they explain a very thorough approach to the model evaluation, check it out.

[^1]: [LinkedIn's Learning Recommendations Part 1](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-one){: target="_blank"}
[^2]: [LinkedIn's Learning Recommendations Part 2](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-two){: target="_blank"}
[^3]: [LinkedIn's Neural Collaborative Filtering](https://arxiv.org/pdf/1708.05031.pdf)
[^4]: [LinkedIn's Generalized Linear Mixed Models](https://www.kdd.org/kdd2016/papers/files/adf0562-zhangA.pdf)
[^5]: From a very good [recommendations introduction by Google](https://developers.google.com/machine-learning/recommendation/dnn/softmax#can-you-use-item-features){: target="_blank"}.
