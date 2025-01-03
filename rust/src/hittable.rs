mod hittable_list;
mod sphere;

use std::rc::Rc;

use crate::{
    interval::Interval, material::Material, ray::Ray, vec3::{Point3, Vec3}
};

pub use hittable_list::HittableList;
pub use sphere::Sphere;

pub trait Hittable {
    fn hit(&self, r: Ray, ray_t: Interval) -> Option<HitRecord>;
}

pub struct HitRecord {
    pub p: Point3,
    pub normal: Vec3,
    pub material: Rc<dyn Material>,
    pub t: f64,
    pub front_face: bool
}

impl HitRecord {
    fn new(r: Ray, t: f64, normal: Vec3, material: Rc<dyn Material>) -> HitRecord {
        let front_face = Vec3::dot(r.direction, normal) < 0.0;

        HitRecord {
            p: r.at(t),
            normal: if front_face { normal } else { -normal },
            material,
            t,
            front_face
        }
    }
}
