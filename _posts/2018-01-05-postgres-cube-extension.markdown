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

In practice, it means that every item will be represented by some vector. E.g. like that:

{% highlight matlab %}
item1 = [-1.429; -1.080;  0.0160; 0.810; -0.382; -0.986; -0.898; -0.723; -1.179; -0.391]
item2 = [-0.218;  1.681; -0.0125; 0.235; -0.209;  0.509;  0.553; -0.373; -0.511;  0.212]
item3 = [-0.696;  1.352;  0.2413; 1.202;  0.267; -0.688; -1.197;  0.363;  0.681; -0.578]
{% endhighlight %}

To see how items are related, we can simply find [Euclidean distance]{:target="_blank"} between these representations:
{% highlight matlab %}
norm(item1 - item2) = 3.8372
norm(item1 - item3) = 3.4537
norm(item2 - item3) = 2.9400
{% endhighlight %}

So without knowing much about these items, we can already see that item2 and item3 are more similar, and item1 is closer to item3 than to item2. 

Okay, so now we know how to understand relationship between items. But what about storing these embeddings somewhere. 

## CUBE extesion
create table we_300 (word varchar(200), vector cube)

CREATE UNLOGGED TABLE we_csv (word varchar(200), 
e1 float,e2 float,e3 float,e4 float,e5 float,e6 float,e7 float,e8 float,e9 float,e10 float,e11 float,e12 float,e13 float,e14 float,e15 float,e16 float,e17 float,e18 float,e19 float,e20 float,e21 float,e22 float,e23 float,e24 float,e25 float,e26 float,e27 float,e28 float,e29 float,e30 float,e31 float,e32 float,e33 float,e34 float,e35 float,e36 float,e37 float,e38 float,e39 float,e40 float,e41 float,e42 float,e43 float,e44 float,e45 float,e46 float,e47 float,e48 float,e49 float,e50 float,e51 float,e52 float,e53 float,e54 float,e55 float,e56 float,e57 float,e58 float,e59 float,e60 float,e61 float,e62 float,e63 float,e64 float,e65 float,e66 float,e67 float,e68 float,e69 float,e70 float,e71 float,e72 float,e73 float,e74 float,e75 float,e76 float,e77 float,e78 float,e79 float,e80 float,e81 float,e82 float,e83 float,e84 float,e85 float,e86 float,e87 float,e88 float,e89 float,e90 float,e91 float,e92 float,e93 float,e94 float,e95 float,e96 float,e97 float,e98 float,e99 float,e100 float,e101 float,e102 float,e103 float,e104 float,e105 float,e106 float,e107 float,e108 float,e109 float,e110 float,e111 float,e112 float,e113 float,e114 float,e115 float,e116 float,e117 float,e118 float,e119 float,e120 float,e121 float,e122 float,e123 float,e124 float,e125 float,e126 float,e127 float,e128 float,e129 float,e130 float,e131 float,e132 float,e133 float,e134 float,e135 float,e136 float,e137 float,e138 float,e139 float,e140 float,e141 float,e142 float,e143 float,e144 float,e145 float,e146 float,e147 float,e148 float,e149 float,e150 float,e151 float,e152 float,e153 float,e154 float,e155 float,e156 float,e157 float,e158 float,e159 float,e160 float,e161 float,e162 float,e163 float,e164 float,e165 float,e166 float,e167 float,e168 float,e169 float,e170 float,e171 float,e172 float,e173 float,e174 float,e175 float,e176 float,e177 float,e178 float,e179 float,e180 float,e181 float,e182 float,e183 float,e184 float,e185 float,e186 float,e187 float,e188 float,e189 float,e190 float,e191 float,e192 float,e193 float,e194 float,e195 float,e196 float,e197 float,e198 float,e199 float,e200 float,e201 float,e202 float,e203 float,e204 float,e205 float,e206 float,e207 float,e208 float,e209 float,e210 float,e211 float,e212 float,e213 float,e214 float,e215 float,e216 float,e217 float,e218 float,e219 float,e220 float,e221 float,e222 float,e223 float,e224 float,e225 float,e226 float,e227 float,e228 float,e229 float,e230 float,e231 float,e232 float,e233 float,e234 float,e235 float,e236 float,e237 float,e238 float,e239 float,e240 float,e241 float,e242 float,e243 float,e244 float,e245 float,e246 float,e247 float,e248 float,e249 float,e250 float,e251 float,e252 float,e253 float,e254 float,e255 float,e256 float,e257 float,e258 float,e259 float,e260 float,e261 float,e262 float,e263 float,e264 float,e265 float,e266 float,e267 float,e268 float,e269 float,e270 float,e271 float,e272 float,e273 float,e274 float,e275 float,e276 float,e277 float,e278 float,e279 float,e280 float,e281 float,e282 float,e283 float,e284 float,e285 float,e286 float,e287 float,e288 float,e289 float,e290 float,e291 float,e292 float,e293 float,e294 float,e295 float,e296 float,e297 float,e298 float,e299 float,e300 float);
import io
import numpy as np
def load_vectors(fname):
    fin = io.open(fname, 'r', encoding='utf-8', newline='\n', errors='ignore')
    with open('eggs.csv', 'w', newline='') as csvfile:
        csvw = csv.writer(csvfile, delimiter=',',quoting=csv.QUOTE_MINIMAL)
        for line in fin:
            tokens = line.rstrip().split(' ')
            csvw.writerow(tokens)

