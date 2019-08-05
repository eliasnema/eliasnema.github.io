---
layout: post
title:  "Embeddings"
date:   2018-10-23 12:28:41 +0100
categories: embeddings
toc: true
---
* TOC
{:toc}

# Introduction
Imagine a task of comparing of how two things are similar to each other. As a human, you have a set of [recognition patterns]{:target="_blank"}. For machines, you need to represent objects somehow first. Latest hot thing in this space is [embeddings]{:target="_blank"} and *ANYTHING-to-VEC* models.

The idea behind them is to represent real-world objects, such as [words]{:target="_blank"} or [listings]{:target="_blank"}, using vectors of numbers.

These vectors are not the aim itself, but they have some useful properties. For example, similar things are located close to each other. Also, you can do vector operation on top of them.

But this is not an article about data science whatsoever, so I'll be looking from an engineering perspective. What is the best way to store, process, retrieve? This field of ??? is not new of course and even Larry Page did his thesis in it. But until modern explosion of ML, there were no real needs in using them in production environments. 

# Setup
Some experiment boundaries: 
- we have 1M vectors of high dimensionality (e.g. 100, 300)
- we want to have a stateful system: ability to add, modify vectors, as well as get most similar items in real time

Not surprisingly, there are not that many systems that can support such requirements out of the box.

# Comparison
Let's start with system close to our heart: Postgres. It comes out of the box with the Cube extension. It was created not for the purposes stated above. However, since the 9.6 was extended with the functionality and syntax to achieve the task we need.


# Conclusion



[recognition patterns]: https://en.wikipedia.org/wiki/Pattern_recognition_(psychology)
[embeddings]: https://www.tensorflow.org/versions/master/programmers_guide/embedding
[words]: https://en.wikipedia.org/wiki/Word2vec
[listings]: (https://medium.com/airbnb-engineering/listing-embeddings-for-similar-listing-recommendations-and-real-time-personalization-in-search-601172f7603e)
