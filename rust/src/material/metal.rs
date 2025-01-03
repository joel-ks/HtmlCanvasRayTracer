use crate::{colour::Colour, hittable::HitRecord, interval::Interval, ray::Ray, vec3::Vec3};

use super::{Material, Scatter};

pub struct Metal {
    albedo: Colour,
    fuzz: f64
}

impl Metal {
    pub fn new(albedo: Colour, fuzz: f64) -> Metal {
        static FUZZ_RANGE: Interval = Interval { min: 0.0, max: 1.0 };
        let fuzz = FUZZ_RANGE.clamp(fuzz);
        
        Metal { albedo, fuzz }
    }
}

impl Material for Metal {
    fn scatter(&self, ray: &Ray, hit_record: &HitRecord) -> Option<Scatter> {
        let reflected = ray.direction.reflect(hit_record.normal);
        let reflected = reflected.normalize() + (self.fuzz * Vec3::random_unit_vector());
        let scattered = Ray{ origin: hit_record.p, direction: reflected };

        if Vec3::dot(scattered.direction, hit_record.normal) > 0.0 {
            return Some(
                Scatter { scattered, attenuation: self.albedo }
            );
        } else {
            return None;
        }
    }
}
