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

> 🚨 The last 2 weeks were really sad for the Belarus. Independent of your political views I encourage to check out any news on the situation there. 🚨

On the data side we've got plenty of recent articles about **recommenders**. This is going to be a lengthy piece covering 5 articles, 3 papers and providing an overview on how recommenders are built at this current moment. Most cases will be structured as follows: _overview->data->model->evaluation_. I prefer not to pay much attention to the reported results because they are relative to the previos baseline performance and cannot be used outside of the context.

Generally, the industry have converged to **embedding representations** of both users (customers) and items (anything that is the main product for the business). The difference is mostly in **how these vectors are generated and how are used afterwards.** The main trends covered:

> * It's all started with Matrix Factorization but then shifted towards neural nets and embedding spaces.
> * On the **item side** pretty much every one converged to building embeddings to optimize for the product similarity.
> * On the **user side,** however, representations vary depending on the use case and business model.
{: .thought}

## LinkedIn

### LinkedIn Learning

![data]({{ site.url }}{{ site.baseurl }}/assets/newsletter/linkedin.png){: class="thumbnail-img"}

We start with the LinkedIn Learning use case and their two-episode article ([one](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-one){: target="_blank"}, [two](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-two){: target="_blank"}). The main goal for them is to *"surface the most relevant and personalized course recommendations"*.

There are two main models powering the offline (precalculated for each user) recommendations - neural collaborative filtering and generalized linear mixed model.

#### Collaborative Filtering (CF)

**Overview:** pros/cons of CF are well-known and LinkedIn didn't escape them. Here is their recap:

* works better for core learners (members who are already active on the LinkedIn Learning platform)
* focuses on recent interactions *(not a very common one, probably a property of their implementation)*
* diversified recommendations
* no domain knowledge needed
* however, cold start problems

> I think recency and diversity are the most interesting points here.
>* **Recency:** generally, CF doesn't give preference for the recent items unless implemented with some kind of time decay or position-aware component in the model.
>* **Diversity:** in e-commerce, CF often REDUCES the diversity of the content because it converges to clusters of popular items. And here, probably, due to the fact that course catalog is not that big and that every person can take any course, it's actually increases it.
  {: .thought}

**Data:** Course watch history data with a watch-time threshold (if a learner only watches the first three seconds of a course, it's not included).

> Two tower architecture consists of two networks with fully connected layers in each becoming narrower with each consecutive layer.
{: .thought}

**Model:** Computing learner and course embeddings separately. This is also known as a _two-tower architecture._ Log loss is used as an optimization function. The modeling objective is to predict course watches using the past watches. 4 negative samples are taken for each positive one.

> Interesting that input to the learner part is **user/course co-occurrence matrix**, while input to the course part is **course/course similarity** matrix.
{: .thought}

**Evaluation:** Holding the last interaction for each user for a test set - **leave-one-out** approach. A random sample of 100 items that user didn't interact with is taken and the one hidden item (user's last action) is ranked against these 100. Performance is judged by **hit ratio and NDCG** at 10.

**Production:** 

#### Response Prediction Model

Another offline model to compliment CF is so-called "Response Prediction". It takes into account user and course metadata as well as user's actions

> This algorithm typically performs better than CF for members with no/little previous engagement on LinkedIn Learning, as well as for new courses with few prior interactions.

**Data**:

* User profile features (skills, industry, etc.)
* Course metadata (difficulty, category, skills)
* Historical explicit engagement (clicks, bookmarks, etc.) with the course watch time as an importance weight given to each click instance.

> As a result, this importance weight helps to promote courses with higher watch times and creates a model that can optimize for course watches, not just clicks.

**Model**: a fancy named "Generalized Linear Mixture Model (GLMix)" is used here. In reality, it's actually quite a simple (though hard computationally, [check the paper](https://www.kdd.org/kdd2016/papers/files/adf0562-zhangA.pdf)) approach to express user's probability to click via a sum of the three components: a global model, per-learner model, and per-course model.

> We are currently working on a model ensemble that can perform personalized blending of Response Prediction and Neural CF models to improve the overall performance on the final recommendation task. Secondly, we also plan to adopt Attention Models into our Neural CF framework for learner profiling, i.e., assigning attention weights to a learner’s course watch history to capture long term and short term interests in a more effective manner.

**Evaluation:** 
**Production:** two-stage ranking strategy. In the first stage of the ranking, we convert it to a search-like problem by leveraging the open-source library Apache Lucene. In this stage, an inverted job index is built, where keys are the job features and values are the corresponding job IDs. We run the baseline model LR-Cosine in this stage, which works efficiently with Lucene (since all the features are cosine-similarity based), and select the top K results (e.g.  K=1000) for the secondstage ranking.  In the second stage, we re-score the top Kresults using the full GLMix model and show the top-rankedjobs to the member. 
Retraining the model daily. 

### LinkedIn Jobs

