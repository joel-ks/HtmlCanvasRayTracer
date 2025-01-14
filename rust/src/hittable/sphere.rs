use std::rc::Rc;

use crate::{interval::Interval, material::Material, vec3::{Point3, Vec3}};

use super::{HitRecord, Hittable};

pub struct Sphere {
    centre: Point3,
    radius: f64,
    material: Rc<dyn Material>
}

impl Sphere {
    // We need a lifetime here in case Material is ever implemented for a reference
    // https://stackoverflow.com/a/54788788
    pub fn new(centre: Point3, radius: f64, material: impl Material + 'static) -> Sphere {
        Sphere {
            centre,
            radius: radius.max(0.0),
            material: Rc::new(material)
        }
    }
}

impl Hittable for Sphere {
    fn hit(&self, r: crate::ray::Ray, ray_t: Interval) -> Option<HitRecord> {
        // Equation for ray(O,D) intersects sphere(C,r):
        // => t^2(D⋅D)-2t(D⋅(O-C))+((O-C)⋅(O-C)-r^2)=0
        // Solve for t to determine if ray intersects at any point:
        // => Quadratic formula: (-b ± sqrt(b^2 - 4ac)) / 2a where
        //      - a = (D⋅D) = length_squared(D)
        //      - b = -2(D⋅(O-C))
        //      - c = ((O-C)⋅(O-C))−r^2
        // Since b has a factor of -2 we can simplify by setting h = b/-2 = D⋅(O-C)
        // => Formula simplifies to: (h ± sqrt(h^2 - ac)) / a
        let oc = self.centre - r.origin; // precalculate as this is part of h and c
        let a = r.direction.length_squared();
        let h = Vec3::dot(r.direction, oc);
        let c = Vec3::dot(oc, oc) - self.radius * self.radius;

        // Hit sphere when there is a solution
        // => i.e. when discriminant (h^2 - ac) is non-zero
        let discriminant = h * h - a * c;
        if discriminant < 0.0 {
            return None;
        }

        let sqrt_discriminant = discriminant.sqrt();

        // Find the nearest root that lies in the acceptable range.
        let mut root = (h - sqrt_discriminant) / a;
        if !ray_t.surrounds(root) {
            root = (h + sqrt_discriminant) / a;
            if !ray_t.surrounds(root) {
                return None;
            }
        }

        let p = r.at(root);
        let normal = (p - self.centre) / self.radius;
        return Some(HitRecord::new(r, root, normal, self.material.clone()));
    }
}
