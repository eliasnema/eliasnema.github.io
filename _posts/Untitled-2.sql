with seed_item as (
  select
    item_id,
    l1_norm,
    l2_norm,
    min_idx,
    max_idx,
    vector
  from
    item_embeddings
  where
    item_id <= 2
),
sim_items as (
  select
    si.item_id i1,
    ie.item_id i2,
    si.l1_norm l11,
    ie.l1_norm l12,
    si.l2_norm l21,
    ie.l2_norm l22,
    si.min_idx min1,
    ie.min_idx min2,
    si.max_idx max1,
    ie.max_idx max2,
    cube_distance(ie.vector, si.vector) dist,
    row_number() over (
      partition by si.item_id
      order by
        cube_distance(ie.vector, si.vector)
    ) rn
  from
    item_embeddings as ie
    cross join seed_item as si
)
select
  i1,
  count(*),
  avg(dist),
  count(*) filter (
    where
      l11 = l12
  ) l1_norm_eq,
  count(*) filter (
    where
      l21 = l22
  ) l2_norm_eq,
  count(*) filter (
    where
      min1 = min2
  ) min_eq,
  count(*) filter (
    where
      max1 = max2
  ) max_eq
from
  sim_items
where
  rn <= 10
group by
  1;with seed_item as (
    select
      item_id,
      l1_norm,
      l2_norm,
      min_idx,
      max_idx,
      vector
    from
      item_embeddings
    where
      item_id <= 2
  )
select
  si.item_id i1,
  ie.item_id i2,
  si.l1_norm l11,
  ie.l1_norm l12,
  si.l2_norm l21,
  ie.l2_norm l22,
  si.min_idx min1,
  ie.min_idx min2,
  si.max_idx max1,
  ie.max_idx max2,
  ie.dist
from
  seed_item si
  cross join lateral (
    select
      ie.item_id,
      ie.l1_norm,
      ie.l2_norm,
      ie.min_idx,
      ie.max_idx,
      cube_distance(ie.vector, si.vector) dist
    from
      item_embeddings ie
    order by
      ie.vector < -> si.vector
    limit
      10
  );
  
  
---------

select
  si.item_id,
  array_agg(lj.item_id || ',' || lj.dist)
from ie_10 si
  cross join lateral (
    select
      ie.item_id,
      cube_distance(ie.emb_vector, si.emb_vector) dist
    from ie_10 ie
    order by ie.emb_vector <-> si.emb_vector limit 4
  ) lj
where si.item_id != lj.item_id
group by 1;

select
  si.item_id,
  array_agg(lj.item_id || ',' || lj.dist)
from item_embeddings si
  cross join lateral (
    select
      ie.item_id,
      cube_distance(ie.emb_vector, si.emb_vector) dist
    from item_embeddings ie
    order by ie.emb_vector <-> si.emb_vector limit 10
  ) lj
where si.item_id != lj.item_id
group by 1;


select
  si.item_id,
  lj.item_id,
  lj.dist
from item_embeddings si
  cross join lateral (
    select
      ie.item_id,
      cube_distance(ie.emb_vector, si.emb_vector) dist
    from item_embeddings ie
    order by ie.emb_vector <-> si.emb_vector limit 10
  ) lj
where si.item_id != lj.item_id

---
100 - 14s
200 - 27s
300 - 38s/45s
400 - 60s
800 - 100s
2000 - 215s
3000 - 450s
