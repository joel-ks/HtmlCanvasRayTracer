mod hittable_list;
mod sphere;

use std::rc::Rc;

use crate::{
    interval::Interval, material::Material, ray::Ray, vec3::{Point3, Vec3}
};

pub use hittable_list::HittableList;
pub use sphere::Sphere;

pub trait Hittable {
    fn hit(&self, ray: &Ray, ray_test_interval: &Interval) -> Option<HitRecord>;
}

pub struct HitRecord {
    pub hit_point: Point3,
    pub ray_hit: f64,
    pub normal: Vec3,
    pub front_face: bool,
    pub material: Rc<dyn Material>
}

impl HitRecord {
    fn new(ray: &Ray, ray_hit: f64, normal: Vec3, material: Rc<dyn Material>) -> HitRecord {
        let front_face = Vec3::dot(ray.direction, normal) < 0.0;

        HitRecord {
            hit_point: ray.at(ray_hit),
            ray_hit,
            normal: if front_face { normal } else { -normal },
            front_face,
            material
        }
    }
}
