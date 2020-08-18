---
layout: post
title:  "Pandas EDA Checklist"
date:   2020-01-14
categories: pandas, analytics
toc: true
---
* TOC
{:toc}

# EDA
As with every data professional, it's quite often that I want to quickly dig into some. What's it there, are there any obvious trends, correlations, missing data?

There are great packages that allow you to automate this process (such as [pandas-profiling](https://github.com/pandas-profiling/pandas-profiling). And while I've been using it from time to time, I found myself returning to manually looking at data with some of the commands below. There is something intangible you get while learning about things slower rather than faster.

So here is a list of things I usually run when examining the dataset.


```
df.head()
df.head().T()
```
Depending on the situation head or transposed head gives me a quick look inside the dataset.

Then a quantitative look at the dataset.
```
data.shape
data.dtypes
data.describe()
data.isnull().sum()
```

Next step is to look at the data distributions. 
```

	.value_counts(normalize=True)
	.value_counts(dropna=False)
	.value_counts(bins=10)

pd.cut() - to create bins from continuous

.hist()

.sum()
.sum(axis='columns', skipna=False)

.corr()
.cov()
.corrwith()
```

```
from pandas.plotting import scatter_matrix
attributes = ["median_house_value", "median_income", "total_rooms", "housing_median_age"]
scatter_matrix(housing[attributes], figsize=(12, 8))

```