use crate::vec3::{Point3, Vec3};

#[derive(Clone, Copy)]
pub struct Ray {
    pub origin: Point3,
    pub direction: Vec3,
}

impl Ray {
    // pub fn identity() -> Ray {
    //     Ray {
    //         origin: Point3::origin(),
    //         direction: Vec3::origin(),
    //     }
    // }

    pub fn at(self, t: f64) -> Point3 {
        self.origin + t * self.direction
    }
}
