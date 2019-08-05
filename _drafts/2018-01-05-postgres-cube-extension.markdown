---
layout: post
title:  "Postgres CUBE extension"
date:   2018-01-05 12:28:41 +0100
categories: postgres
toc: true
---
* TOC
{:toc}

## Similar things
Imagine, you want to understand how similar are some items to each other. And this could be anything - two items on the e commerce site or two videos etc. But to see how similar two things are, we need to find some way to compare them to each other. One way to do that is to represent your items through [embeddings]{:target="_blank"} in some high-dimensional space. 


## CUBE extesion
{% highlight sql %}

CREATE UNLOGGED TABLE we25_csv (word varchar(200), e1 float,e2 float,e3 float,e4 float,e5 float,e6 float,e7 float,e8 float,e9 float,e10 float,e11 float,e12 float,e13 float,e14 float,e15 float,e16 float,e17 float,e18 float,e19 float,e20 float,e21 float,e22 float,e23 float,e24 float,e25 float);

CREATE UNLOGGED TABLE we50_csv (word varchar(200), e1 float,e2 float,e3 float,e4 float,e5 float,e6 float,e7 float,e8 float,e9 float,e10 float,e11 float,e12 float,e13 float,e14 float,e15 float,e16 float,e17 float,e18 float,e19 float,e20 float,e21 float,e22 float,e23 float,e24 float,e25 float,e26 float,e27 float,e28 float,e29 float,e30 float,e31 float,e32 float,e33 float,e34 float,e35 float,e36 float,e37 float,e38 float,e39 float,e40 float,e41 float,e42 float,e43 float,e44 float,e45 float,e46 float,e47 float,e48 float,e49 float,e50 float);

CREATE UNLOGGED TABLE we100_csv (word varchar(200), e1 float,e2 float,e3 float,e4 float,e5 float,e6 float,e7 float,e8 float,e9 float,e10 float,e11 float,e12 float,e13 float,e14 float,e15 float,e16 float,e17 float,e18 float,e19 float,e20 float,e21 float,e22 float,e23 float,e24 float,e25 float,e26 float,e27 float,e28 float,e29 float,e30 float,e31 float,e32 float,e33 float,e34 float,e35 float,e36 float,e37 float,e38 float,e39 float,e40 float,e41 float,e42 float,e43 float,e44 float,e45 float,e46 float,e47 float,e48 float,e49 float,e50 float,e51 float,e52 float,e53 float,e54 float,e55 float,e56 float,e57 float,e58 float,e59 float,e60 float,e61 float,e62 float,e63 float,e64 float,e65 float,e66 float,e67 float,e68 float,e69 float,e70 float,e71 float,e72 float,e73 float,e74 float,e75 float,e76 float,e77 float,e78 float,e79 float,e80 float,e81 float,e82 float,e83 float,e84 float,e85 float,e86 float,e87 float,e88 float,e89 float,e90 float,e91 float,e92 float,e93 float,e94 float,e95 float,e96 float,e97 float,e98 float,e99 float,e100 float);

