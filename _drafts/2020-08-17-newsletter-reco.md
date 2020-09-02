---
layout: post
title: "💆‍♀️ State of Recommendations"
description: "Embeddings. Users through products. How LinkedIn recommends jobs and how Pinterest clusters your interests."
image:
  path: /assets/newsletter/reco.png
date: 2020-09-01
category: data-meets-product
toc: true
---
* TOC
{:toc}

## Belarus

> 🚨 The last 3 weeks were really sad for the Belarus. Independent of your political views I encourage to check out any news on the situation there. 🚨

On the data side, we've got an explosion of relatively fresh articles about **recommenders**. This is going to be a lengthy piece covering 4 articles, 3 papers and trying to demonstrate trends happening in the reco community. Most cases will be structured as follows: `🌅Overview -> 🛢Data -> 🚗Model -> 🔁Validation -> 🎬Production.` I prefer not to focus a lot on the reported results because they are always relative to the previous baselines and cannot be used outside of the context.

And so that you don't need to scroll to the end, here is a summary of the overall trends:

![reco_history]({{ site.url }}{{ site.baseurl }}/assets/newsletter/reco.png)

> * Starting with a timeless classic of recsys — matrix factorization, it now evolved to **neural nets, embedding spaces and sequential models** (with a slight sidetrack to mixed linear models).
> * Serving also moved to more **real-time** architectures and dynamic **re-rankers.**
> * From relying mostly on explicit ratings to incorporating different **implicit** signals and applying fancy weights on them.
> * On the **item side** pretty much every one converged to building embeddings to optimize for the product similarity.
> * On the **user side,** however, representations vary depending on the use case and business model.
{: .thought}

## LinkedIn

### LinkedIn Learning

![linkedin]({{ site.url }}{{ site.baseurl }}/assets/newsletter/linkedin.png){: class="thumbnail-img"}

We start with the LinkedIn Learning use case and their two-episode article ([one](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-one){: target="_blank"}, [two](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-two){: target="_blank"}). The main goal for them is to *"surface the most relevant and personalized course recommendations"*.

There are two main models powering the offline (precalculated for each user) recommendations - neural collaborative filtering and generalized linear mixed model.

#### Collaborative Filtering (Neural)

Pros/cons of CF are well-known and LinkedIn didn't escape them. Here is their recap:

* works better for core learners (members who are already active on the LinkedIn Learning platform)
* focuses on recent interactions *(not a very common one, probably a property of their implementation)*
* diversified recommendations
* no domain knowledge needed
* however, cold start problems

> I think recency and diversity are the most interesting points here.
>* **Recency:** generally, CF doesn't give preference for the recent items unless implemented with some kind of time decay or position-aware component in the model.
>* **Diversity:** in e-commerce, CF often REDUCES the diversity of the content because it converges to clusters of popular items. And here, probably, due to the fact that the course catalogue is not that big and that every person can take any course, it actually increases it.
{: .thought}

**🛢Data:** Course watch history data with a watch-time threshold (if a learner only watches the first three seconds of a course, it's not included).

> Two tower architecture consists of two networks with fully connected layers in each becoming narrower with each consecutive layer.
{: .thought}

**🚗Model:** Computing learner and course embeddings separately. This is also known as a _two-tower architecture._ Log loss is used as an optimization function. The modeling objective is to predict course watches using the past watches. 4 negative samples are taken for each positive one.

> Interesting that input to the learner part is **user/course co-occurrence matrix**, while input to the course part is **course/course similarity** matrix.
{: .thought}

**🔁Validation:** Holding the last interaction for each user for a test set — a **leave-one-out** approach. A random sample of 100 items that user didn't interact with is taken and the one hidden item (user's last action) is ranked against these 100. Performance is judged by **hit ratio and NDCG** at 10.

**🎬Production:**  Take learner's embedding and course embeddings and score all courses for each user. Generating a top K set for each learner offline.

#### Response Prediction Model

Another offline model to compliment CF is so-called "Response Prediction". It takes into account user and course metadata as well as user's actions

> This algorithm typically performs better than CF for members with no/little previous engagement on LinkedIn Learning, as well as for new courses with few prior interactions.

**🛢Data**:

* User profile features (skills, industry, etc.)
* Course metadata (difficulty, category, skills)
* Historical explicit engagement (clicks, bookmarks, etc.) with the course watch time as an importance weight given to each click instance.

> As a result, this importance weight helps to promote courses with higher watch times and creates a model that can optimize for course watches, not just clicks.

