use crate::{
    colour::{Colour, Pixel},
    hittable::Hittable,
    interval::Interval,
    ray::Ray,
    utils,
    vec3::{Point3, Vec3},
};

pub struct CameraBuilder {
    pub image_width: u32,
    pub image_height: u32,
    pub v_fov_degrees: f64,
    pub look_from: Point3,
    pub look_at: Point3,
    pub up: Vec3,
    pub samples: u32,
    pub max_bounces: u32
}

impl CameraBuilder {
    pub fn build(self) -> Camera {
        let aspect_ratio = self.image_width as f64 / self.image_height as f64;

        // Determine viewport dimensions.
        let focal_length = (self.look_from - self.look_at).length();
        let v_fov_rads = utils::degs_to_rads(self.v_fov_degrees);
        let viewport_height = 2.0 * (v_fov_rads / 2.0).tan() * focal_length;
        let viewport_width = viewport_height * aspect_ratio;

        // Calculate the u,v,w unit basis vectors for the camera coordinate frame.
        let w = (self.look_from - self.look_at).normalize();
        let u = Vec3::cross(self.up, w).normalize();
        let v = Vec3::cross(w, u);

        // Calculate the vectors across the horizontal and down the vertical viewport edges.
        let viewport_u = viewport_width * u; // Vector across viewport horizontal edge
        let viewport_v = viewport_height * -v; // Vector down viewport vertical edge
    
        // Calculate the horizontal and vertical delta vectors from pixel to pixel.
        let pixel_delta_u = viewport_u / (self.image_width as f64);
        let pixel_delta_v = viewport_v / (self.image_height as f64);

        // Calculate the location of the upper left pixel.
        let viewport_upper_left = self.look_from - focal_length * w - viewport_u / 2.0 - viewport_v / 2.0;
        let pixel00_loc = viewport_upper_left + 0.5 * (pixel_delta_u + pixel_delta_v);

        let pixel_samples_scale = 1.0 / (self.samples as f64);

        Camera {
            centre: self.look_from,
            pixel00_loc,
            pixel_delta_u,
            pixel_delta_v,
            samples: self.samples,
            max_bounces: self.max_bounces,
            pixel_samples_scale
        }
    }
}

pub struct Camera {
    centre: Point3,
    pixel00_loc: Point3,
    pixel_delta_u: Vec3,
    pixel_delta_v: Vec3,
    samples: u32,
    max_bounces: u32,
    pixel_samples_scale: f64
}

impl Camera {
    pub fn render_pixel(&self, x: u32, y: u32, world: &impl Hittable) -> Pixel {
        let mut colour = Colour { x: 0.0, y: 0.0, z: 0.0 };
        
        for _ in 0..self.samples {
            let ray = self.get_ray(x, y);
            colour += Camera::ray_colour(ray, world, self.max_bounces);
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
            x: utils::random() - 0.5,
            y: utils::random() - 0.5,
            z: 0.0
        }
    }

    fn ray_colour(ray: Ray, world: &impl Hittable, bounce_limit: u32) -> Colour {
        if bounce_limit <= 0 {
            return Colour::origin();
        }

        let hit_record = world.hit(
            ray,
            Interval {
                min: 0.001,
                max: utils::INFINITY,
            },
        );

        // Trace ray off the object that was hit
        if let Some(hit_record) = hit_record {
            if let Some(scatter) = hit_record.material.scatter(&ray, &hit_record) {
                return scatter.attenuation * Camera::ray_colour(scatter.scattered, world, bounce_limit - 1);
            } else {
                return Colour::origin();
            }
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
