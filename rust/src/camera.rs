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
}

impl Camera {
    pub fn new(image_width: u32, image_height: u32) -> Camera {
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

        Camera {
            centre,
            pixel00_loc,
            pixel_delta_u,
            pixel_delta_v
        }
    }

    pub fn render_pixel(&self, x: u32, y: u32, world: &Box<dyn Hittable>) -> Pixel {
        let pixel_centre = self.pixel00_loc + ((x as f64) * self.pixel_delta_u) + ((y as f64) * self.pixel_delta_v);
        let ray_direction = pixel_centre - self.centre;
        let ray = Ray {
            origin: self.centre,
            direction: ray_direction,
        };
        let colour = Camera::ray_colour(ray, world);

        return Pixel::from_colour(colour);
    }

    fn ray_colour(ray: Ray, world: &Box<dyn Hittable>) -> Colour {
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
