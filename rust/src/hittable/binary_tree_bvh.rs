use std::cmp::Ordering;

use crate::{interval::Interval, utils};

use super::{Hittable, Aabb};

pub struct BinaryTreeBvh {
    left: Box<dyn Hittable>,
    right: Option<Box<dyn Hittable>>,
    bbox: Aabb
}

impl BinaryTreeBvh {
    pub fn new(mut objects: Vec<Box<dyn Hittable>>) -> BinaryTreeBvh {
        let len = objects.len();
        let (left, right) = match len {
            1 => (objects.remove(0), Option::None),
            2 => (objects.remove(0), Option::Some(objects.remove(0))),
            _ => {
                let axis = utils::range_random_i32(0, 2);
                if axis == 0 {
                    objects.sort_by(|a, b| Self::interval_compare(&a.bounding_box().x, &b.bounding_box().x))
                } else if axis == 1 {
                    objects.sort_by(|a, b| Self::interval_compare(&a.bounding_box().y, &b.bounding_box().y))
                } else if axis == 2 {
                    objects.sort_by(|a, b| Self::interval_compare(&a.bounding_box().z, &b.bounding_box().z))
                }

                let split_objects = objects.split_off(len / 2);
                (
                    // This coercion is automatic for individual boxes but not when they're in a tuple :(
                    Box::new(Self::new(objects)) as Box<dyn Hittable>,
                    Option::Some(Box::new(Self::new(split_objects)) as Box<dyn Hittable>)
                )
            }
        };

        let bbox = if let Some(ref right) = right {
            Aabb::union(left.bounding_box(), right.bounding_box())
        } else { *left.bounding_box() };

        BinaryTreeBvh { left, right, bbox }
    }

    fn interval_compare(a: &Interval, b: &Interval) -> Ordering {
        a.min.partial_cmp(&b.min).unwrap() // Assuming these will never be NaN
    }
}

impl Hittable for BinaryTreeBvh {
    fn hit(&self, ray: &crate::ray::Ray, ray_test_interval: &crate::interval::Interval) -> Option<super::HitRecord> {
        self.bbox.hit(ray, ray_test_interval)?;

        let hit_left = self.left.hit(ray, ray_test_interval);

        let max = if let Some(ref hit) = hit_left { hit.ray_hit } else { ray_test_interval.max };
        let ray_test_interval = Interval {
            min: ray_test_interval.min,
            max,
        };
        let hit_right = if let Some(ref right) = self.right { right.hit(ray, &ray_test_interval) } else { None };

        if hit_right.is_some() { hit_right } else { hit_left }
    }

    fn bounding_box(&self) -> &Aabb {
        &self.bbox
    }
}
