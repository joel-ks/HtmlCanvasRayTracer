mod colour;
mod hittable;
mod interval;
mod ray;
mod utils;
mod vec3;
mod wasm_utils;

use colour::{Colour, Pixel};
use hittable::{Hittable, HittableList, Sphere};
use interval::Interval;
use ray::Ray;
use vec3::{Point3, Vec3};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Renderer {
    image_width: u32,
    image_height: u32,

    pixel00_loc: Point3,
    pixel_delta_u: Vec3,
    pixel_delta_v: Vec3,

    viewport_width: f64,
    viewport_height: f64,
    focal_length: f64,
    camera_centre: Point3,

    world: HittableList,
}

#[wasm_bindgen]
impl Renderer {
    pub fn new(width: u32, height: u32) -> Renderer {
        wasm_utils::set_panic_hook();

        let aspect_ratio = width as f64 / height as f64;
        let viewport_height = 2.0;
        let viewport_width = viewport_height * aspect_ratio;
        let focal_length = 1.0;
        let camera_centre = Point3::origin();

        let viewport_u = Vec3 { x: viewport_width, y: 0.0, z: 0.0 };
        let viewport_v = Vec3 { x: 0.0, y: -viewport_height, z: 0.0 };

        let pixel_delta_u = viewport_u / (width as f64);
        let pixel_delta_v = viewport_v / (height as f64);

        let viewport_upper_left = camera_centre - Vec3 { x: 0.0, y: 0.0, z: focal_length }
            - viewport_u / 2.0 - viewport_v / 2.0;
        let pixel00_loc = viewport_upper_left + 0.5 * (pixel_delta_u + pixel_delta_v);

        return Renderer {
            image_width: width,
            image_height: height,
            pixel00_loc,
            pixel_delta_u,
            pixel_delta_v,
            viewport_width,
            viewport_height,
            focal_length,
            camera_centre,
            world: Renderer::generate_world(),
        };
    }

    fn generate_world() -> HittableList {
        let mut world = HittableList::new();

        world.add(Box::new(Sphere::new(Point3 { x: 0.0, y: 0.0, z: -1.0 }, 0.5)));
        world.add(Box::new(Sphere::new(Point3 { x: 0.0, y: -100.5, z: -1.0 }, 100.0)));

        return world;
    }

    pub fn render_pixel(&self, x: u32, y: u32) -> Pixel {
        let pixel_centre = self.pixel00_loc + ((x as f64) * self.pixel_delta_u) + ((y as f64) * self.pixel_delta_v);
        let ray_direction = pixel_centre - self.camera_centre;
        let ray = Ray {
            origin: self.camera_centre,
            direction: ray_direction,
        };
        let colour = self.ray_colour(ray);

        return Pixel::from_colour(colour);
    }

    fn ray_colour(&self, r: Ray) -> Colour {
        let hit_record = self.world.hit(r, Interval { min: 0.0, max: utils::INFINITY });
        if let Some(hit_record) = hit_record {
            return Colour {
                x: (hit_record.normal.x + 1.0) * 0.5,
                y: (hit_record.normal.y + 1.0) * 0.5,
                z: (hit_record.normal.z + 1.0) * 0.5,
            };
        }

        let start_colour = Colour { x: 1.0, y: 1.0, z: 1.0 };
        let end_colour = Colour { x: 0.5, y: 0.7, z: 1.0 };

        let dir_norm = r.direction.normalize();
        let a = 0.5 * (dir_norm.y + 1.0);

        return (1.0 - a) * start_colour + a * end_colour;
    }
}
