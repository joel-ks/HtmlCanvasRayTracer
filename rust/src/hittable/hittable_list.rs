use crate::{interval::Interval, ray::Ray};

use super::{HitRecord, Hittable, Aabb};

pub struct HittableList {
    hittables: Vec<Box<dyn Hittable>>,
    bbox: Aabb
}

impl HittableList {
    pub fn new() -> HittableList {
        HittableList {
            hittables: Vec::new(),
            bbox: Aabb::default()
        }
    }

    pub fn of_hittables(hittables: Vec<Box<dyn Hittable>>) -> HittableList {
        let mut bbox = Aabb::default();
        for h in hittables.iter() {
            bbox = Aabb::union(bbox, h.bounding_box());
        }

        HittableList {
            hittables,
            bbox
        }
    }

    pub fn push(&mut self, hittable: Box<dyn Hittable>) {
        // Need to update the AABB first because we can't borrow the hittable after it's moved into the Box
        self.bbox = Aabb::union(self.bbox, hittable.bounding_box());
        self.hittables.push(hittable);
    }
}

impl Hittable for HittableList {
    fn hit(&self, ray: &Ray, ray_test_interval: Interval) -> Option<super::HitRecord> {
        let mut hit_record: Option<HitRecord> = None;
        let mut closest = ray_test_interval.max;

        for h in self.hittables.iter() {
            if let Some(test) = h.hit(ray, Interval { min: ray_test_interval.min, max: closest }) {
                closest = test.ray_hit;
                hit_record = Some(test);
            }
        }

        hit_record
    }

    fn bounding_box(&self) -> Aabb {
        self.bbox
    }
}
