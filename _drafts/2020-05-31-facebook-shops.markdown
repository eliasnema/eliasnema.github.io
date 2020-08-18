---
layout: post
title: "Digging into Facebook's e-commerce proposition"
description: ""
image:
  path: /assets/hypothesize/doodle.png
date: 2020-05-31
categories: [product]
permalink: facebook-ecommerce.html
toc: true
---
* TOC
{:toc}

## Facebook and e-commerce
When Facebook entered marketplace business in 2016, it came as a shocking surprise to many of the established players in the industry. It’s been steadily growing ever since and became a worhty competitor in many segments. 4 years later, in 2020, Facebook has announced Shops - helping small businesses to sell online.

This came along with a more detailed article on how computer vision and AI are a part of a longer-term vision on enhancing shopping experience. It shows how sophisticated Facebook AI’s department is and how hard it’s for others to compete with them. But does the technical advantage translate into a better customer experience? Are there advancements enough for users to abandon platforms they are using?

I think that not. At least not yet. At least not yet due to technological superiority. But more on that below.

## Value proposition
At a very high level there are two parts:
* Make it easier to **connect sellers and buyers**
    * A universal multi-category computer vision system designed for shopping
    * It is able to identify layered objects in photos (like a shirt beneath a jacket)
    * It is powering both Marketplace and Facebook Pages
* Increase **engagement**
    * Rotating View to easily create 3D-like representation of what they want to sell
    * Try on to allow people to see how they might look in some products


## Make it easier to connect sellers and buyers

A universal computer vision system designed for shopping
- Multi-category model across all fine-grained product categories (fashion, auto, and home decor)
    - a massive number of data sets, types of supervision, and loss functions into a single model, while making sure it works well on every task simultaneously. This is a huge AI challenge because optimizing and fine-tuning hyperparameters for one task can sometimes reduce the effectiveness of another. For example, optimizing a model to recognize cars well might mean it’s not as good at recognizing patterns on clothing.
    - uses an object detector to identify boxes in images surrounding likely products, match each box against our list of known products, and keep all matches that are within a similarity threshold. The resulting matches are added to our training set, increasing our training data without requiring human annotation.
    - a compressed embedding space, using just 256 bits to represent each product

- understand each individual’s taste and style, context that matters when searching for a product to fit a specific need or situation, it needs to work for everyone’s subjective preferences, globally; Visual search (vision)
- improving segmentation, detection, and classification
    - First, we detect a clothing item as a whole and roughly predict its shape. Then we can use this prediction as a guide to refine the estimate for each pixel. This allows us to incorporate global information from the detection to make better local decisions for each pixel in the semantic segmentation.
    - projects the predicted instance masks (with uncertainty) for each detection into a feature map to use as an auxiliary input for semantic segmentation. It also supports back-propagation, making it end-to-end trainable
    - our text-based attribute systems could identify only 33 percent of the colors and attributes in home and garden listings on Marketplace. We’re now able to recognize 90 percent of them.
- Beyond Marketplace, we are also testing automatic product tagging on Facebook Pages to help people discover products from businesses they like. When Page admins upload a photo, GrokNet can suggest potential products to tag by visually matching between items in the photo and the Page's product catalog


## Increase engagement
- 3d images: we used the classic visual-inertial simultaneous localization and mapping (SLAM) algorithm, which gives us the position of the camera relative to a set of 3D feature points in the image. Marketplace iOS to start
- Try on


![Savings]({{ site.url }}/assets/hypothesize/savings.png)


Supply bound - something that is limited by the available supply. And this is in very generic terms. For example, you want to buy a used car. There is a much higher chance you’ll be limited by your local dealers and will not go to the other side of the world to get a car. It’s inconvenient and simply not worth it. Same for when you are looking for an apartment: in most of the cases you are looking for a specific city (and if you are not, then you probably don’t need to worry about articles like this). But also you have cost limitations and you can choose only from a limited number of options in a city/neighborhood that you want. Or consider doing groceries - you consume something fresh and local. Or if you need a very specific shutter replacement for your camera. You cannot just decide 

Demand-bound 




I'm going into more details about how to generate hypotheses and about each of the steps in the book I'm working now. It's called **Hypothesize!** and you can [pre-order it now at half price](https://gumroad.com/l/SSTiNM/kwfh1gn). 

_Note that you will only get charged after the release date._