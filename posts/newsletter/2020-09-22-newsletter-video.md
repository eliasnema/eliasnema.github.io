---
title: "📹 Tensorflow.js, AI in Video and Analytics"
author: "Elias Nema"
date: "2020-09-22"
categories: [data-meets-product]
---

## ML in the Browser

What can you do with ML in a modern browser? A showcase from the TensorFlow.js community. My personal favorites were:

* [Touch-less interface for your hand](https://demos.touch-less.dev/). It takes some time to get used to it and there is still some polishing to be made. However, after a bit of practice, it becomes kind of fun.

* [Analyze emotions of your audience in real-time](https://enjoyingthe.show/#explainer), so that your amazing jokes no longer end in awkwardly muted silence.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/fZ1rzawCPD4?controls=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## AI in Video

* [Synthesia](https://www.synthesia.io/) — a new service to generate video-content:

  * Chose from predefined narrators
  * Type the script
  * It'll create a video of the person presenting your text in some minutes

* [Norfair](https://github.com/tryolabs/norfair) — an open-source library from the [Tyro-labs](https://tryolabs.com/blog/2020/09/10/releasing-norfair-an-open-source-library-for-object-tracking/) for the object tracking (cars, pedestrians, poses).

* And if those are not cool enough for you, how about generating realistic tennis matches with real players. [Vid2Player](https://cs.stanford.edu/~haotianz/research/vid2player/) does exactly that. Wanted to change the grand-slam history or play Federer against Federer? Well, now you can do that:

<iframe width="560" height="315" src="https://www.youtube.com/embed/GnZUIuOzgQc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

* And since both AI and Video require quite some compute resources and following the horrible launch of 30x cards from NVIDIA, [here is a guide](http://timdettmers.com/2020/09/07/which-gpu-for-deep-learning/) on how to chose the one that suits you best while waiting for the cards' availability.

## Analytics

Relaunch of the analytics blog at Netflix has brought two recent articles. [The first one](https://netflixtechblog.com/analytics-at-netflix-who-we-are-and-what-we-do-7d9c08fe6965?source=rss----2615bd06b42e---4) is about the broader role of an analyst. I think this diagram is quite cool and shows the depth of what's analytics in data organizations.

![analytics-netflix](2020-09-22-analytics-netflix.png)

In [the other article from them](https://netflixtechblog.com/how-our-paths-brought-us-to-data-and-netflix-4eced44a6872?source=rss----2615bd06b42e---4), there is an interview with a couple of data folks. In the spirit of:

> Everyone wants to build fancy models or tools, but fewer are willing to do the foundational things like cleaning the data and writing the documentation.

Enough of Netflix. Lastly, an interesting (though quite wordy) [take on data cleansing](https://counting.substack.com/p/data-cleaning-is-analysis-not-grunt) and why it's not as simple as it's often presented. I enjoy a lot the attitude from the author:

> TL;DR: Cleaning data is considered by some people [citation needed] to be menial work that’s somehow “beneath” the sexy “real” data science work. I call BS.
