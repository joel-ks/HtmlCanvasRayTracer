use crate::vec3::Vec3;
use wasm_bindgen::prelude::wasm_bindgen;

pub type Colour = Vec3;

#[wasm_bindgen]
pub struct Pixel {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8
}

impl Pixel {
    pub fn from_f32s(r: f32, g: f32, b: f32, a: f32) -> Pixel {
        const SCALE: f32 = 255.0;
        
        return Pixel {
            r: (r * SCALE).floor() as u8,
            g: (g * SCALE).floor() as u8,
            b: (b * SCALE).floor() as u8,
            a: (a * SCALE).floor() as u8,
        };
    }

    pub fn from_f64s(r: f64, g: f64, b: f64, a: f64) -> Pixel {
        const SCALE: f64 = 255.0;
        
        return Pixel {
            r: (r * SCALE).floor() as u8,
            g: (g * SCALE).floor() as u8,
            b: (b * SCALE).floor() as u8,
            a: (a * SCALE).floor() as u8,
        };
    }

    pub fn from_colour(colour: Colour) -> Pixel {
        Pixel::from_f64s(colour.x, colour.y, colour.z, 1.0)
    }
}
