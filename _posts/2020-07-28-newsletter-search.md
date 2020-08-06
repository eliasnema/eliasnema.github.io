---
layout: post
title: "🔎 Weekly Musings: Search"
description: "Figuring out paid search and relevance engineering"
image:
  path: /assets/newsletter/pinterest.png
date: 2020-07-28
category: newsletter
toc: true
---
* TOC
{:toc}

This week I ended up reading a couple of recent articles around the topic of search. Not groundbreaking paper’s style. Rather down-to-earth field implementations. Below, I’ll go through the paid search challenges in two major online platforms. And then to the emerging role of a Relevance Engineer.

![pinterest]({{ site.url }}{{ site.baseurl }}/assets/newsletter/pinterest.png){: class="thumbnail-img"}

[Shopping upsells on Pinterest](https://medium.com/pinterest-engineering/driving-shopping-upsells-from-pinterest-search-d06329255402){:target="_blank"}. An interesting story. Let me decompose it to the common steps seen across data projects.

A simple problem to solve — introduce ads into the search results. They call it “shopping upsells“. Imagine you need to build a shopping upsell model.

#### Step 1. Get Data

Where to get the data for a feature that doesn’t yet exist on a platform?

* One approach: randomly display a portion of upsells for all queries. However, this way the product quality is mixed with the user intent for shopping — not clear if the user doesn’t want to buy in general or doesn’t like this particular ad.
* A better approach: *embed products in both upsell and organic sections*, but hide prices in organic. This way is possible to distill the intent of a user and make data less noisy.

#### Step 2. Get Model

You’ve got data, get a model.

* Use business knowledge to come up with a smart objective. Clicks on products are usually noisy, but a good first start. Much better to assign proper weights to strong signals and smartly combine them. Pinterest uses pins and clicks to partner sites.
* [Model architecture](https://miro.medium.com/max/300/0*kI9UvZRbnPFM1RJ2){:target="_blank"}:\
`Query -> Embedding -> Encoder -> Dense -> Log Loss`

New practitioners are often disappointed by seeing simple architectures after all the resnets and RNNs they’ve just studied. But complexity and state-of-the-arts are often wrong fallacies to chase for most of the businesses.

#### Step 3a. Get Results

> “After launching the experiment, the model increased more than 2X traffic to the shopping search page without hurting overall search metrics in terms of long clicks or saves. The model also increased more than 2X product impressions and product long clicks through the upsell.“

#### Step 3b. Hack Production

Having the results you now need to hack the costs to get the “model economics” right.

* For example, they are smartly precomputing head queries and filtering out “non-shoppable categories, such as ‘recipe’ or ‘finance’.”

My bet is that Pinterest didn’t come up with these optimizations from the beginning. Usually, it’s a loop of 2-3b steps until you get all the components right. This often-overlooked cycle of small adjustments, in this case, allowed to reduce model serving traffic by 70% 🤯

![ebay]({{ site.url }}{{ site.baseurl }}/assets/newsletter/ebay.png){: class="thumbnail-img"}

[Ebay’s article](https://tech.ebayinc.com/product/ebay-makes-promoted-listings-in-search-results-more-relevant-and-dynamic/){:target="_blank"} on balancing paid and non-paid content in their search results.

The basic idea is that having fixed paid slots is bad. Both for the:

* *head queries*, for which there is much more paid content than it’s possible to fit
* as well as *tail queries*, for which there is often not enough high-quality paid content

The solution? Get rid of the fixed paid slots and rank the whole search result according to “relevancy“. Here is a more detailed summary:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/ebaytech?ref_src=twsrc%5Etfw">@ebaytech</a> has recently released an article on balancing the paid and non-paid content in their search result page (thread)⁰<a href="https://twitter.com/hashtag/ecommerce?src=hash&amp;ref_src=twsrc%5Etfw">#ecommerce</a> <a href="https://twitter.com/hashtag/Search?src=hash&amp;ref_src=twsrc%5Etfw">#Search</a> <a href="https://twitter.com/hashtag/marketplace?src=hash&amp;ref_src=twsrc%5Etfw">#marketplace</a> ⁰<a href="https://t.co/REualIf6Aq">https://t.co/REualIf6Aq</a></p>&mdash; Elias Nema (@EliasNema) <a href="https://twitter.com/EliasNema/status/1286420652539424773?ref_src=twsrc%5Etfw">July 23, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

# 🕵️‍♀️ DS or ML? RE!

[Another interesting take](https://opensourceconnections.com/blog/2020/07/16/what-is-a-relevance-engineer/){:target="_blank"} on the career in the data field from one of the most famous search practitioners. A couple of highlights:

- Who is a relevance engineer: *“implements information retrieval algorithms that solve user information needs in real time, at scale“*
- Applied approach: *“don’t chase the state of the art unnecessarily, rather they prefer proven techniques for 80% of the problem“, “don’t solve search for Kaggle points or academia, but for real companies and users“*
- How it’s different from ML engineer: both roles are very similar, with relevance engs tending to be more user-centric and focused on IR problems (ML is broader and not necessarily user-facing problems)

I think the role will become more popular going forward with many companies realizing the need and value of showing relevant content to users in an ever-shrinking customer attention span.