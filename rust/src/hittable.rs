mod hittable_list;
mod sphere;

use crate::{
    interval::Interval, ray::Ray, vec3::{Point3, Vec3}
};

pub use hittable_list::HittableList;
pub use sphere::Sphere;

pub trait Hittable {
    fn hit(&self, r: Ray, ray_t: Interval) -> Option<HitRecord>;
}

pub struct HitRecord {
    pub p: Point3,
    pub normal: Vec3,
    pub t: f64,
    pub front_face: bool
}

impl HitRecord {
    fn new(r: Ray, t: f64, normal: Vec3) -> HitRecord {
        let front_face = Vec3::dot(r.direction, normal) < 0.0;

        HitRecord {
            p: r.at(t),
            normal: if front_face { normal } else { -normal },
            t,
            front_face
        }
    }
}
