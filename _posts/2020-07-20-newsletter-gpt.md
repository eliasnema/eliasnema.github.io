---
layout: post
title: "💥 GPT Excitement and AI Costs [weekly explorations]"
description: "Everybody is [again] excited about the future of AI and technology"
image:
  path: /assets/newsletter/to_uniform.png
date: 2020-07-20
category: newsletter
toc: true
---
* TOC
{:toc}

# A Week of GPT-3, Obviously

There were so many tweets, articles and general excitement that it became too much even for Sam Altman himself:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">The GPT-3 hype is way too much. It’s impressive (thanks for the nice compliments!) but it still has serious weaknesses and sometimes makes very silly mistakes. AI is going to change the world, but GPT-3 is just a very early glimpse. We have a lot still to figure out.</p>&mdash; Sam Altman (@sama) <a href="https://twitter.com/sama/status/1284922296348454913?ref_src=twsrc%5Etfw">July 19, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I’m, of course, impressed too. In fact, it was able to produce my most liked tweet 😞 (and same happened to some better-known folks):

<blockquote class="twitter-tweet" data-conversation="none"><p lang="en" dir="ltr">Side note: if this somehow becomes my most viewed tweet ever, I&#39;m going to be sad.</p>&mdash; Leo Polovets (@lpolovets) <a href="https://twitter.com/lpolovets/status/1284288703200817153?ref_src=twsrc%5Etfw">July 18, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

There are many great articles covering GPT-3 and its meaning for the future of humanity. You can easily find them, but probably don’t need to, because they pop up everywhere.

Hype aside, it’s a huge model and probably costs a fortune, but the whole product part is done in a very lean way. It’s at the market validation phase, which it has nailed perfectly.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">In the ultimate lean startup twist it turned out that <a href="https://twitter.com/sama?ref_src=twsrc%5Etfw">@sama</a> was manually answering all GPT-3 requests.</p>&mdash; Andreas Klinger ✌️ (@andreasklinger) <a href="https://twitter.com/andreasklinger/status/1283981585251880961?ref_src=twsrc%5Etfw">July 17, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Probably, the next step would be to optimize costs and **make the economics right** for the rest of the internet. Which brings us to the topic of costs, which becomes as relevant as never for the AI/ML community.

# 💰Costs in AI

- A very interesting conversation on last [week's TWIML AI podcast](https://twimlai.com/twiml-talk-391-the-case-for-hardware-ml-model-co-designwith-diana-marculescu/){:target="_blank"} about model design optimization for hardware.
- [Another article](https://www.wired.com/story/prepare-artificial-intelligence-produce-less-wizardry/){:target="_blank"} suggests that despite shafing off 3/4 of errors in logistic optimization prediction with the help of deep learning, a European retailer chose not to use the model because of costs.

Until very recently DL has been driven by the research in big companies. This means almost unlimited resources. It’s great to validate and/or win the market. But with time, you need to get the unit economics right. For training and serving and smaller devices (a smartphone in 2017 was able to run [AlexNet only for 1 hour](https://arxiv.org/pdf/1611.05128.pdf){:target="_blank"}).

Basically there are multiple directions in ML optimizations:

- Incorporating [power/energy/latency constraints](https://workshop-edlcv.github.io/slides/901-talk.pdf){:target="_blank"} into network architectures search. This *“can bring 5‐10x improvement in energy or latency with minimal loss in accuracy or can satisfy real‐time constraints for inference”*. Basically, by thinking about hardware constraints in advance you can get to almost the same accuracy while saving in the order of magnitudes. An amazing trade-off for most of the businesses.
- [Quantizing neural networks](https://arxiv.org/pdf/1904.02835.pdf){:target="_blank"}. The idea here is to round model weights to the nearest power of 2, hence allowing using shift and add operations to replace the multiplications. This improves speed and lowers energy consumption. A very smart approach and again, a well-worse trade-off.
- [Energy-aware pruning of NNs](https://openaccess.thecvf.com/content_CVPR_2020/papers/Chin_Towards_Efficient_Model_Compression_via_Learned_Global_Ranking_CVPR_2020_paper.pdf){:target="_blank"}: Often both accuracy and latency are important to the application. This work allows you to quickly iterate over accuracy-vs.-speed trade-off for finding a sweet-spot for a particular application using model compression. 
- [Discretizing vectors over a d-dimensional sphere](https://arxiv.org/pdf/1806.03198.pdf){:target="_blank"}: A super-smart approach where instead of adapting an index to the data, the data is adopted to the index itself. *“We learn a neural network that aims at preserving the neighborhood structure in the input space while best covering the output space (uniformly)”*.

![to uniform]({{ site.url }}{{ site.baseurl }}/assets/newsletter/to_uniform.png){: class="thumbnail-img"}

These are just the directions I’ve seen recently. But the topic is becoming more and more important. If AI aims to turn into a new cloud, the industry needs to figure out the ways to scale the “state-of-the-art“ to the rest of the internet. And it looks like we are finally getting there.
