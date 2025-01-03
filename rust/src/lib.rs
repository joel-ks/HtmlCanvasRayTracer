mod camera;
mod colour;
mod hittable;
mod interval;
mod ray;
mod utils;
mod vec3;
mod wasm_utils;

use camera::Camera;
use colour::Pixel;
use hittable::{HittableList, Sphere};
use vec3::Point3;
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

        let camera = Camera::new(width, height, 100, 50);
        let world = Renderer::generate_world();

        Renderer { camera, world }
    }

    pub fn render_pixel(&self, width: u32, height: u32) -> Pixel {
        self.camera.render_pixel(width, height, &self.world)
    }

    fn generate_world() -> HittableList {
        let mut world = HittableList::new();

        world.add(Sphere::new(Point3 { x: 0.0, y: 0.0, z: -1.0 }, 0.5));
        world.add(Sphere::new(Point3 { x: 0.0, y: -100.5, z: -1.0 }, 100.0));

        return world;
    }
}
