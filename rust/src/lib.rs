mod camera;
mod colour;
mod hittable;
mod interval;
mod material;
mod ray;
mod utils;
mod vec3;

use camera::{Camera, CameraBuilder};
use colour::{Colour, Pixel};
use hittable::{Sphere};
use material::{Dielectric, Lambertian, Metal};
use vec3::{Point3, Vec3};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

use crate::hittable::{BinaryTreeBvh, Hittable, HittableList};

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
pub struct Renderer {
    camera: Camera,
    // world: HittableList,
    world: BinaryTreeBvh,
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl Renderer {
    pub fn new(width: u32, height: u32) -> Renderer {
        #[cfg(target_arch = "wasm32")]
        utils::set_panic_hook();

        let camera = CameraBuilder {
            image_width: width,
            image_height: height,
            v_fov_degrees: 20.0,
            look_from: Point3 { x: 13.0, y: 2.0, z: 3.0 },
            look_at: Point3 { x: 0.0, y: 0.0, z: 0.0 },
            up: Vec3 { x: 0.0, y: 1.0, z: 0.0 },
            defocus_angle: 0.6,
            focal_length: 10.0,
            samples: 100,
            max_bounces: 50
        }.build();
        let world = Renderer::generate_world();

        Renderer {
            camera,
            // world: HittableList::of_hittables(world)
            world: BinaryTreeBvh::new(world)
        }
    }

    pub fn render_pixel(&self, width: u32, height: u32) -> Pixel {
        self.camera.render_pixel(width, height, &self.world)
    }

    fn generate_world() -> Vec<Box<dyn Hittable>> {
        let mut world = Vec::<Box<dyn Hittable>>::new();

        // Ground
        world.push(Box::new(Sphere::new(
            Point3 { x: 0.0, y: -1000.0, z: 0.0 }, 1000.0,
            Lambertian::new(Vec3 { x: 0.5, y: 0.5, z: 0.5 })
        )));

        // Lots of random small spheres
        for a in -11..11 {
            for b in -11..11 {
                let centre = Point3 {
                    x: a as f64 + 0.9 * utils::random(),
                    y: 0.2,
                    z: b as f64 + 0.9 * utils::random()
                };

                static FRONT_OF_SCENE: Point3 = Point3 { x: 4.0, y: 0.2, z: 0.0 };
                if (centre - FRONT_OF_SCENE).length() > 0.9 {
                    let choose_mat = utils::random();

                    if choose_mat < 0.8 {
                        let material = Lambertian::new(Colour::random() * Colour::random());
                        let centre2 = centre + Vec3 { x: 0.0, y: utils::range_random_f64(0.0, 0.5), z: 0.0 };
                        world.push(Box::new(Sphere::new_with_motion(centre, centre2, 0.2, material)));
                    } else if choose_mat < 0.95 {
                        let material = Metal::new(Colour::range_random(0.5, 1.0), utils::range_random_f64(0.0, 0.5));
                        world.push(Box::new(Sphere::new(centre, 0.2, material)));
                    } else {
                        let material = Dielectric::new(1.5);
                        world.push(Box::new(Sphere::new(centre, 0.2, material)));
                    };
                }
            }
        }

        // 3 central spheres
        world.push(Box::new(Sphere::new(
            Point3 { x: 0.0, y: 1.0, z: 0.0 }, 1.0,
            Dielectric::new(1.5)
        )));

        world.push(Box::new(Sphere::new(
            Point3 { x: -4.0, y: 1.0, z: 0.0 }, 1.0,
            Lambertian::new(Vec3 { x: 0.4, y: 0.2, z: 0.1 })
        )));

        world.push(Box::new(Sphere::new(
            Point3 { x: 4.0, y: 1.0, z: 0.0 }, 1.0,
            Metal::new(Vec3 { x: 0.7, y: 0.6, z: 0.5 }, 0.0)
        )));

        world
    }
}
