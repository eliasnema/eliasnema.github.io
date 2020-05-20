---
layout: post
title: "Unaggregate your data, bust a quote and learn a thing about modern football"
description: "And here I fell in a very common mistake people make while working with data. It's always tempting to look at aggregated data to see patterns and trends. However, often you need the exact opposite:"
image:
  path: /assets/man_city/stacked_graph.png
date: 2020-05-20
categories: [football]
toc: true
---
* TOC
{:toc}

## Introduction
Somehow I've spent the last week looking at Man City stats.

It all started with this quote in the book about the [data and football](https://www.amazon.com/Football-Hackers-Science-Data-Revolution/dp/1788702050){:target="_blank"} that I'm reading now.
![quote]({{ site.url }}/assets/man_city/quote.jpg)

**Spoiler alert**: this proved to be wrong. But it triggered interest from my side. Man City is one of the most dinstinguished sides by their style of playing. Do they really play that short?

## A common pitfall
So I wanted to quickly double-check the fact. Which, turned out, to be not easy at all. Available data is either not complete or too aggregated, there is a shortage of reliable publicly available sources. For example, the [official premier league](https://www.premierleague.com/stats/top/clubs/att_obox_goal?se=79){:target="blank"} site says that MC has scored 13 goals from outside the box during the 2017/18 season, but there is no information about distributions (the quote mentions only the first half of the season).

And here I fell in a very common mistake people make while working with data. It's always tempting to look at aggregated data to see patterns and trends. However, often you need the exact opposite: take one sample, study it, see if it makes sense, see if it contains data that you expect.

In fact, to prove the quote wrong I needed just a single example of a goal that City has scored from outside the box during that part of the season. So after searching for the best strikes of the season on YouTube I found that the quote didn't hold up. Just take a look at this last-minute [wonder-strike from Sterling](https://www.youtube.com/watch?v=VVDJEVCUO3c){:target="_blank"}. 

> This is a great example of a very common mistake people make when working with data. It's always tempting to look at aggregated data to see patterns and trends. However, often you need the exact opposite: take one sample, study it, see if it makes sense, see if it contains data that you expect.

So we've already proved the quote wrong simply by watching a couple of great football moments. 

## Going deeper
But now that we are in the topic, let's dig deeper. The best website that I was able to find to look at more granular data is [fbref](https://fbref.com/){:target="_blank"}. There I took statistics on every shot Man City did during their last 3 Premier League seasons. We also have a distance for each shot.

### Visualising
Here and below I'll be taking into consideration only first halves of the seasons. First, because the quote was about that. Second, this would be enough to see the tactical changes over time. Third, data for the 2019/20 season is incomplete anyways.

Let's start with trying to understand if there is any significant difference between seasons.

[![histograms]({{ site.url }}/assets/man_city/histograms.png# 70%)]({{ site.url }}/assets/man_city/histograms.png)

This visualisation is of little use here, but at least we can see some distinctions between seasons.

Let's quickly compute t-test statistics to get a numeric representation of it:

```
season 17/18 vs 18/19: Ttest_indResult(statistic=1.1348979627228202, pvalue=0.2568168035045629)
season 18/19 vs 19/20: Ttest_indResult(statistic=1.8185721011018878, pvalue=0.06943167359879912)
season 17/18 vs 19/20: Ttest_indResult(statistic=3.1215926762079387, pvalue=0.0018782472078475076)
```

Indeed, looks like there is a small but not very significant difference between 2017 and 2018, while a much bigger difference between 2018 and 2019. This compounds to a huge difference from 2017 to 2019 seasons.

> This compounds to a huge difference from 2017 to 2019 seasons.

Let's give this difference a better human interface.

### Stacked graph
One way to look at distribution differences would be a stacked bar graph. This graph quickly falls apart when the number of dimension grows, but is perfect for our use case.

[![stacked graph]({{ site.url }}/assets/man_city/stacked_graph.png# 70%)]({{ site.url }}/assets/man_city/stacked_graph.png)

It's not too detailed, but also very concise. And we clearly see that each season City is aiming to shoot more and from the closer range.

### Density graphs
If we want to look even closer we can go with density graphs.

[![density graphs]({{ site.url }}/assets/man_city/density.png)]({{ site.url }}/assets/man_city/density.png)

Wow, this tells a story now. A coincidence? I doubt that.

## Conclusion & learnings
I believe football evolves by learning more about itself. It's a known fact that teams have started optimising for shooting from positions with higher chance of scoring, which [translates into less long-ranged shots](https://totalfootballanalysis.com/article/xg-analysis-tactical-analysis-tactics){:target="_blank"}.

Evolution of Man City from the season 2017 to 2019 shows that they indeed follow this trend of shooting from “better” positions. But does it make their game better? That's the question we can't objectively answer with data.


<br/>

> Some concise takeaways for the data folks:
> 1. Don't start with aggregated data. Make sure you data points make sense first.
> 2. Compare distributions numerically using t-test, Kolmogorov-Smirnov test, etc.
> 3. Add a visual story by bucketing:
> - Histograms
> - Pivot histograms into a stacked chart for a different perspective
> - Go for density estimations for more details

Notebook for this article with code to build all the graphs is available [here](https://github.com/eliasnema/makeover_monday/blob/master/man_city_stats/city_stats.ipynb){:target="_blank"}.