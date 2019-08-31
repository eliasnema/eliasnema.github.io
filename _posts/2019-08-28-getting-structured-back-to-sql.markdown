---
layout: post
title:  "Getting \"Structured\" Back to SQL"
date:   2019-08-28
categories: analytics, microservices
toc: true
---
* TOC
{:toc}

# Half a century old question
Not that many questions in computer science have been circulating for more than 50 years and are still around. **"How to write SQL"** is one of them. 

There is a good reason for this. 

Relational databases have dominated the market since the 70s. Then the whole [NoSQL]{:target="_blank"} movement arose and smoothly evolved into a [NewSQL]{:target="_blank"}. Recently, all major streaming systems are [adding support for SQL]{:target="_blank"}. There should be something really powerful about this language.

With great power, comes - you know. SQL is so flexible that allows you to write queries in almost any form and still get some results. The problem is that understanding if this result makes sense requires usually more effort than to produce it. You saw it yourself - "fixing" joins with `DISTINCT` statement, counting rows multiple times. 

>SQL is so flexible that allows you to write queries in almost any form and still get **some results**. The problem is that understanding if this result makes sense **requires usually more effort** than to produce it.

I argue that most of this can be avoided by writing queries in a **structured manner**, optimizing for readability first.


# Structure _[d Query Language]_

So how to make structure? First, begin with the end in mind. What should the answer look like? For example, **you want to analyze revenue for a specific sales channel by different region**. See, it's already a prepared `SELECT` statement.

        _Here and below, I'll be using pseudo-SQL to avoid unrelated details._


```sql
SELECT channel, region, SUM(sales)
```

Usually, there would be the main subject in your question. Above, you want to analyze revenue. So `sales` is going to be your main entity, **a driving table**. In FROM, you should always put it first.

```sql
FROM sales                                 <---- driving table
```

Now you want to filter for a specific channel. For this, go to the new table - channels. When adding it, think of your query as a tree - the main table as a body and the new table as a branch.

```sql
FROM sales                                 <---- driving table

  JOIN channels ON channel = 'web'         <---- branch 1
```

>One thing to keep in mind when adding tables is the granularity you are operating on. The last thing you want is to introduce a row explosion when joining. **Write your join conditions carefully.**

The next step is to group results by region. In the sales table, there is only a `district_id`. For a region you need to go to `districts -> cities -> regions` tables. Hear your branch would consist of multiple tables.

```sql
  JOIN districts                           <---- branch 2.1
    JOIN cities                            <---- branch 2.2
      JOIN regions                         <---- branch 2.3
```

Another way to think about this: I need to get the name of a region for each district. Basically, `district_id, region_name` with the join condition on `district_id`. It's always good to double-check the join condition with a simple query like:

```sql
SELECT district_id, count(*)
FROM (district_region_branch)   <---  branch 2 from the previous query
GROUP BY district_id 
HAVING count(*) > 1
```

This will check if you have duplicates on the join key. Ideally, you will do this check for every branch introduced.

Branching metaphor also helps with rules for `OUTER` joins - whenever introduced, carry it over for all the join conditions till the end of the current branch. If there are data inconsistencies and some cities are not available in the `city` table. Hence you introduce a `LEFT JOIN` and carry it:

```sql
  JOIN districts                           <---- branch
    LEFT JOIN cities                       <---- if outer join here
      LEFT JOIN regions                    <---- then also here
```

Ok, so what do we have at the end?

```sql
SELECT region, SUM(sales)
FROM sales                                 <---- driving table

  JOIN channels WHERE channel = 'web'      <---- branch 1

  JOIN districts                           <---- branch 2.1
    LEFT JOIN cities                       <---- branch 2.2
      LEFT JOIN regions                    <---- branch 2.3

GROUP BY region
```

Note how indentation makes the query structure more readable and puts all tables in purposeful groups.

# Conclusion and a recipe
Of course, we looked at quite a simple query. And SQL is [sophisticated nowadays]{:target="_blank"}. You can do a JSON, pattern recognition, complex aggregations. However, the structure should come first. Here is how to enforce it:

>1. **Begin with the end in mind.** Think about how your answer should look like.
>
>2. **Find the main subject.** Always put it to a FROM first. If there is more than one - wrap each into a CTE and apply these steps to each of them.
>
>3. Add tables to the main **one intent at a time.** E.g.: "_all the following JOINs are here to get a region for a sale_".
>
>4. Be very careful about your joins. Ensure the table you add has **not more than one row per join condition**.
>
>5. Move to **grouping, analytical functions, etc. only after** you've finished connecting all the data sources.

Once you have learned how to get the data you need from different sources and documented it in the form of a readable structure, the query will **tell a story of your analysis** in itself. More importantly, it will help others to better understand your intents and trust your results.

[NewSQL]: https://en.wikipedia.org/wiki/NewSQL
[NoSQL]: https://en.wikipedia.org/wiki/NoSQL
[adding support for SQL]: https://arxiv.org/abs/1905.12133
[sophisticated nowadays]: https://en.wikipedia.org/wiki/SQL:2016