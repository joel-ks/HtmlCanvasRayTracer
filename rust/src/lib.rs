mod camera;
mod colour;
mod hittable;
mod interval;
mod material;
mod ray;
mod utils;
mod vec3;
mod wasm_utils;

use camera::{Camera, CameraBuilder};
use colour::Pixel;
use hittable::{HittableList, Sphere};
use material::{Dielectric, Lambertian, Metal};
use vec3::{Point3, Vec3};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Renderer {
    camera: Camera,
    world: HittableList,
}

#[wasm_bindgen]
impl Renderer {
    pub fn new(width: u32, height: u32) -> Renderer {
        wasm_utils::set_panic_hook();

        let camera = CameraBuilder {
            image_width: width,
            image_height: height,
            v_fov_degrees: 20.0,
            look_from: Point3 { x: -2.0, y: 2.0, z: 1.0 },
            look_at: Point3 { x: 0.0, y: 0.0, z: -1.0 },
            up: Vec3 { x: 0.0, y: 1.0, z: 0.0 },
            defocus_angle: 10.0,
            focal_length: 3.4,
            samples: 100,
            max_bounces: 50
        }.build();
        let world = Renderer::generate_world();

        Renderer { camera, world }
    }

    pub fn render_pixel(&self, width: u32, height: u32) -> Pixel {
        self.camera.render_pixel(width, height, &self.world)
    }

    fn generate_world() -> HittableList {
        let mut world = HittableList::new();

        // Ground
        world.add(Sphere::new(
            Point3 { x: 0.0, y: -100.5, z: -1.0 }, 100.0,
            Lambertian::new(Vec3 { x: 0.8, y: 0.8, z: 0.0 })
        ));

        // Centre
        world.add(Sphere::new(
            Point3 { x: 0.0, y: 0.0, z: -1.2 }, 0.5,
            Lambertian::new(Vec3 { x: 0.1, y: 0.2, z: 0.5 })
        ));

        // Left (hollow glass sphere modeled as a glass sphere and a bubble that's fully inside)
        world.add(Sphere::new(
            Point3 { x: -1.0, y: 0.0, z: -1.0 }, 0.5,
            Dielectric::new(1.5)
        ));
        world.add(Sphere::new(
            Point3 { x: -1.0, y: 0.0, z: -1.0 }, 0.4,
            Dielectric::new(1.0 / 1.5)
        ));

        // Right
        world.add(Sphere::new(
            Point3 { x: 1.0, y: 0.0, z: -1.0 }, 0.5,
            Metal::new(Vec3 { x: 0.8, y: 0.6, z: 0.2 }, 1.0)
        ));

        return world;
    }
}
