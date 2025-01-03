mod dielectric;
mod lambertian;
mod metal;

pub use dielectric::Dielectric;
pub use lambertian::Lambertian;
pub use metal::Metal;

use crate::{colour::Colour, hittable::HitRecord, ray::Ray};

pub struct Scatter {
    pub scattered: Ray,
    pub attenuation: Colour
}

pub trait Material {
    fn scatter(&self, _ray: &Ray, _hit_record: &HitRecord) -> Option<Scatter> {
        None
    }
}
