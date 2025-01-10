use crate::{colour::Colour, hittable::HitRecord, ray::Ray, utils, vec3::Vec3};

use super::{Material, Scatter};

pub struct Dielectric {
    refraction_index: f64
}

impl Dielectric {
    pub fn new(refraction_index: f64) -> Dielectric {
        Dielectric { refraction_index }
    }
}

impl Material for Dielectric {
    fn scatter(&self, ray: &Ray, hit_record: &HitRecord) -> Option<Scatter> {
        let refraction_index = if hit_record.front_face { 1.0 / self.refraction_index } else { self.refraction_index };
        let direction_norm = ray.direction.normalize();
        let cos_theta = Vec3::dot(-direction_norm, hit_record.normal);
        let sin_theta = (1.0 - cos_theta * cos_theta).sqrt();

        let total_internal_reflection = refraction_index * sin_theta > 1.0;
        let reflectance = reflectance(cos_theta, refraction_index);

        let direction = if total_internal_reflection || reflectance > utils::random() {
            direction_norm.reflect(hit_record.normal)
        } else {
            direction_norm.refract(hit_record.normal, refraction_index)
        };

        let scattered = Ray { origin: hit_record.hit_point, direction };
        let attenuation = Colour { x: 1.0, y: 1.0, z: 1.0 };

        Some(Scatter { scattered, attenuation })
    }
}

fn reflectance(cos_theta: f64, refraction_index: f64) -> f64 {
    // Use Schlick's approximation for reflectance.
    let r0 = (1.0 - refraction_index) / (1.0 + refraction_index);
    let r0 = r0 * r0;

    r0 + (1.0 - r0) * (1.0 - cos_theta).powi(5)
}
