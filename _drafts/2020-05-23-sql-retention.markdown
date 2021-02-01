---
layout: post
title: 'Calculating retention in SQL'
description: ''
date: 2020-05-22
permalink: retention-in-sql
categories: analytics, sql
toc: true
---

* TOC
{:toc}

# Retention and SQL

A quick snippet to calculate retention using SQL:

```sql
WITH cohorts AS (
    -- for every user taking a unique combination 
    SELECT user_id,
           event_date AS cohort_date,
    FROM clickstream_data
    WHERE event_date BETWEEN dateadd('day',-15,current_date) AND dateadd('day',-1,current_date)
      AND event_name = 'user_first_time_event'
    GROUP BY user_id, event_date
),
coh_size AS (
    SELECT cohort_date, count(*) AS coh_size FROM cohorts GROUP BY 1
),
retention AS (
    SELECT coh.cohort_date,
           date_diff('day', coh.cohort_date, event_date)  AS return_day,
           APPROXIMATE COUNT(DISTINCT coh.user_id)        AS day_n_cnt
    FROM cohorts coh
        LEFT JOIN clickstream_data cd ON (
            coh.cohort_date >=cd.event_date
            AND coh.user_id = cd.user_id
            AND cd.event_date BETWEEN dateadd('day',-15,current_date) AND dateadd('day',-1,current_date)
            AND cd.event_name = 'return_even')
    GROUP BY 1, 2)
SELECT cohort_date,
       coh_size,
       sum(CASE WHEN ret IS NULL THEN day_n_cnt ELSE 0 END)                AS churn,
       sum(CASE WHEN ret = 0 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day0_ret,
       sum(CASE WHEN ret = 1 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day1_ret,
       sum(CASE WHEN ret = 2 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day2_ret,
       sum(CASE WHEN ret = 3 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day3_ret,
       sum(CASE WHEN ret = 4 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day4_ret,
       sum(CASE WHEN ret = 5 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day5_ret,
       sum(CASE WHEN ret = 6 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day6_ret,
       sum(CASE WHEN ret = 7 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day7_ret,
       sum(CASE WHEN ret = 8 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day8_ret,
       sum(CASE WHEN ret = 9 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT  AS day9_ret,
       sum(CASE WHEN ret = 10 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT AS day10_ret,
       sum(CASE WHEN ret = 11 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT AS day11_ret,
       sum(CASE WHEN ret = 12 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT AS day12_ret,
       sum(CASE WHEN ret = 13 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT AS day13_ret,
       sum(CASE WHEN ret = 14 THEN day_n_cnt ELSE 0 END) / coh_size::FLOAT AS day14_ret
FROM retention r
         JOIN coh_size USING (cohort_date)
GROUP BY 1, 2
ORDER BY 1;
```