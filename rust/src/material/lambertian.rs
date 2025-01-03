use crate::{colour::Colour, hittable::HitRecord, ray::Ray, vec3::Vec3};

use super::{Material, Scatter};

pub struct Lambertian {
    albedo: Colour,
}

impl Lambertian {
    pub fn new(albedo: Colour) -> Lambertian {
        Lambertian { albedo }
    }
}

impl Material for Lambertian {
    fn scatter(&self, _: &Ray, hit_record: &HitRecord) -> Option<Scatter> {
        let direction = {
            // let direction = Vec3::random_on_hemisphere(hit_record.normal); // hemispheric distribution
            let direction = hit_record.normal + Vec3::random_unit_vector(); // Lambertian distribution

            // Catch degenerate scatter direction
            if direction.near_zero() {
                hit_record.normal
            } else {
                direction
            }
        };

        let scattered = Ray { origin: hit_record.p, direction };

        Some(Scatter { scattered, attenuation: self.albedo })
    }
}
