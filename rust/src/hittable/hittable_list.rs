use crate::interval::Interval;

use super::{HitRecord, Hittable};

pub struct HittableList {
    hittables: Vec<Box<dyn Hittable>>
}

impl HittableList {
    pub fn new() -> HittableList {
        HittableList {
            hittables: Vec::new()
        }
    }

    pub fn add(&mut self, hittable: Box<dyn Hittable>) {
        self.hittables.push(hittable);
    }
}

impl Hittable for HittableList {
    fn hit(&self, r: crate::ray::Ray, ray_t: Interval) -> Option<super::HitRecord> {
        let mut hit_record: Option<HitRecord> = None;
        let mut closest = ray_t.max;

        for h in self.hittables.iter() {
            if let Some(test) = h.hit(r, Interval { min: ray_t.min, max: closest }) {
                closest = test.t;
                hit_record = Some(test);
            }
        }

        return hit_record;
    }
}
