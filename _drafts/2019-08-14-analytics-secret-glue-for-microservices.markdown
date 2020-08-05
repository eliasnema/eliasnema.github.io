---
layout: post
title:  "Analytics as a Secret Glue for Microservice Architecture"
date:   2019-08-14
categories: analytics, microservices
toc: true
---
* TOC
{:toc}

Recently, we saw a major shift towards "microservice architectures". Driven by the industry's most successful companies it allowed teams to have fewer dependencies, move faster and scale easier. This, of course, introduced some challenges. Most of them are related to the distributed nature of the architecture and the increased cost of communication. Lots of progress have been made to overcome them, mostly in areas of system observability and operations. The journey itself is treated as a technical problem to solve. Analytics is often overlooked as something not having a direct relation to the system design.

However, the heterogeneous nature of microservices makes a perfect case for data analysis. That's how data warehousing was born after all ("central repositories of integrated data from one or more disparate sources"). In a distributed setup role of the company-wide analytical platform can be immense. Let's look at the example.

Imagine your team releases some feature. You run an experiment and notice that feature drives your team's target KPI up. That's great. Should you roll-out for the entire user base? Sure, roll out, celebrate and go home. What if, however, at the same time some KPI for a different team goes down. This might happen when you cannibalize the channel or introduce some major behavior changes on a platform. Would you want to release this feature now?

And, of course, there cannot be a correct answer to this. Nor is there a template of any kind. Making a decision requires careful planning of the experiment, cross-team alignments, willingness to make small dips where needed, so the whole system moves optimally, not the single component. And having data provides a common ground for these decisions, allows to make an educated guess, estimate the impact. Without it, teams might fall into a vicious circle of pulling in different directions. Lots of movement with no progress.

So which metrics should you think of when starting a new project or planning an experiment?
1. Company's high-level metrics: the hardest to move and would rarely be shifted by a single experiment or a feature. More likely to be altered from a compound effect of many different iterations.
2. Team's metrics: you do want to drive your team metrics up, but the important factor here is to look at them in a context of being a part of a system.
3. More granular experiment or project-related metrics: these usually comes first to your mind when designing a feature. Should be as detailed as needed so you can measure the direct and isolated impact.

There might be more depending on a project, but only by looking through different levels would you be able to make data-conscious decisions and have a ground to communicate them.

That's why when stepping into a path of microservices, company-wide analytical and experimentation culture should be among prerequisites, not an afterthought. The rich analytical platform can become your glue to connect separate elements of a system. As well as allow you to orchestrate loosely coupled components to sway in the same direction.
