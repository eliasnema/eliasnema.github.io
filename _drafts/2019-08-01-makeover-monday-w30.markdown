---
layout: post
title:  "Makeover Monday W30: Arsenal FC stats 2018/19"
date:   2019-08-01 12:28:41 +0100
categories: makeover-monday
toc: true
---
* TOC
{:toc}

# Introduction
I've always wanted to try the makeover monday since I learned about the project. But _busy being busy_, you know.

Last week, however, two things happened:
- Statistics for the Arsenal's last season was posted as a weekly project (and I love football).
- I accidentally saw that.

So it was decided - I'm creating a visualization.


# Setup
I need to create it using something of course. What are my options? Data world provides quite some extensions there. After playing with a few (Tableau, Google DataStudio, Excel :sunglasses:), I realized that still, the simplest and most flexible way for me to crunch some numbers was jupyter.

>For me jupyter beats other tools for the EDA.
> - I can iterate quickly due to the environment itself.
> - Slice and dice data the way I want with `pandas`.
> - Plot if instantly with `matplotlib/seaborn/plotly`.
> - Play with `sklearn` or anything else from the python ecosystem for more clever algos.

To be fair, I can get everything of the above in RStudio (and probably more precise stats and subjectively more beautiful visuals out of the box), but I'm not that familiar with the R ecosystem.

# Looking at data
Data represents some KPIs of players throughout the season. Position data wasn't present in the dataset.
Initially, I wanted to cluster players together to see if there are any patterns and groups. Then realized it doesn't make a good visualization - hey look, these players have Saves, they are probably goalkeepers. So I decided to cheat a bit and to enhance my data with the information about positions.
Now having the data on positions, let's compare players to each other. Maybe the radar chart can work for such kind of comparison.

But there are a limited amount of axes on a graph for users to still make sense of it. How to choose the best ones? There are some obvious choices of course: saves for goalkeepers, tackles for defenders, goals for forwards. But how about common attributes such as passes? To identify potential interesting data points I started with a correlations plot. I was looking for some interesting distributions, e.g. metrics that are not linearly correlated with the minutes played.
![correlations]({{ site.url }}/assets/mm/19w30/corr.png)

Nice, looks like there are some potentially distinguishable KPIs. What do we do next?

# To scale or not to scale?
If we want to create player profiles, we cannot just say Cech made X saves while Leno made Y. We need to normalize it. Most precise would be to do it by minutes played. So tackles per minute played or passes per minute played.

Having these numbers we can already iterate to find the best representation.

Displaying numbers as-is:

The problem with this approach - it's hard to have all the numbers at the same scale, so adding say minutes played here is impossible. Also, some metrics skews the scale towards one direction and so it becomes hard to see values on smaller KPIs. For the benefits: you can see real values for the KPIs. So you can see Mustafi doing 0.06 clearances per minute played.


We can try log-scaling the axis to get more equal distribution of numbers:


Another approach is relative scaling. We can divide values by the maximum for the metric at this position. So all players will get a percentage from the max.



Personally, I prefer the last approach, even here we are losing the interpretability (now it's not possible to see the real value for tackles per minute) but the relative comparison is much better in this case.

![GK]({{ site.url }}/assets/mm/19w30/GK.png)

# Comparison

# Conclusion

