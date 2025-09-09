use crate::{colour::Colour, hittable::HitRecord, material::texture::{SolidColour, Texture}, ray::Ray, vec3::Vec3};

use super::{Material, Scatter};

pub struct Lambertian {
    albedo: Box<dyn Texture>,
}

impl Lambertian {
    pub fn new_with_colour(albedo: Colour) -> Lambertian {
        Self::new(Box::new(SolidColour::new(albedo)))
    }

    pub fn new(albedo: Box<dyn Texture>) -> Lambertian {
        Lambertian { albedo }
    }
}

impl Material for Lambertian {
    fn scatter(&self, ray: &Ray, hit_record: &HitRecord) -> Option<Scatter> {
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

        let scattered = Ray { origin: hit_record.hit_point, direction, time: ray.time };

        Some(Scatter {
            scattered,
            attenuation: self.albedo.value(hit_record.u, hit_record.v, hit_record.hit_point)
        })
    }
}