**🚗Model**: a fancy named "Generalized Linear Mixture Model (GLMix)" is used here. In reality, it's actually quite a simple (though hard computationally, [check the paper](https://www.kdd.org/kdd2016/papers/files/adf0562-zhangA.pdf){: target="_blank"}) approach to express user's probability to click via a sum of the three components: a global model, per-learner model, and per-course model.

> We are currently working on a model ensemble that can perform personalized blending of Response Prediction and Neural CF models to improve the overall performance on the final recommendation task. Secondly, we also plan to adopt Attention Models into our Neural CF framework for learner profiling, i.e., assigning attention weights to a learner’s course watch history to capture long term and short term interests in a more effective manner.

**🔁Validation:** Using AUC for offline validation as well as click/apply rates for the online experiments.

**🎬Production:** offline two-stage ranking strategy:

* searching in Lucene using user and item features to generate 1000 candidates
* ranking candidates using full GLMix model

### LinkedIn Jobs

In their [next article](https://engineering.linkedin.com/blog/2020/quality-matches-via-personalized-ai){: target="_blank"} LinkedIn shared some insights on their jobs recommendations **(which can potentially be useful for any job-seeker).** For example:

> Our analysis demonstrated that the majority of job applicants **apply to at least 5 jobs**, while the majority of **job postings receive at least 10 applicants**. This proves to result in enough data to train the personalization models.

**Goal**: to predict the probability of a positive recruiter action, conditional on a given member applying to a given job.

**🛢Data**: How to identify if a signal is negative (have someone not replied because of lack of interest or because he is processing other candidates)?
> We make the negatives conclusive if no engagement is seen after 14 days. However, if a recruiter responds to other applications submitted later, we may infer the negative label earlier.

Now you know when to stop waiting for the recruiter's response ⏳.

**🚗Model**: here, the same model from the above (GLMix).

```logit(P(positive response | member, job)) = F_global(X_member, X_job) + F_member(X_job) + F_job(X_member)```

> We used linear models for fm and fj, but one **can use any model in the above formulation as long as the produced scores are calibrated to output log-odds** (for example, a neural net). Usually, linear models are sufficient as per-member and per-job components, as individual members and individual jobs **do not have enough interactions** to train more complex non-linear models.

**🔁Evaluation**: AUC and NDCG are used.

**🎬Production**:

* user/job models are retrained daily, with automated quality checks in place
* global model his updated once every few weeks
* initializing weights with existing values to reduce the training time

## Avito

![avito]({{ site.url }}{{ site.baseurl }}/assets/newsletter/avito.png){: class="thumbnail-img"} A very [important and thoughtful article](https://habr.com/ru/company/avito/blog/491942/){: target="_blank"} (sorry, in Russian) from our frineds at Avito. And their approach takes a bit different direction. What if instead of learning personalized recommendations we'd try to optimize for the item similarity?

**🛢Data:** pairs of "similar" items. How to define similars? Items that were contacted by a user with a time threshold between actions (8h for for avito). This gives 1s as a label. How to get 0s? Negative sampling (4000 per each pair, the more the better, constraint of GPU memory) from the items that were active at the platform during the time of contact but were not contacted by the user. Random sampling with a probability of item being selected equals to a square root of number of contacts that respected item got.

**🚗Model:** item features are fed into the embedding layers with a dropout and 2 linear layers on top. Item IDs are not included into item features to allow model generalization.

> The last layer is tanh to transform the output into the [-1, 1] range and multiply by 128 later to fit into the INT8 to save memory in serving.

**Training:** calculating scores for the positive sample and 4000 negative samples for each pair. Taking 100 highest scores from the negatives (top 100 wrongly predicted) and calculating log-loss.

> Learning only from the top 100 wrong predictions allows to save on training time without loosing the accuracy.

**🔁Validation:** Time-based split, with omitting 6 month of data between training and validation. This is done to see how model will behave after 6 months of not training.

**🎬Production:**
The model is re-trained once per 6 months. This works fine because item IDs are not included into training so new items can be embedded into the space just by their features. So new items get's represented in a space as soon as they are posted. Embeddings are stored in Sphinx search engine, which allows quite a fast vector search (p99 is under 200ms with 200k rpm, sharded by category).

Also worth noting that recommendations are used on both the item page (item-to-item) and the homefeed (user-to-item), with u2i recommendations coming from the similar items to the ones that user has seen recently.

## Pinterest

![pinterest]({{ site.url }}{{ site.baseurl }}/assets/newsletter/pinterest.png){: class="thumbnail-img"}
And now — Pinterest. Another very thoughtful and pragmatic [piece from them](https://medium.com/pinterest-engineering/pinnersage-multi-modal-user-embedding-framework-for-recommendations-at-pinterest-bfd116b49475){: target="_blank"}.

Here as well, the general ideal is embed users/items into some space. However, having a single vector for user works bad — no matter how good the network is it won't be able to represent all the user's clusters of interests. Another approach (the same as Avito takes above) is to represent a user via embeddings of the items that he is interested in. But averaging works bad for the longer-term user interests (e.g. paintings and shoes average to a salad). The solution?

Run **item clustering** on the last 90 days of actions of a user and take **medoids** (like centroids, but should be an existing item) from the 3 most important clusters (3 is a sweet spot for the performance/diversity tradeoff). Find similar items to those 3. Using medoids instead of cluster averages also **improves caching** of the solution.

**🛢Data:** users’ action pins from the last 90 days.

**🚗Model:** the main model is quite simple [Ward clustering](https://en.wikipedia.org/wiki/Ward%27s_method){: target="_blank"} with the goal to produce different amount of clusters depending on variety of items in the user’s history. A time decay average is used to assign importance to clusters.

**🔁Validation:** a very thorough approach to the evaluation process, highly recommend to check out more in the [paper](https://arxiv.org/pdf/2007.03634.pdf){: target="_blank"}.

* Get the user's 3 month important clusters of items and their medoids.
* Get 400 closest items to these embedidings.
* Calculate **relevance:** the proportion of observed action pins that have high cosine similarity (≥0.8) with any recommended pin.
* And **recall:** the proportion of action pins that are found in the recommendation set.
* Test batches are calculated in the chronological order, day by day, simulating the production setup.

**🎬Production**:

* Using HNSW for the approximate nearest neighbor search
* Filtering out near duplicates and lower quality pins
* Using medoids allows to save on caching (no need to compute aNN all the time)

Served using a classical [lambda architecture](https://en.wikipedia.org/wiki/Lambda_architecture):

> 1. Daily Batch Inference: PinnerSage is run daily over the **last 90 day actions** of a user on a MapReduce cluster. The output of the daily inference job (list of medoids and their importance) are served online in key-value store.
> 2. Lightweight Online Inference: We collect the **most recent 20 actions** of each user on the latest day (after the last update to the entry in the key-value store) for online inference. PinnerSage uses a real-time event-based streaming service to consume action events and update the clusters initiated from the key-value store.
>
> In practice, the system optimization plays a critical role in enabling the productionization of PinnerSage.

## Coveo

![coveo]({{ site.url }}{{ site.baseurl }}/assets/newsletter/coveo.png){: class="thumbnail-img"}

Ok, item ebmeddings are great. But how about tranfer learning for them? Wait, what? The thing is that many companies are actually multi-brand groups having more than one brand.

 > Product embeddings have been mostly investigatedas static entities so far, but, exactly as words [10], products are allbut static. Since the creation of embeddings is a stochastic process,training embeddings for similar products in different digital shopswill produce embedding spaces which are not immediately com-parable: how can we build a unified cross-shop representation ofproducts?

**🛢Data:** There are 2 possible variants for the data on hand:

* cross-brand data NOT available
* cross-brand data available

**🚗Model:** So we need to align spaces first. The first way is to use item features for that 

**🔁Validation:**

**🎬Production**:

---
<br/>
References:

1. [LinkedIn's Learning Recommendations Part 1](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-one){: target="_blank"}
2. [LinkedIn's Learning Recommendations Part 2](https://engineering.linkedin.com/blog/2020/course-recommendations-ai-part-two){: target="_blank"}
3. [LinkedIn's Neural Collaborative Filtering](https://arxiv.org/pdf/1708.05031.pdf){: target="_blank"}
4. [LinkedIn's Generalized Linear Mixed Models](https://www.kdd.org/kdd2016/papers/files/adf0562-zhangA.pdf){: target="_blank"}
5. Avito's [article](https://habr.com/ru/company/avito/blog/491942/){: target="_blank"}
6. Pinterest's [article](https://medium.com/pinterest-engineering/pinnersage-multi-modal-user-embedding-framework-for-recommendations-at-pinterest-bfd116b49475){: target="_blank"}
7. Pinterest's [paper](https://arxiv.org/pdf/2007.03634.pdf){: target="_blank"}
8. [Recommendations introduction](https://developers.google.com/machine-learning/recommendation/dnn/softmax#can-you-use-item-features){: target="_blank"} by Google