use crate::{interval::Interval, ray::Ray, vec3::Point3};

#[derive(Default, Clone, Copy)]
pub struct Aabb {
    pub x: Interval,
    pub y: Interval,
    pub z: Interval,
}

impl Aabb {
    pub fn between_points(a: Point3, b: Point3) -> Aabb {
        // Treat the two points a and b as extrema for the bounding box, so we
        // don't require a particular minimum/maximum coordinate order.
        Aabb {
            x: if a.x <= b.x {
                Interval { min: a.x, max: b.x }
            } else {
                Interval { min: b.x, max: a.x }
            },
            y: if a.y <= b.y {
                Interval { min: a.y, max: b.y }
            } else {
                Interval { min: b.y, max: a.y }
            },
            z: if a.z <= b.z {
                Interval { min: a.z, max: b.z }
            } else {
                Interval { min: b.z, max: a.z }
            },
        }
    }

    pub fn union(a: &Aabb, b: &Aabb) -> Aabb {
        Aabb {
            x: Interval::union(&a.x, &b.x),
            y: Interval::union(&a.y, &b.y),
            z: Interval::union(&a.z, &b.z)
        }
    }

    pub fn hit(&self, ray: &Ray, ray_test_interval: &Interval) -> Option<Interval> {
        let ray_test_interval = Self::check_intersect_axis(&self.x, 1.0 / ray.direction.x, ray.origin.x, ray_test_interval)?;
        let ray_test_interval = Self::check_intersect_axis(&self.y, 1.0 / ray.direction.y, ray.origin.y, &ray_test_interval)?;
        let ray_test_interval = Self::check_intersect_axis(&self.z, 1.0 / ray.direction.z, ray.origin.z, &ray_test_interval)?;

        Some(ray_test_interval)
    }

    fn check_intersect_axis(
        axis_interval: &Interval,
        axis_direction_inv: f64,
        axis_ray_origin: f64,
        ray_test_interval: &Interval,
    ) -> Option<Interval> {
        let t0 = (axis_interval.min - axis_ray_origin) * axis_direction_inv;
        let t1 = (axis_interval.max - axis_ray_origin) * axis_direction_inv;

        let mut min = ray_test_interval.min;
        let mut max = ray_test_interval.max;

        if t0 < t1 {
            if t0 > min { min = t0; }
            if t1 < max { max = t1; }
        } else {
            if t1 > min { min = t1; }
            if t0 < max { max = t0; }
        }

        if max > min {
            Some(Interval { min, max })
        } else {
            None
        }
    }
}
