use web_sys::js_sys::Math::random;

use crate::{
    colour::{Colour, Pixel},
    hittable::Hittable,
    interval::Interval,
    ray::Ray,
    utils,
    vec3::{Point3, Vec3},
};

pub struct Camera {
    centre: Point3,
    pixel00_loc: Point3,
    pixel_delta_u: Vec3,
    pixel_delta_v: Vec3,
    samples: u32,
    pixel_samples_scale: f64
}

impl Camera {
    pub fn new(image_width: u32, image_height: u32, samples: u32) -> Camera {
        let aspect_ratio = image_width as f64 / image_height as f64;
        let centre = Point3::origin();

        let viewport_height = 2.0;
        let viewport_width = viewport_height * aspect_ratio;
        let focal_length = 1.0;

        let viewport_u = Vec3 { x: viewport_width, y: 0.0, z: 0.0 };
        let viewport_v = Vec3 { x: 0.0, y: -viewport_height, z: 0.0 };
 
        let pixel_delta_u = viewport_u / (image_width as f64);
        let pixel_delta_v = viewport_v / (image_height as f64);

        let viewport_upper_left = centre - Vec3 { x: 0.0, y: 0.0, z: focal_length }
            - viewport_u / 2.0 - viewport_v / 2.0;
        let pixel00_loc = viewport_upper_left + 0.5 * (pixel_delta_u + pixel_delta_v);

        let pixel_samples_scale = 1.0 / (samples as f64);

        Camera {
            centre,
            pixel00_loc,
            pixel_delta_u,
            pixel_delta_v,
            samples,
            pixel_samples_scale
        }
    }

    pub fn render_pixel(&self, x: u32, y: u32, world: &impl Hittable) -> Pixel {
        let mut colour = Colour { x: 0.0, y: 0.0, z: 0.0 };
        
        for _ in 0..self.samples {
            let ray = self.get_ray(x, y);
            colour += Camera::ray_colour(ray, world);
        }

        return Pixel::from_colour(self.pixel_samples_scale * colour);
    }

    fn get_ray(&self, x: u32, y: u32) -> Ray {
        // Construct a camera ray originating from the origin and directed at randomly sampled
        // point around the pixel location x, y.
        let offset = Camera::sample_square();
        let pixel_sample = self.pixel00_loc
            + ((x as f64 + offset.x) * self.pixel_delta_u)
            + ((y as f64 + offset.y) * self.pixel_delta_v);
        
        Ray {
            origin: self.centre,
            direction: pixel_sample - self.centre
        }
    }

    /// Returns the vector to a random point in the \[-.5,-.5\]-\[+.5,+.5\] unit square.
    fn sample_square() -> Vec3 {
        return Vec3
        {
            x: random() - 0.5,
            y: random() - 0.5,
            z: 0.0
        }
    }

    fn ray_colour(ray: Ray, world: &impl Hittable) -> Colour {
        let hit_record = world.hit(
            ray,
            Interval {
                min: 0.0,
                max: utils::INFINITY,
            },
        );
        if let Some(hit_record) = hit_record {
            return Colour {
                x: (hit_record.normal.x + 1.0) * 0.5,
                y: (hit_record.normal.y + 1.0) * 0.5,
                z: (hit_record.normal.z + 1.0) * 0.5,
            };
        }

        static START_COLOUR: Colour = Colour {
            x: 1.0,
            y: 1.0,
            z: 1.0,
        };
        static END_COLOUR: Colour = Colour {
            x: 0.5,
            y: 0.7,
            z: 1.0,
        };

        let dir_norm = ray.direction.normalize();
        let a = 0.5 * (dir_norm.y + 1.0);

        return (1.0 - a) * START_COLOUR + a * END_COLOUR;
    }
}
