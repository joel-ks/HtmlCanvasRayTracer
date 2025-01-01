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
        const MAX_U8: f32 = 255.0;
        
        Pixel {
            r: (r * MAX_U8).floor() as u8,
            g: (g * MAX_U8).floor() as u8,
            b: (b * MAX_U8).floor() as u8,
            a: (a * MAX_U8).floor() as u8,
        }
    }

    pub fn from_f64s(r: f64, g: f64, b: f64, a: f64) -> Pixel {
        const MAX_U8: f64 = 255.0;
        
        Pixel {
            r: (r * MAX_U8).floor() as u8,
            g: (g * MAX_U8).floor() as u8,
            b: (b * MAX_U8).floor() as u8,
            a: (a * MAX_U8).floor() as u8,
        }
    }

    pub fn from_colour(colour: Colour) -> Pixel {
        Pixel::from_f64s(colour.x, colour.y, colour.z, 1.0)
    }
}