pv ~/git/unstaged/eliasnema.github.io/eggs.csv | psql -c "COPY we_csv FROM STDIN (FORMAT CSV)"


select word, cube(array[e1,e2,e3,e4,e5,e6,e7,e8,e9,e10,e11,e12,e13,e14,e15,e16,e17,e18,e19,e20,e21,e22,e23,e24,e25,e26,e27,e28,e29,e30,e31,e32,e33,e34,e35,e36,e37,e38,e39,e40,e41,e42,e43,e44,e45,e46,e47,e48,e49,e50,e51,e52,e53,e54,e55,e56,e57,e58,e59,e60,e61,e62,e63,e64,e65,e66,e67,e68,e69,e70,e71,e72,e73,e74,e75,e76,e77,e78,e79,e80,e81,e82,e83,e84,e85,e86,e87,e88,e89,e90,e91,e92,e93,e94,e95,e96,e97,e98,e99,e100,e101,e102,e103,e104,e105,e106,e107,e108,e109,e110,e111,e112,e113,e114,e115,e116,e117,e118,e119,e120,e121,e122,e123,e124,e125,e126,e127,e128,e129,e130,e131,e132,e133,e134,e135,e136,e137,e138,e139,e140,e141,e142,e143,e144,e145,e146,e147,e148,e149,e150,e151,e152,e153,e154,e155,e156,e157,e158,e159,e160,e161,e162,e163,e164,e165,e166,e167,e168,e169,e170,e171,e172,e173,e174,e175,e176,e177,e178,e179,e180,e181,e182,e183,e184,e185,e186,e187,e188,e189,e190,e191,e192,e193,e194,e195,e196,e197,e198,e199,e200,e201,e202,e203,e204,e205,e206,e207,e208,e209,e210,e211,e212,e213,e214,e215,e216,e217,e218,e219,e220,e221,e222,e223,e224,e225,e226,e227,e228,e229,e230,e231,e232,e233,e234,e235,e236,e237,e238,e239,e240,e241,e242,e243,e244,e245,e246,e247,e248,e249,e250,e251,e252,e253,e254,e255,e256,e257,e258,e259,e260,e261,e262,e263,e264,e265,e266,e267,e268,e269,e270,e271,e272,e273,e274,e275,e276,e277,e278,e279,e280,e281,e282,e283,e284,e285,e286,e287,e288,e289,e290,e291,e292,e293,e294,e295,e296,e297,e298,e299,e300]) from we_csv;


