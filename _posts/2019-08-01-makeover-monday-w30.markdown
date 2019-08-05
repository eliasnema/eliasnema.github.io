---
layout: post
title:  "Makeover Monday W30: Arsenal FC stats 2018/19"
date:   2019-08-01 12:28:41 +0100
categories: makeover-monday
toc: true
---
* TOC
{:toc}

## Introduction
I've always wanted to try the makeover monday since I learned about the project. But _busy being busy_, you know.

Last week, however, two things happened:
- Statistics for the Arsenal's last season was posted as a weekly project (and I love football).
- I accidentally saw that.

So it was decided - I'm creating a visualization.


## Setup
I need to create it using something of course. What are my options? Data world provides quite some extensions there. After playing with a few (Tableau, Google DataStudio, Excel :sunglasses:), I realized that still, the simplest and most flexible way for me to crunch some numbers was jupyter.

>For me jupyter beats other tools for the EDA.
> - I can iterate quickly due to the environment itself.
> - Slice and dice data the way I want with `pandas`.
> - Plot if instantly with `matplotlib/seaborn/plotly`.
> - Play with `sklearn` or anything else from the python ecosystem for more clever algos.

To be fair, I can get everything of the above in RStudio (and probably more precise stats and subjectively more beautiful visuals out of the box), but I'm more comfortable with the python ecosystem.

## Looking at data
Data represents some KPIs of players throughout the season. Position data wasn't present in the dataset.
Initially, I wanted to cluster players together to see if there are any patterns and groups. Then realized it doesn't make a good visualization - hey look, these players have Saves, they are probably goalkeepers. So I decided to cheat a bit and to enhance my data with the information about positions.
Now having the data on positions, let's compare players to each other. Maybe the radar chart can work for such kind of comparison.

But there are a limited amount of axes on a graph for users to still make sense of it. How to choose the best ones? There are some obvious choices of course: saves for goalkeepers, tackles for defenders, goals for forwards. But how about common attributes such as passes? To identify potential interesting data points I started with a correlations plot. I was looking for some interesting distributions, e.g. metrics that are not linearly correlated with the minutes played.
![correlations]({{ site.url }}/assets/mm/19w30/corr.png)

Nice, looks like there are some potentially distinguishable KPIs. What do we do next?

## To scale or not to scale?
If we want to create player profiles, we cannot just say Cech made X saves while Leno made Y. We need to normalize it. Most precise would be to do it by minutes played. So tackles per minute played or passes per minute played.

Having these numbers we can already iterate to find the best representation.

###$ Ratios as-is
The good part here - real values are displayed for the KPIs. We can see Mustafi is completing around 0.06 clearances per minute played, more than anyone else.
The problem - it's hard to have all the numbers at the same scale, so some metrics skew the scale towards one direction and so it becomes hard to see values for smaller values.
![metrics_nonscaled]({{ site.url }}/assets/mm/19w30/DF_nonscaled.png)

> Mustafi is completing around 0.06 clearances per minute played, more than any other defender in a team.

#### Log-scaling
We can try to play with axis scalse to get more equal distribution of numbers. As you can see now graphs are more equally distributed, but it's a mess in readability.
![metrics_logr]({{ site.url }}/assets/mm/19w30/DF_logr.png)

> You need to be carefull using log scales, especially in a radar chart.

#### Relative sclaing
We can divide values by the maximum for the metric at this position. So all players will get a percentage from the maximum for the position in a team. As for the example above: Mustafi will get 1 for the clearances kpi, Sokratis around 0.8 from that and so on.
![metrics_scaled]({{ site.url }}/assets/mm/19w30/DF_scaled.png)

Personally, I prefer the last approach, even here we are losing the interpretability (now it's not possible to see the real value for tackles per minute) but the relative comparison is much better in this case. So let's just polish the graph a bit.

## Comparison: GK
![GK]({{ site.url }}/assets/mm/19w30/GK.png)
>- Cech was getting around __20% of playing time__ compared to Leno.
>- Distinctive __styles__: Cech is doing much more high claims while Leno uses more punches.
>- Cech has a better __"saves per minute"__ ratio, but also might be the result of him playing much less.

## Comparison: top 4 DF by minues played
![DF]({{ site.url }}/assets/mm/19w30/DF.png)
>- __Mustafi__ leads on most defensive metrics. He also played most minutes from all defenders (3rd overall, after Leno and Aubameyang).
>- __Sokratis__ has a similar profile, with the exception that he leads by far in yellow cards.
>- Bellerin and Kolasinac have more __offensive profiles__, both taking third place in overall team assists rank (5 each, Bellerin played less).

## Comparison: MF with >= 20 appearances
![MFD]({{ site.url }}/assets/mm/19w30/MFD.png)
>- There are two clear __patterns__ on the chart: __defensive and offensive__. Xhaka and Torreira are representatives of the former while Mkhitaryan and Özil of the latter.

![MFA]({{ site.url }}/assets/mm/19w30/MFA.png)

>- __Ramsey__ is an interesting exception of a "complete" midfielder here, leading by assists per minute played, but also participating in tackles a lot.

## Comparison: FW
![FW]({{ site.url }}/assets/mm/19w30/FW.png)
>- Lacazette and Aubameyang are __2nd and 4th in most minutes played__ during the season.
>- Lacazette __fouls five times more__ than Aubameyang or Iwobi.
>- Aubameyang leads on __goals__ effectiveness, while Iwobi and Lacazette are great in __assists__.

## Final thougts
I used canva to assemble the graphs above into the final [image]{:target="_blank"}. Honestly, I had some fun doing this project. I didn't come up with any breakthroughs of course - things on graphs are already well known. However, I had a couple of interesting observations and discoveries during the process.

> Science is what we understand well enough to explain to a computer; art is everything else. 
> __D. Knuth__


[image]: https://www.canva.com/design/DADgwo_GAu0/share/preview?token=RKMuwlarujwqFTrMlQp1vg&role=EDITOR&utm_content=DADgwo_GAu0&utm_campaign=designshare&utm_medium=link&utm_source=sharebutton