In their [next article](https://engineering.linkedin.com/blog/2020/quality-matches-via-personalized-ai) LinkedIn shared some insights on their jobs recommendations **(which can potentially be useful for any job-seeker).** For example:

> Our analysis demonstrated that the majority of job applicants **apply to at least 5 jobs**, while the majority of **job postings receive at least 10 applicants**. This proves to result in enough data to train the personalization models.

**Goal**: to predict the probability of a positive recruiter action, conditional on a given member applying to a given job.

**Data**: How to identify if a signal is negative (have someone not replied because of lack of interest or because he is processing other candidatess)?
> We make the negatives conclusive if no engagement is seen after 14 days. However, if a recruiter responds to other applications submitted later, we may infer the negative label earlier.

Now you know when to stop waiting for the recruiter's response ⏳.

**Model**: here, the same model from the above (GLMix).

```logit(P(positive response | member, job)) = F_global(X_member, X_job) + F_member(X_job) + F_job(X_member)```

> We used linear models for fm and fj, but one **can use any model in the above formulation as long as the produced scores are calibrated to output log-odds** (for example, a neural net). Usually, linear models are sufficient as per-member and per-job components, as individual members and individual jobs **do not have enough interactions** to train more complex non-linear models.

**Validation**: AUC and NDCG are used.

**Production**:

* user/job models are retrained daily, with automated quality checks in place
* global model his updated once every few weeks
* initializing weights with existing values to reduce the training time

## Avito

![avito]({{ site.url }}{{ site.baseurl }}/assets/newsletter/avito.png){: class="thumbnail-img"} A very [important and thoughtful article](https://habr.com/ru/company/avito/blog/491942/){: target="_blank"} from our frineds at Avito. And their approach takes a bit different direction. What if instead of learning personalized recommendations we'd try to optimize for the item similarity?

**Data:** pairs of "similar" items. How to define similars? Items that were contacted by a user with a time threshold between actions (8h for for avito). This gives 1s as a label. How to get 0s? Negative sampling (4000 per each pair, the more the better, constraint of GPU memory) from the items that were active at the platform during the time of contact but were not contacted by the user. Random sampling with a probability of item being selected equals to a square root of number of contacts that respected item got.

**Model:** item features are fed into the embedding layers with a dropuout and 2 linear layers on top. Item IDs are not included into item features to allow model generalisation.

> The last layer is tanh to transform the output into the [-1, 1] range and multiply by 128 later to fit into the INT8 to save memory in serving.

**Training:** calculating scores for the positive sample and 4000 negative samples for each pair. Taking 100 highest scores from the negatives (top 100 wrongly predicted) and calculating log-loss.

> Learning only from the top 100 wrong predictions allows to save on training time without loosing the accuracy.

**Validation:** Time-based split, with omitting 6 month of data between training and validation. This is done to see how model will behave after 6 months of not training.

**Production:** 

## Pinterest

![data]({{ site.url }}{{ site.baseurl }}/assets/newsletter/pinterest.png){: class="thumbnail-img"}
And now - Pinterest. A very thoughtful and a pragmatic [piece from them](https://medium.com/pinterest-engineering/pinnersage-multi-modal-user-embedding-framework-for-recommendations-at-pinterest-bfd116b49475). Really worth checking out.

**General idea:** represent users via item embeddings. But averaging of embeddings works bad for longer-term user interests (e.g. paintings and shoes average to a salad). Hence, first they run **item clustering** on the last 90 days of actions of a user and take **medoids** (like centroids, but should be an existing item) from the 3 most important clusters (3 is a sweet spot for the performance/diversity tradeoff). After they have 3 items aNN search is performed to find similar items. Using medoids instead of cluster averages also **improves caching** of the solution.

**Model:** the main model is quite simple [Ward clustering](https://en.wikipedia.org/wiki/Ward%27s_method) with the goal to produce different amount of clusters depending on variety of items in the user’s history. A time decay average is used to assign importance to clusters.

**Production**:
- Using HNSW
- Filtering out near duplicates and lower quality pins
- Using medoids allows to save in caching (no need to compute aNN all the time)

Served using a classical [lambda architecture](https://en.wikipedia.org/wiki/Lambda_architecture):

> 1. Daily Batch Inference: PinnerSage is run daily over the **last 90 day actions** of a user on a MapReduce cluster. The output of the daily inference job (list of medoids and their importance) are served online in key-value store.
> 1. Lightweight Online Inference: We collect the **most recent 20 actions** of each user on the latest day (after the last update to the entry in the key-value store) for online inference. PinnerSage uses a real-time event-based streaming service to consume action events and update the clusters initiated from the key-value store.

> In practice, the system optimization plays a critical role in enabling the productionization of PinnerSage.

Also in [the paper](https://arxiv.org/pdf/2007.03634.pdf) they explain a very thorough approach to the model evaluation, check it out.

A list of used resources:
1. [LinkedIn's Learning Recommendations Part 1](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-one){: target="_blank"}
2. [LinkedIn's Learning Recommendations Part 2](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-two){: target="_blank"}
3. [LinkedIn's Neural Collaborative Filtering](https://arxiv.org/pdf/1708.05031.pdf)
4. [LinkedIn's Generalized Linear Mixed Models](https://www.kdd.org/kdd2016/papers/files/adf0562-zhangA.pdf)
5. From a very good [recommendations introduction by Google](https://developers.google.com/machine-learning/recommendation/dnn/softmax#can-you-use-item-features){: target="_blank"}.