CREATE UNLOGGED TABLE we200_csv (word varchar(200), 
e1 float,e2 float,e3 float,e4 float,e5 float,e6 float,e7 float,e8 float,e9 float,e10 float,e11 float,e12 float,e13 float,e14 float,e15 float,e16 float,e17 float,e18 float,e19 float,e20 float,e21 float,e22 float,e23 float,e24 float,e25 float,e26 float,e27 float,e28 float,e29 float,e30 float,e31 float,e32 float,e33 float,e34 float,e35 float,e36 float,e37 float,e38 float,e39 float,e40 float,e41 float,e42 float,e43 float,e44 float,e45 float,e46 float,e47 float,e48 float,e49 float,e50 float,e51 float,e52 float,e53 float,e54 float,e55 float,e56 float,e57 float,e58 float,e59 float,e60 float,e61 float,e62 float,e63 float,e64 float,e65 float,e66 float,e67 float,e68 float,e69 float,e70 float,e71 float,e72 float,e73 float,e74 float,e75 float,e76 float,e77 float,e78 float,e79 float,e80 float,e81 float,e82 float,e83 float,e84 float,e85 float,e86 float,e87 float,e88 float,e89 float,e90 float,e91 float,e92 float,e93 float,e94 float,e95 float,e96 float,e97 float,e98 float,e99 float,e100 float,e101 float,e102 float,e103 float,e104 float,e105 float,e106 float,e107 float,e108 float,e109 float,e110 float,e111 float,e112 float,e113 float,e114 float,e115 float,e116 float,e117 float,e118 float,e119 float,e120 float,e121 float,e122 float,e123 float,e124 float,e125 float,e126 float,e127 float,e128 float,e129 float,e130 float,e131 float,e132 float,e133 float,e134 float,e135 float,e136 float,e137 float,e138 float,e139 float,e140 float,e141 float,e142 float,e143 float,e144 float,e145 float,e146 float,e147 float,e148 float,e149 float,e150 float,e151 float,e152 float,e153 float,e154 float,e155 float,e156 float,e157 float,e158 float,e159 float,e160 float,e161 float,e162 float,e163 float,e164 float,e165 float,e166 float,e167 float,e168 float,e169 float,e170 float,e171 float,e172 float,e173 float,e174 float,e175 float,e176 float,e177 float,e178 float,e179 float,e180 float,e181 float,e182 float,e183 float,e184 float,e185 float,e186 float,e187 float,e188 float,e189 float,e190 float,e191 float,e192 float,e193 float,e194 float,e195 float,e196 float,e197 float,e198 float,e199 float,e200 float);

create table we_25 (word varchar(200), vector cube);
create table we_50 (word varchar(200), vector cube);
create table we_100 (word varchar(200), vector cube);
create table we_200 (word varchar(200), vector cube);

insert into we_25 select word, cube(array[e1,e2,e3,e4,e5,e6,e7,e8,e9,e10,e11,e12,e13,e14,e15,e16,e17,e18,e19,e20,e21,e22,e23,e24,e25]) from we25_csv;
insert into we_50 select word, cube(array[e1,e2,e3,e4,e5,e6,e7,e8,e9,e10,e11,e12,e13,e14,e15,e16,e17,e18,e19,e20,e21,e22,e23,e24,e25,e26,e27,e28,e29,e30,e31,e32,e33,e34,e35,e36,e37,e38,e39,e40,e41,e42,e43,e44,e45,e46,e47,e48,e49,e50]) from we50_csv;
insert into we_100 select word, cube(array[e1,e2,e3,e4,e5,e6,e7,e8,e9,e10,e11,e12,e13,e14,e15,e16,e17,e18,e19,e20,e21,e22,e23,e24,e25,e26,e27,e28,e29,e30,e31,e32,e33,e34,e35,e36,e37,e38,e39,e40,e41,e42,e43,e44,e45,e46,e47,e48,e49,e50,e51,e52,e53,e54,e55,e56,e57,e58,e59,e60,e61,e62,e63,e64,e65,e66,e67,e68,e69,e70,e71,e72,e73,e74,e75,e76,e77,e78,e79,e80,e81,e82,e83,e84,e85,e86,e87,e88,e89,e90,e91,e92,e93,e94,e95,e96,e97,e98,e99,e100]) from we100_csv;
insert into we_200 select word, cube(array[e1,e2,e3,e4,e5,e6,e7,e8,e9,e10,e11,e12,e13,e14,e15,e16,e17,e18,e19,e20,e21,e22,e23,e24,e25,e26,e27,e28,e29,e30,e31,e32,e33,e34,e35,e36,e37,e38,e39,e40,e41,e42,e43,e44,e45,e46,e47,e48,e49,e50,e51,e52,e53,e54,e55,e56,e57,e58,e59,e60,e61,e62,e63,e64,e65,e66,e67,e68,e69,e70,e71,e72,e73,e74,e75,e76,e77,e78,e79,e80,e81,e82,e83,e84,e85,e86,e87,e88,e89,e90,e91,e92,e93,e94,e95,e96,e97,e98,e99,e100,e101,e102,e103,e104,e105,e106,e107,e108,e109,e110,e111,e112,e113,e114,e115,e116,e117,e118,e119,e120,e121,e122,e123,e124,e125,e126,e127,e128,e129,e130,e131,e132,e133,e134,e135,e136,e137,e138,e139,e140,e141,e142,e143,e144,e145,e146,e147,e148,e149,e150,e151,e152,e153,e154,e155,e156,e157,e158,e159,e160,e161,e162,e163,e164,e165,e166,e167,e168,e169,e170,e171,e172,e173,e174,e175,e176,e177,e178,e179,e180,e181,e182,e183,e184,e185,e186,e187,e188,e189,e190,e191,e192,e193,e194,e195,e196,e197,e198,e199,e200]) from we200_csv;