cube(array[0.0364, 0.0471, -0.0089, 0.1581, -0.0014, 0.0707, -0.0623, -0.0518, -0.0351, -0.0581, -0.0553, -0.0147, -0.0394, 0.0593, -0.0265, -0.0384, 0.0001, 0.0519, -0.0436, -0.0268, -0.0719, -0.063, -0.1568, -0.0172, 0.0262, 0.0386, 0.0049, 0.2344, 0.1249, -0.12, -0.0787, 0.09, -0.1062, -0.1093, 0.09, 0.0651, -0.0769, 0.1147, 0.0539, -0.026, -0.0671, -0.0282, 0.0545, 0.0465, -0.0258, 0.0232, -0.0172, -0.0031, -0.1974, -0.1194, 0.0971, 0.0527, -0.7107, 0.0378, -0.1183, 0.1093, 0.0623, 0.1238, -0.0055, 0.0138, -0.0306, -0.1246, -0.0099, -0.062, -0.2119, 0.0404, 0.0136, 0.0241, 0.0618, 0.0025, 0.0682, -0.09, -0.0158, 0.0647, -0.0249, -0.137, 0.003, 0.071, 0.0412, -0.0228, 0.0055, 0.0936, 0.0144, -0.2438, 0.0139, -0.1029, -0.0049, -0.0319, 0.2819, 0.0332, -0.1356, 0.0091, 0.0282, 0.0725, -0.0145, -0.0573, -0.0044, 0.0825, -0.0141, 0.0398, -0.1085, -0.0631, 0.0459, 0.0047, -0.0199, -0.0859, -0.0054, -0.0235, 0.1355, 0.0907, 0.0077, -0.1256, -0.1537, -0.0069, 0.0784, 0.0204, 0.0629, -0.0063, 0.1228, -0.1379, -0.0089, 0.0365, -0.0525, 0.0332, -0.1082, 0.2102, -0.1179, -0.0986, -0.0113, -0.0582, -0.0126, -0.0698, -0.0334, -0.0838, 0.0463, -0.103, 0.0628, 0.0134, 0.1044, 0.1271, 0.0626, 0.0443, 0.0385, 0.1158, 0.002, 0.1499, -0.1052, -0.0598, -0.0527, 0.119, 0.156, 0.0496, -0.1085, -0.0247, 0.0348, -0.0188, -0.0112, 0.044, 0.0152, -0.0228, -0.0432, 0.0353, 0.0147, -0.1504, -0.1267, -0.0323, 0.0218, 0.1391, 0.029, 0.0509, -0.2273, 0.0435, 0.0038, 0.0013, -0.0255, -0.0794, 0.2396, -0.0654, -0.0191, -0.0556, 0.054, 0.0105, -0.0447, 0.0014, -0.0215, 0.0233, -0.0323, 0.1982, -0.0459, -0.0513, -0.0065, 0.0635, -0.0999, 0.1033, -0.0686, -0.007, -0.1119, 0.0189, 0.2126, -0.0659, -0.1, 0.0352, 0.025, -0.1062, -0.0004, -0.0048, 0.0661, -0.0072, 0.021, -0.0978, 0.0628, -0.143, 0.1388, 0.0118, -0.1103, -0.0679, -0.0711, -0.0547, -0.0305, -0.0636, 0.0064, -0.0518, 0.026, -0.0374, 0.0298, -0.0818, -0.0372, -0.0045, -0.0751, -0.0131, 0.338, -0.0533, 0.3764, -0.0736, 0.1042, -0.0739, -0.0667, 0.1668, -0.2813, 0.0014, -0.1107, -0.0442, 0.0574, 0.188, 0.0018, -0.1103, -0.0773, -0.1346, 0.0733, 0.3603, -0.1222, -0.0463, -0.1454, -0.0863, 0.3293, 0.0758, -0.0474, -0.0557, -0.1334, -0.0551, -0.0363, -0.0662, -0.0095, -0.0364, -0.0817, 0.0244, 0.0222, 0.0925, -0.1022, -0.0579, 0.1451, 0.04, -0.0697, -0.0384, 0.0115, -0.0141, -0.0861, -0.0583, 0.0272, 0.0653, -0.0119, -0.0586, -0.1676, 0.0837, -0.1338, 0.0934, 0.0687, 0.0502, 0.0832, 0.0284, 0.0349, -0.0551, -0.0084, 0.0553, -0.0295, -0.0555, 0.0608, -0.1713, 0.0507, 0.0224])

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

WITH gs AS (SELECT generate_series(1,10) AS item_id)
SELECT item_id
  , cube(array[
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random()
  ])
  FROM gs;


WITH gs AS (SELECT generate_series(1,10) AS item_id)
SELECT item_id
  , cube(array[
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),
    random(),random(),random(),random(),random(),random(),random(),random(),random(),random()
  ])
  FROM gs;

