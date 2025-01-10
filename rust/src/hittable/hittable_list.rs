use crate::{interval::Interval, ray::Ray};

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

    // We need a lifetime here in case Hittable is ever implemented for a reference
    // https://stackoverflow.com/a/54788788
    pub fn add(&mut self, hittable: impl Hittable + 'static) {
        self.hittables.push(Box::new(hittable));
    }
}

impl Hittable for HittableList {
    fn hit(&self, ray: &Ray, ray_test_interval: &Interval) -> Option<super::HitRecord> {
        let mut hit_record: Option<HitRecord> = None;
        let mut closest = ray_test_interval.max;

        for h in self.hittables.iter() {
            if let Some(test) = h.hit(ray, &Interval { min: ray_test_interval.min, max: closest }) {
                closest = test.ray_hit;
                hit_record = Some(test);
            }
        }

        return hit_record;
    }
}