create unique index we_25_word_pk_idx on we_25 (word);
create unique index we_50_word_pk_idx on we_50 (word);
create unique index we_100_word_pk_idx on we_100 (word);
create unique index we_200_word_pk_idx on we_200 (word);
{% endhighlight %}

{% highlight bash %}

elias.nema=# explain (analyze,buffers) with seed as (select * From we_25 where word = 'postgres') select we.word,(we.vector<#>seed.vector) dist from we_25 we cross join seed order by we.vector<#>seed.vector limit 20;
                                                               QUERY PLAN                                                               
----------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=140464.18..140464.23 rows=20 width=19) (actual time=798.150..798.154 rows=20 loops=1)
   Buffers: shared hit=546 read=74092
   CTE seed
     ->  Gather  (cost=1000.00..44535.01 rows=1 width=219) (actual time=89.770..89.794 rows=1 loops=1)
           Workers Planned: 2
           Workers Launched: 2
           Buffers: shared hit=225 read=37094
           ->  Parallel Seq Scan on we_25  (cost=0.00..43534.91 rows=1 width=219) (actual time=82.771..85.000 rows=0 loops=3)
                 Filter: ((word)::text = 'postgres'::text)
                 Rows Removed by Filter: 397838
                 Buffers: shared hit=225 read=37094
   ->  Sort  (cost=95929.17..98912.80 rows=1193455 width=19) (actual time=798.149..798.150 rows=20 loops=1)
         Sort Key: ((we.vector <#> seed.vector))
         Sort Method: top-N heapsort  Memory: 27kB
         Buffers: shared hit=546 read=74092
         ->  Nested Loop  (cost=0.00..64171.76 rows=1193455 width=19) (actual time=89.831..657.213 rows=1193514 loops=1)
               Buffers: shared hit=546 read=74092
               ->  CTE Scan on seed  (cost=0.00..0.02 rows=1 width=32) (actual time=89.772..89.776 rows=1 loops=1)
                     Buffers: shared hit=225 read=37094
               ->  Seq Scan on we_25 we  (cost=0.00..49253.55 rows=1193455 width=219) (actual time=0.056..206.667 rows=1193514 loops=1)
                     Buffers: shared hit=321 read=36998
 Planning time: 0.115 ms
 Execution time: 798.206 ms
(23 rows)


elias.nema=# explain (analyze,buffers) with seed as (select * From we_50 where word = 'postgres') select we.word,(we.vector<#>seed.vector) dist from we_50 we cross join seed order by we.vector<#>seed.vector limit 20;
                                                               QUERY PLAN                                                               
----------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=199728.86..199728.91 rows=20 width=19) (actual time=985.626..985.631 rows=20 loops=1)
   Buffers: shared hit=641 read=133255
   CTE seed
     ->  Gather  (cost=1000.00..74164.65 rows=1 width=419) (actual time=0.277..0.307 rows=1 loops=1)
           Workers Planned: 2
           Workers Launched: 2
           Buffers: shared hit=297 read=66651
           ->  Parallel Seq Scan on we_50  (cost=0.00..73164.55 rows=1 width=419) (actual time=117.050..117.051 rows=0 loops=3)
                 Filter: ((word)::text = 'postgres'::text)
                 Rows Removed by Filter: 397838
                 Buffers: shared hit=297 read=66651
   ->  Sort  (cost=125564.21..128548.15 rows=1193578 width=19) (actual time=985.625..985.627 rows=20 loops=1)
         Sort Key: ((we.vector <#> seed.vector))
         Sort Method: top-N heapsort  Memory: 26kB
         Buffers: shared hit=641 read=133255
         ->  Nested Loop  (cost=0.00..93803.53 rows=1193578 width=19) (actual time=0.289..840.445 rows=1193514 loops=1)
               Buffers: shared hit=641 read=133255
               ->  CTE Scan on seed  (cost=0.00..0.02 rows=1 width=32) (actual time=0.280..0.285 rows=1 loops=1)
                     Buffers: shared hit=297 read=66651
               ->  Seq Scan on we_50 we  (cost=0.00..78883.78 rows=1193578 width=419) (actual time=0.005..300.247 rows=1193514 loops=1)
                     Buffers: shared hit=344 read=66604
 Planning time: 0.113 ms
 Execution time: 985.687 ms


elias.nema=# explain (analyze,buffers) with seed as (select * From we_100 where word = 'postgres') select we.word,(we.vector<#>seed.vector) dist from we_100 we cross join seed order by we.vector<#>seed.vector limit 20;
                                                                QUERY PLAN                                                                
------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=331055.55..331055.60 rows=20 width=19) (actual time=1763.587..1763.591 rows=20 loops=1)
   Buffers: shared hit=608 read=264618
   CTE seed
     ->  Gather  (cost=1000.00..139829.33 rows=1 width=819) (actual time=227.596..227.622 rows=1 loops=1)
           Workers Planned: 2
           Workers Launched: 2
           Buffers: shared hit=256 read=132357
           ->  Parallel Seq Scan on we_100  (cost=0.00..138829.23 rows=1 width=819) (actual time=193.062..222.961 rows=0 loops=3)
                 Filter: ((word)::text = 'postgres'::text)
                 Rows Removed by Filter: 397838
                 Buffers: shared hit=256 read=132357
   ->  Sort  (cost=191226.21..194210.00 rows=1193517 width=19) (actual time=1763.586..1763.587 rows=20 loops=1)
         Sort Key: ((we.vector <#> seed.vector))
         Sort Method: top-N heapsort  Memory: 27kB
         Buffers: shared hit=608 read=264618
         ->  Nested Loop  (cost=0.00..159467.15 rows=1193517 width=19) (actual time=227.611..1612.989 rows=1193514 loops=1)
               Buffers: shared hit=608 read=264618
               ->  CTE Scan on seed  (cost=0.00..0.02 rows=1 width=32) (actual time=227.598..227.601 rows=1 loops=1)
                     Buffers: shared hit=256 read=132357
               ->  Seq Scan on we_100 we  (cost=0.00..144548.17 rows=1193517 width=819) (actual time=0.010..484.765 rows=1193514 loops=1)
                     Buffers: shared hit=352 read=132261
 Planning time: 0.115 ms
 Execution time: 1763.645 ms
                                           

elias.nema=# explain (analyze,buffers) with seed as (select * From we_200 where word = 'postgres') select we.word,(we.vector<#>seed.vector) dist from we_200 we cross join seed order by we.vector<#>seed.vector limit 20;
                                                                QUERY PLAN                                                                 
-------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=662587.49..662587.54 rows=20 width=19) (actual time=3204.843..3204.847 rows=20 loops=1)
   Buffers: shared hit=1812 read=594946
   CTE seed
     ->  Gather  (cost=1000.00..305595.33 rows=1 width=1619) (actual time=474.322..474.350 rows=1 loops=1)
           Workers Planned: 2
           Workers Launched: 2
           Buffers: shared hit=858 read=297521
           ->  Parallel Seq Scan on we_200  (cost=0.00..304595.23 rows=1 width=1619) (actual time=468.610..468.611 rows=0 loops=3)
                 Filter: ((word)::text = 'postgres'::text)
                 Rows Removed by Filter: 397838
                 Buffers: shared hit=858 read=297521
   ->  Sort  (cost=356992.16..359975.95 rows=1193516 width=19) (actual time=3204.842..3204.843 rows=20 loops=1)
         Sort Key: ((we.vector <#> seed.vector))
         Sort Method: top-N heapsort  Memory: 27kB
         Buffers: shared hit=1812 read=594946
         ->  Nested Loop  (cost=0.00..325233.13 rows=1193516 width=19) (actual time=474.339..3041.446 rows=1193514 loops=1)
               Buffers: shared hit=1812 read=594946
               ->  CTE Scan on seed  (cost=0.00..0.02 rows=1 width=32) (actual time=474.326..474.329 rows=1 loops=1)
                     Buffers: shared hit=858 read=297521
               ->  Seq Scan on we_200 we  (cost=0.00..310314.16 rows=1193516 width=1619) (actual time=0.009..962.660 rows=1193514 loops=1)
                     Buffers: shared hit=954 read=297425
 Planning time: 0.113 ms
 Execution time: 3204.901 ms
(23 rows)

Time: 3205.348 ms (00:03.205)


create table we_100_0125 (word varchar(200), vector cube);
create table we_100_025 (word varchar(200), vector cube);
create table we_100_05 (word varchar(200), vector cube);
create unique index we_100_0125_word_pk_idx on we_100_0125 (word);
create unique index we_100_025_word_pk_idx on we_100_025 (word);
create unique index we_100_05_word_pk_idx on we_100_05 (word);

elias.nema=# explain (analyze,buffers) with seed as (select * From we_100_0125 where word = 'postgres') select we.word,(we.vector<#>seed.vector) dist from we_100_0125 we cross join seed order by we.vector<#>seed.vector limit 20;
                                                                  QUERY PLAN                                                                   
-----------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=24041.90..24041.95 rows=20 width=16) (actual time=0.051..0.051 rows=0 loops=1)
   Buffers: shared hit=3
   CTE seed
     ->  Index Scan using we_100_0125_word_pk_idx on we_100_0125  (cost=0.42..8.44 rows=1 width=816) (actual time=0.043..0.044 rows=0 loops=1)
           Index Cond: ((word)::text = 'postgres'::text)
           Buffers: shared hit=3
   ->  Sort  (cost=24033.47..24408.47 rows=150000 width=16) (actual time=0.050..0.050 rows=0 loops=1)
         Sort Key: ((we.vector <#> seed.vector))
         Sort Method: quicksort  Memory: 25kB
         Buffers: shared hit=3
         ->  Nested Loop  (cost=0.00..20042.02 rows=150000 width=16) (actual time=0.045..0.045 rows=0 loops=1)
               Buffers: shared hit=3
               ->  CTE Scan on seed  (cost=0.00..0.02 rows=1 width=32) (actual time=0.045..0.045 rows=0 loops=1)
                     Buffers: shared hit=3
               ->  Seq Scan on we_100_0125 we  (cost=0.00..18167.00 rows=150000 width=816) (never executed)
 Planning time: 0.140 ms
 Execution time: 0.081 ms


elias.nema=# explain (analyze,buffers) with seed as (select * From we_100_025 where word = 'postgres') select we.word,(we.vector<#>seed.vector) dist from we_100_025 we cross join seed order by we.vector<#>seed.vector limit 20;
                                                                 QUERY PLAN                                                                  
---------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=48075.30..48075.35 rows=20 width=18) (actual time=0.055..0.055 rows=0 loops=1)
   Buffers: shared hit=3
   CTE seed
     ->  Index Scan using we_100_025_word_pk_idx on we_100_025  (cost=0.42..8.44 rows=1 width=818) (actual time=0.049..0.049 rows=0 loops=1)
           Index Cond: ((word)::text = 'postgres'::text)
           Buffers: shared hit=3
   ->  Sort  (cost=48066.86..48816.86 rows=299999 width=18) (actual time=0.055..0.055 rows=0 loops=1)
         Sort Key: ((we.vector <#> seed.vector))
         Sort Method: quicksort  Memory: 25kB
         Buffers: shared hit=3
         ->  Nested Loop  (cost=0.00..40084.00 rows=299999 width=18) (actual time=0.050..0.050 rows=0 loops=1)
               Buffers: shared hit=3
               ->  CTE Scan on seed  (cost=0.00..0.02 rows=1 width=32) (actual time=0.050..0.050 rows=0 loops=1)
                     Buffers: shared hit=3
               ->  Seq Scan on we_100_025 we  (cost=0.00..36333.99 rows=299999 width=818) (never executed)
 Planning time: 0.140 ms
 Execution time: 0.086 ms


elias.nema=# explain (analyze,buffers) with seed as (select * From we_100_05 where word = 'postgres') select we.word,(we.vector<#>seed.vector) dist from we_100_05 we cross join seed order by we.vector<#>seed.vector limit 20;
                                                                QUERY PLAN                                                                 
-------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=96141.39..96141.44 rows=20 width=20) (actual time=745.085..745.091 rows=20 loops=1)
   Buffers: shared hit=15911 read=50760
   CTE seed
     ->  Index Scan using we_100_05_word_pk_idx on we_100_05  (cost=0.42..8.44 rows=1 width=820) (actual time=0.086..0.088 rows=1 loops=1)
           Index Cond: ((word)::text = 'postgres'::text)
           Buffers: shared read=4
   ->  Sort  (cost=96132.95..97632.96 rows=600003 width=20) (actual time=745.084..745.087 rows=20 loops=1)
         Sort Key: ((we.vector <#> seed.vector))
         Sort Method: top-N heapsort  Memory: 27kB
         Buffers: shared hit=15911 read=50760
         ->  Nested Loop  (cost=0.00..80167.09 rows=600003 width=20) (actual time=0.107..671.231 rows=600000 loops=1)
               Buffers: shared hit=15911 read=50760
               ->  CTE Scan on seed  (cost=0.00..0.02 rows=1 width=32) (actual time=0.088..0.090 rows=1 loops=1)
                     Buffers: shared read=4
               ->  Seq Scan on we_100_05 we  (cost=0.00..72667.03 rows=600003 width=820) (actual time=0.015..216.627 rows=600000 loops=1)
                     Buffers: shared hit=15911 read=50756
 Planning time: 0.370 ms
 Execution time: 745.121 ms


0125: 173.279 ms
025: 340.732 ms
05: 632.382 ms
1: 1356.530 ms
{% endhighlight %}
One possibility is to store them in relational database. Here we are looking at Postgres (because it's [awesome]{:target="_blank"}, if you had doubts). There is a [cube extension], that allows, among some other things, to store n-dimensional data structures and even find nearest neighbours based on distance between them.

Main idea is to have a `cube` object that will be based on `array` in our case. We will create a table of the following structure and fill it with data from the previous example:
{% highlight sql %}
CREATE TABLE item_embeddings (item_id INT, emb_vector CUBE);
INSERT INTO item_embeddings VALUES
  (1, cube(array[-1.429, -1.080,  0.0160, 0.810, -0.382, -0.986, -0.898, -0.723, -1.179, -0.391])), 
  (2, cube(array[-0.218,  1.681, -0.0125, 0.235, -0.209,  0.509,  0.553, -0.373, -0.511,  0.212])), 
  (3, cube(array[-0.696,  1.352,  0.2413, 1.202,  0.267, -0.688, -1.197,  0.363,  0.681, -0.578]))
{% endhighlight %}

## Finding similar items
In the cube extension there are special operators to find distance between vectors: it's the `<->` sign that does the trick for `Euclidean distance` (as you can see in docs, there are also `<#>` and `<=>` that corresponds to `Taxicab (L-1 metric)` and `Chebyshev (L-inf metric)` distances respectively). So the following query will return distance between vectors, we've loaded before.
{% highlight sql %}
SELECT e1.item_id,
       e2.item_id,
       e1.emb_vector <-> e2.emb_vector AS distance
  FROM item_embeddings e1
  JOIN item_embeddings e2 ON e1.item_id < e2.item_id;
{% endhighlight %}

{% highlight shell %}
+-----------+-----------+---------------+
| item_id   | item_id   | distance      |
|-----------+-----------+---------------|
| 1         | 2         | 3.83715614095 |
| 1         | 3         | 3.45394095057 |
| 2         | 3         | 2.94019955785 |
+-----------+-----------+---------------+
{% endhighlight %}
So you can see that numbers correspond to the previous snippet, where we calculated Euclidean distance by our own. You can also notice that. 

But it's rare enough you actually need distances between items. Much more common use-case is _"giving a seed item, find most similar items to this one"_. This is so-called [nearest neighbor search].

### Couple of items
So let's get items in the order of similarity to the *item3*:
WITH i3 AS (SELECT emb_vector FROM item_embeddings WHERE item_id = 1)
SELECT ie.item_id
     , i3.emb_vector <-> ie.emb_vector  AS   distance
  FROM item_embeddings ie CROSS JOIN i3
 ORDER BY i3.emb_vector <-> ie.emb_vector
;
WITH i1 AS (SELECT emb_vector FROM item_embeddings WHERE item_id = 1)
SELECT ie.item_id
     , i1.emb_vector <-> ie.emb_vector  AS   distance
  FROM item_embeddings ie CROSS JOIN i1
 ORDER BY i1.emb_vector <-> ie.emb_vector
 LIMIT 15
;
### Million items
Now let's look at what will happen when we increase number of items in our dataset. Loading 1M items this time:
{% highlight sql %}
INSERT INTO item_embeddings
WITH gs AS (SELECT generate_series(1,1e6) AS item_id)
SELECT item_id
     , cube(array[random(),random(),random(),random(),random(),random(),random(),random(),random(),random()])
  FROM gs;
{% endhighlight %}
### Widening vector
## Trying approximation
## Conclusion

Version
{% highlight bash %}
select version()
+--------------------------------------------------------------------------------------------------+
| version                                                                                          |
|--------------------------------------------------------------------------------------------------|
| PostgreSQL 10.1 on x86_64-pc-linux-gnu, compiled by gcc (Debian 6.3.0-18) 6.3.0 20170516, 64-bit |
+--------------------------------------------------------------------------------------------------+
{% endhighlight %}
create extension cube;

```

[embeddings]: https://www.tensorflow.org/versions/master/programmers_guide/embedding
[awesome]: http://www.craigkerstiens.com/2018/01/31/postgres-hidden-gems/#.WnThJWCKxwk.twitter
[cube extension]: https://www.postgresql.org/docs/10/static/cube.html
[Euclidean distance]: https://en.wikipedia.org/wiki/Euclidean_distance
[nearest neighbor search]: https://en.wikipedia.org/wiki/Nearest_neighbor_search
[]: https://towardsdatascience.com/deep-learning-4-embedding-layers-f9a02d55ac12