Version
``` sql
select version()
+--------------------------------------------------------------------------------------------------+
| version                                                                                          |
|--------------------------------------------------------------------------------------------------|
| PostgreSQL 10.1 on x86_64-pc-linux-gnu, compiled by gcc (Debian 6.3.0-18) 6.3.0 20170516, 64-bit |
+--------------------------------------------------------------------------------------------------+
```
``` sql
create extension cube;

CREATE TABLE item_embeddings_csv (item_id int, 
e1  float, e2  float, e3  float, e4  float, e5  float, e6  float, e7  float, e8  float, e9  float, e10 float, 
e11 float, e12 float, e13 float, e14 float, e15 float, e16 float, e17 float, e18 float, e19 float, e20 float, 
e21 float, e22 float, e23 float, e24 float, e25 float, e26 float, e27 float, e28 float, e29 float, e30 float, 
e31 float, e32 float, e33 float, e34 float, e35 float, e36 float, e37 float, e38 float, e39 float, e40 float, 
e41 float, e42 float, e43 float, e44 float, e45 float, e46 float, e47 float, e48 float, e49 float, e50 float, 
e51 float, e52 float, e53 float, e54 float, e55 float, e56 float, e57 float, e58 float, e59 float, e60 float, 
e61 float, e62 float, e63 float, e64 float, e65 float, e66 float, e67 float, e68 float, e69 float, e70 float, 
e71 float, e72 float, e73 float, e74 float, e75 float, e76 float, e77 float, e78 float, e79 float, e80 float, 
e81 float, e82 float, e83 float, e84 float, e85 float, e86 float, e87 float, e88 float, e89 float, e90 float);

CREATE UNLOGGED TABLE we_csv (word varchar(200), 
e1 float,e2 float,e3 float,e4 float,e5 float,e6 float,e7 float,e8 float,e9 float,e10 float,e11 float,e12 float,e13 float,e14 float,e15 float,e16 float,e17 float,e18 float,e19 float,e20 float,e21 float,e22 float,e23 float,e24 float,e25 float,e26 float,e27 float,e28 float,e29 float,e30 float,e31 float,e32 float,e33 float,e34 float,e35 float,e36 float,e37 float,e38 float,e39 float,e40 float,e41 float,e42 float,e43 float,e44 float,e45 float,e46 float,e47 float,e48 float,e49 float,e50 float,e51 float,e52 float,e53 float,e54 float,e55 float,e56 float,e57 float,e58 float,e59 float,e60 float,e61 float,e62 float,e63 float,e64 float,e65 float,e66 float,e67 float,e68 float,e69 float,e70 float,e71 float,e72 float,e73 float,e74 float,e75 float,e76 float,e77 float,e78 float,e79 float,e80 float,e81 float,e82 float,e83 float,e84 float,e85 float,e86 float,e87 float,e88 float,e89 float,e90 float,e91 float,e92 float,e93 float,e94 float,e95 float,e96 float,e97 float,e98 float,e99 float,e100 float,e101 float,e102 float,e103 float,e104 float,e105 float,e106 float,e107 float,e108 float,e109 float,e110 float,e111 float,e112 float,e113 float,e114 float,e115 float,e116 float,e117 float,e118 float,e119 float,e120 float,e121 float,e122 float,e123 float,e124 float,e125 float,e126 float,e127 float,e128 float,e129 float,e130 float,e131 float,e132 float,e133 float,e134 float,e135 float,e136 float,e137 float,e138 float,e139 float,e140 float,e141 float,e142 float,e143 float,e144 float,e145 float,e146 float,e147 float,e148 float,e149 float,e150 float,e151 float,e152 float,e153 float,e154 float,e155 float,e156 float,e157 float,e158 float,e159 float,e160 float,e161 float,e162 float,e163 float,e164 float,e165 float,e166 float,e167 float,e168 float,e169 float,e170 float,e171 float,e172 float,e173 float,e174 float,e175 float,e176 float,e177 float,e178 float,e179 float,e180 float,e181 float,e182 float,e183 float,e184 float,e185 float,e186 float,e187 float,e188 float,e189 float,e190 float,e191 float,e192 float,e193 float,e194 float,e195 float,e196 float,e197 float,e198 float,e199 float,e200 float,e201 float,e202 float,e203 float,e204 float,e205 float,e206 float,e207 float,e208 float,e209 float,e210 float,e211 float,e212 float,e213 float,e214 float,e215 float,e216 float,e217 float,e218 float,e219 float,e220 float,e221 float,e222 float,e223 float,e224 float,e225 float,e226 float,e227 float,e228 float,e229 float,e230 float,e231 float,e232 float,e233 float,e234 float,e235 float,e236 float,e237 float,e238 float,e239 float,e240 float,e241 float,e242 float,e243 float,e244 float,e245 float,e246 float,e247 float,e248 float,e249 float,e250 float,e251 float,e252 float,e253 float,e254 float,e255 float,e256 float,e257 float,e258 float,e259 float,e260 float,e261 float,e262 float,e263 float,e264 float,e265 float,e266 float,e267 float,e268 float,e269 float,e270 float,e271 float,e272 float,e273 float,e274 float,e275 float,e276 float,e277 float,e278 float,e279 float,e280 float,e281 float,e282 float,e283 float,e284 float,e285 float,e286 float,e287 float,e288 float,e289 float,e290 float,e291 float,e292 float,e293 float,e294 float,e295 float,e296 float,e297 float,e298 float,e299 float,e300 float);

-- CREATE TABLE item_embeddings_csv (item_id int, 
e1  float, e2  float, e3  float, e4  float, e5  float, e6  float, e7  float, e8  float, e9  float, e10 float, 
e11 float, e12 float, e13 float, e14 float, e15 float, e16 float, e17 float, e18 float, e19 float, e20 float, 
e21 float, e22 float, e23 float, e24 float, e25 float, e26 float, e27 float, e28 float, e29 float, e30 float, 
e31 float, e32 float, e33 float, e34 float, e35 float, e36 float, e37 float, e38 float, e39 float, e40 float, 
e41 float, e42 float, e43 float, e44 float, e45 float, e46 float, e47 float, e48 float, e49 float, e50 float, 
e51 float, e52 float, e53 float, e54 float, e55 float, e56 float, e57 float, e58 float, e59 float, e60 float, 
e61 float, e62 float, e63 float, e64 float, e65 float, e66 float, e67 float, e68 float, e69 float, e70 float, 
e71 float, e72 float, e73 float, e74 float, e75 float, e76 float, e77 float, e78 float, e79 float, e80 float, 
e81 float, e82 float, e83 float, e84 float, e85 float, e86 float, e87 float, e88 float, e89 float, e90 float,
norm_round int,min_idx int,max_idx int,l2_norm_round int);

\copy item_embeddings_csv FROM '/Users/elias.nema/git/relevance/kingsman/models/active_ie.csv'  DELIMITER ',' CSV
```
create table item_embeddings (item_id int, l1_norm int, l2_norm int, min_idx int, max_idx int, vector cube);

# The third

``` sh
postgres> select count(*) from item_emb_csv;
+---------+
| count   |
|---------|
| 1199658 |
+---------+

postgres> analyze item_emb_csv;
ANALYZE
Time: 0.896s

postgres> create table item_embeddings (item_id int, vector cube);

postgres> 
insert into item_embeddings select item_id,norm_round,l2_norm_round,min_idx,max_idx,cube(array[e1,e2,e3,e4,e5,e6,e7,e8,e9,e10,e11,e12,e13,e14,e15,e16,e17,e18,e19,e20,e21,e22,e23,e24,e25,e26,e27,e28,e29,e30,e31,e32,e33,e34,e35,e36,e37,e38,e39,e40,e41,e42,e43,e44,e45,e46,e47,e48,e49,e50,e51,e52,e53,e54,e55,e56,e57,e58,e59,e60,e61,e62,e63,e64,e65,e66,e67,e68,e69,e70,e71,e72,e73,e74,e75,e76,e77,e78,e79,e80,e81,e82,e83,e84,e85,e86,e87,e88,e89,e90]) from item_emb_csv;
INSERT 0 1199658
Time: 11.548s (11 seconds)
postgres> analyze item_embeddings;
ANALYZE
Time: 1.989s (a second)
postgres> select * from item_embeddings order by cube(array[-1.429396629333496,-1.0800886154174805,0.016983360052108765,0.8100804686546326,-0.3821883797645569,-0.9869611263275146,-0.8983392119407654,-0.72
          33108282089233,-1.1799477338790894,-0.3910001516342163,-0.4496285319328308,-0.9205198884010315,0.3329625129699707,0.16709201037883759,-0.32186752557754517,-0.3776169419288635,0.9535160660743713,
          -0.46631839871406555,-0.9827753305435181,-0.23059944808483124,-0.16175822913646698,1.1474850177764893,-0.45223262906074524,0.26880425214767456,-0.20183296501636505,-1.273923635482788,-1.45204544
          06738281,-1.6257303953170776,-0.8976568579673767,0.3239484131336212,0.09839248657226562,-0.32506126165390015,0.3147737383842468,0.3601040840148926,1.2253775596618652,1.1473376750946045,0.2187643
          4981822968,0.08535249531269073,0.5321782827377319,-0.9369210004806519,-0.041441041976213455,0.08755964040756226,-0.3156392574310303,-0.21885186433792114,1.6812622547149658,-0.012522578239440918,
          0.23514816164970398,-0.2094845473766327,0.5095798373222351,0.5535487532615662,-0.37340009212493896,-0.5118032693862915,0.21270844340324402,0.20315015316009521,-0.2860109806060791,0.3482474684715
          271,-1.1423231363296509,0.6251248121261597,0.30866846442222595,-0.3911898732185364,-0.7458918690681458,-1.1178058385849,1.0101838111877441,1.4073526859283447,-0.6966542601585388,1.35284101963043
          21,0.24139447510242462,1.202555537223816,0.26691290736198425,0.08506130427122116,-0.688648521900177,-1.197743535041809,0.36319413781166077,0.6805375814437866,-0.5782361626625061,-0.9213697910308
          838,0.31544339656829834,-0.5080110430717468,-0.15731993317604065,-0.6120206713676453,0.4255205988883972,-0.3019621968269348,-1.0332316160202026,0.6209618449211121,-0.42759597301483154,0.68357586
          86065674,-0.3987412750720978,-0.5011864304542542,-0.3090435266494751,-0.09834538400173187]) <-> vector asc limit 10;
+-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| item_id   | vector                                                                                                                                                                                        
|-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| 1         | (-1.4293966293335, -1.08008861541748, 0.0169833600521088, 0.810080468654633, -0.382188379764557, -0.986961126327515, -0.898339211940765, -0.723310828208923, -1.17994773387909, -0.39100015163
| 1570193   | (-1.52410984039307, -1.22949028015137, -0.19624088704586, 0.741328001022339, -0.579791963100433, -1.09340727329254, -1.17813634872437, -0.966721296310425, -1.4402437210083, -0.46416696906089
| 1079939   | (-1.54126644134521, -1.25655329227448, -0.234864935278893, 0.72887396812439, -0.615586400032043, -1.11268925666809, -1.22881960868835, -1.01081335544586, -1.48739457130432, -0.47742059826850
| 622013    | (-1.45812726020813, -1.43305480480194, -0.286666035652161, 0.742514133453369, -0.601331651210785, -1.0898711681366, -1.40508770942688, -0.862579047679901, -1.6496570110321, -0.56777703762054
| 833038    | (-1.38374185562134, -1.68211627006531, 0.109135702252388, 0.814811766147614, -1.16279661655426, -0.933576226234436, -0.793501973152161, -0.896188855171204, -1.73902320861816, -0.608343243598
| 1605823   | (-1.60604178905487, -1.33095455169678, -0.0174886882305145, 0.952862679958344, -0.586605131626129, -1.21187329292297, -1.13921058177948, -1.03617930412292, -1.39832079410553, -0.175434947013
| 1310906   | (-1.11108350753784, -1.0072238445282, -0.307974815368652, 0.359968245029449, -0.625868082046509, -1.07872521877289, -1.334712266922, -0.595451712608337, -1.54082369804382, -0.702927052974701
| 619646    | (-1.90957200527191, -1.33467578887939, 0.514744102954865, 1.05396091938019, -0.348787486553192, -1.06412422657013, -1.16105818748474, -0.595287919044495, -1.92011308670044, -0.86499607563018
| 1795854   | (-0.649678349494934, -0.897190690040588, -0.26180100440979, 0.43856218457222, -0.882052302360535, -1.22166228294373, -0.850410878658295, -0.124631226062775, -0.76722377538681, -0.26512864232
| 2002809   | (-1.04451811313629, -1.36315369606018, 0.132547095417976, 0.710687875747681, -1.22742640972137, -0.788083612918854, -0.728577733039856, -0.388570666313171, -1.47935140132904, -0.502618670463
+-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
SELECT 10
Time: 1.356s (a second)
postgres> explain analyze select * from item_embeddings order by cube(array[-1.429396629333496,-1.0800886154174805,0.016983360052108765,0.8100804686546326,-0.3821883797645569,-0.9869611263275146,-0.898339
          2119407654,-0.7233108282089233,-1.1799477338790894,-0.3910001516342163,-0.4496285319328308,-0.9205198884010315,0.3329625129699707,0.16709201037883759,-0.32186752557754517,-0.3776169419288635,0.9
          535160660743713,-0.46631839871406555,-0.9827753305435181,-0.23059944808483124,-0.16175822913646698,1.1474850177764893,-0.45223262906074524,0.26880425214767456,-0.20183296501636505,-1.27392363548
          2788,-1.4520454406738281,-1.6257303953170776,-0.8976568579673767,0.3239484131336212,0.09839248657226562,-0.32506126165390015,0.3147737383842468,0.3601040840148926,1.2253775596618652,1.1473376750
          946045,0.21876434981822968,0.08535249531269073,0.5321782827377319,-0.9369210004806519,-0.041441041976213455,0.08755964040756226,-0.3156392574310303,-0.21885186433792114,1.6812622547149658,-0.012
          522578239440918,0.23514816164970398,-0.2094845473766327,0.5095798373222351,0.5535487532615662,-0.37340009212493896,-0.5118032693862915,0.21270844340324402,0.20315015316009521,-0.2860109806060791
          ,0.3482474684715271,-1.1423231363296509,0.6251248121261597,0.30866846442222595,-0.3911898732185364,-0.7458918690681458,-1.1178058385849,1.0101838111877441,1.4073526859283447,-0.6966542601585388,
          1.3528410196304321,0.24139447510242462,1.202555537223816,0.26691290736198425,0.08506130427122116,-0.688648521900177,-1.197743535041809,0.36319413781166077,0.6805375814437866,-0.5782361626625061,
          -0.9213697910308838,0.31544339656829834,-0.5080110430717468,-0.15731993317604065,-0.6120206713676453,0.4255205988883972,-0.3019621968269348,-1.0332316160202026,0.6209618449211121,-0.427595973014
          83154,0.6835758686065674,-0.3987412750720978,-0.5011864304542542,-0.3090435266494751,-0.09834538400173187]) <=> vector asc limit 10;
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| QUERY PLAN                                                                                                                                                                                                
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| Limit  (cost=160885.97..160886.00 rows=10 width=740) (actual time=1438.489..1438.492 rows=10 loops=1)                                                                                                     
|   ->  Sort  (cost=160885.97..163885.12 rows=1199660 width=740) (actual time=1438.487..1438.489 rows=10 loops=1)                                                                                           
|         Sort Key: (('(-1.4293966293335, -1.08008861541748, 0.0169833600521088, 0.810080468654633, -0.382188379764557, -0.986961126327515, -0.898339211940765, -0.723310828208923, -1.17994773387909, -0.39
|         Sort Method: top-N heapsort  Memory: 42kB                                                                                                                                                         
|         ->  Seq Scan on item_embeddings  (cost=0.00..134961.75 rows=1199660 width=740) (actual time=0.042..1169.475 rows=1199658 loops=1)                                                                 
| Planning time: 0.102 ms                                                                                                                                                                                   
| Execution time: 1438.523 ms                                                                                                                                                                               
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
postgres> CREATE INDEX ON item_embeddings USING gist ( vector );
CREATE INDEX
Time: 279.722s (4 minutes)
postgres> analyze item_embeddings;
ANALYZE
Time: 4.004s (4 seconds)
postgres> SELECT pg_relation_filepath(oid), relpages FROM pg_class WHERE relname = 'item_embeddings';
+------------------------+------------+
| pg_relation_filepath   | relpages   |
|------------------------+------------|
| base/12994/16479       | 119966     |
+------------------------+------------+
SELECT 1
Time: 0.003s
postgres> explain analyze select * from item_embeddings order by cube(array[-1.429396629333496,-1.0800886154174805,0.016983360052108765,0.8100804686546326,-0.3821883797645569,-0.9869611263275146,-0.898339
          2119407654,-0.7233108282089233,-1.1799477338790894,-0.3910001516342163,-0.4496285319328308,-0.9205198884010315,0.3329625129699707,0.16709201037883759,-0.32186752557754517,-0.3776169419288635,0.9
          535160660743713,-0.46631839871406555,-0.9827753305435181,-0.23059944808483124,-0.16175822913646698,1.1474850177764893,-0.45223262906074524,0.26880425214767456,-0.20183296501636505,-1.27392363548
          2788,-1.4520454406738281,-1.6257303953170776,-0.8976568579673767,0.3239484131336212,0.09839248657226562,-0.32506126165390015,0.3147737383842468,0.3601040840148926,1.2253775596618652,1.1473376750
          946045,0.21876434981822968,0.08535249531269073,0.5321782827377319,-0.9369210004806519,-0.041441041976213455,0.08755964040756226,-0.3156392574310303,-0.21885186433792114,1.6812622547149658,-0.012
          522578239440918,0.23514816164970398,-0.2094845473766327,0.5095798373222351,0.5535487532615662,-0.37340009212493896,-0.5118032693862915,0.21270844340324402,0.20315015316009521,-0.2860109806060791
          ,0.3482474684715271,-1.1423231363296509,0.6251248121261597,0.30866846442222595,-0.3911898732185364,-0.7458918690681458,-1.1178058385849,1.0101838111877441,1.4073526859283447,-0.6966542601585388,
          1.3528410196304321,0.24139447510242462,1.202555537223816,0.26691290736198425,0.08506130427122116,-0.688648521900177,-1.197743535041809,0.36319413781166077,0.6805375814437866,-0.5782361626625061,
          -0.9213697910308838,0.31544339656829834,-0.5080110430717468,-0.15731993317604065,-0.6120206713676453,0.4255205988883972,-0.3019621968269348,-1.0332316160202026,0.6209618449211121,-0.427595973014
          83154,0.6835758686065674,-0.3987412750720978,-0.5011864304542542,-0.3090435266494751,-0.09834538400173187]) <-> vector asc limit 10;
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| QUERY PLAN                                                                                                                                                                                                
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| Limit  (cost=0.41..12.28 rows=10 width=740) (actual time=113.535..14707.274 rows=10 loops=1)                                                                                                              
|   ->  Index Scan using item_embeddings_vector_idx on item_embeddings  (cost=0.41..1423985.55 rows=1199657 width=740) (actual time=113.533..14707.262 rows=10 loops=1)                                     
|         Order By: (vector <-> '(-1.4293966293335, -1.08008861541748, 0.0169833600521088, 0.810080468654633, -0.382188379764557, -0.986961126327515, -0.898339211940765, -0.723310828208923, -1.17994773387
| Planning time: 0.835 ms                                                                                                                                                                                   
| Execution time: 14707.719 ms                                                                                                                                                                              
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
EXPLAIN
Time: 14.719s (14 seconds)
postgres> \d item_embeddings
+----------+---------+-------------+
| Column   | Type    | Modifiers   |
|----------+---------+-------------|
| item_id  | integer |             |
| vector   | cube    |             |
+----------+---------+-------------+
Indexes:
    "item_embeddings_vector_idx" gist (vector)

Time: 0.011s
postgres> drop index item_embeddings_vector_idx
DROP INDEX
Time: 0.108s
postgres> CREATE INDEX ON item_embeddings  ( vector );
CREATE INDEX
Time: 19.553s (19 seconds)
postgres> analyze item_embeddings;
postgres> explain analyze select * from item_embeddings order by cube(array[-1.429396629333496,-1.0800886154174805,0.016983360052108765,0.8100804686546326,-0.3821883797645569,-0.9869611263275146,-0.898339
          2119407654,-0.7233108282089233,-1.1799477338790894,-0.3910001516342163,-0.4496285319328308,-0.9205198884010315,0.3329625129699707,0.16709201037883759,-0.32186752557754517,-0.3776169419288635,0.9
          535160660743713,-0.46631839871406555,-0.9827753305435181,-0.23059944808483124,-0.16175822913646698,1.1474850177764893,-0.45223262906074524,0.26880425214767456,-0.20183296501636505,-1.27392363548
          2788,-1.4520454406738281,-1.6257303953170776,-0.8976568579673767,0.3239484131336212,0.09839248657226562,-0.32506126165390015,0.3147737383842468,0.3601040840148926,1.2253775596618652,1.1473376750
          946045,0.21876434981822968,0.08535249531269073,0.5321782827377319,-0.9369210004806519,-0.041441041976213455,0.08755964040756226,-0.3156392574310303,-0.21885186433792114,1.6812622547149658,-0.012
          522578239440918,0.23514816164970398,-0.2094845473766327,0.5095798373222351,0.5535487532615662,-0.37340009212493896,-0.5118032693862915,0.21270844340324402,0.20315015316009521,-0.2860109806060791
          ,0.3482474684715271,-1.1423231363296509,0.6251248121261597,0.30866846442222595,-0.3911898732185364,-0.7458918690681458,-1.1178058385849,1.0101838111877441,1.4073526859283447,-0.6966542601585388,
          1.3528410196304321,0.24139447510242462,1.202555537223816,0.26691290736198425,0.08506130427122116,-0.688648521900177,-1.197743535041809,0.36319413781166077,0.6805375814437866,-0.5782361626625061,
          -0.9213697910308838,0.31544339656829834,-0.5080110430717468,-0.15731993317604065,-0.6120206713676453,0.4255205988883972,-0.3019621968269348,-1.0332316160202026,0.6209618449211121,-0.427595973014
          83154,0.6835758686065674,-0.3987412750720978,-0.5011864304542542,-0.3090435266494751,-0.09834538400173187]) <-> vector asc limit 10;
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| QUERY PLAN                                                                                                                                                                                                
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| Limit  (cost=160885.87..160885.89 rows=10 width=740) (actual time=1488.500..1488.503 rows=10 loops=1)                                                                                                     
|   ->  Sort  (cost=160885.87..163885.01 rows=1199657 width=740) (actual time=1488.499..1488.501 rows=10 loops=1)                                                                                           
|         Sort Key: (('(-1.4293966293335, -1.08008861541748, 0.0169833600521088, 0.810080468654633, -0.382188379764557, -0.986961126327515, -0.898339211940765, -0.723310828208923, -1.17994773387909, -0.39
|         Sort Method: top-N heapsort  Memory: 42kB                                                                                                                                                         
|         ->  Seq Scan on item_embeddings  (cost=0.00..134961.71 rows=1199657 width=740) (actual time=0.075..1225.012 rows=1199658 loops=1)                                                                 
| Planning time: 0.133 ms                                                                                                                                                                                   
| Execution time: 1488.528 ms                                                                                                                                                                               
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
EXPLAIN
Time: 1.500s (a second)


```

[embeddings]: https://www.tensorflow.org/versions/master/programmers_guide/embedding
[awesome]: http://www.craigkerstiens.com/2018/01/31/postgres-hidden-gems/#.WnThJWCKxwk.twitter
[cube extension]: https://www.postgresql.org/docs/10/static/cube.html
[Euclidean distance]: https://en.wikipedia.org/wiki/Euclidean_distance
[nearest neighbor search]: https://en.wikipedia.org/wiki/Nearest_neighbor_search
[]: https://towardsdatascience.com/deep-learning-4-embedding-layers-f9a02d55ac12